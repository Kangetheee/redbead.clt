import env from "@/config/server.env";

const oneDay = 24 * 60 * 60 * 1000;

export const SESSION_OPTIONS = {
  NAME: "session",
  PATH: "/",
  // DOMAIN: "localhost",
  HTTP_ONLY: true,
  SECURE: env.NODE_ENV !== "development",
  SAME_SITE: "lax",
  EXPIRES: new Date(Date.now() + oneDay),
  ALGORITHM: "HS256",
  EXPIRATION_TIME: "1d",
} as const;

const ALLOWED_COOKIE_SIZE = 4096;
const ESTIMATED_EMPTY_COOKIE_SIZE = 160;
export const CHUNK_SIZE = ALLOWED_COOKIE_SIZE - ESTIMATED_EMPTY_COOKIE_SIZE;
