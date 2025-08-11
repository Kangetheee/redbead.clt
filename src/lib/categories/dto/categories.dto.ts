import { z } from "zod";

// Create Category Schema
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
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
  parentId: z.string().uuid("Invalid parent ID").optional(),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;

// Update Category Schema
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
  isActive: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
  parentId: z.string().uuid("Invalid parent ID").optional(),
});

export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;

// Get Categories Schema (matching API spec)
export const getCategoriesSchema = z.object({
  pageIndex: z.number().min(0, "Page index must be non-negative").optional(),
  pageSize: z
    .number()
    .min(-1, "Page size must be -1 or positive")
    .max(100, "Page size cannot exceed 100")
    .optional(),
  search: z.string().max(100, "Search term too long").optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(["name", "slug", "createdAt", "updatedAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  parentId: z.string().uuid("Invalid parent ID").optional(),
});

// Explicit type definition to ensure all properties are optional
export type GetCategoriesDto = {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: "name" | "slug" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  parentId?: string;
};
