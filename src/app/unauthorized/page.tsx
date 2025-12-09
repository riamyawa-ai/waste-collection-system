import Link from "next/link";
import { ShieldX, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { APP_NAME } from "@/constants";

export const metadata: Metadata = {
    title: `Unauthorized | ${APP_NAME}`,
    description: "You don't have permission to access this page.",
};

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 p-4">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <ShieldX className="w-10 h-10 text-red-600" />
                </div>

                {/* Content */}
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                    Access Denied
                </h1>
                <p className="text-neutral-600 mb-8">
                    You don&apos;t have permission to access this page. If you believe this is an error,
                    please contact your administrator.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" asChild>
                        <Link href="javascript:history.back()">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/">
                            <Home className="w-4 h-4 mr-2" />
                            Go Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
