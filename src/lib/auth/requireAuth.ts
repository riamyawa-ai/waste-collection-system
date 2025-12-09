import { getCurrentUser, hasRole } from "./helpers";
import { redirect } from "next/navigation";
import { DASHBOARD_ROUTES, type UserRole } from "@/constants";

/**
 * Higher-order function that requires authentication
 * Use in server components to protect pages
 */
export async function requireAuth() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return user;
}

/**
 * Higher-order function that requires specific role(s)
 * Redirects to correct dashboard if user doesn't have access
 */
export async function requireRole(
    allowedRoles: UserRole | UserRole[],
    redirectOnFail: boolean = true
) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const hasAccess = roles.includes(user.role);

    if (!hasAccess && redirectOnFail) {
        // Redirect to user's correct dashboard
        const correctDashboard = DASHBOARD_ROUTES[user.role] || DASHBOARD_ROUTES.client;
        redirect(correctDashboard);
    }

    return { user, hasAccess };
}

/**
 * Get authenticated user for a page
 * Returns null if not authenticated (doesn't redirect)
 */
export async function getAuthUser() {
    return getCurrentUser();
}

/**
 * Check if request is from an authenticated user
 * Returns boolean, doesn't redirect
 */
export async function checkAuth(): Promise<boolean> {
    const user = await getCurrentUser();
    return !!user;
}
