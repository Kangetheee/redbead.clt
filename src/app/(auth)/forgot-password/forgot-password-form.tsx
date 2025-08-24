"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import FormButton from "@/components/ui/form-button";
import FormPhoneInput from "@/components/ui/form-phone-input";
import { forgotPasswordAction } from "@/lib/auth/auth.actions";
import {
  type ForgotPasswordDto,
  forgotPasswordSchema,
} from "@/lib/auth/dto/auth.dto";

export default function ForgotPasswordForm() {
  const router = useRouter();

  const form = useForm<ForgotPasswordDto>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { identifier: "" },
  });

  const {
    control,
    formState: { isSubmitting: isPending },
    handleSubmit,
    reset,
  } = form;

  async function onSubmit(data: ForgotPasswordDto) {
    const result = await forgotPasswordAction(data);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    reset();
    toast.success(result.data.message);

    // Redirect to reset password page with the phone number
    const resetPasswordUrl = `/reset-password?identifier=${encodeURIComponent(data.identifier)}`;
    router.push(resetPasswordUrl);
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
              Send Reset Code
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
