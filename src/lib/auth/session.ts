import { createClient } from "@/lib/supabase/server";

// Re-export session config for shared access
export { SESSION_CONFIG } from "./client-session";

/**
 * Get the current session with user data (server-side only)
 */
export async function getServerSession() {
    const supabase = await createClient();

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
        return null;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    // Get profile for role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single();

    return {
        user: {
            id: user.id,
            email: user.email,
            role: profile?.role || user.user_metadata?.role || "client",
            fullName: profile?.full_name || user.user_metadata?.full_name,
        },
        accessToken: session.access_token,
        expiresAt: session.expires_at,
    };
}

/**
 * Refresh the current session (server-side only)
 */
export async function refreshServerSession() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
        console.error("Failed to refresh session:", error);
        return null;
    }

    return data.session;
}
