/* eslint-disable @typescript-eslint/no-explicit-any */

export interface BulkOrderItem {
  id: string;
  productId: string;
  bulkOrderId: string;
  quantity: number;
  customizations: Record<string, any>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  products: {
    id: string;
    name: string;
    basePrice: number;
    thumbnailImage?: string;
  };
}

export type BulkOrderStatus =
  | "QUOTE_REQUESTED"
  | "QUOTE_PREPARING"
  | "QUOTE_READY"
  | "QUOTE_ACCEPTED"
  | "QUOTE_REJECTED"
  | "PAYMENT_PENDING"
  | "IN_PRODUCTION"
  | "COMPLETED"
  | "CANCELLED";

export interface BulkOrderResponse {
  id: string;
  name: string;
  description?: string;
  status: BulkOrderStatus;
  userId: string;
  items: BulkOrderItem[];
  attachments?: string[];
  notes?: string;
  quoteAmount?: number;
  quoteExpiry?: string;
  convertedToOrder: boolean;
  orderId?: string;
  createdAt: string;
  updatedAt: string;
  estimatedTotal?: number;
  itemCount: number;
  totalQuantity: number;
  totalWeight?: number;
  hasOutOfStockItems: boolean;
  isQuoteExpired: boolean;
}

export interface BulkOrderDetail extends BulkOrderResponse {
  outOfStockItems?: Array<{
    productId: string;
    productName: string;
    requestedQuantity: number;
    availableStock: number;
  }>;
}

export interface BulkOrderFilters {
  status?: BulkOrderStatus;
  search?: string;
}
