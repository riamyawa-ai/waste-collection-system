"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
    seconds: number;
    onComplete?: () => void;
    className?: string;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
    autoStart?: boolean;
}

export function CountdownTimer({
    seconds,
    onComplete,
    className,
    size = "md",
    showLabel = true,
    autoStart = true,
}: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState(seconds);
    const [isRunning, setIsRunning] = useState(autoStart);

    useEffect(() => {
        if (!isRunning) return;

        if (timeLeft <= 0) {
            setIsRunning(false);
            onComplete?.();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isRunning, onComplete]);

    const reset = useCallback((newSeconds?: number) => {
        setTimeLeft(newSeconds ?? seconds);
        setIsRunning(true);
    }, [seconds]);

    const formatTime = (secs: number): string => {
        const minutes = Math.floor(secs / 60);
        const remainingSeconds = secs % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    const progress = (timeLeft / seconds) * 100;

    const sizes = {
        sm: {
            container: "w-16 h-16",
            circle: "w-14 h-14",
            text: "text-sm",
            strokeWidth: 3,
        },
        md: {
            container: "w-20 h-20",
            circle: "w-18 h-18",
            text: "text-base",
            strokeWidth: 4,
        },
        lg: {
            container: "w-24 h-24",
            circle: "w-22 h-22",
            text: "text-lg",
            strokeWidth: 5,
        },
    };

    const sizeConfig = sizes[size];
    const circumference = 2 * Math.PI * 40; // radius = 40

    return (
        <div className={cn("flex flex-col items-center gap-2", className)}>
            <div className={cn("relative", sizeConfig.container)}>
                <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 100 100"
                >
                    {/* Background circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={sizeConfig.strokeWidth}
                        className="text-neutral-200"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={sizeConfig.strokeWidth}
                        strokeLinecap="round"
                        className={cn(
                            "transition-all duration-1000",
                            timeLeft > 30
                                ? "text-primary-500"
                                : timeLeft > 10
                                    ? "text-yellow-500"
                                    : "text-red-500"
                        )}
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - progress / 100)}
                    />
                </svg>
                {/* Timer text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span
                        className={cn(
                            "font-mono font-semibold",
                            sizeConfig.text,
                            timeLeft <= 10 ? "text-red-600" : "text-neutral-700"
                        )}
                    >
                        {formatTime(timeLeft)}
                    </span>
                </div>
            </div>
            {showLabel && (
                <span className="text-sm text-neutral-500">
                    {timeLeft > 0 ? "Time remaining" : "Time expired"}
                </span>
            )}
        </div>
    );
}

// Simple inline countdown for buttons
export function InlineCountdown({
    seconds,
    onComplete,
    className,
}: {
    seconds: number;
    onComplete?: () => void;
    className?: string;
}) {
    const [timeLeft, setTimeLeft] = useState(seconds);

    useEffect(() => {
        if (timeLeft <= 0) {
            onComplete?.();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onComplete]);

    if (timeLeft <= 0) return null;

    return (
        <span className={cn("tabular-nums", className)}>
            ({timeLeft}s)
        </span>
    );
}
