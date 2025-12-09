"use client";

import { AlertTriangle, Clock, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface RateLimitWarningProps {
    remainingAttempts?: number;
    lockoutRemaining?: number;
    showCaptcha?: boolean;
    className?: string;
}

export function RateLimitWarning({
    remainingAttempts,
    lockoutRemaining,
    showCaptcha,
    className,
}: RateLimitWarningProps) {
    // Account is locked
    if (lockoutRemaining && lockoutRemaining > 0) {
        const minutes = Math.ceil(lockoutRemaining / 60);

        return (
            <div
                className={cn(
                    "flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200",
                    className
                )}
            >
                <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-sm font-medium text-red-800">
                        Account Temporarily Locked
                    </p>
                    <p className="text-sm text-red-600">
                        Too many failed login attempts. Please try again in{" "}
                        <span className="font-semibold">{minutes} minute{minutes !== 1 ? "s" : ""}</span>.
                    </p>
                </div>
            </div>
        );
    }

    // CAPTCHA required (3+ failed attempts)
    if (showCaptcha) {
        return (
            <div
                className={cn(
                    "flex items-start gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200",
                    className
                )}
            >
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-sm font-medium text-yellow-800">
                        Verification Required
                    </p>
                    <p className="text-sm text-yellow-700">
                        Please complete the security verification to continue.
                    </p>
                </div>
            </div>
        );
    }

    // Show remaining attempts warning
    if (remainingAttempts !== undefined && remainingAttempts <= 2 && remainingAttempts > 0) {
        return (
            <div
                className={cn(
                    "flex items-center gap-2 text-sm text-amber-600",
                    className
                )}
            >
                <Clock className="w-4 h-4" />
                <span>
                    {remainingAttempts} attempt{remainingAttempts !== 1 ? "s" : ""} remaining before lockout
                </span>
            </div>
        );
    }

    return null;
}

// Session timeout warning component
export function SessionTimeoutWarning({
    remainingMinutes,
    onExtend,
    className,
}: {
    remainingMinutes: number;
    onExtend: () => void;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "fixed bottom-4 right-4 max-w-sm p-4 bg-white rounded-lg shadow-lg border border-yellow-200 z-50",
                className
            )}
        >
            <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-neutral-800">
                        Session Expiring Soon
                    </p>
                    <p className="text-sm text-neutral-600">
                        Your session will expire in{" "}
                        <span className="font-semibold">{remainingMinutes} minute{remainingMinutes !== 1 ? "s" : ""}</span>{" "}
                        due to inactivity.
                    </p>
                    <button
                        onClick={onExtend}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                        Stay signed in
                    </button>
                </div>
            </div>
        </div>
    );
}
