import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DASHBOARD_ROUTES, USER_ROLES, type UserRole } from "@/constants";

// Route protection configuration
const PROTECTED_ROUTES = {
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

  // If no user and trying to access protected route, redirect to login
  if (!user) {
    if (!isPublicRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
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
