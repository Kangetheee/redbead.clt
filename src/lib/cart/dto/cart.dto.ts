import { z } from "zod";

export const customizationChoiceSchema = z.object({
  optionId: z.string().min(1, "Option ID is required"),
  valueId: z.string().optional(),
  value: z.string().optional(), // support plain value for text/color choices
  customValue: z.string().optional(),
});
export type CustomizationChoiceDto = z.infer<typeof customizationChoiceSchema>;

export const createCartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required").optional(),
  variantId: z.string().min(1, "Variant ID is required").optional(),
  designId: z.string().min(1, "Design ID is required").optional(),
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
  pageIndex: z.number().min(0).optional(),
  pageSize: z.number().min(-1).max(100).optional(),
  search: z.string().optional(),
  categorySlug: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "quantity", "totalPrice"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
export type GetCartDto = z.infer<typeof getCartSchema>;

export const getSavedItemsSchema = z.object({
  pageIndex: z.number().min(0).optional(),
  pageSize: z.number().min(-1).max(100).optional(),
  search: z.string().optional(),
  categorySlug: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "quantity"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
export type GetSavedItemsDto = z.infer<typeof getSavedItemsSchema>;

export const bulkRemoveSchema = z.object({
  cartItemIds: z.array(z.string().min(1)).min(1),
});
export type BulkRemoveDto = z.infer<typeof bulkRemoveSchema>;

export const saveForLaterSchema = z.object({
  cartItemIds: z.array(z.string().min(1)).min(1),
  saveForLater: z.boolean(),
});
export type SaveForLaterDto = z.infer<typeof saveForLaterSchema>;

export const mergeSessionCartSchema = z.object({
  sessionId: z.string().min(1),
});
export type MergeSessionCartDto = z.infer<typeof mergeSessionCartSchema>;

export const cleanupExpiredSessionsSchema = z.object({
  daysOld: z.number().min(1),
});
export type CleanupExpiredSessionsDto = z.infer<
  typeof cleanupExpiredSessionsSchema
>;

export const addressInputSchema = z.object({
  recipientName: z.string().min(1),
  companyName: z.string().optional(),
  street: z.string().min(1),
  street2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
  type: z.string().optional(), // shipping/billing
});
export type AddressInputDto = z.infer<typeof addressInputSchema>;

export const initCheckoutSchema = z.object({
  useCartItems: z.boolean().default(true),
  items: z.array(createCartItemSchema).optional(),
  guestEmail: z.string().email().optional(),
  couponCode: z.string().optional(),
});
export type InitCheckoutDto = z.infer<typeof initCheckoutSchema>;

export const shippingCalculationSchema = z.object({
  sessionId: z.string().min(1),
  shippingAddress: addressInputSchema,
});
export type ShippingCalculationDto = z.infer<typeof shippingCalculationSchema>;

export const validateCheckoutSchema = z.object({
  sessionId: z.string().min(1),
  shippingAddress: addressInputSchema.optional(),
  billingAddress: addressInputSchema.optional(),
  selectedShippingOption: z.string().optional(),
  paymentMethod: z.string().min(1),
  customerPhone: z.string().optional(),
});
export type ValidateCheckoutDto = z.infer<typeof validateCheckoutSchema>;

export const completeCheckoutSchema = z.object({
  sessionId: z.string().min(1),
  shippingAddressId: z.string().optional(),
  billingAddressId: z.string().optional(),
  selectedShippingOption: z.string().optional(),
  paymentMethod: z.string().min(1),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
});
export type CompleteCheckoutDto = z.infer<typeof completeCheckoutSchema>;

export const guestInitCheckoutSchema = z.object({
  guestEmail: z.string().email(),
  items: z.array(createCartItemSchema).min(1),
});
export type GuestInitCheckoutDto = z.infer<typeof guestInitCheckoutSchema>;

export const guestCompleteCheckoutSchema = z.object({
  sessionId: z.string().min(1),
  guestInfo: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    company: z.string().optional(),
  }),
  shippingAddress: addressInputSchema,
  selectedShippingOption: z.string().optional(),
  paymentMethod: z.string().min(1),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
});
export type GuestCompleteCheckoutDto = z.infer<
  typeof guestCompleteCheckoutSchema
>;
