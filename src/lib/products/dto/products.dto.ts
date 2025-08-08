import { z } from "zod";

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
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required"),
  thumbnailImage: z.string().url("Invalid thumbnail URL").optional(),
  basePrice: z.number().min(0, "Base price must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
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
  images: z.array(z.string().url("Invalid image URL")).optional(),
  thumbnailImage: z.string().url("Invalid thumbnail URL").optional(),
  basePrice: z.number().min(0, "Base price must be positive").optional(),
  categoryId: z.string().min(1, "Category is required").optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

export type UpdateProductDto = z.infer<typeof updateProductSchema>;

export const getProductsSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  relatedTo: z.string().optional(),
  sortBy: z.enum(["name", "createdAt", "basePrice", "updatedAt"]).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

export type GetProductsDto = z.infer<typeof getProductsSchema>;

export const searchProductsSchema = z.object({
  q: z.string().min(1, "Search query is required"),
  limit: z.number().min(1).max(50).optional(),
  categoryId: z.string().optional(),
});

export type SearchProductsDto = z.infer<typeof searchProductsSchema>;

export const calculatePriceSchema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1"),
  variantId: z.string().optional(),
  customizations: z.record(z.any()).optional(),
});

export type CalculatePriceDto = z.infer<typeof calculatePriceSchema>;
