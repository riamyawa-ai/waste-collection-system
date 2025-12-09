"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { AlertCircle, CheckCircle, Recycle, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrengthMeter } from "@/components/ui/password-strength";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validators/auth";
import { resetPassword, type AuthActionResult } from "@/lib/auth/actions";

export function ResetPasswordForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const password = watch("password");

    const onSubmit = (data: ResetPasswordFormData) => {
        setError(null);

        startTransition(async () => {
            const result: AuthActionResult = await resetPassword(data);

            if (result.success) {
                setSuccess(true);
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    router.push("/login?message=Password reset successfully");
                }, 2000);
            } else {
                setError(result.error || "Failed to reset password");
            }
        });
    };

    if (success) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
                <div className="p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="w-8 h-8 text-primary-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                        Password reset successful!
                    </h1>
                    <p className="text-neutral-600 mb-6">
                        Your password has been updated. You can now sign in with your new password.
                    </p>
                    <p className="text-sm text-neutral-500">
                        Redirecting to sign in...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
            {/* Header */}
            <div className="p-8 pb-0 text-center">
                <Link href="/" className="inline-flex items-center gap-2 mb-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-eco">
                        <Recycle className="w-6 h-6 text-white" />
                    </div>
                </Link>
                <h1 className="text-2xl font-bold text-neutral-900">Set new password</h1>
                <p className="mt-2 text-neutral-600">
                    Your new password must be different from previous passwords.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                {/* Error Alert */}
                {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Password Field */}
                <div className="space-y-2">
                    <Label htmlFor="password" required>
                        New Password
                    </Label>
                    <PasswordInput
                        id="password"
                        placeholder="••••••••"
                        disabled={isPending}
                        {...register("password")}
                    />
                    {errors.password && (
                        <p className="text-sm text-red-600">{errors.password.message}</p>
                    )}
                </div>

                {/* Password Strength Meter */}
                {password && (
                    <PasswordStrengthMeter password={password} showRequirements={true} />
                )}

                {/* Confirm Password Field */}
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword" required>
                        Confirm New Password
                    </Label>
                    <PasswordInput
                        id="confirmPassword"
                        placeholder="••••••••"
                        disabled={isPending}
                        {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                        <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            Reset password
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
}
