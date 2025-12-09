"use client";

import { forwardRef, useState, useEffect } from "react";
import { Phone } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface PhoneInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    showIcon?: boolean;
    error?: string;
    onChange?: (value: string) => void;
    value?: string;
}

function formatPhoneNumber(value: string): string {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Handle +63 prefix
    if (value.startsWith("+63")) {
        const localNumber = digits.slice(2); // Remove '63'
        if (localNumber.length <= 3) {
            return `+63 ${localNumber}`;
        } else if (localNumber.length <= 6) {
            return `+63 ${localNumber.slice(0, 3)} ${localNumber.slice(3)}`;
        } else {
            return `+63 ${localNumber.slice(0, 3)} ${localNumber.slice(3, 6)} ${localNumber.slice(6, 10)}`;
        }
    }

    // Handle 09XX format
    if (digits.startsWith("09") || digits.startsWith("9")) {
        const normalized = digits.startsWith("9") ? `0${digits}` : digits;
        if (normalized.length <= 4) {
            return normalized;
        } else if (normalized.length <= 7) {
            return `${normalized.slice(0, 4)} ${normalized.slice(4)}`;
        } else {
            return `${normalized.slice(0, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7, 11)}`;
        }
    }

    // Handle 63XXXXXXXXXX format (without +)
    if (digits.startsWith("63")) {
        return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 12)}`.trim();
    }

    return digits;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
    ({ className, showIcon = true, error, onChange, value = "", ...props }, ref) => {
        const [displayValue, setDisplayValue] = useState("");

        useEffect(() => {
            if (value) {
                setDisplayValue(formatPhoneNumber(value));
            }
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value;

            // Only allow digits, spaces, dashes, and plus sign
            const sanitized = inputValue.replace(/[^\d\s\-+]/g, "");

            // Format the number
            const formatted = formatPhoneNumber(sanitized);
            setDisplayValue(formatted);

            // Pass the raw digits to the form
            const rawValue = sanitized.replace(/[\s\-]/g, "");
            onChange?.(rawValue);
        };

        return (
            <div className="relative">
                {showIcon && (
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
                )}
                <Input
                    ref={ref}
                    type="tel"
                    inputMode="tel"
                    value={displayValue}
                    onChange={handleChange}
                    placeholder="+63 912 345 6789"
                    className={cn(
                        showIcon && "pl-10",
                        error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);

PhoneInput.displayName = "PhoneInput";
