/* eslint-disable @typescript-eslint/no-unused-vars */

import { z } from "zod";
import { requiredNumberSchema, numberSchema } from "@/lib/shared/common.dto";

export const createProductTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must only contain lowercase letters, numbers, and hyphens"
    ),
  description: z.string().min(1, "Description is required"),
  type: z.string().min(1, "Type is required"),
  material: z.string().min(1, "Material is required"),
  categoryId: z.string().min(1, "Category is required"),
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required"),
  thumbnailImage: z.string().url("Invalid thumbnail URL").optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().max(200, "Meta title too long").optional(),
  metaDescription: z.string().max(500, "Meta description too long").optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export type CreateProductTypeDto = z.infer<typeof createProductTypeSchema>;

export const updateProductTypeSchema = z.object({
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
  type: z.string().min(1, "Type is required").optional(),
  material: z.string().min(1, "Material is required").optional(),
  categoryId: z.string().min(1, "Category is required").optional(),
  images: z.array(z.string().url("Invalid image URL")).optional(),
  thumbnailImage: z.string().url("Invalid thumbnail URL").optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  metaTitle: z.string().max(200, "Meta title too long").optional(),
  metaDescription: z.string().max(500, "Meta description too long").optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export type UpdateProductTypeDto = z.infer<typeof updateProductTypeSchema>;

export const getProductTypesSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  type: z.string().optional(),
  material: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(["name", "createdAt", "sortOrder"]).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

export type GetProductTypesDto = z.infer<typeof getProductTypesSchema>;

export const getProductTypesByCategorySchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  search: z.string().optional(),
  type: z.string().optional(),
  material: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(["name", "createdAt", "sortOrder"]).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

export type GetProductTypesByCategoryDto = z.infer<
  typeof getProductTypesByCategorySchema
>;
