import { Metadata } from "next";
import { ReactNode } from "react";

import { CircleDot } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-svh bg-background">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e5,#0ea5e9,#4f46e5)] opacity-10 dark:opacity-20" />

      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-4 top-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-4 top-1/2 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="bg-grid-white/[0.02] absolute inset-0 bg-[size:32px]" />

      <div className="container relative flex min-h-svh flex-col items-center justify-center px-4 py-8 mx-auto">
        <div className="w-full max-w-[440px] space-y-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative w-64">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary/20 to-primary/20 blur" />
              <div className="relative">
                <h1 className="text-2xl font-bold">Mama Bima Admin</h1>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <CircleDot className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-muted-foreground">
                Mama Bima Admin
              </p>
            </div>
          </div>
          {children}

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Secure login powered by Oleq</p>
            <p className="mt-1">
              © {new Date().getFullYear()} Mama Bima. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
