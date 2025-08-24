"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import FormButton from "@/components/ui/form-button";
import FormInput from "@/components/ui/form-input";
import FormPhoneInput from "@/components/ui/form-phone-input";
import { resetPasswordAction } from "@/lib/auth/auth.actions";
import {
  type ResetPasswordDto,
  resetPasswordSchema,
} from "@/lib/auth/dto/auth.dto";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifierParam = searchParams?.get("identifier") || "";

  const form = useForm<ResetPasswordDto>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      identifier: identifierParam,
      resetCode: "",
      newPassword: "",
    },
  });

  const {
    control,
    formState: { isSubmitting: isPending },
    handleSubmit,
    reset,
  } = form;

  async function onSubmit(data: ResetPasswordDto) {
    const result = await resetPasswordAction(data);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    reset();
    toast.success(result.data.message);

    // Redirect to sign in page after successful password reset
    router.push("/sign-in");
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <FormPhoneInput
              control={control}
              name="identifier"
              label="Phone Number"
              placeholder="07000000000"
              disabled
            />

            <FormInput
              control={control}
              name="resetCode"
              label="Reset Code"
              placeholder="Enter 6-digit code"
              type="text"
              maxLength={6}
            />

            <FormInput
              control={control}
              name="newPassword"
              label="New Password"
              placeholder="Enter your new password"
              type="password"
            />

            <FormButton className="mt-2" isLoading={isPending}>
              Reset Password
            </FormButton>

            <div className="flex justify-between text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-muted-foreground hover:opacity-75"
              >
                Didn&apos;t receive code?
              </Link>
              <Link
                href="/sign-in"
                className="font-medium text-muted-foreground hover:opacity-75"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
