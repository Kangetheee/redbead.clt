import { z } from "zod";
import {
  floatSchema,
  requiredFloatSchema,
  numberSchema,
} from "@/lib/shared/common.dto";

export const createShippingZoneSchema = z.object({
  name: z.string().min(1, "Zone name is required").max(255, "Name too long"),
  countries: z
    .array(z.string().length(2, "Invalid country code"))
    .min(1, "At least one country is required"),
});

export type CreateShippingZoneDto = z.infer<typeof createShippingZoneSchema>;

export const updateShippingZoneSchema = z.object({
  name: z
    .string()
    .min(1, "Zone name is required")
    .max(255, "Name too long")
    .optional(),
  countries: z
    .array(z.string().length(2, "Invalid country code"))
    .min(1, "At least one country is required")
    .optional(),
  isActive: z.boolean().optional(),
});

export type UpdateShippingZoneDto = z.infer<typeof updateShippingZoneSchema>;

export const createShippingRateSchema = z.object({
  name: z.string().min(1, "Rate name is required").max(255, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  baseRate: requiredFloatSchema.transform((val) => parseFloat(val)),
  perKgRate: floatSchema
    .transform((val) => (val ? parseFloat(val) : undefined))
    .optional(),
  minWeight: floatSchema
    .transform((val) => (val ? parseFloat(val) : undefined))
    .optional(),
  maxWeight: floatSchema
    .transform((val) => (val ? parseFloat(val) : undefined))
    .optional(),
  minOrderValue: floatSchema
    .transform((val) => (val ? parseFloat(val) : undefined))
    .optional(),
  maxOrderValue: floatSchema
    .transform((val) => (val ? parseFloat(val) : undefined))
    .optional(),
  freeShippingThreshold: floatSchema
    .transform((val) => (val ? parseFloat(val) : undefined))
    .optional(),
  estimatedDays: z.string().max(255, "Estimated days too long").optional(),
  sortOrder: numberSchema
    .transform((val) => (val ? parseInt(val) : 0))
    .default("0"),
});

export type CreateShippingRateDto = z.infer<typeof createShippingRateSchema>;

export const updateShippingRateSchema = z.object({
  name: z
    .string()
    .min(1, "Rate name is required")
    .max(255, "Name too long")
    .optional(),
  description: z.string().max(500, "Description too long").optional(),
  baseRate: floatSchema
    .transform((val) => (val ? parseFloat(val) : undefined))
    .optional(),
  perKgRate: floatSchema
    .transform((val) => (val ? parseFloat(val) : undefined))
    .optional(),
  minWeight: floatSchema
    .transform((val) => (val ? parseFloat(val) : undefined))
    .optional(),
  maxWeight: floatSchema
    .transform((val) => (val ? parseFloat(val) : undefined))
    .optional(),
  minOrderValue: floatSchema
    .transform((val) => (val ? parseFloat(val) : undefined))
    .optional(),
  maxOrderValue: floatSchema
    .transform((val) => (val ? parseFloat(val) : undefined))
    .optional(),
  freeShippingThreshold: floatSchema
    .transform((val) => (val ? parseFloat(val) : undefined))
    .optional(),
  estimatedDays: z.string().max(255, "Estimated days too long").optional(),
  sortOrder: numberSchema
    .transform((val) => (val ? parseInt(val) : undefined))
    .optional(),
  isActive: z.boolean().optional(),
});

export type UpdateShippingRateDto = z.infer<typeof updateShippingRateSchema>;

export const shippingCalculationItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  weight: z.number().min(0).optional(),
});

export const shippingAddressSchema = z.object({
  recipientName: z.string().min(1, "Recipient name is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().length(2, "Invalid country code"),
});

export const shippingCalculationSchema = z.object({
  sessionId: z.string().optional(),
  items: z.array(shippingCalculationItemSchema).optional(),
  shippingAddress: shippingAddressSchema,
  urgencyLevel: z
    .enum(["NORMAL", "EXPEDITED", "RUSH", "EMERGENCY"])
    .default("NORMAL"),
  orderValue: z.number().min(0).optional(),
  totalWeight: z.number().min(0).optional(),
});

export type ShippingCalculationDto = z.infer<typeof shippingCalculationSchema>;
