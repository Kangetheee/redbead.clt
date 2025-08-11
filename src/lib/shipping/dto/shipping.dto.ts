import { z } from "zod";

// Shipping Zone Schemas
export const createShippingZoneSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  countries: z
    .array(z.string().length(2, "Country code must be 2 characters"))
    .min(1, "At least one country is required"),
});

export type CreateShippingZoneDto = z.infer<typeof createShippingZoneSchema>;

export const updateShippingZoneSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name too long")
    .optional(),
  countries: z
    .array(z.string().length(2, "Country code must be 2 characters"))
    .min(1, "At least one country is required")
    .optional(),
  isActive: z.boolean().optional(),
});

export type UpdateShippingZoneDto = z.infer<typeof updateShippingZoneSchema>;

export const getShippingZonesSchema = z.object({
  page: z.number().min(1, "Page must be at least 1").optional().default(1),
  limit: z
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .optional()
    .default(10),
});

export type GetShippingZonesDto = z.infer<typeof getShippingZonesSchema>;

// Shipping Rate Schemas
export const createShippingRateSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(255, "Name too long"),
    description: z.string().min(1, "Description is required"),
    baseRate: z.number().min(0, "Base rate must be non-negative"),
    perKgRate: z.number().min(0, "Per kg rate must be non-negative"),
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
    estimatedDays: z.string().min(1, "Estimated delivery days is required"),
    sortOrder: z.number().default(0),
  })
  .refine(
    (data) => {
      if (data.minWeight !== undefined && data.maxWeight !== undefined) {
        return data.minWeight <= data.maxWeight;
      }
      return true;
    },
    {
      message: "Minimum weight must be less than or equal to maximum weight",
      path: ["maxWeight"],
    }
  )
  .refine(
    (data) => {
      if (
        data.minOrderValue !== undefined &&
        data.maxOrderValue !== undefined
      ) {
        return data.minOrderValue <= data.maxOrderValue;
      }
      return true;
    },
    {
      message:
        "Minimum order value must be less than or equal to maximum order value",
      path: ["maxOrderValue"],
    }
  );

export type CreateShippingRateDto = z.infer<typeof createShippingRateSchema>;

export const updateShippingRateSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(255, "Name too long")
      .optional(),
    description: z.string().min(1, "Description is required").optional(),
    baseRate: z.number().min(0, "Base rate must be non-negative").optional(),
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
      .min(1, "Estimated delivery days is required")
      .optional(),
    sortOrder: z.number().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.minWeight !== undefined && data.maxWeight !== undefined) {
        return data.minWeight <= data.maxWeight;
      }
      return true;
    },
    {
      message: "Minimum weight must be less than or equal to maximum weight",
      path: ["maxWeight"],
    }
  )
  .refine(
    (data) => {
      if (
        data.minOrderValue !== undefined &&
        data.maxOrderValue !== undefined
      ) {
        return data.minOrderValue <= data.maxOrderValue;
      }
      return true;
    },
    {
      message:
        "Minimum order value must be less than or equal to maximum order value",
      path: ["maxOrderValue"],
    }
  );

export type UpdateShippingRateDto = z.infer<typeof updateShippingRateSchema>;

export const getShippingRatesSchema = z.object({
  page: z.number().min(1, "Page must be at least 1").optional().default(1),
  limit: z
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .optional()
    .default(10),
});

export type GetShippingRatesDto = z.infer<typeof getShippingRatesSchema>;

// Shipping Address Schema (matching API spec)
export const shippingAddressSchema = z.object({
  name: z.string().min(1, "Address name is required"),
  recipientName: z.string().min(1, "Recipient name is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().length(2, "Country code must be 2 characters"),
  phone: z.string().min(1, "Phone number is required"),
  type: z.enum(["SHIPPING", "BILLING", "BOTH"]),
});

export type ShippingAddressDto = z.infer<typeof shippingAddressSchema>;

// Calculate Shipping Schema (matching API spec)
export const calculateShippingSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  shippingAddress: shippingAddressSchema,
});

export type CalculateShippingDto = z.infer<typeof calculateShippingSchema>;
