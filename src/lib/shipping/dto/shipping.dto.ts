import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

/**
 * Schema for creating a shipping zone
 * Used with POST /v1/shipping/zones
 */
export const createShippingZoneSchema = z.object({
  name: z.string().min(1, "Zone name is required").max(255, "Name too long"),
  countries: z
    .array(z.string().length(2, "Invalid country code"))
    .min(1, "At least one country is required"),
});

export type CreateShippingZoneDto = z.infer<typeof createShippingZoneSchema>;

/**
 * Schema for creating a shipping rate for a zone
 * Used with POST /v1/shipping/zones/{id}/rates
 */
export const createShippingRateSchema = z.object({
  name: z.string().min(1, "Rate name is required").max(255, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  baseRate: z.number().min(0, "Base rate must be non-negative"),
  perKgRate: z.number().min(0, "Per kg rate must be non-negative").optional(),
  minWeight: z
    .number()
    .min(0, "Minimum weight must be non-negative")
    .optional(),
  maxWeight: z
    .number()
    .min(0, "Maximum weight must be non-negative")
    .optional(),
  minOrderValue: z
    .number()
    .min(0, "Minimum order value must be non-negative")
    .optional(),
  maxOrderValue: z
    .number()
    .min(0, "Maximum order value must be non-negative")
    .optional(),
  freeShippingThreshold: z
    .number()
    .min(0, "Free shipping threshold must be non-negative")
    .optional(),
  estimatedDays: z
    .string()
    .max(255, "Estimated days description too long")
    .optional(),
  sortOrder: z
    .number()
    .int()
    .min(0, "Sort order must be non-negative")
    .default(0),
});

export type CreateShippingRateDto = z.infer<typeof createShippingRateSchema>;

/**
 * Shipping address schema for calculations
 */
export const shippingAddressSchema = z.object({
  recipientName: z.string().min(1, "Recipient name is required"),
  companyName: z.string().optional(),
  street: z.string().min(1, "Street address is required"),
  street2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().length(2, "Invalid country code"),
  phone: z
    .string()
    .refine((phone) => !phone || isValidPhoneNumber(phone), {
      message: "Invalid phone number",
    })
    .optional(),
});

export type ShippingAddressDto = z.infer<typeof shippingAddressSchema>;

/**
 * Schema for calculating shipping costs
 * Used with POST /v1/shipping/calculate
 */
export const shippingCalculationSchema = z.object({
  sessionId: z.string().optional(),
  shippingAddress: shippingAddressSchema,
  urgencyLevel: z
    .enum(["NORMAL", "EXPEDITED", "RUSH", "EMERGENCY"])
    .default("NORMAL"),
});

export type ShippingCalculationDto = z.infer<typeof shippingCalculationSchema>;

// Export urgency levels enum
export const URGENCY_LEVELS = [
  "NORMAL",
  "EXPEDITED",
  "RUSH",
  "EMERGENCY",
] as const;
export type UrgencyLevel = (typeof URGENCY_LEVELS)[number];
