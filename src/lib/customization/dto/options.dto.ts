import { z } from "zod";

// Enums
export const customizationOptionTypeEnum = z.enum([
  "DROPDOWN",
  "COLOR_PICKER",
  "TEXT_INPUT",
  "FILE_UPLOAD",
  "NUMBER_INPUT",
  "CHECKBOX",
  "RADIO",
]);

// Customization Options DTOs
export const createCustomizationOptionSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters"),
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  type: customizationOptionTypeEnum,
  required: z.boolean().default(false),
  sortOrder: z.number().min(0, "Sort order must be non-negative").default(0),
});

export const updateCustomizationOptionSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be less than 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

export const getCustomizationOptionsSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  search: z
    .string()
    .max(100, "Search must be less than 100 characters")
    .optional(),
  type: customizationOptionTypeEnum.optional(),
});

export const assignOptionToTemplateSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  required: z.boolean().default(false),
  sortOrder: z.number().min(0, "Sort order must be non-negative").default(0),
});

// Customization Values DTOs
export const createCustomizationValueSchema = z.object({
  value: z
    .string()
    .min(1, "Value is required")
    .max(50, "Value must be less than 50 characters"),
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
  hexColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Invalid hex color")
    .optional(),
  priceAdjustment: z
    .number()
    .min(0, "Price adjustment must be non-negative")
    .default(0),
  sortOrder: z.number().min(0, "Sort order must be non-negative").default(0),
  isActive: z.boolean().default(true),
  optionId: z.string().uuid("Invalid option ID"),
});

export const updateCustomizationValueSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be less than 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  priceAdjustment: z
    .number()
    .min(0, "Price adjustment must be non-negative")
    .optional(),
  sortOrder: z.number().min(0, "Sort order must be non-negative").optional(),
  isActive: z.boolean().optional(),
});

export const getCustomizationValuesSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  search: z
    .string()
    .max(100, "Search must be less than 100 characters")
    .optional(),
  optionId: z.string().uuid("Invalid option ID").optional(),
  isActive: z.boolean().optional(),
});

export const calculatePriceAdjustmentSchema = z.object({
  valueIds: z.array(z.string()).min(1, "At least one value ID is required"),
});

export const validateCustomizationsSchema = z.object({
  customizations: z.record(z.string(), z.string()),
});

export const getCustomizationValueStatsSchema = z.object({
  optionId: z.string().uuid("Invalid option ID").optional(),
});

// Type exports
export type CreateCustomizationOptionDto = z.infer<
  typeof createCustomizationOptionSchema
>;
export type UpdateCustomizationOptionDto = z.infer<
  typeof updateCustomizationOptionSchema
>;
export type GetCustomizationOptionsDto = z.infer<
  typeof getCustomizationOptionsSchema
>;
export type AssignOptionToTemplateDto = z.infer<
  typeof assignOptionToTemplateSchema
>;
export type CustomizationOptionType = z.infer<
  typeof customizationOptionTypeEnum
>;

export type CreateCustomizationValueDto = z.infer<
  typeof createCustomizationValueSchema
>;
export type UpdateCustomizationValueDto = z.infer<
  typeof updateCustomizationValueSchema
>;
export type GetCustomizationValuesDto = z.infer<
  typeof getCustomizationValuesSchema
>;
export type CalculatePriceAdjustmentDto = z.infer<
  typeof calculatePriceAdjustmentSchema
>;
export type ValidateCustomizationsDto = z.infer<
  typeof validateCustomizationsSchema
>;
export type GetCustomizationValueStatsDto = z.infer<
  typeof getCustomizationValueStatsSchema
>;
