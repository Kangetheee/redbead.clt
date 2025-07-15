import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Sign In",
};

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-3 w-full max-w-40" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full max-w-40" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-2 w-full max-w-40 ml-auto" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Card className="border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>

        <Separator className="my-4" />

        <Suspense fallback={<LoadingSkeleton />}>
          <LoginForm />
        </Suspense>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <Link
            href="/sign-in/otp"
            className="underline-offset-4 hover:text-primary hover:underline"
          >
            Sign in with OTP instead
          </Link>
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Protected by enterprise-grade security</p>
        </div>
      </CardContent>
    </Card>
  );
}
