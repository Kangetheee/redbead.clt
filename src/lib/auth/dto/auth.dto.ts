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
