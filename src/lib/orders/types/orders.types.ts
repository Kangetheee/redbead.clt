export interface OrderUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  type: string;
  verified: boolean;
}

export interface OrderAddress {
  id: string;
  recipientName: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface OrderProduct {
  id: string;
  name: string;
  slug: string;
  previewImage: string;
  basePrice: number;
}

export interface OrderVariant {
  id: string;
  name: string;
  displayName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dimensions: Record<string, any>;
  price: number;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customizations: any[];
  status: string;
  productId: string;
  variantId?: string;
  product?: OrderProduct;
  variant?: OrderVariant;
}

export interface OrderPayment {
  id: string;
  status: string;
  method: string;
  amount: number;
}

export interface DesignApproval {
  id: string;
  orderId: string;
  designId?: string;
  status: string;
  customerEmail: string;
  previewImages: string[];
  requestedAt: string;
  respondedAt?: string;
}

export interface OrderResponse {
  id: string;
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
  designApprovalRequired: boolean;
  designApprovalStatus?: string;
  designApprovalRequestedAt?: string;
  designApprovalCompletedAt?: string;
  designApproval?: DesignApproval;
  user: OrderUser;
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  orderItems: OrderItem[];
  payment?: OrderPayment;
  createdAt: string;
  updatedAt: string;
}

export interface ExtendedOrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customizations: Record<string, any>;
  included: boolean;
  originalIndex: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  originalItem?: any;
}

export interface TimelineItem {
  status: string;
  description: string;
  timestamp: string;
  updatedBy?: string;
  notes?: string;
}

export interface OrderItemTracking {
  id: string;
  productName: string;
  variantName?: string;
  quantity: number;
  status: string;
  statusDescription: string;
  estimatedCompletion?: string;
}

export interface OrderTrackingResponse {
  orderNumber: string;
  status: string;
  statusDescription: string;
  trackingNumber?: string;
  expectedDelivery?: string;
  lastUpdate: string;
  nextStep?: string;
  timeline: TimelineItem[];
  items: OrderItemTracking[];
  designApproval?: {
    id: string;
    status: string;
    statusDescription: string;
    expiresAt?: string;
    customerEmail: string;
    remindersSent: number;
  };
  shippingAddress: {
    recipientName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  totalAmount: number;
  canCancel: boolean;
  progressPercentage: number;
}

export interface PaginationMeta {
  pageCount: number;
  pageSize: number;
  currentPage: number;
  pageIndex: number;
  itemCount: number;
}

export interface PaginatedOrdersResponse {
  items: OrderResponse[];
  meta: PaginationMeta;
}

export interface CustomerNote {
  id: string;
  type: string;
  priority: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface ReorderResponse {
  newOrderId: string;
  newOrderNumber: string;
  originalOrderNumber: string;
  itemsCloned: number;
  totalAmount: number;
  success: boolean;
  message: string;
}

export interface DesignApprovalTokenResponse {
  id: string;
  token: string;
  expiresAt: string;
  emailLogId: string;
}

export interface DesignApprovalActionResponse {
  success: boolean;
  message: string;
  orderNumber: string;
  designApproval: {
    id: string;
    status: string;
    rejectionReason?: string;
  };
}

export interface DesignApprovalResendResponse {
  success: boolean;
  message: string;
  emailSentAt: string;
  remindersSent: number;
}
