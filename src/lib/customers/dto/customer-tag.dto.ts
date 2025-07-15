import { z } from "zod";

export const createCustomerTagSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters"),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Invalid hex color")
    .max(50, "Color must be less than 50 characters")
    .optional(),
});

export const updateCustomerTagSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters")
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Invalid hex color")
    .max(50, "Color must be less than 50 characters")
    .optional(),
});

export type CreateCustomerTagDto = z.infer<typeof createCustomerTagSchema>;
export type UpdateCustomerTagDto = z.infer<typeof updateCustomerTagSchema>;
