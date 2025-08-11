import { z } from "zod";

export const ADDRESS_TYPES = ["SHIPPING", "BILLING", "BOTH"] as const;

// Create Address DTO Schema
export const createAddressSchema = z.object({
  name: z.string().min(1, "Address name is required").max(100, "Name too long"),
  recipientName: z
    .string()
    .min(1, "Recipient name is required")
    .max(100, "Recipient name too long"),
  companyName: z.string().max(100, "Company name too long").optional(),
  street: z
    .string()
    .min(1, "Street address is required")
    .max(200, "Street address too long"),
  street2: z.string().max(200, "Street address 2 too long").optional(),
  city: z.string().min(1, "City is required").max(100, "City name too long"),
  state: z.string().max(100, "State name too long").optional(),
  postalCode: z
    .string()
    .min(1, "Postal code is required")
    .max(20, "Postal code too long"),
  country: z.string().length(2, "Country must be a 2-letter code (e.g., KE)"),
  phone: z.string().max(20, "Phone number too long").optional(),
  addressType: z.enum(ADDRESS_TYPES, {
    errorMap: () => ({
      message: "Address type must be SHIPPING, BILLING, or BOTH",
    }),
  }),
  isDefault: z.boolean().default(false),
});

export type CreateAddressDto = z.infer<typeof createAddressSchema>;

// Update Address DTO Schema
export const updateAddressSchema = z.object({
  name: z
    .string()
    .min(1, "Address name is required")
    .max(100, "Name too long")
    .optional(),
  recipientName: z
    .string()
    .min(1, "Recipient name is required")
    .max(100, "Recipient name too long")
    .optional(),
  companyName: z.string().max(100, "Company name too long").optional(),
  street: z
    .string()
    .min(1, "Street address is required")
    .max(200, "Street address too long")
    .optional(),
  street2: z.string().max(200, "Street address 2 too long").optional(),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City name too long")
    .optional(),
  state: z.string().max(100, "State name too long").optional(),
  postalCode: z
    .string()
    .min(1, "Postal code is required")
    .max(20, "Postal code too long")
    .optional(),
  country: z
    .string()
    .length(2, "Country must be a 2-letter code (e.g., KE)")
    .optional(),
  phone: z.string().max(20, "Phone number too long").optional(),
  addressType: z
    .enum(ADDRESS_TYPES, {
      errorMap: () => ({
        message: "Address type must be SHIPPING, BILLING, or BOTH",
      }),
    })
    .optional(),
  isDefault: z.boolean().optional(),
});

export type UpdateAddressDto = z.infer<typeof updateAddressSchema>;

// Get Addresses DTO Schema
export const getAddressesSchema = z.object({
  page: z.number().min(1, "Page must be at least 1").optional().default(1),
  limit: z
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .optional()
    .default(10),
});

export type GetAddressesDto = z.infer<typeof getAddressesSchema>;
