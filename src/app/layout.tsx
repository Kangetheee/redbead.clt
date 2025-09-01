import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Toaster } from "@/components/ui/sonner";
import env from "@/config/server.env";
import { ProgressBar } from "@/providers/progress-bar";
import QueryProvider from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

import "../styles/globals.css";
import { CartSessionProvider } from "@/providers/cart-session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Redbead",
    default: "Redbead",
  },
  description: "Redbead",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <CartSessionProvider>
              {children}
              {env.NODE_ENV === "development" && (
                <ReactQueryDevtools buttonPosition="bottom-right" />
              )}
            </CartSessionProvider>
          </QueryProvider>

          <ProgressBar />
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
