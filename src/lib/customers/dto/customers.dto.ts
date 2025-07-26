import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

/**
 * Schema for getting customers with pagination and search
 * Used with GET /v1/customers
 */
export const getCustomersSchema = z.object({
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(10).optional(),
  search: z.string().optional(),
});

export type GetCustomersDto = z.infer<typeof getCustomersSchema>;

/**
 * Schema for creating a new customer
 * Used with POST /v1/customers
 */
export const createCustomerSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" })
    .optional(),
  company: z.string().max(255, "Company name too long").optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
  notes: z.string().optional(),
});

export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;

/**
 * Schema for updating customer information
 * Used with PATCH /v1/customers/{id}
 */
export const updateCustomerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name too long")
    .optional(),
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

/**
 * Schema for getting customer recent orders
 * Used with GET /v1/customers/{id}/recent-orders
 */
export const getCustomerRecentOrdersSchema = z.object({
  limit: z.number().min(1).max(50).default(10).optional(),
});

export type GetCustomerRecentOrdersDto = z.infer<
  typeof getCustomerRecentOrdersSchema
>;
