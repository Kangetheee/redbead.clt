import { z } from "zod";

export const bulkOrderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  customizations: z.object({}).passthrough(),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
});
export type BulkOrderItemDto = z.infer<typeof bulkOrderItemSchema>;

export const createBulkOrderSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  items: z.array(bulkOrderItemSchema).min(1, "At least one item is required"),
  attachments: z.array(z.string()).optional(),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
});
export type CreateBulkOrderDto = z.infer<typeof createBulkOrderSchema>;

export const updateBulkOrderSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters")
    .optional(),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  status: z
    .enum([
      "QUOTE_REQUESTED",
      "QUOTE_PREPARING",
      "QUOTE_READY",
      "QUOTE_ACCEPTED",
      "QUOTE_REJECTED",
      "PAYMENT_PENDING",
      "IN_PRODUCTION",
      "COMPLETED",
      "CANCELLED",
    ])
    .optional(),
  attachments: z.array(z.string()).optional(),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
  quoteAmount: z.number().min(0, "Quote amount must be positive").optional(),
  quoteExpiry: z.string().optional(),
});
export type UpdateBulkOrderDto = z.infer<typeof updateBulkOrderSchema>;

export const getBulkOrdersSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});
export type GetBulkOrdersDto = z.infer<typeof getBulkOrdersSchema>;
