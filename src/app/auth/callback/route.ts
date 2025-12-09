import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { DASHBOARD_ROUTES, USER_ROLES, type UserRole } from "@/constants";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";
    const type = searchParams.get("type");

    if (code) {
        const supabase = await createClient();

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            // Handle email verification
            if (type === "signup" || type === "email_change") {
                // Create or update user profile
                const { error: profileError } = await supabase
                    .from("profiles")
                    .upsert({
                        id: data.user.id,
                        email: data.user.email,
                        full_name: data.user.user_metadata?.full_name,
                        phone: data.user.user_metadata?.phone,
                        barangay: data.user.user_metadata?.barangay,
                        address: data.user.user_metadata?.address,
                        role: data.user.user_metadata?.role || USER_ROLES.CLIENT,
                        updated_at: new Date().toISOString(),
                    });

                if (profileError) {
                    console.error("Error creating profile:", profileError);
                }
            }

            // Handle password recovery
            if (type === "recovery") {
                return NextResponse.redirect(`${origin}/reset-password`);
            }

            // Get user role for redirect
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", data.user.id)
                .single();

            const role = (profile?.role as UserRole) || USER_ROLES.CLIENT;
            const dashboardUrl = DASHBOARD_ROUTES[role] || DASHBOARD_ROUTES.client;

            // Redirect to the appropriate dashboard
            return NextResponse.redirect(`${origin}${dashboardUrl}`);
        }
    }

    // Handle error - redirect to login with error message
    return NextResponse.redirect(
        `${origin}/login?error=Could not authenticate user`
    );
}
