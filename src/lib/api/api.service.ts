import axios, { AxiosError, AxiosHeaders, AxiosRequestConfig } from "axios";
import "server-only";

import env from "@/config/server.env";

import { headers } from "next/headers";
import { cache } from "react";
import { getErrorMessage } from "../get-error-message";
import { getSession } from "../session/session";

type BaseOptions = {
  headers?: AxiosHeaders | Record<string, string>;
};

type RequestOptions = BaseOptions & {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any> | FormData;
};

export class Fetcher {
  constructor(private apiUri = axios.create({ baseURL: env.API_URL })) {}

  private isDev = env.NODE_ENV === "development";

  private async getClientHeaders() {
    const headersList = await headers();

    // List of headers you want to forward
    const headersToForward = [
      "user-agent",
      "accept-language",
      "x-forwarded-for",
      "referer",
      "accept",
      "origin",
      // 'x-real-ip',
    ];

    const clientHeaders: Record<string, string> = {};

    // Get IP address from various possible headers
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      headersList.get("cf-connecting-ip") || // Cloudflare
      headersList.get("true-client-ip") || // Akamai and Cloudflare
      headersList.get("x-client-ip") || // AWS WAF
      headersList.get("forwarded") || // RFC 7239
      "";

    if (ip) {
      clientHeaders["X-Forwarded-For"] = ip;
      clientHeaders["X-Real-IP"] = ip;
    }

    headersToForward.forEach((header) => {
      const value = headersList.get(header);
      if (value) {
        // Convert to proper case (e.g., 'user-agent' to 'User-Agent')
        const properHeader = header
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("-");

        clientHeaders[properHeader] = value;
      }
    });

    return clientHeaders;
  }

  public request = cache(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async <T = any>(
      url: string,
      options: RequestOptions = {},
      authOptions: { auth: boolean } = { auth: true }
    ): Promise<T> => {
      try {
        const headersList = await this.getClientHeaders();
        const hasAuth = authOptions.auth;
        const {
          headers: otherHeaders,
          method = "GET",
          ...restOptions
        } = options;

        const accessToken = (await getSession())?.accessToken ?? null;

        if (hasAuth && !accessToken)
          throw new Error("No active session found. Please login to continue");

        // Build headers object, handling FormData specially
        const baseHeaders: Record<string, string> = {
          ...headersList,
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        };

        // Don't set Content-Type for FormData - let the browser set it with boundary
        const isFormData =
          restOptions.data && restOptions.data instanceof FormData;
        if (!isFormData) {
          baseHeaders["Content-Type"] = "application/json";
          baseHeaders["Accept"] = "application/json";
        }

        // Merge additional headers, but don't override Content-Type for FormData
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

        console.log(requestOptions);

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
