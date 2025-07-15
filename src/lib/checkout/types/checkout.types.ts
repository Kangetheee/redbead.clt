export interface CheckoutItem {
  productId: string;
  quantity: number;
  customizations: CustomizationChoice[];
  designId?: string;
}

export interface CustomizationChoice {
  optionId: string;
  valueId: string;
  customValue?: string;
}

export interface CheckoutItemResponse {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customizations: string[];
  thumbnail: string;
}

export interface CheckoutSession {
  sessionId: string;
  items: CheckoutItemResponse[];
  subtotal: number;
  estimatedTax: number;
  estimatedTotal: number;
  requiresShipping: boolean;
  requiresDesignApproval: boolean;
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
    id: string;
    name: string;
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
