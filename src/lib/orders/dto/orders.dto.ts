import { z } from "zod";

// Order status and urgency level enums for reuse
const ORDER_STATUS = [
  "PENDING",
  "CONFIRMED",
  "DESIGN_PENDING",
  "DESIGN_APPROVED",
  "DESIGN_REJECTED",
  "PAYMENT_PENDING",
  "PAYMENT_CONFIRMED",
  "PROCESSING",
  "PRODUCTION",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

const DESIGN_APPROVAL_STATUS = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
] as const;

const URGENCY_LEVELS = ["NORMAL", "EXPEDITED", "RUSH", "EMERGENCY"] as const;

const NOTE_TYPES = [
  "GENERAL",
  "URGENCY",
  "TIMELINE",
  "SHIPPING",
  "CUSTOMIZATION",
  "PRODUCTION",
  "QUALITY",
  "DESIGN_APPROVAL",
] as const;

const NOTE_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;

const ORDER_ITEM_STATUS = [
  "PROCESSING",
  "DESIGNING",
  "PRODUCTION",
  "QUALITY_CHECK",
  "READY_FOR_SHIPPING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export const getOrdersSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  status: z.enum(ORDER_STATUS).optional(),
  designApprovalStatus: z.enum(DESIGN_APPROVAL_STATUS).optional(),
  minTotal: z.number().optional(),
  maxTotal: z.number().optional(),
  startDate: z.string().optional(), // ISO string
  endDate: z.string().optional(), // ISO string
  search: z.string().optional(), // Search by order number or tracking number
  urgencyLevel: z.enum(URGENCY_LEVELS).optional(),
  templateId: z.string().optional(),
});

export type GetOrdersDto = z.infer<typeof getOrdersSchema>;

// Updated to match actual API requirements
export const orderItemCustomizationSchema = z.object({
  optionId: z.string(),
  valueId: z.string(),
  customValue: z.string().optional(),
});

// Updated schema to match API expectations
export const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().min(1, "Variant ID is required"),
  quantity: z.number().min(1),
  customizations: z.record(z.string()).optional().default({}),
  designId: z.string().optional(),
});

export type OrderItemDto = z.infer<typeof orderItemSchema>;

export const createOrderSchema = z.object({
  shippingAddressId: z.string(),
  billingAddressId: z.string().optional(),
  customerId: z.string().optional(),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).optional(),
  useCartItems: z.boolean().optional(),
  urgencyLevel: z.enum(URGENCY_LEVELS).optional(),
  expectedProductionDays: z.number().optional(),
  specialInstructions: z.string().optional(),
  designApprovalRequired: z.boolean().optional(),
  paymentMethod: z.string().optional(),
  customerPhone: z.string().optional(),
  templateId: z.string().optional(),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;

export const updateOrderSchema = z.object({
  status: z.enum(ORDER_STATUS).optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().optional(),
  expectedDelivery: z.string().optional(), // ISO string
  notes: z.string().optional(),
  urgencyLevel: z.enum(URGENCY_LEVELS).optional(),
  expectedProductionDays: z.number().optional(),
  specialInstructions: z.string().optional(),
  designStartDate: z.string().optional(), // ISO string
  designCompletionDate: z.string().optional(), // ISO string
  productionStartDate: z.string().optional(), // ISO string
  productionEndDate: z.string().optional(), // ISO string
  shippingDate: z.string().optional(), // ISO string
  actualDeliveryDate: z.string().optional(), // ISO string
});

export type UpdateOrderDto = z.infer<typeof updateOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUS),
  reason: z.string().optional(),
});

export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;

export const createOrderNoteSchema = z.object({
  type: z.enum(NOTE_TYPES),
  priority: z.enum(NOTE_PRIORITIES).optional(),
  title: z.string().optional(),
  content: z.string(),
  isInternal: z.boolean().optional(),
});

export type CreateOrderNoteDto = z.infer<typeof createOrderNoteSchema>;

export const designSummaryCustomizationSchema = z.object({
  option: z.string(),
  value: z.string(),
});

export const designSummarySchema = z.object({
  templateName: z.string(),
  sizeVariant: z.string(),
  quantity: z.number(),
  material: z.string(),
  closure: z.string().optional(),
  text: z.string(),
  colors: z.array(z.string()),
  customizations: z.array(designSummaryCustomizationSchema).optional(),
});

// Updated to match API - designSummary is optional based on the working example
export const requestDesignApprovalSchema = z.object({
  customerEmail: z.string().email(),
  designId: z.string().optional(),
  previewImages: z.array(z.string()),
  designSummary: designSummarySchema.optional(),
  expiryHours: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

export type RequestDesignApprovalDto = z.infer<
  typeof requestDesignApprovalSchema
>;

export const updateDesignApprovalSchema = z.object({
  status: z.enum(DESIGN_APPROVAL_STATUS),
  rejectionReason: z.string().optional(),
  approvedBy: z.string().optional(),
});

export type UpdateDesignApprovalDto = z.infer<
  typeof updateDesignApprovalSchema
>;

// Design approval token operations
export const approveDesignViaTokenSchema = z.object({
  token: z.string().length(64, "Token must be 64 characters"),
});

export type ApproveDesignViaTokenDto = z.infer<
  typeof approveDesignViaTokenSchema
>;

export const rejectDesignViaTokenSchema = z.object({
  token: z.string().length(64, "Token must be 64 characters"),
  reason: z.string().optional(),
});

export type RejectDesignViaTokenDto = z.infer<
  typeof rejectDesignViaTokenSchema
>;

export const resendDesignApprovalEmailSchema = z.object({
  designApprovalId: z.string(),
});

export type ResendDesignApprovalEmailDto = z.infer<
  typeof resendDesignApprovalEmailSchema
>;

// Order Item DTOs
export const updateOrderItemStatusSchema = z.object({
  status: z.enum(ORDER_ITEM_STATUS),
  notes: z.string().optional(),
});

export type UpdateOrderItemStatusDto = z.infer<
  typeof updateOrderItemStatusSchema
>;

export const bulkUpdateOrderItemStatusSchema = z.object({
  orderItemIds: z.array(z.string()),
  status: z.enum(ORDER_ITEM_STATUS),
  notes: z.string().optional(),
});

export type BulkUpdateOrderItemStatusDto = z.infer<
  typeof bulkUpdateOrderItemStatusSchema
>;

// Updated to match API - uses productId instead of templateId
export const getOrderItemsByStatusSchema = z.object({
  status: z.enum(ORDER_ITEM_STATUS),
  productId: z.string(),
});

export type GetOrderItemsByStatusDto = z.infer<
  typeof getOrderItemsByStatusSchema
>;

export const calculateTimelineSchema = z.object({
  startDate: z.string(), // ISO string - required query parameter
});

export type CalculateTimelineDto = z.infer<typeof calculateTimelineSchema>;

// Export constants for use in other files
export {
  ORDER_STATUS,
  DESIGN_APPROVAL_STATUS,
  URGENCY_LEVELS,
  NOTE_TYPES,
  NOTE_PRIORITIES,
  ORDER_ITEM_STATUS,
};
