import { z } from "zod";

// Canvas Element Schema
export const canvasElementSchema = z.object({
  id: z.string().min(1, "Element ID is required"),
  type: z.enum(["text", "image", "shape", "media"]),
  x: z.number(),
  y: z.number(),
  width: z.number().min(0),
  height: z.number().min(0),
  rotation: z.number().optional(),
  content: z.string().optional(),
  font: z.string().optional(),
  fontSize: z.number().optional(),
  fontWeight: z.string().optional(),
  color: z.string().optional(),
  mediaId: z.string().optional(),
  shapeType: z.string().optional(),
  properties: z.record(z.any()).optional(),
});

// Canvas Data Schema
export const canvasDataSchema = z.object({
  width: z.number().min(1, "Canvas width is required"),
  height: z.number().min(1, "Canvas height is required"),
  backgroundColor: z.string().optional(),
  elements: z.array(canvasElementSchema),
  metadata: z.record(z.any()).optional(),
});

// Configure Canvas Schema
export const configureCanvasSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  sizeVariantId: z.string().min(1, "Size variant ID is required"),
  customizations: z.record(z.any()).optional(),
});

export type ConfigureCanvasDto = z.infer<typeof configureCanvasSchema>;

// Upload Artwork Schema
export const uploadArtworkSchema = z.object({
  canvasId: z.string().min(1, "Canvas ID is required"),
  position: z.string().optional(),
});

export type UploadArtworkDto = z.infer<typeof uploadArtworkSchema>;

// Create Design Schema
export const createDesignSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  description: z.string().optional(),
  templateId: z.string().min(1, "Template ID is required"),
  sizeVariantId: z.string().min(1, "Size variant ID is required"),
  customizations: canvasDataSchema,
  status: z.enum(["DRAFT", "COMPLETED", "ARCHIVED"]).default("DRAFT"),
  isTemplate: z.boolean().default(false),
  isPublic: z.boolean().default(false),
});

export type CreateDesignDto = z.infer<typeof createDesignSchema>;

// Update Design Schema
export const updateDesignSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name too long")
    .optional(),
  description: z.string().optional(),
  templateId: z.string().optional(),
  sizeVariantId: z.string().optional(),
  customizations: canvasDataSchema.optional(),
  status: z.enum(["DRAFT", "COMPLETED", "ARCHIVED"]).optional(),
  isTemplate: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export type UpdateDesignDto = z.infer<typeof updateDesignSchema>;

// Export Design Schema
export const exportDesignSchema = z.object({
  format: z.enum(["png", "jpg", "pdf", "svg"]),
  quality: z.enum(["low", "medium", "high", "print"]),
  width: z.number().min(1).optional(),
  height: z.number().min(1).optional(),
  dpi: z.number().min(72).optional(),
  includeBleed: z.boolean().default(false),
  includeCropMarks: z.boolean().default(false),
  colorProfile: z.string().optional(),
  showMockup: z.boolean().default(false),
});

export type ExportDesignDto = z.infer<typeof exportDesignSchema>;

// Design Validation Schema
export const designValidationSchema = z.object({
  checkPrintReadiness: z.boolean().default(true),
  checkConstraints: z.boolean().default(true),
  checkAssetQuality: z.boolean().default(true),
});

export type DesignValidationDto = z.infer<typeof designValidationSchema>;

// Share Design Schema
export const shareDesignSchema = z.object({
  expiresAt: z.string().datetime().optional(),
  allowDownload: z.boolean().default(false),
  password: z.string().optional(),
  note: z.string().max(500, "Note too long").optional(),
});

export type ShareDesignDto = z.infer<typeof shareDesignSchema>;

// Upload Asset Schema
export const uploadAssetSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  type: z.enum(["image", "logo", "background", "texture", "icon"]),
  description: z.string().max(500, "Description too long").optional(),
  folderId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type UploadAssetDto = z.infer<typeof uploadAssetSchema>;

// Get Designs Schema
export const getDesignsSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  page: z.number().min(1).optional(),
  isTemplate: z.boolean().optional(),
  status: z.enum(["DRAFT", "COMPLETED", "ARCHIVED"]).optional(),
  templateId: z.string().optional(),
});

// Explicit type definition
export type GetDesignsDto = {
  limit?: number;
  page?: number;
  isTemplate?: boolean;
  status?: "DRAFT" | "COMPLETED" | "ARCHIVED";
  templateId?: string;
};

// Get Fonts Schema
export const getFontsSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  premium: z.boolean().optional(),
});

// Explicit type definition
export type GetFontsDto = {
  category?: string;
  search?: string;
  premium?: boolean;
};

// Get User Assets Schema
export const getUserAssetsSchema = z.object({
  type: z.string().optional(),
  folderId: z.string().optional(),
});

// Explicit type definition
export type GetUserAssetsDto = {
  type?: string;
  folderId?: string;
};
