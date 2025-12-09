import { Suspense } from "react";
import { VerifyEmailContent } from "./verify-email-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Verify Email | EcoCollect Panabo",
    description: "Verify your email address to complete your EcoCollect Panabo registration.",
};

function LoadingFallback() {
    return (
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
            <div className="p-8 text-center">
                <div className="mx-auto w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-6 animate-pulse" />
                <div className="h-6 bg-neutral-100 rounded w-48 mx-auto mb-4 animate-pulse" />
                <div className="h-4 bg-neutral-100 rounded w-64 mx-auto animate-pulse" />
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <VerifyEmailContent />
        </Suspense>
    );
}
