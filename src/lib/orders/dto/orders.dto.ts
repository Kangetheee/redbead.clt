import { z } from "zod";

// Order status and urgency level enums for reuse
const ORDER_STATUS = [
  "PENDING",
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

export const getOrdersSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  status: z.enum(ORDER_STATUS).optional(),
  designApprovalStatus: z.enum(DESIGN_APPROVAL_STATUS).optional(),
  minTotal: z.number().optional(),
  maxTotal: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  urgencyLevel: z.enum(URGENCY_LEVELS).optional(),
});

export type GetOrdersDto = z.infer<typeof getOrdersSchema>;

export const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
  customizations: z.record(z.any()),
});

export type OrderItemDto = z.infer<typeof orderItemSchema>;

export const createOrderSchema = z.object({
  shippingAddressId: z.string(),
  billingAddressId: z.string().optional(),
  customerId: z.string().optional(),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).optional(),
  useCartItems: z.boolean().default(true),
  urgencyLevel: z.enum(URGENCY_LEVELS).default("NORMAL"),
  expectedProductionDays: z.number().optional(),
  specialInstructions: z.string().optional(),
  designApprovalRequired: z.boolean().default(true),
  paymentMethod: z.string().default("MPESA"),
  customerPhone: z.string().optional(),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;

export const updateOrderSchema = z.object({
  status: z.enum(ORDER_STATUS).optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().optional(),
  expectedDelivery: z.string().optional(),
  notes: z.string().optional(),
  urgencyLevel: z.enum(URGENCY_LEVELS).optional(),
  expectedProductionDays: z.number().optional(),
  specialInstructions: z.string().optional(),
});

export type UpdateOrderDto = z.infer<typeof updateOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUS),
  reason: z.string().optional(),
});

export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;

export const createOrderNoteSchema = z.object({
  noteType: z.enum(NOTE_TYPES),
  priority: z.string().optional(),
  title: z.string().optional(),
  content: z.string(),
  isInternal: z.boolean().optional(),
});

export type CreateOrderNoteDto = z.infer<typeof createOrderNoteSchema>;

export const requestDesignApprovalSchema = z.object({
  customerEmail: z.string().email(),
  designId: z.string().optional(),
  previewImages: z.array(z.string()),
  designSummary: z.record(z.any()),
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
