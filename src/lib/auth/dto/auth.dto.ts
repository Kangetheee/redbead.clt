import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

export const signInSchema = z.object({
  identifier: z
    .string()
    .min(1, "Required")
    .refine((value) => isValidPhoneNumber(value), "Invalid phone number"),
  password: z.string().min(1, "Required"),
});
export type SignInDto = z.infer<typeof signInSchema>;

export const requestOtpSchema = z.object({
  identifier: z
    .string()
    .min(1, "Required")
    .refine((value) => isValidPhoneNumber(value), "Invalid phone number"),
});
export type RequestOtpDto = z.infer<typeof requestOtpSchema>;

export const signInOtpSchema = z.object({
  identifier: z
    .string()
    .min(1, "Required")
    .refine((value) => isValidPhoneNumber(value), "Invalid phone number"),
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});
export type SignInOtpDto = z.infer<typeof signInOtpSchema>;

export const resetPasswordSchema = z.object({
  identifier: z
    .string()
    .min(1, "Required")
    .refine((value) => isValidPhoneNumber(value), "Invalid phone number"),
});
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;

export const verifyPhoneSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine((value) => isValidPhoneNumber(value), "Invalid phone number"),
});
export type VerifyPhoneDto = z.infer<typeof verifyPhoneSchema>;

export const confirmPhoneSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine((value) => isValidPhoneNumber(value), "Invalid phone number"),
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});
export type ConfirmPhoneDto = z.infer<typeof confirmPhoneSchema>;

export const signUpSchema = z.object({
  verificationToken: z.string().min(1, "Verification token is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});
export type SignUpDto = z.infer<typeof signUpSchema>;
