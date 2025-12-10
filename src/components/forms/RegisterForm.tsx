"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail, User, ArrowRight, AlertCircle, Recycle, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordInput } from "@/components/ui/password-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { BarangaySelect } from "@/components/ui/barangay-select";
import { PasswordStrengthMeter } from "@/components/ui/password-strength";
import { registerSchema, type RegisterFormData } from "@/lib/validators/auth";
import { signUp, type AuthActionResult } from "@/lib/auth/actions";
import { APP_NAME } from "@/constants";

export function RegisterForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
            barangay: undefined,
            address: "",
            agreeToTerms: false,
        },
    });

    const password = watch("password");

    const onSubmit = (data: RegisterFormData) => {
        setError(null);

        startTransition(async () => {
            const result: AuthActionResult = await signUp(data);

            if (result.success && result.redirectTo) {
                router.push(result.redirectTo);
            } else {
                setError(result.error || "Failed to create account");
            }
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
            {/* Header */}
            <div className="p-8 pb-0 text-center">
                <Link href="/" className="inline-flex items-center gap-2 mb-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-eco">
                        <Recycle className="w-6 h-6 text-white" />
                    </div>
                </Link>
                <h1 className="text-2xl font-bold text-neutral-900">
                    Create your account
                </h1>
                <p className="mt-2 text-neutral-600">
                    Join {APP_NAME} and start managing your waste collection
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName" required>
                            First Name
                        </Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                            <Input
                                id="firstName"
                                placeholder="Juan"
                                className="pl-10"
                                disabled={isPending}
                                {...register("firstName")}
                            />
                        </div>
                        {errors.firstName && (
                            <p className="text-sm text-red-600">{errors.firstName.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName" required>
                            Last Name
                        </Label>
                        <Input
                            id="lastName"
                            placeholder="Dela Cruz"
                            disabled={isPending}
                            {...register("lastName")}
                        />
                        {errors.lastName && (
                            <p className="text-sm text-red-600">{errors.lastName.message}</p>
                        )}
                    </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                    <Label htmlFor="email" required>
                        Email Address
                    </Label>
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

                {/* Phone Field */}
                <div className="space-y-2">
                    <Label htmlFor="phone" required>
                        Phone Number
                    </Label>
                    <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                            <PhoneInput
                                id="phone"
                                value={field.value}
                                onChange={field.onChange}
                                disabled={isPending}
                                error={errors.phone?.message}
                            />
                        )}
                    />
                    {errors.phone && (
                        <p className="text-sm text-red-600">{errors.phone.message}</p>
                    )}
                </div>

                {/* Barangay Field */}
                <div className="space-y-2">
                    <Label htmlFor="barangay">
                        Barangay <span className="text-neutral-400">(Optional)</span>
                    </Label>
                    <Controller
                        name="barangay"
                        control={control}
                        render={({ field }) => (
                            <BarangaySelect
                                value={field.value}
                                onChange={field.onChange}
                                disabled={isPending}
                                error={errors.barangay?.message}
                            />
                        )}
                    />
                    {errors.barangay && (
                        <p className="text-sm text-red-600">{errors.barangay.message}</p>
                    )}
                </div>

                {/* Address Field */}
                <div className="space-y-2">
                    <Label htmlFor="address">
                        Complete Address <span className="text-neutral-400">(Optional)</span>
                    </Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
                        <Input
                            id="address"
                            placeholder="House/Lot No., Street, Purok"
                            className="pl-10"
                            disabled={isPending}
                            {...register("address")}
                        />
                    </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="password" required>
                            Password
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
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" required>
                            Confirm
                        </Label>
                        <PasswordInput
                            id="confirmPassword"
                            placeholder="••••••••"
                            disabled={isPending}
                            {...register("confirmPassword")}
                        />
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-600">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Password Strength Meter */}
                {password && (
                    <PasswordStrengthMeter password={password} showRequirements={true} />
                )}

                {/* Terms & Conditions */}
                <div className="flex items-start gap-2">
                    <Controller
                        name="agreeToTerms"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id="agreeToTerms"
                                className="mt-1"
                                disabled={isPending}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                    <label htmlFor="agreeToTerms" className="text-sm text-neutral-600 cursor-pointer">
                        I agree to the{" "}
                        <Link href="/terms" className="text-primary-600 hover:underline">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-primary-600 hover:underline">
                            Privacy Policy
                        </Link>
                    </label>
                </div>
                {errors.agreeToTerms && (
                    <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
                )}

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            Create Account
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </>
                    )}
                </Button>
            </form>

            {/* Footer */}
            <div className="px-8 pb-8 text-center">
                <p className="text-sm text-neutral-600">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-semibold text-primary-600 hover:text-primary-700"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
