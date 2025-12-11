"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/constants";

export function EmailVerificationSuccess() {
    const _searchParams = useSearchParams();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
            <div className="p-8 text-center">
                {/* Success icon */}
                <div className="mx-auto w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-primary-600" />
                </div>

                {/* Header */}
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                    Email Verified!
                </h1>
                <p className="text-neutral-600 mb-6">
                    Your email has been successfully verified. You can now access all features of {APP_NAME}.
                </p>

                {/* Auto-redirect notice */}
                <div className="bg-primary-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-primary-700">
                        You will be redirected to your dashboard in{" "}
                        <span className="font-semibold">{countdown} seconds</span>...
                    </p>
                </div>

                {/* Manual redirect button */}
                <Button asChild className="w-full">
                    <Link href="/client/dashboard">
                        Go to Dashboard
                    </Link>
                </Button>
            </div>
        </div>
    );
}
