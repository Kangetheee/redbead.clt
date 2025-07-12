import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { CHUNK_SIZE } from "./session.constants";

export class SessionStore {
  private chunks: Record<string, string> = {};

  private cookieName: string;

  private constructor(cookieName: string) {
    this.cookieName = cookieName;
  }

  static async create(
    cookieName: string,
    reqCookie?: NextRequest["cookies"]
  ): Promise<SessionStore> {
    const store = new SessionStore(cookieName);
    const cookieStore = reqCookie || (await cookies());
    cookieStore.getAll().forEach((cookie) => {
      if (cookie.name.startsWith(store.cookieName)) {
        store.chunks[cookie.name] = cookie.value;
      }
    });
    return store;
  }

  get value() {
    return Object.keys(this.chunks)
      .sort((a, b) => {
        const aSuffix = parseInt(a.split(".").pop() || "0", 10);
        const bSuffix = parseInt(b.split(".").pop() || "0", 10);
        return aSuffix - bSuffix;
      })
      .map((key) => this.chunks[key])
      .join("");
  }

  chunk(value: string) {
    const chunkCount = Math.ceil(value.length / CHUNK_SIZE);
    const newChunks: Record<string, string> = {};

    for (let i = 0; i < chunkCount; i += 1) {
      const chunkName = i === 0 ? this.cookieName : `${this.cookieName}.${i}`;
      newChunks[chunkName] = value.substring(
        i * CHUNK_SIZE,
        (i + 1) * CHUNK_SIZE
      );
    }

    return newChunks;
  }

  async clean() {
    const cookieStore = await cookies();
    Object.keys(this.chunks).forEach((name) => {
      cookieStore.delete(name);
    });
  }
}
