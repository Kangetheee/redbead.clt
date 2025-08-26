import { z } from "zod";

export const customizationChoiceSchema = z.object({
  optionId: z.string().min(1, "Option ID is required"),
  valueId: z.string().optional(),
  customValue: z.string().optional(),
});
export type CustomizationChoiceDto = z.infer<typeof customizationChoiceSchema>;

export const createCartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().min(1, "Variant ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  customizations: z.array(customizationChoiceSchema).default([]),
});
export type CreateCartItemDto = z.infer<typeof createCartItemSchema>;

export const updateCartItemSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required").optional(),
  quantity: z.number().min(1, "Quantity must be at least 1").optional(),
  customizations: z.array(customizationChoiceSchema).optional(),
});
export type UpdateCartItemDto = z.infer<typeof updateCartItemSchema>;

export const getCartSchema = z.object({
  pageIndex: z.number().min(0, "Page index must be non-negative").optional(),
  pageSize: z
    .number()
    .min(-1, "Page size must be -1 or positive")
    .max(100, "Page size cannot exceed 100")
    .optional(),
  search: z.string().optional(),
  categorySlug: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "quantity", "totalPrice"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type GetCartDto = {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  categorySlug?: string;
  sortBy?: "createdAt" | "updatedAt" | "quantity" | "totalPrice";
  sortOrder?: "asc" | "desc";
};

export const getSavedItemsSchema = z.object({
  pageIndex: z.number().min(0, "Page index must be non-negative").optional(),
  pageSize: z
    .number()
    .min(-1, "Page size must be -1 or positive")
    .max(100, "Page size cannot exceed 100")
    .optional(),
  search: z.string().optional(),
  categorySlug: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "quantity"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type GetSavedItemsDto = {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  categorySlug?: string;
  sortBy?: "createdAt" | "updatedAt" | "quantity";
  sortOrder?: "asc" | "desc";
};

export const bulkRemoveSchema = z.object({
  cartItemIds: z
    .array(z.string().min(1, "Cart item ID is required"))
    .min(1, "At least one cart item ID is required"),
});
export type BulkRemoveDto = z.infer<typeof bulkRemoveSchema>;

export const saveForLaterSchema = z.object({
  cartItemIds: z
    .array(z.string().min(1, "Cart item ID is required"))
    .min(1, "At least one cart item ID is required"),
  saveForLater: z.boolean(),
});
export type SaveForLaterDto = z.infer<typeof saveForLaterSchema>;

export const mergeSessionCartSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});
export type MergeSessionCartDto = z.infer<typeof mergeSessionCartSchema>;

export const cleanupExpiredSessionsSchema = z.object({
  daysOld: z.number().min(1, "Days old must be at least 1"),
});
export type CleanupExpiredSessionsDto = z.infer<
  typeof cleanupExpiredSessionsSchema
>;
