/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CustomizationOption {
  id: string;
  name: string;
  type: "DROPDOWN" | "TEXT" | "COLOR" | "IMAGE";
  required: boolean;
  metadata?: {
    options?: Array<{
      value: string;
      label: string;
      hexCode?: string;
      priceAdjustment: number;
    }>;
    colors?: string[];
    defaultColor?: string;
    maxLength?: number;
    allowedFormats?: string[];
  };
  isActive: boolean;
  productAssignments?: Array<{
    id: string;
    productId: string;
    optionId: string;
    required: boolean;
    sortOrder: number;
    product: CartProduct;
    option: Record<string, any>;
  }>;
}

export interface CartItemCustomization {
  optionId: string;
  valueId?: string;
  customValue?: string;
  option: CustomizationOption;
}

// Product & Variant Types
export interface CartCategory {
  id: string;
  name: string;
  slug: string;
}

export interface CartVariant {
  id: string;
  name: string;
  type: string;
  price: number;
  sku?: string;
  stock: number;
  isDefault: boolean;
  metadata?: Record<string, any>;
}

export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  thumbnailImage?: string;
  basePrice: number;
  categoryId?: string;
  isActive: boolean;
  isFeatured?: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  category?: CartCategory;
  variants?: CartVariant[];
  customizations?: Array<{
    id: string;
    productId: string;
    optionId: string;
    required: boolean;
    sortOrder: number;
    option: CustomizationOption;
  }>;
  designTemplates?: Array<{
    id: string;
    name: string;
    thumbnail: string;
    basePrice: number;
  }>;
}

// Cart Item Response
export interface CartItemResponse {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  customizations: CartItemCustomization[];
  product: CartProduct;
  variant: CartVariant;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  sessionId?: string;
}

// Cart Response Structure
export interface CartResponse {
  items: CartItemResponse[];
  meta: {
    pageCount: number;
    pageSize: number;
    currentPage: number;
    pageIndex: number;
    itemCount: number;
  };
  summary: {
    itemCount: number;
    totalQuantity: number;
    subtotal: number;
    total: number;
  };
}

// Bulk Operations
export interface BulkRemoveRequest {
  cartItemIds: string[];
}

export interface SaveForLaterRequest {
  cartItemIds: string[];
  saveForLater: boolean;
}

export interface MergeSessionCartResponse {
  success: boolean;
  mergedItemsCount: number;
}

export interface CleanupExpiredSessionsResponse {
  deletedCount: number;
}
