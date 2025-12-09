"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Recycle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validators/auth";
import { forgotPassword, type AuthActionResult } from "@/lib/auth/actions";

export function ForgotPasswordForm() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = (data: ForgotPasswordFormData) => {
        setError(null);

        startTransition(async () => {
            const result: AuthActionResult = await forgotPassword(data);

            if (result.success) {
                setSuccess(true);
            } else {
                setError(result.error || "Failed to send reset email");
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
                        Check your email
                    </h1>
                    <p className="text-neutral-600 mb-6">
                        We&apos;ve sent a password reset link to{" "}
                        <span className="font-medium text-neutral-900">
                            {getValues("email")}
                        </span>
                    </p>
                    <div className="bg-primary-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-primary-700">
                            The link will expire in <span className="font-semibold">1 hour</span>.
                            Please check your spam folder if you don&apos;t see the email.
                        </p>
                    </div>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to sign in
                    </Link>
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
                <h1 className="text-2xl font-bold text-neutral-900">Forgot password?</h1>
                <p className="mt-2 text-neutral-600">
                    No worries, we&apos;ll send you reset instructions.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="juan@example.com"
                            className="pl-10"
                            disabled={isPending}
                            {...register("email")}
                        />
                    </div>
                    {errors.email && (
                        <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        "Send reset link"
                    )}
                </Button>

                {/* Back to login */}
                <div className="text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-primary-600"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to sign in
                    </Link>
                </div>
            </form>
        </div>
    );
}
