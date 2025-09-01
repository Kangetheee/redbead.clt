import { Media } from "@/lib/products/types/products.types";

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
  productId: string;
  name: string;
  type: string;
  price: number;
  sku?: string | null;
  stock: number;
  isDefault: boolean;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images: Media[];
  thumbnailImage?: Media | null;
  basePrice: number;
  categoryId: string;
  isActive: boolean;
  isFeatured?: boolean;
  metadata?: {
    tags?: string[];
    type?: string;
    leadTime?: string;
    material?: string;
    dimensions?: {
      width: number;
      height: number;
    };
    waterproof?: boolean;
    productionDays?: number;
    [key: string]: any;
  };
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
  // Fulfillment properties
  fulfillmentType?: "INVENTORY" | "PRODUCTION";
  estimatedDelivery?: string;
}

// Cart Item Response - Updated to match actual API structure
export interface CartItemResponse {
  id: string;
  productId: string;
  variantId?: string;
  designId?: string;
  quantity: number;
  unitPrice: number;
  customizations: CartItemCustomization[];
  product: CartProduct;
  variant?: CartVariant; // Made optional since API might not always include it
  totalPrice: number;
  fulfillmentType?: "INVENTORY" | "PRODUCTION";
  isCustomDesign?: boolean;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
  sessionId?: string;
}

// Cart Response Structure - Updated to match backend
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
  fulfillment?: {
    standardProducts: number;
    customDesigns: number;
    estimatedStandardDelivery: string;
    estimatedCustomDelivery: string;
    hasMixedFulfillment: boolean;
    pendingApprovals: number;
  };
}

// Design Response Interface
export interface CartDesign {
  id: string;
  name: string;
  description?: string;
  status: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  preview?: string;
  estimatedCost?: number;
  estimatedProductionDays: number;
  requiresApproval: boolean;
}

// Request DTOs
export interface CreateCartItemDto {
  productId: string;
  variantId?: string;
  designId?: string;
  quantity: number;
  customizations: {
    optionId: string;
    valueId: string;
    customValue?: string;
  }[];
}

export interface UpdateCartItemDto {
  variantId?: string;
  quantity?: number;
  customizations?: {
    optionId: string;
    valueId: string;
    customValue?: string;
  }[];
}

export interface GetCartDto {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  categorySlug?: string;
  fulfillmentType?: "INVENTORY" | "PRODUCTION";
  designStatus?: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetSavedItemsDto extends GetCartDto {}

// Bulk Operations
export interface BulkRemoveRequest {
  cartItemIds: string[];
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BulkRemoveDto extends BulkRemoveRequest {}

export interface SaveForLaterRequest {
  cartItemIds: string[];
  saveForLater: boolean;
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SaveForLaterDto extends SaveForLaterRequest {}

export interface MergeSessionCartDto {
  sessionId: string;
  coordinateDelivery?: boolean;
}

export interface MergeSessionCartResponse {
  success: boolean;
  mergedItemsCount: number;
}

export interface CleanupExpiredSessionsDto {
  daysOld?: number;
}

export interface CleanupExpiredSessionsResponse {
  deletedCount: number;
}

// Cart Analytics and Recommendations
export interface CartAnalytics {
  composition: {
    totalValue: number;
    averageItemValue: number;
    fulfillmentBreakdown: {
      inventory: { items: number; value: number };
      production: { items: number; value: number };
    };
  };
  designStatus: {
    drafts: number;
    pendingReview: number;
    approved: number;
    rejected: number;
  };
  timeline: {
    fastest: string;
    longest: string;
    coordinated: string;
  };
}

export interface CartRecommendation {
  id: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  thumbnail: string;
  recommendationReason: string;
  fulfillmentType: "INVENTORY" | "PRODUCTION";
}

export interface CartRecommendations {
  frequentlyBoughtTogether: CartRecommendation[];
  complementaryProducts: CartRecommendation[];
  similarProducts: CartRecommendation[];
  quickAddProducts: CartRecommendation[];
}

// Checkout Readiness
export interface CartCheckoutReadiness {
  canCheckout: boolean;
  standardItemsReady: boolean;
  customItemsReady: boolean;
  pendingApprovals: number;
  blockers: string[];
  warnings: string[];
}
