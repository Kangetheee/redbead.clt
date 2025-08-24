import type { Metadata } from "next/types";
import { Suspense } from "react";

import { Card } from "@/components/ui/card";

import ResetPasswordForm from "./reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function ResetPasswordPage() {
  return (
    <Card className="p-6">
      <div className="flex flex-col space-y-2 text-left">
        <h1 className="text-2xl font-semibold tracking-tight">
          Reset Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter the reset code sent to your phone and your new password
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </Card>
  );
}
