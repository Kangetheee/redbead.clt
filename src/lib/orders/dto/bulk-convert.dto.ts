import { z } from "zod";

export const bulkOrderConversionSchema = z.object({
  shippingAddressId: z.string().optional(),
  billingAddressId: z.string().optional(),
  couponCode: z.string().optional(),
  specialInstructions: z
    .string()
    .max(500, "Special instructions must be less than 500 characters")
    .optional(),
  urgencyLevel: z
    .enum(["NORMAL", "EXPEDITED", "RUSH", "EMERGENCY"])
    .default("NORMAL"),
  expectedProductionDays: z
    .number()
    .min(1, "Expected production days must be at least 1")
    .optional(),
});

export type BulkOrderConversionDto = z.infer<typeof bulkOrderConversionSchema>;
