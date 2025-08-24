"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import FormButton from "@/components/ui/form-button";
import FormPhoneInput from "@/components/ui/form-phone-input";
import { verifyPhoneAction } from "@/lib/auth/auth.actions";
import {
  type VerifyPhoneDto,
  verifyPhoneSchema,
} from "@/lib/auth/dto/auth.dto";

export default function PhoneVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString() || "";
  const callbackUrl =
    new URLSearchParams(searchParamsString).get("callbackUrl") || "";

  const form = useForm<VerifyPhoneDto>({
    resolver: zodResolver(verifyPhoneSchema),
    defaultValues: { phone: "" },
  });

  const {
    control,
    formState: { isSubmitting: isPending },
    handleSubmit,
    reset,
  } = form;

  async function onSubmit(data: VerifyPhoneDto) {
    const result = await verifyPhoneAction(data);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    reset();
    toast.success("Verification code sent!");
    router.push(
      `/sign-up/verify?phone=${encodeURIComponent(data.phone)}${
        callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""
      }`
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormPhoneInput
          control={control}
          name="phone"
          label="Phone Number"
          placeholder="07000000000"
        />

        <FormButton isLoading={isPending} className="w-full">
          Send Verification Code
        </FormButton>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="underline-offset-4 hover:text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </form>
    </Form>
  );
}
