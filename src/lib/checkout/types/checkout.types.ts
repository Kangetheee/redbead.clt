export interface CheckoutItem {
  productId: string;
  variantId?: string;
  quantity: number;
  customizations?: CustomizationChoice[];
  designId?: string;
}

export interface CustomizationChoice {
  optionId: string;
  value?: string; // e.g. "Red"
  valueId?: string; // optional ID reference
  customValue?: string;
}

export interface CheckoutItemResponse {
  itemType: "PRODUCT" | "TEMPLATE";
  productId?: string;
  templateId?: string;
  designId?: string;
  variantId?: string;
  productName?: string;
  templateName?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customizations: string[];
  thumbnail: string;
  requiresProduction: boolean;
}

export interface CheckoutSession {
  sessionId: string;
  items: CheckoutItemResponse[];
  subtotal: number;
  estimatedTax: number;
  estimatedTotal: number;
  requiresShipping: boolean;
  requiresDesignApproval: boolean;
  fulfillmentType: "INVENTORY" | "PRODUCTION" | "HYBRID";
  customerInfo: {
    email?: string;
    isGuest: boolean;
  };
  availablePaymentMethods: string[];
  expiresAt: string;
}

export interface AddressInput {
  recipientName: string;
  companyName?: string;
  street: string;
  street2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
  type?: string; // shipping/billing, optional
}

export interface ShippingOption {
  id: string;
  name: string;
  description?: string;
  cost: number;
  originalCost: number;
  isFree: boolean;
  estimatedDays?: string;
  urgencyMultiplier: number;
  zone?: {
    id?: string;
    name?: string;
  };
}

export interface ShippingOptionsResponse {
  sessionId: string;
  shippingOptions: ShippingOption[];
  updatedTotals: {
    subtotal: number;
    estimatedTax: number;
    shippingCost: number;
    discount: number;
    estimatedTotal: number;
  };
}

export interface CheckoutValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  finalTotals?: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  };
  estimatedProductionDays?: number;
  estimatedDelivery?: string;
}

export interface GuestInfo {
  name: string;
  email: string;
  company?: string;
}

export interface PaymentDetails {
  method: string;
  amount: number;
  currency: string;
  instructions: string;
  transactionId: string;
  phone?: string;
}

export interface CheckoutResponse {
  success: boolean;
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  paymentRequired: boolean;
  paymentDetails: PaymentDetails;
  designApprovalRequired: boolean;
  fulfillmentType: "INVENTORY" | "PRODUCTION" | "HYBRID";
  estimatedProductionDays: number;
  estimatedDelivery: string;
  nextSteps: string[];
  trackingUrl: string;
}

export interface OrderConfirmation {
  orderId: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  items: Array<{
    productName: string;
    quantity: number;
    customizations: string[];
  }>;
  shippingAddress: {
    recipientName: string;
    formattedAddress: string;
  };
  nextSteps: string[];
  estimatedDelivery: string;
  createdAt: string;
}

export interface PaginationMeta {
  pageCount: number;
  pageSize: number;
  currentPage: number;
  pageIndex: number;
  itemCount: number;
}

export interface CheckoutSessionsListResponse {
  data: CheckoutSession[];
  meta: PaginationMeta;
}
