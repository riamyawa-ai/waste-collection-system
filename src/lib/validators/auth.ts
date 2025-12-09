import { z } from "zod";
import { PANABO_BARANGAYS } from "@/constants";

// Password policy requirements
export const PASSWORD_REQUIREMENTS = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true,
} as const;

// Email validation schema
export const emailSchema = z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address");

// Password validation schema with all requirements
export const passwordSchema = z
    .string()
    .min(1, "Password is required")
    .min(
        PASSWORD_REQUIREMENTS.minLength,
        `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`
    )
    .refine(
        (password) => /[A-Z]/.test(password),
        "Password must contain at least one uppercase letter (A-Z)"
    )
    .refine(
        (password) => /[a-z]/.test(password),
        "Password must contain at least one lowercase letter (a-z)"
    )
    .refine(
        (password) => /[0-9]/.test(password),
        "Password must contain at least one number (0-9)"
    )
    .refine(
        (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
        "Password must contain at least one special character (!@#$%^&*)"
    );

// Philippine phone number validation
export const phoneSchema = z
    .string()
    .min(1, "Phone number is required")
    .refine(
        (phone) => {
            // Remove spaces and dashes for validation
            const cleaned = phone.replace(/[\s-]/g, "");
            // Accept formats: +63XXXXXXXXXX, 09XXXXXXXXX, 63XXXXXXXXXX
            return /^(\+?63|0)?9\d{9}$/.test(cleaned);
        },
        "Please enter a valid Philippine phone number (e.g., +63 912 345 6789 or 09123456789)"
    );

// Barangay validation
export const barangaySchema = z.enum(PANABO_BARANGAYS, {
    message: "Please select a valid barangay",
});

// Login form schema
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().default(false),
});

// Registration form schema
export const registerSchema = z
    .object({
        firstName: z
            .string()
            .min(1, "First name is required")
            .min(2, "First name must be at least 2 characters")
            .max(50, "First name must be less than 50 characters"),
        lastName: z
            .string()
            .min(1, "Last name is required")
            .min(2, "Last name must be at least 2 characters")
            .max(50, "Last name must be less than 50 characters"),
        email: emailSchema,
        phone: phoneSchema,
        password: passwordSchema,
        confirmPassword: z.string().min(1, "Please confirm your password"),
        barangay: barangaySchema.optional(),
        address: z.string().optional(),
        agreeToTerms: z.boolean().refine((val) => val === true, {
            message: "You must agree to the Terms and Conditions",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

// Forgot password schema
export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

// Reset password schema
export const resetPasswordSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

// Type exports - use z.input for form types (before transforms)
// and z.output (or z.infer) for the transformed/validated data
export type LoginFormData = z.input<typeof loginSchema>;
export type LoginFormOutput = z.output<typeof loginSchema>;
export type RegisterFormData = z.input<typeof registerSchema>;
export type RegisterFormOutput = z.output<typeof registerSchema>;
export type ForgotPasswordFormData = z.input<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.input<typeof resetPasswordSchema>;

// Password strength checker
export interface PasswordStrength {
    score: number; // 0-5
    label: "weak" | "fair" | "good" | "strong" | "very-strong";
    requirements: {
        minLength: boolean;
        hasUppercase: boolean;
        hasLowercase: boolean;
        hasNumber: boolean;
        hasSpecialChar: boolean;
    };
}

export function checkPasswordStrength(password: string): PasswordStrength {
    const requirements = {
        minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(requirements).filter(Boolean).length;

    const labels: Record<number, PasswordStrength["label"]> = {
        0: "weak",
        1: "weak",
        2: "fair",
        3: "good",
        4: "strong",
        5: "very-strong",
    };

    return {
        score,
        label: labels[score],
        requirements,
    };
}
