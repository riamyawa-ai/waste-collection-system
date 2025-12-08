"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME, PANABO_BARANGAYS } from "@/constants";
import {
  Recycle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Phone,
  MapPin,
} from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement registration logic with Supabase
    setTimeout(() => setIsLoading(false), 1000);
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
      <form onSubmit={handleSubmit} className="p-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fullName" required>
            Full Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              id="fullName"
              type="text"
              placeholder="Juan dela Cruz"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" required>
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              id="email"
              type="email"
              placeholder="juan@example.com"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" required>
            Phone Number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              id="phone"
              type="tel"
              placeholder="+63 912 345 6789"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="barangay" required>
            Barangay
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 z-10" />
            <select
              id="barangay"
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors appearance-none cursor-pointer"
              required
            >
              <option value="">Select your barangay</option>
              {PANABO_BARANGAYS.map((barangay) => (
                <option key={barangay} value={barangay}>
                  {barangay}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" required>
            Complete Address
          </Label>
          <Input
            id="address"
            type="text"
            placeholder="House/Lot No., Street, Purok"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password" required>
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" required>
              Confirm
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            className="mt-1 w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            required
          />
          <label htmlFor="terms" className="text-sm text-neutral-600">
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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
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
