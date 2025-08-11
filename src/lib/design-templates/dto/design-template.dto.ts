/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  SizeVariantResponseDto,
  ColorPresetResponseDto,
  FontPresetResponseDto,
  MediaRestrictionResponseDto,
} from "../types/design-template.types";

import { z } from "zod";

// Create Template DTO Schema
export const createTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  productId: z.string().min(1, "Product ID is required"),
  categoryId: z.string().min(1, "Category ID is required"),
  basePrice: z.number().positive("Base price must be positive"),
  thumbnail: z.string().min(1, "Thumbnail is required"),
  isActive: z.boolean().default(true),
  metadata: z
    .object({
      tags: z.array(z.string()).optional(),
    })
    .optional(),
});

export type CreateTemplateDto = z.infer<typeof createTemplateSchema>;

// Update Template DTO Schema
export const updateTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name too long")
    .optional(),
  description: z.string().max(500, "Description too long").optional(),
  categoryId: z.string().optional(),
  productId: z.string().optional(),
  basePrice: z.number().positive("Base price must be positive").optional(),
  thumbnail: z.string().optional(),
  isActive: z.boolean().optional(),
  metadata: z
    .object({
      tags: z.array(z.string()).optional(),
    })
    .optional(),
});

export type UpdateTemplateDto = z.infer<typeof updateTemplateSchema>;

// Get Templates DTO Schema
export const getTemplatesSchema = z.object({
  pageIndex: z.number().min(0).optional(),
  pageSize: z.number().min(-1).max(100).optional(),
  search: z.string().optional(),
  productId: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type GetTemplatesDto = z.infer<typeof getTemplatesSchema>;

// Get Templates by Product DTO Schema
export const getTemplatesByProductSchema = z.object({
  isActive: z.boolean().optional(),
});

export type GetTemplatesByProductDto = z.infer<
  typeof getTemplatesByProductSchema
>;

// Duplicate Template DTO Schema
export const duplicateTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
});

export type DuplicateTemplateDto = z.infer<typeof duplicateTemplateSchema>;

// Size Variant DTOs
export const createSizeVariantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  displayName: z.string().min(1, "Display name is required"),
  dimensions: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    unit: z.string(),
    dpi: z.number().positive(),
  }),
  price: z.number().positive("Price must be positive"),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().min(0).default(0),
  metadata: z
    .object({
      printArea: z
        .object({
          width: z.number().positive(),
          height: z.number().positive(),
        })
        .optional(),
    })
    .optional(),
});

export type CreateSizeVariantDto = z.infer<typeof createSizeVariantSchema>;

export const updateSizeVariantSchema = createSizeVariantSchema.partial();
export type UpdateSizeVariantDto = z.infer<typeof updateSizeVariantSchema>;

// Color Preset DTOs
export const createColorPresetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  rgbCode: z.string(),
  cmykCode: z.string().optional(),
  pantoneCode: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  isActive: z.boolean().default(true),
  sortOrder: z.number().min(0).default(0),
});

export type CreateColorPresetDto = z.infer<typeof createColorPresetSchema>;

export const updateColorPresetSchema = createColorPresetSchema.partial();
export type UpdateColorPresetDto = z.infer<typeof updateColorPresetSchema>;

// Font Preset DTOs
export const createFontPresetSchema = z.object({
  family: z.string().min(1, "Font family is required"),
  displayName: z.string().min(1, "Display name is required"),
  weights: z.array(z.number()),
  styles: z.array(z.string()),
  category: z.string().min(1, "Category is required"),
  urls: z
    .object({
      woff2: z.string().optional(),
      woff: z.string().optional(),
    })
    .optional(),
  isPremium: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().min(0).default(0),
});

export type CreateFontPresetDto = z.infer<typeof createFontPresetSchema>;

export const updateFontPresetSchema = createFontPresetSchema.partial();
export type UpdateFontPresetDto = z.infer<typeof updateFontPresetSchema>;

// Media Restriction DTOs
export const createMediaRestrictionSchema = z.object({
  allowedTypes: z.array(z.string()),
  maxFileSize: z.number().positive(),
  allowedFormats: z.array(z.string()),
  requiredDPI: z.number().positive().optional(),
  isActive: z.boolean().default(true),
});

export type CreateMediaRestrictionDto = z.infer<
  typeof createMediaRestrictionSchema
>;

export const updateMediaRestrictionSchema =
  createMediaRestrictionSchema.partial();
export type UpdateMediaRestrictionDto = z.infer<
  typeof updateMediaRestrictionSchema
>;

// Price Calculation DTO
export const calculatePriceSchema = z.object({
  sizeVariantId: z.string().min(1, "Size variant ID is required"),
  quantity: z.number().positive("Quantity must be positive"),
  customizations: z.record(z.any()).optional(),
  urgencyLevel: z.enum(["NORMAL", "URGENT", "RUSH"]).default("NORMAL"),
});

export type CalculatePriceDto = z.infer<typeof calculatePriceSchema>;

// Analytics DTOs
export const getTemplateAnalyticsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  templateIds: z.array(z.string()).optional(),
});

export type GetTemplateAnalyticsDto = z.infer<
  typeof getTemplateAnalyticsSchema
>;
