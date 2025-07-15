/* eslint-disable @typescript-eslint/no-explicit-any */

import { z } from "zod";

// Create DTO Schema
export const createDesignTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  previewImage: z.string().min(1, "Preview image is required"),
  customizations: z.any().refine((data) => data !== undefined, {
    message: "Customizations are required",
  }),
  productId: z.string().min(1, "Product ID is required"),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type CreateDesignTemplateDto = z.infer<
  typeof createDesignTemplateSchema
>;

// Update DTO Schema
export const updateDesignTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name too long")
    .optional(),
  description: z.string().max(500, "Description too long").optional(),
  previewImage: z.string().optional(),
  customizations: z.any().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateDesignTemplateDto = z.infer<
  typeof updateDesignTemplateSchema
>;

// Get Templates DTO Schema
export const getDesignTemplatesSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type GetDesignTemplatesDto = z.infer<typeof getDesignTemplatesSchema>;

// Featured Templates DTO Schema
export const getFeaturedTemplatesSchema = z.object({
  limit: z.number().min(1).max(20).default(5),
});

export type GetFeaturedTemplatesDto = z.infer<
  typeof getFeaturedTemplatesSchema
>;

// Response DTOs
export interface DesignTemplateResponseDto {
  id: string;
  name: string;
  description?: string;
  previewImage: string;
  customizations: any;
  productId: string;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedDesignTemplatesResponseDto {
  items: DesignTemplateResponseDto[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
}
