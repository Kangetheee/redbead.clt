import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be less than 100 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must only contain lowercase letters, numbers, and hyphens"
    ),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  metaTitle: z
    .string()
    .max(200, "Meta title must be less than 200 characters")
    .optional(),
  metaDescription: z
    .string()
    .max(500, "Meta description must be less than 500 characters")
    .optional(),
  thumbnailImage: z.string().url("Invalid thumbnail image URL").optional(),
  bannerImage: z.string().url("Invalid banner image URL").optional(),
  configSchema: z.record(z.any()).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().min(0).max(9999).default(0),
  parentId: z.string().uuid("Invalid parent ID").optional(),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be less than 100 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must only contain lowercase letters, numbers, and hyphens"
    )
    .optional(),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  metaTitle: z
    .string()
    .max(200, "Meta title must be less than 200 characters")
    .optional(),
  metaDescription: z
    .string()
    .max(500, "Meta description must be less than 500 characters")
    .optional(),
  thumbnailImage: z.string().url("Invalid thumbnail image URL").optional(),
  bannerImage: z.string().url("Invalid banner image URL").optional(),
  configSchema: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().min(0).max(9999).optional(),
  parentId: z.string().uuid("Invalid parent ID").optional(),
});

export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;

export const getCategoriesSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
  search: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
});

export type GetCategoriesDto = z.infer<typeof getCategoriesSchema>;
