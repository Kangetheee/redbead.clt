import { z } from "zod";
import { requiredNumberSchema } from "@/lib/shared/common.dto";

export const customizationChoiceSchema = z.object({
  optionId: z.string().min(1, "Option ID is required"),
  valueId: z.string().min(1, "Value ID is required"),
  customValue: z.string().optional(),
});

export type CustomizationChoiceDto = z.infer<typeof customizationChoiceSchema>;

export const createCartItemSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  sizeVariantId: z.string().min(1, "Size variant ID is required"),
  quantity: requiredNumberSchema.transform((val) => parseInt(val)),
  customizations: z.array(customizationChoiceSchema).default([]),
  designId: z.string().optional(),
});

export type CreateCartItemDto = z.infer<typeof createCartItemSchema>;

export const updateCartItemSchema = z.object({
  sizeVariantId: z.string().optional(),
  quantity: requiredNumberSchema.transform((val) => parseInt(val)).optional(),
  customizations: z.array(customizationChoiceSchema).optional(),
  designId: z.string().optional(),
});

export type UpdateCartItemDto = z.infer<typeof updateCartItemSchema>;
