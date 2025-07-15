"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import FormButton from "@/components/ui/form-button";
import FormInput from "@/components/ui/form-input";
import FormPhoneInput from "@/components/ui/form-phone-input";
import { requestOtpAction, signInWithOtpAction } from "@/lib/auth/auth.actions";
import {
  type RequestOtpDto,
  requestOtpSchema,
  type SignInOtpDto,
  signInOtpSchema,
} from "@/lib/auth/dto/auth.dto";

export default function OtpSignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");

  const searchParamsString = searchParams?.toString() || "";
  const callbackUrl =
    new URLSearchParams(searchParamsString).get("callbackUrl") || "/dashboard";

  const otherParams = new URLSearchParams(searchParamsString);
  otherParams.delete("callbackUrl");
  otherParams.delete("msisdn");
  const dashboardUrl = otherParams.toString()
    ? `${callbackUrl}?${otherParams.toString()}`
    : callbackUrl;

  const phoneForm = useForm<RequestOtpDto>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: { identifier: "" },
  });

  const otpForm = useForm<SignInOtpDto>({
    resolver: zodResolver(signInOtpSchema),
    defaultValues: { identifier: "", otp: "" },
  });

  async function onPhoneSubmit(data: RequestOtpDto) {
    const result = await requestOtpAction(data);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setPhoneNumber(data.identifier);
    otpForm.setValue("identifier", data.identifier);
    setStep("otp");
    toast.success("OTP sent to your phone!");
  }

  async function onOtpSubmit(data: SignInOtpDto) {
    const result = await signInWithOtpAction(data);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    otpForm.reset();
    toast.success("Please wait...");
    router.replace(dashboardUrl);
  }

  if (step === "phone") {
    return (
      <Form {...phoneForm}>
        <form
          onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
          className="space-y-4"
          noValidate
        >
          <FormPhoneInput
            control={phoneForm.control}
            name="identifier"
            label="Phone Number"
            placeholder="07000000000"
          />

          <FormButton
            isLoading={phoneForm.formState.isSubmitting}
            className="w-full"
          >
            Send OTP
          </FormButton>

          <div className="text-center text-sm text-muted-foreground">
            Prefer password?{" "}
            <Link
              href="/sign-in"
              className="underline-offset-4 hover:text-primary hover:underline"
            >
              Sign in with password
            </Link>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <Form {...otpForm}>
      <form
        onSubmit={otpForm.handleSubmit(onOtpSubmit)}
        className="space-y-4"
        noValidate
      >
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Code sent to: <span className="font-medium">{phoneNumber}</span>
          </p>
        </div>

        <FormInput
          control={otpForm.control}
          name="otp"
          label="Verification Code"
          placeholder="000000"
          maxLength={6}
          className="text-center text-lg tracking-widest"
        />

        <FormButton
          isLoading={otpForm.formState.isSubmitting}
          className="w-full"
        >
          Sign In
        </FormButton>

        <div className="flex justify-between text-sm text-muted-foreground">
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="underline-offset-4 hover:text-primary hover:underline"
          >
            Use different number
          </button>
          <button
            type="button"
            onClick={() => onPhoneSubmit({ identifier: phoneNumber })}
            className="underline-offset-4 hover:text-primary hover:underline"
          >
            Resend code
          </button>
        </div>
      </form>
    </Form>
  );
}
