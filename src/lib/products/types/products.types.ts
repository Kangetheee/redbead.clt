export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  sku?: string;
  stock: number;
  images: string[];
  thumbnailImage?: string;
  minOrderQuantity: number;
  maxOrderQuantity?: number;
  customizableAreas?: object;
  metaTitle?: string;
  metaDescription?: string;
  isFeatured: boolean;
  isActive: boolean;
  categoryId: string;
  templateId?: string;
  weight?: number;
  dimensions?: object;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  template?: {
    id: string;
    name: string;
    minOrder: number;
    leadTime: string;
  };
  priceTemplates?: ProductPriceTemplate[];
  availableOptions?: ProductCustomizationOption[];
}

export interface ProductPriceTemplate {
  id: string;
  minQuantity: number;
  maxQuantity?: number;
  price: number;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  isActive: boolean;
  productId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCustomizationOption {
  option: {
    id: string;
    name: string;
    displayName: string;
    type: string;
    required: boolean;
  };
  values: Array<{
    id: string;
    value: string;
    displayName: string;
    priceAdjustment: number;
  }>;
}

export interface PriceCalculationRequest {
  quantity: number;
  customizations?: object;
  selectedDimensions?: object;
  selectedMaterials?: object;
  urgencyLevel?: "NORMAL" | "EXPEDITED" | "RUSH" | "EMERGENCY";
}

export interface PriceBreakdown {
  basePrice: number;
  customizationCost: number;
  urgencyMultiplier: number;
  subtotal: number;
  totalPrice: number;
  pricePerUnit: number;
  applicableTemplate?: ProductPriceTemplate;
  customizationBreakdown?: string[];
  dimensionPricing?: number;
  materialPricing?: number;
}

export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  templateId?: string;
  sortBy?: "price" | "name" | "createdAt" | "popularity";
  sortDirection?: "asc" | "desc";
}
