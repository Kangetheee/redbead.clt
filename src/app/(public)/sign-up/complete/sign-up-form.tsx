"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import FormButton from "@/components/ui/form-button";
import FormInput from "@/components/ui/form-input";
import { signUpAction } from "@/lib/auth/auth.actions";
import { type SignUpDto, signUpSchema } from "@/lib/auth/dto/auth.dto";

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verificationToken = searchParams?.get("token") || "";

  const form = useForm<SignUpDto>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      verificationToken,
      name: "",
      email: "",
      company: "",
      password: "",
    },
  });

  const {
    control,
    formState: { isSubmitting: isPending },
    handleSubmit,
    reset,
  } = form;

  async function onSubmit(data: SignUpDto) {
    const result = await signUpAction(data);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    reset();
    toast.success("Account created successfully!");
    router.replace("/dashboard");
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormInput
          control={control}
          name="name"
          label="Full Name"
          placeholder="John Doe"
        />

        <FormInput
          control={control}
          name="email"
          label="Email Address"
          type="email"
          placeholder="john@example.com"
        />

        <FormInput
          control={control}
          name="company"
          label="Company (Optional)"
          placeholder="Your Company Ltd"
        />

        <FormInput
          control={control}
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          description="Must contain at least 8 characters with uppercase, lowercase, number and special character"
        />

        <FormButton isLoading={isPending} className="w-full">
          Create Account
        </FormButton>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="underline-offset-4 hover:text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </form>
    </Form>
  );
}
