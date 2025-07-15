import { z } from "zod";
import {
  requiredFloatSchema,
  requiredNumberSchema,
  floatSchema,
  numberSchema,
} from "@/lib/shared/common.dto";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must only contain lowercase letters, numbers, and hyphens"
    ),
  description: z.string().min(1, "Description is required"),
  basePrice: requiredFloatSchema.transform((val) => parseFloat(val)),
  sku: z.string().optional(),
  stock: requiredNumberSchema.transform((val) => parseInt(val)),
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required"),
  thumbnailImage: z.string().url("Invalid thumbnail URL").optional(),
  minOrderQuantity: requiredNumberSchema.transform((val) => parseInt(val)),
  maxOrderQuantity: numberSchema
    .transform((val) => (val ? parseInt(val) : undefined))
    .optional(),
  customizableAreas: z.object({}).optional(),
  metaTitle: z.string().max(200, "Meta title too long").optional(),
  metaDescription: z.string().max(500, "Meta description too long").optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  categoryId: z.string().min(1, "Category is required"),
  templateId: z.string().optional(),
  weight: floatSchema
    .transform((val) => (val ? parseFloat(val) : undefined))
    .optional(),
  dimensions: z.object({}).optional(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name too long")
    .optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must only contain lowercase letters, numbers, and hyphens"
    )
    .optional(),
  description: z.string().min(1, "Description is required").optional(),
  basePrice: floatSchema
    .transform((val) => (val ? parseFloat(val) : undefined))
    .optional(),
  sku: z.string().optional(),
  stock: numberSchema
    .transform((val) => (val ? parseInt(val) : undefined))
    .optional(),
  images: z.array(z.string().url("Invalid image URL")).optional(),
  thumbnailImage: z.string().url("Invalid thumbnail URL").optional(),
  minOrderQuantity: numberSchema
    .transform((val) => (val ? parseInt(val) : undefined))
    .optional(),
  maxOrderQuantity: numberSchema
    .transform((val) => (val ? parseInt(val) : undefined))
    .optional(),
  customizableAreas: z.object({}).optional(),
  metaTitle: z.string().max(200, "Meta title too long").optional(),
  metaDescription: z.string().max(500, "Meta description too long").optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  categoryId: z.string().optional(),
  templateId: z.string().optional(),
  weight: floatSchema
    .transform((val) => (val ? parseFloat(val) : undefined))
    .optional(),
  dimensions: z.object({}).optional(),
});

export type UpdateProductDto = z.infer<typeof updateProductSchema>;

export const getProductsSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  categoryId: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  search: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  templateId: z.string().optional(),
  sortBy: z.enum(["price", "name", "createdAt", "popularity"]).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

export type GetProductsDto = z.infer<typeof getProductsSchema>;

export const priceCalculationSchema = z.object({
  quantity: requiredNumberSchema.transform((val) => parseInt(val)),
  customizations: z.object({}).optional(),
  selectedDimensions: z.object({}).optional(),
  selectedMaterials: z.object({}).optional(),
  urgencyLevel: z
    .enum(["NORMAL", "EXPEDITED", "RUSH", "EMERGENCY"])
    .default("NORMAL"),
});

export type PriceCalculationDto = z.infer<typeof priceCalculationSchema>;
