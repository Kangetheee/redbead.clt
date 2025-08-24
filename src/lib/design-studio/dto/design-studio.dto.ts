import { z } from "zod";

export const canvasElementSchema = z.object({
  id: z.string().min(1, "Element ID is required"),
  type: z.enum(["text", "image", "logo", "shape", "background"]),
  x: z.number(),
  y: z.number(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  rotation: z.number().optional(),
  zIndex: z.number().optional(),
  content: z.string().optional(),
  font: z.string().optional(),
  fontSize: z.number().optional(),
  fontWeight: z.string().optional(),
  color: z.string().optional(),
  mediaId: z.string().optional(),
  shapeType: z.string().optional(),
  properties: z.record(z.any()).optional(),
});

export const canvasDataSchema = z.object({
  width: z.number().min(1, "Canvas width is required").optional(),
  height: z.number().min(1, "Canvas height is required").optional(),
  backgroundColor: z.string().optional(),
  elements: z.array(canvasElementSchema),
  metadata: z.record(z.any()).optional(),
});

export const configureCanvasSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  sizeVariantId: z.string().optional(),
  customizations: z.record(z.any()).optional(),
});

export type ConfigureCanvasDto = z.infer<typeof configureCanvasSchema>;

export const uploadArtworkSchema = z.object({
  canvasId: z.string().min(1, "Canvas ID is required"),
  position: z
    .enum(["center", "top-left", "top-right", "bottom-left", "bottom-right"])
    .optional()
    .default("center"),
});

export type UploadArtworkDto = z.infer<typeof uploadArtworkSchema>;

export const createDesignSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  description: z.string().optional(),
  templateId: z.string().min(1, "Template ID is required"),
  sizeVariantId: z.string().optional(),
  customizations: canvasDataSchema,
  status: z
    .enum([
      "DRAFT",
      "PENDING_REVIEW",
      "APPROVED",
      "REJECTED",
      "PUBLISHED",
      "ARCHIVED",
      "COMPLETED",
      "TEMPLATE",
    ])
    .default("DRAFT"),
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
  description: z.string().optional(),
  templateId: z.string().optional(),
  sizeVariantId: z.string().optional(),
  customizations: canvasDataSchema.optional(),
  status: z
    .enum([
      "DRAFT",
      "PENDING_REVIEW",
      "APPROVED",
      "REJECTED",
      "PUBLISHED",
      "ARCHIVED",
      "COMPLETED",
      "TEMPLATE",
    ])
    .optional(),
  isTemplate: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export type UpdateDesignDto = z.infer<typeof updateDesignSchema>;

export const exportDesignSchema = z.object({
  format: z.enum(["png", "jpg", "jpeg", "pdf", "svg"]),
  quality: z.enum(["low", "medium", "high", "print"]),
  width: z.number().min(1).optional(),
  height: z.number().min(1).optional(),
  dpi: z.number().min(72).max(600).default(300).optional(),
  includeBleed: z.boolean().default(false).optional(),
  includeCropMarks: z.boolean().default(false).optional(),
  colorProfile: z.string().default("sRGB").optional(),
  showMockup: z.boolean().default(false).optional(),
});

export type ExportDesignDto = z.infer<typeof exportDesignSchema>;

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

export const uploadAssetSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  type: z.enum(["image", "logo", "background", "texture", "icon"]),
  description: z.string().max(500, "Description too long").optional(),
  folderId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type UploadAssetDto = z.infer<typeof uploadAssetSchema>;

export const getDesignsSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  page: z.number().min(1).optional(),
  isTemplate: z.boolean().optional(),
  status: z
    .enum([
      "DRAFT",
      "PENDING_REVIEW",
      "APPROVED",
      "REJECTED",
      "PUBLISHED",
      "ARCHIVED",
      "COMPLETED",
      "TEMPLATE",
    ])
    .optional(),
  templateId: z.string().optional(),
});

export type GetDesignsDto = {
  limit?: number;
  page?: number;
  isTemplate?: boolean;
  status?:
    | "DRAFT"
    | "PENDING_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "PUBLISHED"
    | "ARCHIVED"
    | "COMPLETED"
    | "TEMPLATE";
  templateId?: string;
};

export const getFontsSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  premium: z.boolean().optional(),
});

export type GetFontsDto = {
  category?: string;
  search?: string;
  premium?: boolean;
};

export const getUserAssetsSchema = z.object({
  type: z.string().optional(),
  folderId: z.string().optional(),
});

export type GetUserAssetsDto = {
  type?: string;
  folderId?: string;
};

export const guestExportDesignSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  customizations: z.record(z.any()),
  exportOptions: exportDesignSchema,
});

export type GuestExportDesignDto = z.infer<typeof guestExportDesignSchema>;

export const createOrderSchema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1"),
  shippingAddressId: z.string().min(1, "Shipping address is required"),
  billingAddressId: z.string().optional(),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
