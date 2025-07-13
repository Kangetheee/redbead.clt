import { z } from "zod";

export const dimensionsSchema = z.object({
  width: z.number().min(1, "Width must be greater than 0"),
  height: z.number().min(1, "Height must be greater than 0"),
  unit: z.string().min(1, "Unit is required"),
  depth: z.number().optional(),
});

export const canvasLayerSchema = z.object({
  id: z.string().min(1, "Layer ID is required"),
  type: z.string().min(1, "Layer type is required"),
  x: z.number(),
  y: z.number(),
  width: z.number().min(0),
  height: z.number().min(0),
  rotation: z.number().optional(),
  opacity: z.number().min(0).max(1).optional(),
  visible: z.boolean().optional(),
  zIndex: z.number().optional(),
  properties: z.object({}).optional(),
});

export const canvasDataSchema = z.object({
  width: z.number().min(1, "Canvas width is required"),
  height: z.number().min(1, "Canvas height is required"),
  backgroundColor: z.string().optional(),
  layers: z.array(canvasLayerSchema),
  metadata: z.object({}).optional(),
});

export const createCanvasSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  sizePresetId: z.string().optional(),
  canvasTemplateId: z.string().optional(),
  customDimensions: dimensionsSchema.optional(),
});

export type CreateCanvasDto = z.infer<typeof createCanvasSchema>;

export const saveCanvasSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  description: z.string().max(1000, "Description too long").optional(),
  customizations: z.object({}),
  productId: z.string().min(1, "Product ID is required"),
  templateId: z.string().optional(),
  preview: z.string().url("Invalid preview URL").optional(),
  isTemplate: z.boolean().default(false),
});

export type SaveCanvasDto = z.infer<typeof saveCanvasSchema>;

export const createDesignSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  description: z.string().max(1000, "Description too long").optional(),
  productId: z.string().min(1, "Product ID is required"),
  customizations: canvasDataSchema,
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
  productId: z.string().optional(),
  customizations: canvasDataSchema.optional(),
  sizePresetId: z.string().optional(),
  templateId: z.string().optional(),
  isTemplate: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export type UpdateDesignDto = z.infer<typeof updateDesignSchema>;

export const saveDesignSchema = z.object({
  printSpecifications: z
    .object({
      material: z.string().min(1, "Material is required"),
      colorMode: z.string().min(1, "Color mode is required"),
      dpi: z.number().min(72, "DPI must be at least 72"),
      finish: z.string().min(1, "Finish is required"),
      specialInstructions: z.string().optional(),
      estimatedProductionTime: z.number().min(0).optional(),
    })
    .optional(),
  productionNotes: z.string().optional(),
  metadata: z.object({}).optional(),
  status: z.string().optional(),
});

export type SaveDesignDto = z.infer<typeof saveDesignSchema>;

export const versionDesignSchema = z.object({
  name: z.string().min(1, "Version name is required"),
  changeDescription: z.string().optional(),
  customizations: canvasDataSchema,
});

export type VersionDesignDto = z.infer<typeof versionDesignSchema>;

export const uploadDesignAssetSchema = z.object({
  assetType: z.enum([
    "LOGO",
    "BACKGROUND",
    "DECORATION",
    "TEXT_OVERLAY",
    "PATTERN",
    "BORDER",
    "ACCENT",
  ]),
  position: z.object({}).optional(),
  metadata: z.object({}).optional(),
});

export type UploadDesignAssetDto = z.infer<typeof uploadDesignAssetSchema>;

export const exportDesignSchema = z.object({
  format: z.enum(["png", "jpg", "pdf", "svg"]),
  quality: z.enum(["low", "medium", "high", "print"]),
  width: z.number().min(1).optional(),
  height: z.number().min(1).optional(),
  dpi: z.number().min(72).optional(),
  includeBleed: z.boolean().default(false),
  includeCropMarks: z.boolean().default(false),
  colorProfile: z.string().optional(),
});

export type ExportDesignDto = z.infer<typeof exportDesignSchema>;

export const designValidationSchema = z.object({
  checkPrintReadiness: z.boolean().default(true),
  checkConstraints: z.boolean().default(true),
  checkAssetQuality: z.boolean().default(true),
});

export type DesignValidationDto = z.infer<typeof designValidationSchema>;

export const shareDesignSchema = z.object({
  expiresAt: z.string().datetime().optional(),
  allowDownload: z.boolean().default(false),
  password: z.string().optional(),
  note: z.string().max(500).optional(),
});

export type ShareDesignDto = z.infer<typeof shareDesignSchema>;

export const uploadAssetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["image", "logo", "background", "texture", "icon"]),
  description: z.string().optional(),
  folderId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type UploadAssetDto = z.infer<typeof uploadAssetSchema>;

export const getDesignsSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  page: z.number().min(1).optional(),
  isTemplate: z.boolean().optional(),
  status: z.string().optional(),
  productId: z.string().optional(),
});

export type GetDesignsDto = z.infer<typeof getDesignsSchema>;

export const getPresetsSchema = z.object({
  type: z.string().optional(),
  category: z.string().optional(),
  includePremium: z.boolean().default(false),
});

export type GetPresetsDto = z.infer<typeof getPresetsSchema>;

export const getFontsSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  premium: z.boolean().optional(),
});

export type GetFontsDto = z.infer<typeof getFontsSchema>;
