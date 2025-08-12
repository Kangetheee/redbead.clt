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
  productId: string; // Added: Missing in original
  name: string;
  type: string;
  price: number;
  sku: string;
  stock: number;
  isDefault: boolean;
  isActive: boolean; // Added: Missing in original
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
  metadata?: CustomizationOptionMetadata; // Made more specific
  isActive: boolean; // Added: Missing in original
}

// Added: More specific metadata structure for customization options
export interface CustomizationOptionMetadata {
  options?: Array<{
    label: string;
    value: string;
    priceAdjustment?: number;
    hexColor?: string; // For COLOR type options
  }>;
  description?: string;
  displayName?: string;
  placeholder?: string; // For TEXT type options
  maxLength?: number; // For TEXT type options
  [key: string]: any;
}

export interface ProductDesignTemplate {
  id: string;
  name: string;
  description?: string; // Added: From your API response
  categoryId?: string; // Added: From your API response
  productId?: string; // Added: From your API response
  basePrice: number;
  thumbnail: string | null; // Updated: Can be null
  isActive?: boolean; // Added: From your API response
  metadata?: Record<string, any>; // Added: From your API response
  createdAt?: string; // Added: From your API response
  updatedAt?: string; // Added: From your API response
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

// Added: Additional types that might be useful
export interface ProductCreateData {
  name: string;
  slug: string;
  description?: string;
  images?: string[];
  thumbnailImage?: string;
  basePrice: number;
  categoryId: string;
  isActive?: boolean;
  isFeatured?: boolean;
  metadata?: ProductMetadata;
}

export interface ProductUpdateData extends Partial<ProductCreateData> {
  id: string;
}

// Added: Cart-related types for customizations
export interface CustomizationChoice {
  optionId: string;
  value: string | number | boolean;
  priceAdjustment?: number;
}

export interface AddToCartData {
  productId: string;
  variantId?: string;
  quantity: number;
  customizations?: CustomizationChoice[];
}
