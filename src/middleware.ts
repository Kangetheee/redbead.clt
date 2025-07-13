import { type NextRequest, NextResponse } from "next/server";
import { getStoredSession } from "./lib/session/session";

const signInRoute = "/sign-in";
const authRoutes = [signInRoute, "/forgot-password", "/sign-up"];
const publicRoutes = ["/", "/api"]; // Landing page and API routes are public
const protectedRoutes = ["/dashboard"]; // Routes that require authentication

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(
    (route) => path === route || path.startsWith(route)
  );

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  const cookie = req.cookies;
  const session = await getStoredSession(cookie);
  const isAuth = !!session;

  // If user is not authenticated and trying to access protected routes
  if (isProtectedRoute && !isAuth) {
    const loginUrl = new URL(signInRoute, req.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      req.nextUrl.pathname + req.nextUrl.search
    );
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (isAuth && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
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
