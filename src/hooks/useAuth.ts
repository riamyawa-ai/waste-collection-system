"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AuthUser } from "@/lib/auth/helpers";
import type { UserRole } from "@/constants";

interface UseAuthReturn {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

/**
 * Hook for managing authentication state on the client
 */
export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchUser = useCallback(async () => {
        try {
            const { data: { user: authUser }, error } = await supabase.auth.getUser();

            if (error || !authUser) {
                setUser(null);
                return;
            }

            // Get profile data
            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", authUser.id)
                .single();

            setUser({
                id: authUser.id,
                email: authUser.email!,
                fullName: profile?.full_name || authUser.user_metadata?.full_name || "",
                phone: profile?.phone || authUser.user_metadata?.phone,
                role: (profile?.role || authUser.user_metadata?.role || "client") as UserRole,
                barangay: profile?.barangay || authUser.user_metadata?.barangay,
                address: profile?.address || authUser.user_metadata?.address,
                avatarUrl: profile?.avatar_url,
                emailVerified: !!authUser.email_confirmed_at,
                createdAt: authUser.created_at,
            });
        } catch (error) {
            console.error("Error fetching user:", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchUser();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, _session) => {
                if (event === "SIGNED_OUT") {
                    setUser(null);
                } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
                    await fetchUser();
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchUser, supabase.auth]);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
    }, [supabase.auth]);

    const refreshUser = useCallback(async () => {
        setIsLoading(true);
        await fetchUser();
    }, [fetchUser]);

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        signOut,
        refreshUser,
    };
}

/**
 * Hook for checking if user has specific role(s)
 */
export function useHasRole(allowedRoles: UserRole | UserRole[]): {
    hasRole: boolean;
    isLoading: boolean;
    currentRole: UserRole | null;
} {
    const { user, isLoading } = useAuth();

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const hasRole = user ? roles.includes(user.role) : false;

    return {
        hasRole,
        isLoading,
        currentRole: user?.role || null,
    };
}
