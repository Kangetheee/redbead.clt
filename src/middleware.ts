/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_OPTIONS, CHUNK_SIZE } from "@/lib/session/session.constants";
import type { Session } from "@/lib/session/session.types";
import env from "@/config/server.env";

const signInRoute = "/sign-in";
const authRoutes = [signInRoute, "/sign-up"];
const publicRoutes = [
  "/",
  "/products",
  "/products/.*",
  "/studio",
  "/cart",
  "/about",
  "/contact",
];

// Middleware-specific session store for cookie handling
class MiddlewareSessionStore {
  private chunks: Record<string, string> = {};
  private cookieName: string;

  constructor(cookieName: string, cookies: NextRequest["cookies"]) {
    this.cookieName = cookieName;

    // Get all cookies related to the session
    cookies.getAll().forEach((cookie) => {
      if (cookie.name.startsWith(this.cookieName)) {
        this.chunks[cookie.name] = cookie.value;
      }
    });
  }

  get value(): string {
    return Object.keys(this.chunks)
      .sort((a, b) => {
        const aSuffix = Number.parseInt(a.split(".").pop() || "0", 10);
        const bSuffix = Number.parseInt(b.split(".").pop() || "0", 10);
        return aSuffix - bSuffix;
      })
      .map((key) => this.chunks[key])
      .join("");
  }
}

// Middleware-specific function to decrypt the session
async function decryptSession(sessionValue?: string): Promise<Session | null> {
  if (!sessionValue) return null;

  try {
    const secretKey = env.AUTH_SECRET;
    const encodedSecretKey = new TextEncoder().encode(secretKey);

    const { payload } = await jwtVerify<Session>(
      sessionValue,
      encodedSecretKey,
      {
        algorithms: [SESSION_OPTIONS.ALGORITHM],
      }
    );

    return payload as Session;
  } catch (error) {
    console.error("Failed to verify session in middleware:", error);
    return null;
  }
}

// Middleware-specific function to get the session
async function getMiddlewareSession(req: NextRequest): Promise<Session | null> {
  const sessionStore = new MiddlewareSessionStore(
    SESSION_OPTIONS.NAME,
    req.cookies
  );
  const session = await decryptSession(sessionStore.value);
  return session;
}

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Exclude API routes from middleware to avoid session issues
  if (path.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Skip middleware for static assets
  if (
    path.startsWith("/_next/") ||
    path.includes("/images/") ||
    path.endsWith(".jpg") ||
    path.endsWith(".png") ||
    path.endsWith(".svg") ||
    path.endsWith(".ico")
  ) {
    return NextResponse.next();
  }

  // Debug logging - use less verbose logging in production
  if (process.env.NODE_ENV !== "production") {
    console.log("Middleware running for path:", path);
  }

  // Check if this is an auth route
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  // Check if this is a public route
  const isPublicRoute = publicRoutes.some((route) => {
    if (route.endsWith(".*")) {
      const baseRoute = route.replace(".*", "");
      return path.startsWith(baseRoute);
    }
    return path === route;
  });

  try {
    // Using our middleware-specific function to get the session
    const session = await getMiddlewareSession(req);

    // Debug session info - only in development
    if (process.env.NODE_ENV !== "production") {
      console.log("Session in middleware:", {
        hasSession: !!session,
        userRole: session?.user?.role,
        path,
      });
    }

    // More strict validation - check if the session actually has valid data
    const isAuth = !!session?.accessToken && !!session?.user?.id;

    // Get user role
    const userRole = session?.user?.role;
    const isAdmin = userRole?.toLowerCase() === "admin";
    const isCustomer = userRole?.toLowerCase() === "customer";

    // Redirect to login if trying to access protected routes without auth
    if (!isAuthRoute && !isPublicRoute && !isAuth) {
      console.log("Redirecting to login - not authenticated");
      const loginUrl = new URL(signInRoute, req.url);
      loginUrl.searchParams.set(
        "callbackUrl",
        req.nextUrl.pathname + req.nextUrl.search
      );
      return NextResponse.redirect(loginUrl);
    }

    // Only redirect from auth routes if the session is VALID
    if (isAuth && isAuthRoute) {
      console.log("Redirecting from auth route - already authenticated");

      // Redirect to appropriate dashboard based on role
      if (isAdmin) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Handle app directory structure for customer and admin areas
    const isAdminPath = path.includes("/(admin)") || path.startsWith("/admin");
    const isCustomerPath =
      path.includes("/(customer)") || path.startsWith("/dashboard");

    // Redirect from customer dashboard to admin dashboard if user is admin
    if (isAuth && isAdmin && isCustomerPath) {
      console.log(
        "Admin user accessing customer dashboard - redirecting to admin dashboard"
      );
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // Restrict admin routes to admin users
    if (isAuth && isAdminPath && !isAdmin) {
      console.log(
        "Non-admin user accessing admin area - redirecting to customer dashboard"
      );
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("Middleware allowing access to:", path);
    }
    return NextResponse.next();
  } catch (error) {
    console.error("Error in middleware:", error);

    // On error, allow the request to continue to avoid blocking users
    return NextResponse.next();
  }
}

export const config = {
  // Improved matcher to exclude static files and API routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
