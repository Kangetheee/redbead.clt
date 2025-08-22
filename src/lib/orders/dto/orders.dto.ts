import { z } from "zod";

export const getOrdersSchema = z.object({
  status: z.string().optional(),
  minTotal: z.number().optional(),
  maxTotal: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
});

export type GetOrdersDto = z.infer<typeof getOrdersSchema>;

export const customerInstructionsSchema = z.object({
  instructions: z.string(),
  isUrgent: z.boolean().default(false),
});

export type CustomerInstructionsDto = z.infer<
  typeof customerInstructionsSchema
>;

export const orderItemModificationSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().min(1),
  customizations: z.record(z.any()).default({}),
});

export const reorderSchema = z.object({
  originalOrderId: z.string(),
  modifyItems: z.boolean().default(false),
  newShippingAddress: z.string().optional(),
  modifiedItems: z.array(orderItemModificationSchema).optional(),
});

export type ReorderDto = z.infer<typeof reorderSchema>;
