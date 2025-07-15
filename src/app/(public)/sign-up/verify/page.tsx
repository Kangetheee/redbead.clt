import type { Metadata } from "next";
import { Suspense } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import OtpVerificationForm from "./otp-verification-form";

export const metadata: Metadata = {
  title: "Verify Phone Number",
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

export default function VerifyPhonePage() {
  return (
    <Card className="border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verify Your Phone
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code sent to your phone
          </p>
        </div>

        <Separator className="my-4" />

        <Suspense fallback={<LoadingSkeleton />}>
          <OtpVerificationForm />
        </Suspense>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Didn&apos;t receive the code? Check your messages or try again</p>
        </div>
      </CardContent>
    </Card>
  );
}
