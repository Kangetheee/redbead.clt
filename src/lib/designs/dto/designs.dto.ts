/* eslint-disable @typescript-eslint/no-explicit-any */

import { z } from "zod";
import { CanvasData } from "@/lib/design-studio/types/design-studio.types";
// import { PrintSpecifications } from "@/lib/design-studio/types/design-studio.types";

export const createDesignSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  description: z.string().max(1000, "Description too long").optional(),
  productId: z.string().min(1, "Product ID is required"),
  customizations: z.any().refine((data) => data !== undefined, {
    message: "Customizations are required",
  }) as z.ZodType<CanvasData>,
  sizePresetId: z.string().optional(),
  templateId: z.string().optional(),
  isTemplate: z.boolean().default(false),
  isPublic: z.boolean().default(false),
});

export type CreateDesignDto = z.infer<typeof createDesignSchema>;

export const updateDesignSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name too long")
    .optional(),
  description: z.string().max(1000, "Description too long").optional(),
  customizations: z.any().optional() as z.ZodType<CanvasData | undefined>,
  sizePresetId: z.string().optional(),
  templateId: z.string().optional(),
  isTemplate: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export type UpdateDesignDto = z.infer<typeof updateDesignSchema>;

export const getDesignsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  isTemplate: z.boolean().optional(),
});

export type GetDesignsDto = z.infer<typeof getDesignsSchema>;

export const duplicateDesignSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name too long")
    .optional(),
  description: z.string().max(1000, "Description too long").optional(),
});

export type DuplicateDesignDto = z.infer<typeof duplicateDesignSchema>;

export interface PaginatedDesignsResponseDto {
  items: DesignResponseDto[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface DesignResponseDto {
  id: string;
  name: string;
  description?: string;
  preview: string;
  customizations: CanvasData;
  metadata?: Record<string, any>;
  product: {
    id: string;
    name: string;
    thumbnail: string;
  };
  status: string;
  version: number;
  parentDesignId?: string;
  // printSpecifications?: PrintSpecifications;
  estimatedCost?: number;
  isTemplate: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}
