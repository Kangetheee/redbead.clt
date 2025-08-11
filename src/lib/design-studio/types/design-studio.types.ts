/* eslint-disable @typescript-eslint/no-explicit-any*/

export interface CanvasElement {
  id: string;
  type: "text" | "image" | "shape" | "media";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  content?: string;
  font?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  mediaId?: string;
  shapeType?: string;
  properties?: Record<string, any>;
}

export interface CanvasData {
  width: number;
  height: number;
  backgroundColor?: string;
  elements: CanvasElement[];
  metadata?: Record<string, any>;
}

// Canvas Configuration Response
export interface CanvasConfigResponse {
  canvasId: string;
  template: Record<string, any>;
  sizeVariant: Record<string, any>;
  constraints: {
    maxFileSize: number;
    allowedFormats: string[];
    allowedTypes: string[];
    requiredDPI: number;
    maxColors: number;
    printArea: Record<string, any>;
  };
  canvasSettings: {
    width: number;
    height: number;
    dpi: number;
    colorMode: string;
    unit: string;
  };
}

// Artwork Upload Response
export interface ArtworkUploadResponse {
  mediaId: string;
  url: string;
  validation: {
    isValid: boolean;
    dpi: number;
    colors: number;
    warnings: string[];
    dimensions: Record<string, any>;
  };
  processedUrl: string;
  metadata: Record<string, any>;
}

// Design Response
export interface DesignResponse {
  id: string;
  name: string;
  description?: string;
  preview: string;
  customizations: CanvasData;
  metadata?: Record<string, any>;
  template?: Record<string, any>;
  sizeVariant?: Record<string, any>;
  status: "DRAFT" | "COMPLETED" | "ARCHIVED";
  version: number;
  parentDesignId?: string;
  estimatedCost?: number;
  isTemplate: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Design List Response
export interface DesignListResponse {
  designs: DesignResponse[];
  meta: Record<string, any>;
}

// Template Presets Response
export interface TemplatePresetsResponse {
  colors: string[];
  fonts: string[];
  sizes: string[];
  mediaRestrictions: Record<string, any>;
}

// Export Design Response
export interface ExportDesignResponse {
  url: string;
  fileSize: number;
  format: string;
  dimensions: Record<string, any>;
  metadata: Record<string, any>;
}

// Design Validation Response
export interface DesignValidationResponse {
  isValid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  printReadiness: Record<string, any>;
  assetQuality: Record<string, any>;
}

// Share Design Response
export interface ShareDesignResponse {
  token: string;
  url: string;
  expiresAt: string;
  createdAt: string;
}

// Font Response
export interface Font {
  id: string;
  family: string;
  displayName: string;
  weights: string[];
  styles: string[];
  category: string;
  previewUrl: string;
  urls: Record<string, any>;
  isPremium: boolean;
  description?: string;
  license?: string;
  designer?: string;
}

// Asset Response
export interface AssetResponse {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  type: string;
  createdAt: string;
  description?: string;
  tags?: string[];
}
