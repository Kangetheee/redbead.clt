import { z } from "zod";

// Base schemas for reusable components
const dimensionsSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
  unit: z.enum(["mm", "cm", "in"]),
});

const materialsSchema = z.object({
  base: z.string(),
  options: z.array(z.string()),
});

const designConstraintsSchema = z.object({
  allowText: z.boolean(),
  allowLogos: z.boolean(),
  allowCustomColors: z.boolean(),
  maxColors: z.number().min(1),
});

const canvasSettingsSchema = z.object({
  backgroundColor: z.string(),
  printable: z.boolean(),
});

export const getTemplatesSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  search: z.string().optional(),
  productId: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export type GetTemplatesDto = z.infer<typeof getTemplatesSchema>;

export const createTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  productId: z.string().min(1, "Product ID is required"),
  categoryId: z.string().min(1, "Category ID is required"),
  previewImage: z.string().min(1, "Preview image is required"),
  images: z.array(z.string()),
  basePrice: z.number().min(0, "Base price must be non-negative"),
  sku: z.string().min(1, "SKU is required"),
  stock: z.number().min(0, "Stock must be non-negative"),
  minOrderQuantity: z
    .number()
    .min(1, "Minimum order quantity must be at least 1"),
  maxOrderQuantity: z
    .number()
    .min(1, "Maximum order quantity must be at least 1"),
  designConstraints: designConstraintsSchema,
  canvasSettings: canvasSettingsSchema,
  dimensions: dimensionsSchema,
  leadTime: z.string(),
  productionDays: z.number().min(0),
  designDays: z.number().min(0),
  shippingDays: z.number().min(0),
  materials: materialsSchema,
  printOptions: z.array(z.string()),
  customizations: z.record(z.any()),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export type CreateTemplateDto = z.infer<typeof createTemplateSchema>;

export const updateTemplateSchema = createTemplateSchema.partial();

export type UpdateTemplateDto = z.infer<typeof updateTemplateSchema>;

export const createSizeVariantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  displayName: z.string().min(1, "Display name is required"),
  dimensions: dimensionsSchema,
  description: z.string().optional(),
  price: z.number().min(0, "Price must be non-negative"),
  sku: z.string().min(1, "SKU is required"),
  stock: z.number().min(0, "Stock must be non-negative"),
  minOrderQty: z.number().min(1, "Minimum order quantity must be at least 1"),
  maxOrderQty: z.number().min(1, "Maximum order quantity must be at least 1"),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().min(0),
});
export type CreateSizeVariantDto = z.infer<typeof createSizeVariantSchema>;

export const updateSizeVariantSchema = createSizeVariantSchema.partial();

export type UpdateSizeVariantDto = z.infer<typeof updateSizeVariantSchema>;

export const calculatePriceSchema = z.object({
  sizeVariantId: z.string().min(1, "Size variant ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  customizations: z.record(z.any()),
  urgencyLevel: z
    .enum(["NORMAL", "EXPEDITED", "RUSH", "EMERGENCY"])
    .default("NORMAL"),
});

export type CalculatePriceDto = z.infer<typeof calculatePriceSchema>;

export const duplicateTemplateSchema = z.object({
  name: z.string().min(1, "New template name is required"),
  slug: z.string().min(1, "New slug is required"),
});

export type DuplicateTemplateDto = z.infer<typeof duplicateTemplateSchema>;

export const getTemplatesByProductSchema = z.object({
  isActive: z.boolean().optional(),
});

export type GetTemplatesByProductDto = z.infer<
  typeof getTemplatesByProductSchema
>;

export const getTemplateAnalyticsSchema = z.object({
  includeAnalytics: z.boolean().optional(),
  dateRange: z.number().min(1).max(365).optional(), // Days
});

export type GetTemplateAnalyticsDto = z.infer<
  typeof getTemplateAnalyticsSchema
>;

export const URGENCY_LEVELS = [
  "NORMAL",
  "EXPEDITED",
  "RUSH",
  "EMERGENCY",
] as const;
export type UrgencyLevel = (typeof URGENCY_LEVELS)[number];

export const DIMENSION_UNITS = ["mm", "cm", "in"] as const;
export type DimensionUnit = (typeof DIMENSION_UNITS)[number];
