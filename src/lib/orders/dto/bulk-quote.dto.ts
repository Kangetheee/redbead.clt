import { z } from "zod";

export const createBulkOrderQuoteSchema = z.object({
  quoteAmount: z.number().min(0.01, "Quote amount must be greater than 0"),
  expiryDays: z
    .number()
    .min(1, "Expiry days must be at least 1")
    .max(365, "Expiry days cannot exceed 365")
    .default(14),
});

export type CreateBulkOrderQuoteDto = z.infer<
  typeof createBulkOrderQuoteSchema
>;
