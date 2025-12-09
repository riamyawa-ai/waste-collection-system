"use client";

import Link from "next/link";
import { Mail, CheckCircle, RefreshCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineCountdown } from "@/components/ui/countdown-timer";
import { maskEmail } from "@/lib/auth/client-utils";
import { useState, useCallback } from "react";
import { resendVerificationEmail } from "@/lib/auth/actions";

interface VerifyEmailCardProps {
    email?: string;
}

export function VerifyEmailCard({ email }: VerifyEmailCardProps) {
    const [isResending, setIsResending] = useState(false);
    const [canResend, setCanResend] = useState(true);
    const [resendMessage, setResendMessage] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const handleResend = useCallback(async () => {
        if (!canResend || !email) return;

        setIsResending(true);
        setResendMessage(null);

        const result = await resendVerificationEmail(email);

        setIsResending(false);

        if (result.success) {
            setResendMessage({
                type: "success",
                message: "Verification email sent! Check your inbox.",
            });
            setCanResend(false);
        } else {
            setResendMessage({
                type: "error",
                message: result.error || "Failed to resend email. Please try again.",
            });
        }
    }, [canResend, email]);

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
            <div className="p-8 text-center">
                {/* Icon */}
                <div className="mx-auto w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6 relative">
                    <Mail className="w-10 h-10 text-primary-600" />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                </div>

                {/* Header */}
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                    Check your email
                </h1>
                <p className="text-neutral-600 mb-6">
                    We&apos;ve sent a verification link to
                    {email ? (
                        <span className="block font-medium text-neutral-900 mt-1">
                            {maskEmail(email)}
                        </span>
                    ) : (
                        <span className="block font-medium text-neutral-900 mt-1">
                            your email address
                        </span>
                    )}
                </p>

                {/* Instructions */}
                <div className="bg-primary-50 rounded-lg p-4 mb-6 text-left">
                    <h3 className="font-medium text-primary-800 mb-2">Next steps:</h3>
                    <ol className="text-sm text-primary-700 space-y-1.5 list-decimal list-inside">
                        <li>Check your inbox (and spam folder)</li>
                        <li>Click the verification link in the email</li>
                        <li>You&apos;ll be automatically signed in</li>
                    </ol>
                </div>

                {/* Link expiration info */}
                <div className="text-sm text-neutral-500 mb-6">
                    Link expires in approximately 1 hour
                </div>

                {/* Resend message */}
                {resendMessage && (
                    <div
                        className={`mb-4 p-3 rounded-lg text-sm ${resendMessage.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                    >
                        {resendMessage.message}
                    </div>
                )}

                {/* Resend button */}
                <div className="space-y-4">
                    <Button
                        onClick={handleResend}
                        variant="outline"
                        className="w-full"
                        disabled={isResending || !canResend || !email}
                    >
                        {isResending ? (
                            <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                        ) : (
                            <>
                                <RefreshCcw className={`w-4 h-4 mr-2 ${!canResend ? "opacity-50" : ""}`} />
                                Resend verification email
                                {!canResend && (
                                    <InlineCountdown
                                        seconds={60}
                                        onComplete={() => setCanResend(true)}
                                        className="ml-1 text-neutral-500"
                                    />
                                )}
                            </>
                        )}
                    </Button>

                    {/* Back to login */}
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-primary-600"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
