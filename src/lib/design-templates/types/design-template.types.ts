/* eslint-disable @typescript-eslint/no-explicit-any */

export interface DesignTemplate {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  productId: string;
  basePrice: number;
  thumbnail: string;
  isActive: boolean;
  metadata?: {
    tags?: string[];
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    images: string[];
    isActive: boolean;
  };
  sizeVariants: SizeVariant[];
  colorPresets: ColorPreset[];
  fontPresets: FontPreset[];
  mediaRestrictions: MediaRestriction[];
}

export interface SizeVariant {
  id: string;
  templateId: string;
  name: string;
  displayName: string;
  dimensions: {
    width: number;
    height: number;
    unit: string;
    dpi: number;
  };
  price: number;
  isDefault: boolean;
  isActive: boolean;
  metadata?: {
    printArea?: {
      width: number;
      height: number;
    };
    [key: string]: any;
  };
  sortOrder: number;
}

export interface ColorPreset {
  id: string;
  templateId: string;
  name: string;
  hexCode: string;
  rgbCode: string;
  cmykCode?: string;
  pantoneCode?: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
}

export interface FontPreset {
  id: string;
  templateId: string;
  family: string;
  displayName: string;
  weights: number[];
  styles: string[];
  category: string;
  urls?: {
    woff2?: string;
    woff?: string;
    [key: string]: string | undefined;
  };
  isPremium: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface MediaRestriction {
  id: string;
  templateId: string;
  allowedTypes: string[];
  maxFileSize: number;
  allowedFormats: string[];
  requiredDPI?: number;
  isActive: boolean;
}

export interface PriceCalculation {
  basePrice: number;
  customizationAdjustments: number;
  unitPrice: number;
  subtotal: number;
  totalPrice: number;
  breakdown: Array<{
    name: string;
    cost: string;
  }>;
  urgencyMultiplier: number;
  quantity: number;
}

// Response DTOs (matching API structure)
export interface TemplateResponse {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  productId: string;
  basePrice: number;
  thumbnail: string;
  isActive: boolean;
  metadata?: {
    tags?: string[];
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    images: string[];
    isActive: boolean;
  };
  sizeVariants: SizeVariantResponseDto[];
  colorPresets: ColorPresetResponseDto[];
  fontPresets: FontPresetResponseDto[];
  mediaRestrictions: MediaRestrictionResponseDto[];
}

export interface SizeVariantResponseDto {
  id: string;
  templateId: string;
  name: string;
  displayName: string;
  dimensions: {
    width: number;
    height: number;
    unit: string;
    dpi: number;
  };
  price: number;
  isDefault: boolean;
  isActive: boolean;
  metadata?: {
    printArea?: {
      width: number;
      height: number;
    };
    [key: string]: any;
  };
  sortOrder: number;
}

export interface ColorPresetResponseDto {
  id: string;
  templateId: string;
  name: string;
  hexCode: string;
  rgbCode: string;
  cmykCode?: string;
  pantoneCode?: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
}

export interface FontPresetResponseDto {
  id: string;
  templateId: string;
  family: string;
  displayName: string;
  weights: number[];
  styles: string[];
  category: string;
  urls?: {
    woff2?: string;
    woff?: string;
    [key: string]: string | undefined;
  };
  isPremium: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface MediaRestrictionResponseDto {
  id: string;
  templateId: string;
  allowedTypes: string[];
  maxFileSize: number;
  allowedFormats: string[];
  requiredDPI?: number;
  isActive: boolean;
}

export interface PriceCalculationResponseDto {
  basePrice: number;
  customizationAdjustments: number;
  unitPrice: number;
  subtotal: number;
  totalPrice: number;
  breakdown: Array<{
    name: string;
    cost: string;
  }>;
  urgencyMultiplier: number;
  quantity: number;
}
