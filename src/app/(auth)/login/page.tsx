import { LoginForm } from "@/components/forms/LoginForm";
import type { Metadata } from "next";
import { APP_NAME } from "@/constants";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: `Sign In | ${APP_NAME}`,
  description: `Sign in to your ${APP_NAME} account to manage waste collection services.`,
};

function LoginFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden p-8 animate-pulse">
        <div className="h-12 w-12 mx-auto bg-gray-200 rounded-xl mb-6" />
        <div className="h-8 w-48 mx-auto bg-gray-200 rounded mb-4" />
        <div className="h-4 w-64 mx-auto bg-gray-200 rounded mb-6" />
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
