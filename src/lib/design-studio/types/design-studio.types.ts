export interface CanvasElement {
  id: string;
  type: "text" | "image" | "logo" | "shape" | "background";
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  zIndex?: number;
  content?: string;
  font?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  mediaId?: string;
  url?: string;
  shapeType?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties?: Record<string, any>;
}

export interface CanvasData {
  width?: number;
  height?: number;
  backgroundColor?: string;
  elements: CanvasElement[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

export interface TemplateInfo {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
}

export interface SizeVariantInfo {
  id: string;
  name: string;
  displayName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dimensions: any;
  price: number;
}

export interface DesignConstraints {
  maxFileSize: number;
  allowedFormats: string[];
  allowedTypes: string[];
  requiredDPI: number;
  maxColors?: number;
  printArea?: {
    width: number;
    height: number;
    unit: string;
  };
}

export interface CanvasSettings {
  width: number;
  height: number;
  dpi: number;
  colorMode: string;
  unit: string;
}

export interface CanvasConfigResponse {
  canvasId: string;
  template: TemplateInfo;
  sizeVariant: SizeVariantInfo;
  constraints: DesignConstraints;
  canvasSettings: CanvasSettings;
}

export interface ArtworkValidation {
  isValid: boolean;
  dpi: number;
  colors: number;
  warnings: string[];
  dimensions: {
    width: number;
    height: number;
  };
}

export interface ArtworkUploadResponse {
  mediaId: string;
  url: string;
  validation: ArtworkValidation;
  processedUrl?: string;
  metadata: {
    originalName: string;
    size: number;
    mimeType: string;
    uploadedAt: Date;
  };
}

export type DesignStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED"
  | "ARCHIVED"
  | "COMPLETED"
  | "TEMPLATE";

export interface DesignResponse {
  id: string;
  name: string;
  description?: string;
  preview?: string;
  customizations: CanvasData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
  template: {
    id: string;
    name: string;
    basePrice: number;
    category: string;
  };
  sizeVariant?: {
    id: string;
    name: string;
    displayName: string;
    price: number;
  };
  status: DesignStatus;
  version: number;
  parentDesignId?: string;
  estimatedCost?: number;
  isTemplate: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DesignListResponse {
  designs: DesignResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ColorPreset {
  id: string;
  name: string;
  hexCode: string;
  rgbCode?: string;
  cmykCode?: string;
  pantoneCode?: string;
  category?: string;
}

export interface FontPreset {
  id: string;
  family: string;
  displayName: string;
  weights: number[];
  styles: string[];
  category: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  urls: any;
  isPremium: boolean;
}

export interface SizePreset {
  id: string;
  name: string;
  displayName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dimensions: any;
  price: number;
  isDefault: boolean;
}

export interface MediaRestrictions {
  allowedTypes: string[];
  maxFileSize: number;
  allowedFormats: string[];
  requiredDPI: number;
}

export interface TemplatePresetsResponse {
  colors: ColorPreset[];
  fonts: FontPreset[];
  sizes: SizePreset[];
  mediaRestrictions: MediaRestrictions;
}

export interface ExportDesignResponse {
  url: string;
  fileSize: number;
  format: string;
  dimensions: {
    width: number;
    height: number;
  };
  metadata: {
    dpi: number;
    colorMode: string;
    isMockup: boolean;
    createdAt: Date;
  };
}

export interface ValidationError {
  type: string;
  message: string;
  severity: "error" | "warning" | "info";
  field?: string;
}

export interface ValidationWarning {
  type: string;
  message: string;
  suggestion?: string;
}

export interface PrintReadiness {
  ready: boolean;
  issues: string[];
  requirements: {
    minDPI: number;
    colorMode: string;
    requiredBleed: number;
  };
}

export interface AssetQuality {
  totalAssets: number;
  lowQualityAssets: number;
  issues: Array<{
    assetId: string;
    issue: string;
    recommendation: string;
  }>;
}

export interface DesignValidationResponse {
  isValid: boolean;
  score: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  printReadiness: PrintReadiness;
  assetQuality: AssetQuality;
}

export interface ShareDesignResponse {
  token: string;
  url: string;
  expiresAt?: Date;
  createdAt: Date;
}

// Font Response
export interface Font {
  id: string;
  family: string;
  displayName: string;
  weights: number[];
  styles: string[];
  category: string;
  previewUrl?: string;
  urls: {
    woff2?: string;
    woff?: string;
    ttf?: string;
    otf?: string;
  };
  isPremium: boolean;
  description?: string;
  license?: string;
  designer?: string;
}

export interface AssetResponse {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  type: "image" | "logo" | "background" | "texture" | "icon";
  createdAt: string;
  description?: string;
  tags?: string[];
}

export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  thumbnailImage?: string;
  basePrice: number;
  category: {
    name: string;
    slug: string;
  };
  variants: Array<{
    id: string;
    name: string;
    price: number;
    isDefault: boolean;
  }>;
}

export interface SharedDesignResponse {
  design: DesignResponse;
  shareInfo: {
    createdAt: Date;
    expiresAt?: Date;
    allowDownload: boolean;
    note?: string;
    creator: string;
  };
}

export interface OrderResponse {
  orderId: string;
}

export interface AdminDesignFilter {
  templateId?: string;
  status?: DesignStatus;
  isTemplate?: boolean;
  creatorId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface DesignStats {
  totalDesigns: number;
  draftDesigns: number;
  publishedDesigns: number;
  templatesCount: number;
  activeUsers: number;
  designsThisWeek: number;
}
