import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

export const createUserSchema = z
  .object({
    name: z.string().min(1, "Required"),
    email: z.string().email("Invalid"),
    phone: z.string().refine(isValidPhoneNumber, { message: "Invalid" }),
    username: z.string().min(1, "Required"),
    password: z.string().optional(),
    // .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().optional(),
    roleId: z.string().min(1, "Required"),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => !data.password || (!!data.password && data.password.length >= 8),
    {
      path: ["password"],
      message: "Password must be at least 8 characters",
    }
  )
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type CreateUserDto = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email("Invalid").optional(),
    phone: z
      .string()
      .refine(isValidPhoneNumber, { message: "Invalid" })
      .optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    roleId: z.string().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => !data.password || (!!data.password && data.password.length >= 8),
    {
      path: ["password"],
      message: "Password must be at least 8 characters",
    }
  )
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
