/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import "server-only";

import env from "@/config/server.env";

import { headers, cookies } from "next/headers";
import { cache } from "react";
import { getErrorMessage } from "../get-error-message";
import { getSession, destroySession, createSession } from "../session/session";

type BaseOptions = {
  headers?: AxiosHeaders | Record<string, string>;
};

type RequestOptions = BaseOptions & {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  data?: Record<string, any> | FormData;
};

type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
  user: any;
};

export class Fetcher {
  constructor(
    private apiUri = axios.create({
      baseURL: env.API_URL,
      withCredentials: true,
      timeout: 30000,
    })
  ) {
    // Add response interceptor to handle cookies
    this.apiUri.interceptors.response.use(
      (response) => this.handleResponseCookies(response),
      (error) => Promise.reject(error)
    );
  }

  private isDev = env.NODE_ENV === "development";
  private isRefreshing = false;
  private refreshPromise: Promise<RefreshTokenResponse> | null = null;

  private async handleResponseCookies(
    response: AxiosResponse
  ): Promise<AxiosResponse> {
    // Extract and forward cookies from API response to browser
    const setCookieHeaders = response.headers["set-cookie"];

    if (setCookieHeaders && setCookieHeaders.length > 0) {
      const cookieStore = await cookies();

      if (this.isDev) {
        console.log("Processing cookies from API:", setCookieHeaders);
      }

      for (const cookieHeader of setCookieHeaders) {
        // Parse cookie header format: "name=value; Max-Age=123; HttpOnly; Secure; SameSite=Lax"
        const [nameValue, ...options] = cookieHeader.split("; ");
        const [name, value] = nameValue.split("=");

        if (name && value) {
          // Parse cookie options
          const cookieOptions: any = {
            httpOnly: true, // Default to httpOnly for security
            secure: env.NODE_ENV === "production",
            sameSite: "lax" as const,
          };

          for (const option of options) {
            const [key, val] = option.split("=");
            const lowerKey = key.toLowerCase();

            switch (lowerKey) {
              case "max-age":
                cookieOptions.maxAge = parseInt(val) * 1000; // Convert to milliseconds
                break;
              case "expires":
                cookieOptions.expires = new Date(val);
                break;
              case "httponly":
                cookieOptions.httpOnly = true;
                break;
              case "secure":
                cookieOptions.secure = true;
                break;
              case "samesite":
                cookieOptions.sameSite = val.toLowerCase() as
                  | "strict"
                  | "lax"
                  | "none";
                break;
              case "path":
                cookieOptions.path = val;
                break;
              case "domain":
                cookieOptions.domain = val;
                break;
            }
          }

          // Set the cookie in Next.js
          try {
            cookieStore.set(name, value, cookieOptions);
            if (this.isDev) {
              console.log(`Set cookie: ${name}=${value}`, cookieOptions);
            }
          } catch (error) {
            if (this.isDev) {
              console.error(`Failed to set cookie ${name}:`, error);
            }
          }
        }
      }
    }

    return response;
  }

  private async getClientHeaders() {
    const headersList = await headers();

    const headersToForward = [
      "user-agent",
      "accept-language",
      "x-forwarded-for",
      "referer",
      "accept",
      "origin",
    ];

    const clientHeaders: Record<string, string> = {};

    // Get IP address
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      headersList.get("cf-connecting-ip") ||
      headersList.get("true-client-ip") ||
      headersList.get("x-client-ip") ||
      headersList.get("forwarded") ||
      "";

    if (ip) {
      clientHeaders["X-Forwarded-For"] = ip;
      clientHeaders["X-Real-IP"] = ip;
    }

    headersToForward.forEach((header) => {
      const value = headersList.get(header);
      if (value) {
        const properHeader = header
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("-");

        clientHeaders[properHeader] = value;
      }
    });

    return clientHeaders;
  }

  private async getAllCookiesForBackend(): Promise<string> {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    // Convert to cookie header format that backend expects
    return allCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");
  }

  private async refreshAccessToken(): Promise<RefreshTokenResponse> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;

    try {
      const session = await getSession();
      if (!session?.refreshToken) {
        throw new Error("No refresh token available");
      }

      this.refreshPromise = this.apiUri
        .request<RefreshTokenResponse>({
          url: "/v1/auth/refresh",
          method: "POST",
          data: { refreshToken: session.refreshToken },
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => response.data);

      const result = await this.refreshPromise;

      await createSession({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      });

      return result;
    } catch (error) {
      await destroySession();
      throw new Error("Session expired. Please log in again.");
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  public request = cache(
    async <T = any>(
      url: string,
      options: RequestOptions = {},
      authOptions: { auth: boolean; skipRefresh?: boolean } = { auth: true }
    ): Promise<T> => {
      try {
        const headersList = await this.getClientHeaders();
        const hasAuth = authOptions.auth;
        const skipRefresh = authOptions.skipRefresh || false;
        const {
          headers: otherHeaders,
          method = "GET",
          ...restOptions
        } = options;

        const session = await getSession();
        const accessToken = session?.accessToken ?? null;

        if (hasAuth && !accessToken) {
          throw new Error("No active session found. Please login to continue");
        }

        // Build headers
        const baseHeaders: Record<string, string> = {
          ...headersList,
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        };

        // CRITICAL: Forward all existing cookies to backend for session tracking
        const existingCookies = await this.getAllCookiesForBackend();
        if (existingCookies) {
          baseHeaders["Cookie"] = existingCookies;

          if (this.isDev) {
            console.log(`Forwarding cookies to backend: ${existingCookies}`);
          }
        }

        // Don't set Content-Type for FormData
        const isFormData =
          restOptions.data && restOptions.data instanceof FormData;
        if (!isFormData) {
          baseHeaders["Content-Type"] = "application/json";
          baseHeaders["Accept"] = "application/json";
        }

        const finalHeaders = {
          ...baseHeaders,
          ...(!isFormData && otherHeaders ? otherHeaders : {}),
        };

        const requestOptions: AxiosRequestConfig = {
          url,
          method,
          ...restOptions,
          headers: finalHeaders,
        };

        if (this.isDev) {
          console.dir({ requestOptions }, { depth: null });
        }

        const response = await this.apiUri.request<T>(requestOptions);

        const resp = response?.data;

        if (this.isDev) {
          console.dir({ requestResponse: resp }, { depth: null });
        }

        return resp;
      } catch (error) {
        if (error instanceof AxiosError) {
          // Handle 401 Unauthorized
          if (
            error.response?.status === 401 &&
            authOptions.auth &&
            !authOptions.skipRefresh &&
            !url.includes("/auth/refresh")
          ) {
            try {
              if (this.isDev) {
                console.log("Access token expired, attempting refresh...");
              }

              await this.refreshAccessToken();

              return this.request<T>(url, options, {
                auth: authOptions.auth,
                skipRefresh: true,
              });
            } catch (refreshError) {
              if (this.isDev) {
                console.error("Token refresh failed:", refreshError);
              }
              throw new Error("Session expired. Please log in again.");
            }
          }

          // Handle network errors
          if (error.code === "ETIMEDOUT") {
            console.error("Request timed out. Server might be unresponsive.");
            throw new Error("Request timed out. Please try again later.");
          }
          if (error.code === "ENETUNREACH") {
            console.error(
              "Network unreachable. Please check your internet connection."
            );
            throw new Error(
              "Network is unreachable. Please check your internet connection."
            );
          }
          if (error.code === "EHOSTUNREACH") {
            console.error(
              "Host unreachable. Check network connection or server status."
            );
            throw new Error(
              "Unable to reach the server. Please check your network connection."
            );
          }

          throw new Error(
            error.response?.data?.message ||
              error.message ||
              error.response?.statusText
          );
        }

        throw new Error(getErrorMessage(error));
      }
    }
  );
}
