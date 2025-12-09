"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getClientSessionManager } from "@/lib/auth/client-session";
import { SessionTimeoutWarning } from "@/components/ui/rate-limit-warning";
import { DASHBOARD_ROUTES, type UserRole } from "@/constants";

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
    const [remainingMinutes, setRemainingMinutes] = useState(5);

    useEffect(() => {
        const supabase = createClient();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === "SIGNED_OUT") {
                    router.push("/login");
                } else if (event === "SIGNED_IN" && session) {
                    // Get user role and redirect to appropriate dashboard
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("role")
                        .eq("id", session.user.id)
                        .single();

                    const role = (profile?.role as UserRole) || "client";
                    const dashboardUrl = DASHBOARD_ROUTES[role];

                    // Only redirect if on login/register page
                    if (pathname === "/login" || pathname === "/register") {
                        router.push(dashboardUrl);
                    }
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [router, pathname]);

    useEffect(() => {
        // Initialize session manager for timeout handling
        const sessionManager = getClientSessionManager();

        sessionManager.init({
            onTimeoutWarning: () => {
                const remaining = Math.ceil(sessionManager.getRemainingTime() / 60000);
                setRemainingMinutes(remaining);
                setShowTimeoutWarning(true);
            },
            onTimeout: () => {
                setShowTimeoutWarning(false);
                router.push("/login?reason=timeout");
            },
        });

        // Update activity on mount
        sessionManager.updateLastActivity();

        return () => {
            sessionManager.cleanup();
        };
    }, [router]);

    const handleExtendSession = async () => {
        const sessionManager = getClientSessionManager();
        const extended = await sessionManager.extendSession();

        if (extended) {
            setShowTimeoutWarning(false);
        }
    };

    return (
        <>
            {children}
            {showTimeoutWarning && (
                <SessionTimeoutWarning
                    remainingMinutes={remainingMinutes}
                    onExtend={handleExtendSession}
                />
            )}
        </>
    );
}
