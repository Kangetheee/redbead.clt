import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

export const createUserSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters"),
    email: z.string().email("Invalid email address"),
    phone: z
      .string()
      .refine(isValidPhoneNumber, { message: "Invalid phone number" }),
    username: z.string().min(1, "Username is required").optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string(),
    roleId: z.string().uuid("Invalid role ID"),
    isActive: z.boolean().default(true),
    verified: z.boolean().default(false),
    avatar: z.string().url("Invalid avatar URL").optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type CreateUserDto = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters")
      .optional(),
    email: z.string().email("Invalid email address").optional(),
    phone: z
      .string()
      .refine(isValidPhoneNumber, { message: "Invalid phone number" })
      .optional(),
    username: z.string().optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      )
      .optional(),
    confirmPassword: z.string().optional(),
    roleId: z.string().uuid("Invalid role ID").optional(),
    isActive: z.boolean().optional(),
    verified: z.boolean().optional(),
    avatar: z.string().url("Invalid avatar URL").optional(),
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type UpdateUserDto = z.infer<typeof updateUserSchema>;

export const getUsersSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  search: z.string().optional(),
  roleId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

export type GetUsersDto = z.infer<typeof getUsersSchema>;
