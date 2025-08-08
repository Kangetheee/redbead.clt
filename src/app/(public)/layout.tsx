import type { Metadata } from "next";
import type { ReactNode } from "react";

import { CircleDot } from "lucide-react";

export const metadata: Metadata = {
  title: "Redbead",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-svh bg-background">
      {/* Animated gradient background - Updated to green and red */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#16a34a,#dc2626,#16a34a)] opacity-10 dark:opacity-20" />

      {/* Decorative circles - Updated to match new gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-4 top-1/4 h-64 w-64 rounded-full bg-green-600/10 blur-3xl" />
        <div className="absolute -right-4 top-1/2 h-64 w-64 rounded-full bg-red-600/10 blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="bg-grid-white/[0.02] absolute inset-0 bg-[size:32px]" />

      <div className="container relative flex min-h-svh flex-col items-center justify-center px-4 py-8 mx-auto">
        <div className="w-full max-w-[440px] space-y-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Removed the blurred background div */}
            <div className="relative">
              {" "}
              {/* This div remains to wrap the h1 */}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Redbead
              </h1>{" "}
              {/* Updated text */}
            </div>

            <div className="flex items-center gap-1.5">
              <CircleDot className="h-4 w-4 text-green-600" />{" "}
              {/* Icon color updated */}
              <p className="text-sm font-medium text-muted-foreground">
                Redbead
              </p>{" "}
              {/* Updated text */}
            </div>
          </div>
          {children}

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Secure login powered by OLEQ</p>
            <p className="mt-1">
              © {new Date().getFullYear()} Redbead. All rights reserved.
            </p>{" "}
          </div>
        </div>
      </div>
    </div>
  );
}
