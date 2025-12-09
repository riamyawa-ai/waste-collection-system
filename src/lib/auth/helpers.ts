import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/constants";

export interface AuthUser {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    role: UserRole;
    barangay?: string;
    address?: string;
    avatarUrl?: string;
    emailVerified: boolean;
    createdAt: string;
}

/**
 * Get the current authenticated user (server-side only)
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    // Get profile data
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return {
        id: user.id,
        email: user.email!,
        fullName: profile?.full_name || user.user_metadata?.full_name || "",
        phone: profile?.phone || user.user_metadata?.phone,
        role: profile?.role || user.user_metadata?.role || "client",
        barangay: profile?.barangay || user.user_metadata?.barangay,
        address: profile?.address || user.user_metadata?.address,
        avatarUrl: profile?.avatar_url,
        emailVerified: !!user.email_confirmed_at,
        createdAt: user.created_at,
    };
}

/**
 * Get the current session (server-side only)
 */
export async function getSession() {
    const supabase = await createClient();

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
        return null;
    }

    return session;
}

/**
 * Check if user is authenticated (server-side only)
 */
export async function isAuthenticated(): Promise<boolean> {
    const user = await getCurrentUser();
    return !!user;
}

/**
 * Check if user has a specific role (server-side only)
 */
export async function hasRole(allowedRoles: UserRole | UserRole[]): Promise<boolean> {
    const user = await getCurrentUser();

    if (!user) {
        return false;
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return roles.includes(user.role);
}

// Re-export client-safe utilities for convenience in server components
export { maskEmail, maskPhone, formatName } from "./client-utils";
