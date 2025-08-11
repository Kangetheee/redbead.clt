/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  thumbnailImage?: string | null;
  basePrice: number;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  metadata?: ProductMetadata;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  variants?: ProductVariant[];
  customizations?: ProductCustomization[];
  designTemplates?: ProductDesignTemplate[];
}

export interface ProductMetadata {
  type?: string;
  leadTime?: string;
  material?: string;
  dimensions?: {
    unit: string;
    width: number;
    height: number;
    length?: number;
  };
  productionDays?: number;
  [key: string]: any; // Allow for additional dynamic properties
}

export interface ProductVariant {
  id: string;
  name: string;
  type: string;
  price: number;
  sku: string;
  stock: number;
  isDefault: boolean;
  metadata?: Record<string, any>;
}

export interface ProductCustomization {
  id: string;
  productId: string;
  optionId: string;
  required: boolean;
  sortOrder: number;
  option: CustomizationOption;
}

export interface CustomizationOption {
  id: string;
  name: string;
  type: string;
  required: boolean;
  metadata?: Record<string, any>;
}

export interface ProductDesignTemplate {
  id: string;
  name: string;
  thumbnail: string;
  basePrice: number;
}

export interface ProductPriceCalculation {
  basePrice: number;
  variantPrice: number;
  customizationCost: number;
  unitPrice: number;
  totalPrice: number;
  quantity: number;
}

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  relatedTo?: string;
  sortBy?: "name" | "createdAt" | "basePrice" | "updatedAt";
  sortDirection?: "asc" | "desc";
}

export interface ProductSearchFilters {
  q: string;
  limit?: number;
  categoryId?: string;
}
