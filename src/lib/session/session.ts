import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { JWTPayload, SignJWT, jwtVerify } from "jose";
import "server-only";

import env from "@/config/server.env";

import { Logger } from "../shared/logger";
import { SESSION_OPTIONS } from "./session.constants";
import { SessionStore } from "./session.store";
import { Session } from "./session.types";

const secretKey = env.AUTH_SECRET;
const encodedSecretKey = new TextEncoder().encode(secretKey);

const logger = new Logger("Session");

export async function encrypt<T extends JWTPayload>(
  payload: T,
  expirationTime: string
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: SESSION_OPTIONS.ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(encodedSecretKey);
}

export async function decrypt<T>(session?: string) {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify<T>(session, encodedSecretKey, {
      algorithms: [SESSION_OPTIONS.ALGORITHM],
    });
    return payload as T;
  } catch (error) {
    logger.error("Failed to verify session", error);
    return null;
  }
}

export async function createSession(payload: Session) {
  // @ts-expect-error - TODO: fix this
  const session = await encrypt<Session>(
    payload,
    SESSION_OPTIONS.EXPIRATION_TIME
  );

  const sessionStore = await SessionStore.create(SESSION_OPTIONS.NAME);
  const chunks = sessionStore.chunk(session);

  const cookieStore = await cookies();
  Object.entries(chunks).forEach(([name, value]) => {
    cookieStore.set(name, value, {
      httpOnly: SESSION_OPTIONS.HTTP_ONLY,
      secure: SESSION_OPTIONS.SECURE,
      expires: SESSION_OPTIONS.EXPIRES,
      sameSite: SESSION_OPTIONS.SAME_SITE,
      path: SESSION_OPTIONS.PATH,
    });
  });

  cookieStore.set(SESSION_OPTIONS.NAME, session, {
    httpOnly: SESSION_OPTIONS.HTTP_ONLY,
    secure: SESSION_OPTIONS.SECURE,
    expires: SESSION_OPTIONS.EXPIRES,
    sameSite: SESSION_OPTIONS.SAME_SITE,
    path: SESSION_OPTIONS.PATH,
  });
}

export async function destroySession() {
  const sessionStore = await SessionStore.create(SESSION_OPTIONS.NAME);
  sessionStore.clean();
}

export async function getStoredSession(cookie?: NextRequest["cookies"]) {
  const sessionStore = await SessionStore.create(SESSION_OPTIONS.NAME, cookie);
  const session = await decrypt<Session>(sessionStore.value);
  if (!session) return null;

  return session;
}

export async function getSession(cookie?: NextRequest["cookies"]) {
  return getStoredSession(cookie);
}
