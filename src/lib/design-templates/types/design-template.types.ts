/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */

export interface Dimensions {
  width: number;
  height: number;
  unit: "mm" | "cm" | "in";
}

export interface Materials {
  base: string;
  options: string[];
}

export interface DesignConstraints {
  allowText: boolean;
  allowLogos: boolean;
  allowCustomColors: boolean;
  maxColors: number;
  printArea?: {
    unit: string;
    width: number;
    height: number;
  };
}

export interface CanvasSettings {
  backgroundColor: string;
  printable: boolean;
  snapToGrid?: boolean;
  gridEnabled?: boolean;
}

// Related entity interfaces
export interface ProductInfo {
  id: string;
  name: string;
  slug: string;
  thumbnailImage?: string;
  basePrice?: number;
  isFeatured?: boolean;
  type?: string;
  material?: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
}

// Size variant interface (updated to match API response)
export interface SizeVariant {
  id: string;
  name: string;
  displayName: string;
  dimensions?: Dimensions;
  description?: string;
  price: number;
  sku?: string;
  stock?: number;
  minOrderQty?: number;
  maxOrderQty?: number;
  isDefault: boolean;
  isActive: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Main template interface (updated to match API response)
export interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  slug: string;
  previewImage: string;
  images: string[];
  customizations: Record<string, any>;
  productId: string;
  basePrice: number;
  sku: string;
  stock: number;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  isFeatured: boolean;
  isActive: boolean;
  categoryId: string;
  metaTitle?: string;
  metaDescription?: string;
  designConstraints: DesignConstraints;
  canvasSettings: CanvasSettings;
  dimensions: Dimensions;
  leadTime: string;
  productionDays: number;
  designDays: number;
  shippingDays: number;
  materials: Materials;
  printOptions: string[];
  createdAt: string;
  updatedAt: string;
  product: ProductInfo;
  category: CategoryInfo;
  sizeVariants: SizeVariant[];
  customizationOptions?: string[];
}

// List response for templates
export interface TemplatesListResponse {
  items: DesignTemplate[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
}

// Price calculation interfaces
export interface PriceBreakdownItem {
  name: string;
  cost: string;
}

export interface PriceCalculationResult {
  basePrice: number;
  customizationAdjustments: number;
  unitPrice: number;
  subtotal: number;
  totalPrice: number;
  breakdown: PriceBreakdownItem[];
  urgencyMultiplier: number;
  quantity: number;
}

// Customization option interfaces
export interface CustomizationOption {
  id: string;
  name: string;
  type: "select" | "text" | "color" | "number" | "boolean";
  required: boolean;
  description?: string;
  values?: CustomizationValue[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface CustomizationValue {
  id: string;
  name: string;
  value: string;
  priceAdjustment: number;
  isDefault?: boolean;
}

// Analytics interfaces
export interface TemplateAnalytics {
  templateId: string;
  templateName: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  popularVariants: {
    variantId: string;
    variantName: string;
    orderCount: number;
  }[];
  monthlyTrends: {
    month: string;
    orders: number;
    revenue: number;
  }[];
}

export interface TemplatePerformanceAnalytics {
  templates: TemplateAnalytics[];
  summary: {
    totalTemplates: number;
    totalOrders: number;
    totalRevenue: number;
    averageConversionRate: number;
  };
  dateRange: {
    startDate: string;
    endDate: string;
    days: number;
  };
}

// Filter and search interfaces
export interface TemplateFilters {
  search?: string;
  productId?: string;
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

// Type guards
export const isDesignTemplate = (obj: any): obj is DesignTemplate => {
  return obj && typeof obj.id === "string" && typeof obj.name === "string";
};

export const isSizeVariant = (obj: any): obj is SizeVariant => {
  return obj && typeof obj.id === "string" && typeof obj.name === "string";
};

export const isPriceCalculationResult = (
  obj: any
): obj is PriceCalculationResult => {
  return (
    obj && typeof obj.totalPrice === "number" && Array.isArray(obj.breakdown)
  );
};

// Utility types
export type TemplateStatus = "active" | "inactive" | "draft";
export type UrgencyLevel = "NORMAL" | "EXPEDITED" | "RUSH" | "EMERGENCY";
export type DimensionUnit = "mm" | "cm" | "in";

// Template creation and update types
export interface CreateTemplateRequest {
  name: string;
  slug: string;
  description: string;
  productId: string;
  categoryId: string;
  previewImage: string;
  images: string[];
  basePrice: number;
  sku: string;
  stock: number;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  designConstraints: DesignConstraints;
  canvasSettings: CanvasSettings;
  dimensions: Dimensions;
  leadTime: string;
  productionDays: number;
  designDays: number;
  shippingDays: number;
  materials: Materials;
  printOptions: string[];
  customizations: Record<string, any>;
  isFeatured: boolean;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateTemplateRequest extends Partial<CreateTemplateRequest> {}

export interface CreateSizeVariantRequest {
  name: string;
  displayName: string;
  dimensions: Dimensions;
  description?: string;
  price: number;
  sku: string;
  stock: number;
  minOrderQty: number;
  maxOrderQty: number;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface UpdateSizeVariantRequest
  extends Partial<CreateSizeVariantRequest> {}

export interface DuplicateTemplateRequest {
  name: string;
  slug: string;
}
