"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import FormButton from "@/components/ui/form-button";
import FormInput from "@/components/ui/form-input";
import { confirmPhoneAction } from "@/lib/auth/auth.actions";
import {
  type ConfirmPhoneDto,
  confirmPhoneSchema,
} from "@/lib/auth/dto/auth.dto";

export default function OtpVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams?.get("phone") || "";
  const searchParamsString = searchParams?.toString() || "";
  const callbackUrl =
    new URLSearchParams(searchParamsString).get("callbackUrl") || "";

  const form = useForm<ConfirmPhoneDto>({
    resolver: zodResolver(confirmPhoneSchema),
    defaultValues: { phone, otp: "" },
  });

  const {
    control,
    formState: { isSubmitting: isPending },
    handleSubmit,
    reset,
  } = form;

  async function onSubmit(data: ConfirmPhoneDto) {
    const result = await confirmPhoneAction(data);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    reset();
    toast.success("Phone verified successfully!");
    router.push(
      `/sign-up/complete?token=${encodeURIComponent(result.data?.verificationToken || "")}${
        callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""
      }`
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Code sent to: <span className="font-medium">{phone}</span>
          </p>
        </div>

        <FormInput
          control={control}
          name="otp"
          label="Verification Code"
          placeholder="000000"
          maxLength={6}
          className="text-center text-lg tracking-widest"
        />

        <FormButton isLoading={isPending} className="w-full">
          Verify Phone Number
        </FormButton>

        <div className="text-center text-sm text-muted-foreground">
          <Link
            href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="underline-offset-4 hover:text-primary hover:underline"
          >
            Use different phone number
          </Link>
        </div>
      </form>
    </Form>
  );
}
