import { type NextRequest, NextResponse } from "next/server";
import { getStoredSession } from "./lib/session/session";

const signInRoute = "/sign-in";
const authRoutes = [signInRoute, "/forgot-password", "/sign-up"];

// Public routes - no authentication required
const publicRoutes = [
  "/",
  "/api",
  "/products", // Public product browsing
  "/categories", // Public category browsing
];

// Role-based dashboard routes
const roleDashboards = {
  Customer: "/dashboard/customer",
  Staff: "/dashboard/staff",
  Admin: "/dashboard/admin",
} as const;

// Define protected routes by role - ALL these require authentication
const roleProtectedRoutes = {
  Customer: [
    "/dashboard/customer",
    "/design-studio",
    "/cart",
    "/checkout",
    "/orders",
    "/profile",
  ],
  Staff: [
    "/dashboard/staff",
    "/staff", // Staff-specific routes
    "/design-approvals", // Design approval workflow
    "/production", // Production management
    "/customer-support", // Customer support tools
  ],
  Admin: [
    "/dashboard/admin",
    "/dashboard/staff", // Admin can access staff routes
    "/admin", // Admin-specific routes
    "/settings", // System settings
    "/analytics", // Analytics and reports
    "/users", // User management
    "/roles", // Role management
  ],
} as const;

// All protected routes (union of all role-specific routes)
const allProtectedRoutes = [
  ...roleProtectedRoutes.Customer,
  ...roleProtectedRoutes.Staff,
  ...roleProtectedRoutes.Admin,
  "/dashboard", // Legacy dashboard route
];

function getRoleBasedDashboard(role: string): string {
  return (
    roleDashboards[role as keyof typeof roleDashboards] ||
    roleDashboards.Customer
  );
}

function canAccessRoute(userRole: string, path: string): boolean {
  const userRoutes =
    roleProtectedRoutes[userRole as keyof typeof roleProtectedRoutes];
  if (!userRoutes) return false;

  return userRoutes.some((route) => path.startsWith(route));
}

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(
    (route) => path === route || path.startsWith(route)
  );

  // Check if the current path is any protected route
  const isProtectedRoute = allProtectedRoutes.some((route) =>
    path.startsWith(route)
  );

  const cookie = req.cookies;
  const session = await getStoredSession(cookie);
  const isAuth = !!session;
  const userRole = session?.user?.role;

  // If user is not authenticated and trying to access protected routes
  if (isProtectedRoute && !isAuth) {
    const loginUrl = new URL(signInRoute, req.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      req.nextUrl.pathname + req.nextUrl.search
    );
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated
  if (isAuth && userRole) {
    // Redirect from auth routes to appropriate dashboard
    if (isAuthRoute) {
      const dashboard = getRoleBasedDashboard(userRole);
      return NextResponse.redirect(new URL(dashboard, req.url));
    }

    // Handle legacy /dashboard redirect
    if (path === "/dashboard") {
      const dashboard = getRoleBasedDashboard(userRole);
      return NextResponse.redirect(new URL(dashboard, req.url));
    }

    // Check if user can access the requested protected route
    if (isProtectedRoute && !canAccessRoute(userRole, path)) {
      // Redirect to their appropriate dashboard if they can't access the route
      const dashboard = getRoleBasedDashboard(userRole);
      return NextResponse.redirect(new URL(dashboard, req.url));
    }
  }

  // Allow access to public routes regardless of auth status
  if (isPublicRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (png, jpg, jpeg, gif, svg, webp)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp)$).*)",
  ],
};
