export interface Dimensions {
  width: number;
  height: number;
  unit: string;
  depth?: number;
}

export interface CanvasLayer {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  visible?: boolean;
  zIndex?: number;
  properties?: object;
}

export interface CanvasData {
  width: number;
  height: number;
  backgroundColor?: string;
  layers: CanvasLayer[];
  metadata?: object;
}

export interface CanvasResponse {
  id: string;
  canvas: CanvasData;
  presets: object;
  constraints: object;
  createdAt: string;
}

export interface SaveCanvasResponse {
  id: string;
  name: string;
  preview: string;
  createdAt: string;
  updatedAt: string;
}

export interface CanvasConfig {
  canvasSettings: object;
  colorPresets: string[];
  fontPresets: string[];
  sizePresets: string[];
  mediaRestrictions: object;
  constraints: object;
  product: object;
}

export interface PrintSpecifications {
  material: string;
  colorMode: string;
  dpi: number;
  finish: string;
  specialInstructions?: string;
  estimatedProductionTime?: number;
}

export interface DesignResponse {
  id: string;
  name: string;
  description?: string;
  preview: string;
  customizations: CanvasData;
  metadata?: object;
  product: object;
  status: string;
  version: number;
  parentDesignId?: string;
  printSpecifications?: PrintSpecifications;
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

export interface UploadDesignAssetResponse {
  id: string;
  url: string;
  assetType: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export interface ExportDesignResponse {
  url: string;
  fileSize: number;
  format: string;
  dimensions: object;
  metadata: object;
}

export interface DesignPresetsResponse {
  colors: string[];
  fonts: string[];
  sizes: string[];
  mediaRestrictions: object;
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

export interface CustomizeTemplateResponse {
  template: object;
  customizableAreas: string[];
  canvasSettings: object;
  product: object;
  constraints: object;
}

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
}

export interface UploadAssetResponse {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  type: string;
  createdAt: string;
}
