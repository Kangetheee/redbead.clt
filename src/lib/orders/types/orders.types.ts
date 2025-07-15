/* eslint-disable @typescript-eslint/no-explicit-any */
export interface OrderAddress {
  id: string;
  // Add other address fields based on your requirements
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  customizations: Record<string, any>;
}

export interface DesignApproval {
  id: string;
  orderId: string;
  orderNumber: string;
  designId: string;
  status: string;
  customerEmail: string;
  previewImages: string[];
  designSummary: {
    productName: string;
    quantity: number;
    material: string;
    text: string;
    colors: string[];
    dimensions: string;
    printType: string;
    attachment: string;
  };
  requestedAt: string;
  respondedAt: string;
  approvedBy: string;
  rejectionReason: string;
  expiresAt: string;
  isExpired: boolean;
  canApprove: boolean;
  canReject: boolean;
  timeRemaining: string;
  comments: string;
  requestRevision: boolean;
  message: string;
  orderDetails: {
    orderNumber: string;
    totalAmount: number;
    itemCount: number;
    customer: {
      name: string;
      company: string;
    };
  };
}

export interface OrderNote {
  id: string;
  noteType: string;
  priority: string;
  title?: string;
  content: string;
  isInternal: boolean;
  createdBy?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface OrderResponse {
  id: string;
  customerId: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  trackingNumber?: string;
  trackingUrl?: string;
  expectedDelivery?: string;
  notes?: string;
  urgencyLevel?: string;
  expectedProductionDays?: number;
  specialInstructions?: string;
  designApprovalRequired: boolean;
  designApprovalStatus?: string;
  designApprovalRequestedAt?: string;
  designApprovalCompletedAt?: string;
  designApproval?: DesignApproval;
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  orderItems: OrderItem[];
  payment?: any;
  createdAt: string;
  updatedAt: string;
}

// For filtering orders
export interface OrderFilters {
  status?: string;
  designApprovalStatus?: string;
  minTotal?: number;
  maxTotal?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  urgencyLevel?: string;
}
