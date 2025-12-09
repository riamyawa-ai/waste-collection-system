"use client";

import { useState, forwardRef } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface PasswordInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    showIcon?: boolean;
    error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, showIcon = true, error, ...props }, ref) => {
        const [isVisible, setIsVisible] = useState(false);

        return (
            <div className="relative">
                {showIcon && (
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
                )}
                <Input
                    ref={ref}
                    type={isVisible ? "text" : "password"}
                    className={cn(
                        showIcon && "pl-10",
                        "pr-10",
                        error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                        className
                    )}
                    {...props}
                />
                <button
                    type="button"
                    onClick={() => setIsVisible(!isVisible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none focus:text-primary-600"
                    tabIndex={-1}
                    aria-label={isVisible ? "Hide password" : "Show password"}
                >
                    {isVisible ? (
                        <EyeOff className="w-5 h-5" />
                    ) : (
                        <Eye className="w-5 h-5" />
                    )}
                </button>
            </div>
        );
    }
);

PasswordInput.displayName = "PasswordInput";
