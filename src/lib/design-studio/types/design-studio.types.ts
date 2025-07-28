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
  properties?: object;
}

export interface CanvasData {
  width: number;
  height: number;
  backgroundColor?: string;
  elements: CanvasElement[];
  metadata?: object;
}

// Canvas Configuration Response
export interface CanvasConfigResponse {
  canvasId: string;
  template: object;
  sizeVariant: object;
  constraints: {
    maxFileSize: number;
    allowedFormats: string[];
    allowedTypes: string[];
    requiredDPI: number;
    maxColors: number;
    printArea: object;
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
    dimensions: object;
  };
  processedUrl: string;
  metadata: object;
}

// Design Response
export interface DesignResponse {
  id: string;
  name: string;
  description?: string;
  preview: string;
  customizations: CanvasData;
  metadata?: object;
  template?: object;
  sizeVariant?: object;
  status: "DRAFT" | "COMPLETED" | "ARCHIVED";
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
  meta: object;
}

// Template Presets Response
export interface TemplatePresetsResponse {
  colors: string[];
  fonts: string[];
  sizes: string[];
  mediaRestrictions: object;
}

export interface ExportDesignResponse {
  url: string;
  fileSize: number;
  format: string;
  dimensions: object;
  metadata: object;
}

export interface DesignValidationResponse {
  isValid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  printReadiness: object;
  assetQuality: object;
}

export interface ShareDesignResponse {
  token: string;
  url: string;
  expiresAt: string;
  createdAt: string;
}

// Font
export interface Font {
  id: string;
  family: string;
  displayName: string;
  weights: string[];
  styles: string[];
  category: string;
  previewUrl: string;
  urls: object;
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
