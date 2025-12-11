"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DASHBOARD_ROUTES, USER_ROLES, type UserRole } from "@/constants";
import {
    loginSchema,
    registerSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    type LoginFormData,
    type RegisterFormData,
    type ForgotPasswordFormData,
    type ResetPasswordFormData,
} from "@/lib/validators/auth";

// Rate limiting storage (in production, use Redis or database)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(email: string): {
    allowed: boolean;
    remainingAttempts: number;
    lockoutRemaining?: number;
} {
    const now = Date.now();
    const attempts = loginAttempts.get(email);

    if (!attempts) {
        return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS };
    }

    // Reset if lockout period has passed
    if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
        loginAttempts.delete(email);
        return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS };
    }

    if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
        const lockoutRemaining = LOCKOUT_DURATION - (now - attempts.lastAttempt);
        return {
            allowed: false,
            remainingAttempts: 0,
            lockoutRemaining: Math.ceil(lockoutRemaining / 1000),
        };
    }

    return {
        allowed: true,
        remainingAttempts: MAX_LOGIN_ATTEMPTS - attempts.count,
    };
}

function recordLoginAttempt(email: string, success: boolean) {
    if (success) {
        loginAttempts.delete(email);
        return;
    }

    const now = Date.now();
    const attempts = loginAttempts.get(email);

    if (!attempts) {
        loginAttempts.set(email, { count: 1, lastAttempt: now });
    } else {
        loginAttempts.set(email, {
            count: attempts.count + 1,
            lastAttempt: now,
        });
    }
}

export interface AuthActionResult {
    success: boolean;
    error?: string;
    requiresCaptcha?: boolean;
    remainingAttempts?: number;
    lockoutRemaining?: number;
    redirectTo?: string;
}

export async function signIn(formData: LoginFormData): Promise<AuthActionResult> {
    const validation = loginSchema.safeParse(formData);

    if (!validation.success) {
        return {
            success: false,
            error: validation.error.issues[0]?.message || "Invalid form data",
        };
    }

    const { email, password } = validation.data;

    // Check rate limiting
    const rateLimit = checkRateLimit(email);
    if (!rateLimit.allowed) {
        return {
            success: false,
            error: `Too many login attempts. Please try again in ${Math.ceil((rateLimit.lockoutRemaining || 0) / 60)} minutes.`,
            lockoutRemaining: rateLimit.lockoutRemaining,
        };
    }

    // Check if CAPTCHA is required (after 3 failed attempts)
    const attempts = loginAttempts.get(email);
    if (attempts && attempts.count >= 3) {
        // In production, verify CAPTCHA here
        // For now, we'll allow the attempt but flag that CAPTCHA should be shown
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        recordLoginAttempt(email, false);
        const currentAttempts = loginAttempts.get(email);

        return {
            success: false,
            error: "Invalid email or password",
            remainingAttempts: MAX_LOGIN_ATTEMPTS - (currentAttempts?.count || 0),
            requiresCaptcha: (currentAttempts?.count || 0) >= 3,
        };
    }

    recordLoginAttempt(email, true);

    // Get user role from profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

    const role = (profile?.role as UserRole) || USER_ROLES.CLIENT;
    const redirectTo = DASHBOARD_ROUTES[role] || DASHBOARD_ROUTES.client;

    return {
        success: true,
        redirectTo,
    };
}

export async function signUp(formData: RegisterFormData): Promise<AuthActionResult> {
    const validation = registerSchema.safeParse(formData);

    if (!validation.success) {
        return {
            success: false,
            error: validation.error.issues[0]?.message || "Invalid form data",
        };
    }

    const { email, password, firstName, lastName, phone, barangay, address } = validation.data;
    const _fullName = `${firstName} ${lastName}`;

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
            data: {
                first_name: firstName,
                last_name: lastName,
                full_name: `${firstName} ${lastName}`,
                phone,
                barangay,
                address,
                role: USER_ROLES.CLIENT, // Default role for new registrations
            },
        },
    });

    if (error) {
        // Handle specific error cases
        if (error.message.includes("already registered")) {
            return {
                success: false,
                error: "An account with this email already exists. Please sign in instead.",
            };
        }
        return {
            success: false,
            error: error.message || "Failed to create account. Please try again.",
        };
    }

    if (!data.user) {
        return {
            success: false,
            error: "Failed to create account. Please try again.",
        };
    }

    return {
        success: true,
        redirectTo: "/verify-email",
    };
}

export async function signOut(): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}

export async function forgotPassword(
    formData: ForgotPasswordFormData
): Promise<AuthActionResult> {
    const validation = forgotPasswordSchema.safeParse(formData);

    if (!validation.success) {
        return {
            success: false,
            error: validation.error.issues[0]?.message || "Invalid email address",
        };
    }

    const { email } = validation.data;
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });

    if (error) {
        // Don't reveal if email exists or not for security
        console.error("Password reset error:", error);
    }

    // Always return success to prevent email enumeration
    return {
        success: true,
    };
}

export async function resetPassword(
    formData: ResetPasswordFormData
): Promise<AuthActionResult> {
    const validation = resetPasswordSchema.safeParse(formData);

    if (!validation.success) {
        return {
            success: false,
            error: validation.error.issues[0]?.message || "Invalid password",
        };
    }

    const { password } = validation.data;
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
        password,
    });

    if (error) {
        if (error.message.includes("expired")) {
            return {
                success: false,
                error: "Reset link has expired. Please request a new one.",
            };
        }
        return {
            success: false,
            error: error.message || "Failed to reset password. Please try again.",
        };
    }

    return {
        success: true,
        redirectTo: "/login",
    };
}

export async function resendVerificationEmail(email: string): Promise<AuthActionResult> {
    const supabase = await createClient();

    const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
    });

    if (error) {
        return {
            success: false,
            error: "Failed to resend verification email. Please try again.",
        };
    }

    return {
        success: true,
    };
}
