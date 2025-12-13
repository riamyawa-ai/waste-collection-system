"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail, ArrowRight, AlertCircle, Recycle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordInput } from "@/components/ui/password-input";
import { RateLimitWarning } from "@/components/ui/rate-limit-warning";

import { loginSchema, type LoginFormData } from "@/lib/validators/auth";
import { signIn, type AuthActionResult } from "@/lib/auth/actions";
import { checkMaintenanceMode } from "@/lib/actions/maintenance";
import { APP_NAME } from "@/constants";

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [rateLimitInfo, setRateLimitInfo] = useState<{
        remainingAttempts?: number;
        lockoutRemaining?: number;
        requiresCaptcha?: boolean;
    }>({});

    // Maintenance mode state
    const [showMaintenanceBanner, setShowMaintenanceBanner] = useState(false);
    const [maintenanceMessage, setMaintenanceMessage] = useState<string>("");
    const [maintenanceEndTime, setMaintenanceEndTime] = useState<string | null>(null);
    const [wasForced, setWasForced] = useState(false);

    // Check for maintenance mode on mount
    useEffect(() => {
        const maintenanceParam = searchParams.get("maintenance");
        const forcedParam = searchParams.get("forced");

        // Always check for maintenance mode (not just when URL param is present)
        const loadMaintenanceDetails = async () => {
            const result = await checkMaintenanceMode();
            if (result) {
                setMaintenanceMessage(result.message);
                setMaintenanceEndTime(result.endTime);
                setShowMaintenanceBanner(true);
                // Only set wasForced if explicitly redirected with forced=true
                setWasForced(maintenanceParam === "true" && forcedParam === "true");
            }
        };
        loadMaintenanceDetails();
    }, [searchParams]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    const onSubmit = (data: LoginFormData) => {
        setError(null);

        startTransition(async () => {
            const result: AuthActionResult = await signIn(data);

            if (result.success && result.redirectTo) {
                router.push(result.redirectTo);
                router.refresh();
            } else {
                setError(result.error || "Failed to sign in");
                setRateLimitInfo({
                    remainingAttempts: result.remainingAttempts,
                    lockoutRemaining: result.lockoutRemaining,
                    requiresCaptcha: result.requiresCaptcha,
                });
            }
        });
    };

    return (
        <div className="space-y-4">
            {/* Maintenance Banner */}
            {showMaintenanceBanner && (
                <Alert className="border-orange-200 bg-orange-50 text-orange-900">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <div className="ml-3">
                        <AlertDescription className="text-sm font-medium text-orange-800">
                            {wasForced ? "You have been logged out due to system maintenance." : "System Maintenance In Progress"}
                        </AlertDescription>
                        <div className="mt-2 text-sm text-orange-700">
                            <p className="mb-1">{maintenanceMessage || "The system is currently undergoing scheduled maintenance."}</p>
                            {maintenanceEndTime && (
                                <p className="text-xs text-orange-600 font-semibold mt-1">
                                    Expected completion: {new Date(maintenanceEndTime).toLocaleString(undefined, {
                                        dateStyle: 'medium',
                                        timeStyle: 'short'
                                    })}
                                </p>
                            )}
                        </div>
                    </div>
                </Alert>
            )}

            <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
                {/* Header */}
                <div className="p-8 pb-0 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-eco">
                            <Recycle className="w-6 h-6 text-white" />
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold text-neutral-900">Welcome back</h1>
                    <p className="mt-2 text-neutral-600">
                        Sign in to your {APP_NAME} account
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                    {/* Error Alert */}
                    {error && !rateLimitInfo.lockoutRemaining && (
                        <Alert variant="destructive">
                            <AlertCircle className="w-4 h-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Rate Limit Warning */}
                    <RateLimitWarning
                        remainingAttempts={rateLimitInfo.remainingAttempts}
                        lockoutRemaining={rateLimitInfo.lockoutRemaining}
                        showCaptcha={rateLimitInfo.requiresCaptcha}
                    />

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
                                disabled={isPending || !!rateLimitInfo.lockoutRemaining}
                                {...register("email")}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link
                                href="/forgot-password"
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <PasswordInput
                            id="password"
                            placeholder="••••••••"
                            disabled={isPending || !!rateLimitInfo.lockoutRemaining}
                            {...register("password")}
                        />
                        {errors.password && (
                            <p className="text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="rememberMe"
                            {...register("rememberMe")}
                        />
                        <label htmlFor="rememberMe" className="text-sm text-neutral-600 cursor-pointer">
                            Remember me for 30 days
                        </label>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isPending || !!rateLimitInfo.lockoutRemaining}
                    >
                        {isPending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Sign in
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </>
                        )}
                    </Button>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-neutral-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-neutral-500">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    {/* Google Sign In */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={isPending}
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </Button>
                </form>

                {/* Footer */}
                <div className="px-8 pb-8 text-center">
                    <p className="text-sm text-neutral-600">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            className="font-semibold text-primary-600 hover:text-primary-700"
                        >
                            Sign up for free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
