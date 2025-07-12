import { NextRequest, NextResponse } from "next/server";

import { getStoredSession } from "./lib/session/session";

const signInRoute = "/sign-in";
const authRoutes = [signInRoute, "/forgot-password"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  const cookie = req.cookies;
  const session = await getStoredSession(cookie);
  const isAuth = !!session;

  if (!isAuthRoute && !isAuth) {
    const loginUrl = new URL(signInRoute, req.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      req.nextUrl.pathname + req.nextUrl.search
    );
    return NextResponse.redirect(loginUrl);
  }

  if (isAuth) {
    if (isAuthRoute) return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
