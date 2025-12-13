import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DASHBOARD_ROUTES, USER_ROLES, type UserRole } from "@/constants";

// Route protection configuration
const _PROTECTED_ROUTES = {
  admin: ["/admin"],
  staff: ["/staff"],
  client: ["/client"],
  collector: ["/collector"],
} as const;

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/auth/callback",
];

// Role access matrix - which roles can access which route prefixes
const ROLE_ACCESS: Record<string, UserRole[]> = {
  "/admin": [USER_ROLES.ADMIN],
  "/staff": [USER_ROLES.STAFF, USER_ROLES.ADMIN],
  "/client": [USER_ROLES.CLIENT],
  "/collector": [USER_ROLES.COLLECTOR],
};

/**
 * Check if system is in maintenance mode
 * Uses direct query to avoid circular dependency with server actions
 */
async function checkMaintenanceModeInMiddleware(supabase: ReturnType<typeof createServerClient>) {
  const now = new Date().toISOString();

  // Check for active maintenance announcements with current time in window
  const { data: maintenanceAnnouncement } = await supabase
    .from('announcements')
    .select('id, title, content, maintenance_start, maintenance_end, maintenance_allowed_roles')
    .eq('type', 'maintenance')
    .eq('is_published', true)
    .lte('maintenance_start', now)
    .gte('maintenance_end', now)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maintenanceAnnouncement) {
    return {
      isActive: true,
      title: maintenanceAnnouncement.title,
      message: maintenanceAnnouncement.content,
      endTime: maintenanceAnnouncement.maintenance_end,
      allowedRoles: maintenanceAnnouncement.maintenance_allowed_roles as string[] || ['admin'],
    };
  }

  // Also check system_settings for legacy maintenance mode
  const { data: settings } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'maintenance')
    .single();

  const maintenanceSettings = settings?.value as {
    enabled?: boolean;
    message?: string;
    scheduledEnd?: string;
  } | null;

  if (maintenanceSettings?.enabled) {
    return {
      isActive: true,
      title: 'System Maintenance',
      message: maintenanceSettings.message || 'System is under maintenance.',
      endTime: maintenanceSettings.scheduledEnd || null,
      allowedRoles: ['admin'], // Legacy fallback
    };
  }

  return null;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Check if the route is public
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check maintenance mode
  const maintenance = await checkMaintenanceModeInMiddleware(supabase);

  // If no user and trying to access protected route, redirect to login
  if (!user) {
    if (!isPublicRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);

      // If maintenance is active, add maintenance param to show modal
      if (maintenance?.isActive) {
        loginUrl.searchParams.set("maintenance", "true");
      }

      return NextResponse.redirect(loginUrl);
    }

    // If on login page during maintenance, pass maintenance info via header
    if (pathname === "/login" && maintenance?.isActive) {
      supabaseResponse.headers.set("x-maintenance-active", "true");
      supabaseResponse.headers.set("x-maintenance-message", maintenance.message || "");
      supabaseResponse.headers.set("x-maintenance-end", maintenance.endTime || "");
    }

    return supabaseResponse;
  }

  // User is authenticated - get their role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const userRole = (profile?.role as UserRole) || user.user_metadata?.role || USER_ROLES.CLIENT;

  // MAINTENANCE MODE CHECK FOR AUTHENTICATED USERS
  // If maintenance is active and user's role is NOT in the allowed list, force logout
  if (maintenance?.isActive) {
    const allowedRoles = maintenance.allowedRoles || ['admin'];

    // Check if user has permission
    if (!allowedRoles.includes(userRole)) {
      // Sign out the user
      await supabase.auth.signOut();

      // Redirect to login with maintenance modal
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("maintenance", "true");
      loginUrl.searchParams.set("forced", "true"); // Indicate they were logged out

      const redirectResponse = NextResponse.redirect(loginUrl);

      // Clear auth cookies
      redirectResponse.cookies.delete("sb-access-token");
      redirectResponse.cookies.delete("sb-refresh-token");

      return redirectResponse;
    }
  }

  // If user is on a public auth route (login, register), redirect to their dashboard
  const authRoutes = ["/login", "/register"];
  if (authRoutes.includes(pathname)) {
    const dashboardUrl = DASHBOARD_ROUTES[userRole] || DASHBOARD_ROUTES.client;
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Check role-based access for protected routes
  for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ACCESS)) {
    if (pathname.startsWith(routePrefix)) {
      if (!allowedRoles.includes(userRole)) {
        // User doesn't have access - redirect to their correct dashboard
        const correctDashboard = DASHBOARD_ROUTES[userRole] || DASHBOARD_ROUTES.client;
        return NextResponse.redirect(new URL(correctDashboard, request.url));
      }
      break;
    }
  }

  // Add user role to headers for use in pages
  supabaseResponse.headers.set("x-user-role", userRole);

  return supabaseResponse;
}
