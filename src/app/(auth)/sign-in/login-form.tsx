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
import { signInAction } from "@/lib/auth/auth.actions";
import { type SignInDto, signInSchema } from "@/lib/auth/dto/auth.dto";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString() || "";
  const callbackUrl =
    new URLSearchParams(searchParamsString).get("callbackUrl") || "";

  const otherParams = new URLSearchParams(searchParamsString);
  otherParams.delete("callbackUrl");
  otherParams.delete("msisdn");
  const dashboardUrl = otherParams.toString()
    ? `${callbackUrl}?${otherParams}`
    : callbackUrl;

  const form = useForm<SignInDto>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const {
    control,
    formState: { isSubmitting: isPending },
    handleSubmit,
    reset,
  } = form;

  async function onSubmit(data: SignInDto) {
    const result = await signInAction(data);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    reset();
    toast.success("Please wait...");
    router.replace(dashboardUrl);
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormPhoneInput
          control={control}
          name="identifier"
          label="Phone Number"
          placeholder="0700000000"
        />

        <div className="space-y-1">
          <FormInput
            control={control}
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <FormButton isLoading={isPending} className="w-full">
          Sign In
        </FormButton>

        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="underline-offset-4 hover:text-primary hover:underline"
          >
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
}
