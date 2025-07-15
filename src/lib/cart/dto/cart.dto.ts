import { z } from "zod";
import { requiredNumberSchema } from "@/lib/shared/common.dto";

export const customizationChoiceSchema = z.object({
  optionId: z.string().min(1, "Option ID is required"),
  valueId: z.string().min(1, "Value ID is required"),
  customValue: z.string().optional(),
});

export type CustomizationChoiceDto = z.infer<typeof customizationChoiceSchema>;

export const createCartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: requiredNumberSchema.transform((val) => parseInt(val)),
  customizations: z.array(customizationChoiceSchema),
  designId: z.string().optional(),
});

export type CreateCartItemDto = z.infer<typeof createCartItemSchema>;

export const updateCartItemSchema = z.object({
  quantity: requiredNumberSchema.transform((val) => parseInt(val)).optional(),
  customizations: z.array(customizationChoiceSchema).optional(),
  designId: z.string().optional(),
});

export type UpdateCartItemDto = z.infer<typeof updateCartItemSchema>;
