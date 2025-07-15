import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

export const createCustomerSchema = z.object({
  name: z.string().max(255, "Name too long").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" })
    .optional(),
  company: z.string().max(255, "Company name too long").optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
  notes: z.string().optional(),
});

export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;

export const updateCustomerSchema = z.object({
  name: z.string().max(255, "Name too long").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" })
    .optional(),
  company: z.string().max(255, "Company name too long").optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
  notes: z.string().optional(),
});

export type UpdateCustomerDto = z.infer<typeof updateCustomerSchema>;

export const getCustomersSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  search: z.string().optional(),
});

export type GetCustomersDto = z.infer<typeof getCustomersSchema>;
