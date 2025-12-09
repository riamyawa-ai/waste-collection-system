"use client";

import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    checkPasswordStrength,
    PASSWORD_REQUIREMENTS,
    type PasswordStrength,
} from "@/lib/validators/auth";

interface PasswordStrengthMeterProps {
    password: string;
    showRequirements?: boolean;
    className?: string;
}

export function PasswordStrengthMeter({
    password,
    showRequirements = true,
    className,
}: PasswordStrengthMeterProps) {
    const strength = useMemo(() => checkPasswordStrength(password), [password]);

    const strengthColors: Record<PasswordStrength["label"], string> = {
        weak: "bg-red-500",
        fair: "bg-orange-500",
        good: "bg-yellow-500",
        strong: "bg-primary-500",
        "very-strong": "bg-primary-600",
    };

    const strengthLabels: Record<PasswordStrength["label"], string> = {
        weak: "Weak",
        fair: "Fair",
        good: "Good",
        strong: "Strong",
        "very-strong": "Very Strong",
    };

    const requirements = [
        {
            key: "minLength",
            label: `At least ${PASSWORD_REQUIREMENTS.minLength} characters`,
            met: strength.requirements.minLength,
        },
        {
            key: "hasUppercase",
            label: "One uppercase letter (A-Z)",
            met: strength.requirements.hasUppercase,
        },
        {
            key: "hasLowercase",
            label: "One lowercase letter (a-z)",
            met: strength.requirements.hasLowercase,
        },
        {
            key: "hasNumber",
            label: "One number (0-9)",
            met: strength.requirements.hasNumber,
        },
        {
            key: "hasSpecialChar",
            label: "One special character (!@#$%^&*)",
            met: strength.requirements.hasSpecialChar,
        },
    ];

    if (!password) {
        return null;
    }

    return (
        <div className={cn("space-y-3", className)}>
            {/* Strength meter bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Password strength</span>
                    <span
                        className={cn(
                            "font-medium",
                            strength.label === "weak" && "text-red-600",
                            strength.label === "fair" && "text-orange-600",
                            strength.label === "good" && "text-yellow-600",
                            strength.label === "strong" && "text-primary-600",
                            strength.label === "very-strong" && "text-primary-700"
                        )}
                    >
                        {strengthLabels[strength.label]}
                    </span>
                </div>
                <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full transition-all duration-300 rounded-full",
                            strengthColors[strength.label]
                        )}
                        style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                </div>
            </div>

            {/* Requirements checklist */}
            {showRequirements && (
                <div className="space-y-1.5">
                    {requirements.map((req) => (
                        <div
                            key={req.key}
                            className={cn(
                                "flex items-center gap-2 text-sm transition-colors",
                                req.met ? "text-primary-600" : "text-neutral-500"
                            )}
                        >
                            {req.met ? (
                                <Check className="w-4 h-4 text-primary-500" />
                            ) : (
                                <X className="w-4 h-4 text-neutral-400" />
                            )}
                            <span>{req.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
