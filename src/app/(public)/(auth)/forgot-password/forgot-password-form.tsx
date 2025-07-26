"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import FormButton from "@/components/ui/form-button";
import FormPhoneInput from "@/components/ui/form-phone-input";
import { resetPasswordAction } from "@/lib/auth/auth.actions";
import {
  type ResetPasswordDto,
  resetPasswordSchema,
} from "@/lib/auth/dto/auth.dto";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString() || "";
  const callbackUrl =
    new URLSearchParams(searchParamsString).get("callbackUrl") || "/";

  const otherParams = new URLSearchParams(searchParamsString);
  otherParams.delete("callbackUrl");
  otherParams.delete("msisdn");
  const dashboardUrl = otherParams.toString()
    ? `${callbackUrl}?${otherParams.toString()}`
    : callbackUrl;

  const form = useForm<ResetPasswordDto>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { identifier: "" },
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
    toast.success("Please wait...");
    router.replace(dashboardUrl);
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <FormPhoneInput
              control={control}
              name="identifier"
              label="Phone Number"
              placeholder="07000000000"
            />

            <FormButton className="mt-2" isLoading={isPending}>
              Reset Password
            </FormButton>
            <div className="flex justify-end">
              <Link
                href="/sign-in"
                className="text-sm font-medium text-muted-foreground hover:opacity-75"
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
