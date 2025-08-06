import { z } from "zod";

// Shipping Zone Schemas
export const createShippingZoneSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  countries: z
    .array(z.string().length(2, "Country code must be 2 characters"))
    .min(1, "At least one country is required"),
});

export type CreateShippingZoneDto = z.infer<typeof createShippingZoneSchema>;

export const getShippingZonesSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export type GetShippingZonesDto = z.infer<typeof getShippingZonesSchema>;

// Shipping Rate Schemas
export const createShippingRateSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(255, "Name too long"),
    description: z.string().min(1, "Description is required"),
    baseRate: z.number().min(0, "Base rate must be non-negative"),
    perKgRate: z.number().min(0, "Per kg rate must be non-negative"),
    freeShippingThreshold: z
      .number()
      .min(0, "Free shipping threshold must be non-negative")
      .optional(),
    estimatedDays: z.string().min(1, "Estimated delivery days is required"),
    minWeight: z.number().min(0).optional(),
    maxWeight: z.number().min(0).optional(),
    minOrderValue: z.number().min(0).optional(),
    maxOrderValue: z.number().min(0).optional(),
    sortOrder: z.number().default(0),
  })
  .refine(
    (data) => {
      if (data.minWeight && data.maxWeight) {
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
      if (data.minOrderValue && data.maxOrderValue) {
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

export const getShippingRatesSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export type GetShippingRatesDto = z.infer<typeof getShippingRatesSchema>;

// Shipping Address Schema
export const shippingAddressSchema = z.object({
  recipientName: z.string().min(1, "Recipient name is required"),
  companyName: z.string().optional(),
  street: z.string().min(1, "Street address is required"),
  street2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().length(2, "Country code must be 2 characters"),
  phone: z.string().min(1, "Phone number is required"),
});

export type ShippingAddressDto = z.infer<typeof shippingAddressSchema>;

// Calculate Shipping Schema
export const calculateShippingSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  shippingAddress: shippingAddressSchema,
  urgencyLevel: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
});

export type CalculateShippingDto = z.infer<typeof calculateShippingSchema>;
