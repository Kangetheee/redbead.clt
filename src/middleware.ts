/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_OPTIONS, CHUNK_SIZE } from "@/lib/session/session.constants";
import type { Session } from "@/lib/session/session.types";
import env from "@/config/server.env";

const signInRoute = "/sign-in";
const signUpRoute = "/sign-up";
const authRoutes = [
  signInRoute,
  signUpRoute,
  "/forgot-password",
  "/reset-password",
];
const publicRoutes = [
  "/",
  "/products",
  "/products/.*",
  "/design-studio",
  "/design-studio/.*",
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

// Helper function to determine the appropriate auth route for redirects
function getAuthRedirectRoute(originalPath: string): string {
  // You can customize this logic based on your needs
  // For example, redirect to sign-up for certain paths, sign-in for others

  // Option 1: Always redirect to sign-in (current behavior)
  return signInRoute;

  // Option 2: Smart routing based on path
  // if (originalPath.includes('checkout') || originalPath.includes('premium')) {
  //   return signUpRoute; // New users might need to sign up for premium features
  // }
  // return signInRoute; // Default to sign-in for existing users
}

// Helper function to handle callback URL for auth routes
function handleAuthRouteCallback(
  req: NextRequest,
  targetAuthRoute: string
): NextResponse {
  const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");

  if (callbackUrl) {
    // If there's already a callback URL, preserve it
    const authUrl = new URL(targetAuthRoute, req.url);
    authUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(authUrl);
  }

  // No callback URL, just redirect to the auth route
  return NextResponse.redirect(new URL(targetAuthRoute, req.url));
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
        path,
      });
    }

    // More strict validation - check if the session actually has valid data
    const isAuth = !!session?.accessToken && !!session?.user?.id;

    // Role checking removed - treating all authenticated users the same

    // Handle callback URL preservation when switching between auth routes
    if (isAuthRoute && !isAuth) {
      const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");

      if (callbackUrl) {
        // User is on an auth route with a callback URL, preserve it
        return NextResponse.next();
      }
    }

    // Redirect to login if trying to access protected routes without auth
    if (!isAuthRoute && !isPublicRoute && !isAuth) {
      console.log("Redirecting to auth - not authenticated");

      const targetAuthRoute = getAuthRedirectRoute(path);
      const authUrl = new URL(targetAuthRoute, req.url);

      // Set callback URL to return to the original protected route
      authUrl.searchParams.set(
        "callbackUrl",
        req.nextUrl.pathname + req.nextUrl.search
      );

      return NextResponse.redirect(authUrl);
    }

    // Only redirect from auth routes if the session is VALID
    if (isAuth && isAuthRoute) {
      console.log("Redirecting from auth route - already authenticated");

      // Check if there's a callback URL to redirect to
      const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");

      if (callbackUrl) {
        // Validate the callback URL to prevent open redirect attacks
        try {
          const callback = new URL(callbackUrl, req.url);

          // Ensure it's the same origin
          if (callback.origin === req.nextUrl.origin) {
            console.log("Redirecting to callback URL:", callbackUrl);
            return NextResponse.redirect(callback);
          }
        } catch (error) {
          console.warn("Invalid callback URL:", callbackUrl);
        }
      }

      // No valid callback URL, redirect to default dashboard
      return NextResponse.redirect(new URL("/", req.url));
    }

    // All role-based routing removed - allow access to all routes for authenticated users

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
