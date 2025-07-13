import { z } from "zod";

export const ADDRESS_TYPES = ["SHIPPING", "BILLING", "BOTH"] as const;

export const createAddressSchema = z.object({
  name: z.string().optional(),
  recipientName: z.string().min(1, "Recipient name is required"),
  companyName: z.string().optional(),
  street: z.string().min(1, "Street is required"),
  street2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().optional(),
  addressType: z.enum(ADDRESS_TYPES),
  isDefault: z.boolean().default(false),
});

export type CreateAddressDto = z.infer<typeof createAddressSchema>;

export const updateAddressSchema = z.object({
  name: z.string().optional(),
  recipientName: z.string().optional(),
  companyName: z.string().optional(),
  street: z.string().optional(),
  street2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  addressType: z.enum(ADDRESS_TYPES).optional(),
  isDefault: z.boolean().optional(),
});

export type UpdateAddressDto = z.infer<typeof updateAddressSchema>;

export const getAddressesSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
});

export type GetAddressesDto = z.infer<typeof getAddressesSchema>;
