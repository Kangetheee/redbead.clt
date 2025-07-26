import type { Metadata } from "next";
import { Suspense } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import PhoneVerificationForm from "./phone-verification-form";

export const metadata: Metadata = {
  title: "Sign Up - Phone Verification",
};

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-3 w-full max-w-40" />
        <Skeleton className="h-8 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Card className="border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create Your Account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your phone number to get started
          </p>
        </div>

        <Separator className="my-4" />

        <Suspense fallback={<LoadingSkeleton />}>
          <PhoneVerificationForm />
        </Suspense>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>We&apos;ll send you a verification code via SMS</p>
        </div>
      </CardContent>
    </Card>
  );
}
