/* eslint-disable @typescript-eslint/no-explicit-any */
import { AddressResponse } from "@/lib/address/types/address.types";

export interface OrderAddress {
  id?: string;
  recipientName?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface OrderItemCustomization {
  optionId: string;
  valueId: string;
  customValue?: string;
}

export interface TemplateDetails {
  name: string;
  slug: string;
  previewImage: string;
  basePrice: number;
}

export interface SizeVariantDetails {
  name: string;
  displayName: string;
  dimensions: {
    width: number;
    height: number;
    unit: string;
  };
  price: number;
}

export interface ProductDetails {
  id: string;
  name: string;
  slug: string;
  previewImage: string;
  basePrice: number;
}

export interface VariantDetails {
  id: string;
  name: string;
  displayName: string;
  dimensions: Record<string, any>;
  price: number;
}

export interface OrderUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string | null;
  type: string;
  verified: boolean;
}

// Updated to match API expectations
export interface OrderItem {
  id?: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  customizations?: Record<string, string>;
  designId?: string;
  status?:
    | "PROCESSING"
    | "DESIGNING"
    | "PRODUCTION"
    | "QUALITY_CHECK"
    | "READY_FOR_SHIPPING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  notes?: string;
  template?: TemplateDetails;
  sizeVariant?: SizeVariantDetails;
  product?: ProductDetails;
  variant?: VariantDetails;
}

export interface DesignSummaryCustomization {
  option: string;
  value: string;
}

export interface DesignSummary {
  templateName: string;
  sizeVariant: string;
  quantity: number;
  material: string;
  closure?: string;
  text: string;
  colors: string[];
  customizations?: DesignSummaryCustomization[];
}

export interface DesignApproval {
  id: string;
  orderId: string;
  designId?: string;
  approvalToken?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "CANCELLED";
  customerEmail: string;
  previewImages: string[];
  designSummary?: DesignSummary;
  requestedAt: string;
  respondedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  expiresAt?: string;
  emailSent?: boolean;
  remindersSent?: number;
}

export interface OrderNoteUser {
  id?: string;
  name?: string;
  avatar?: string;
}

export interface OrderNote {
  id: string;
  type:
    | "GENERAL"
    | "URGENCY"
    | "TIMELINE"
    | "SHIPPING"
    | "CUSTOMIZATION"
    | "PRODUCTION"
    | "QUALITY"
    | "DESIGN_APPROVAL";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  title?: string;
  content: string;
  isInternal?: boolean;
  createdBy?: string;
  createdAt: string;
  user?: OrderNoteUser;
}

export interface PaymentStatus {
  status: "SUCCESS" | "PENDING" | "FAILED" | "CANCELLED";
  transactionId: string;
  message: string;
  provider: string;
}

export interface OrderPayment {
  id?: string;
  method?: string;
  status?: string;
  transactionId?: string;
  amount?: number;
}

// Updated to match API response structure
export interface OrderResponse {
  id: string;
  customerId?: string;
  orderNumber: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "DESIGN_PENDING"
    | "DESIGN_APPROVED"
    | "DESIGN_REJECTED"
    | "PAYMENT_PENDING"
    | "PAYMENT_CONFIRMED"
    | "PROCESSING"
    | "PRODUCTION"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED";
  totalAmount: number;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  trackingNumber?: string;
  trackingUrl?: string;
  expectedDelivery?: string;
  notes?: string;
  urgencyLevel?: "NORMAL" | "EXPEDITED" | "RUSH" | "EMERGENCY";
  expectedProductionDays?: number;
  specialInstructions?: string;
  designApprovalRequired: boolean;
  designApprovalStatus?:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "EXPIRED"
    | "CANCELLED";
  designApprovalRequestedAt?: string;
  designApprovalCompletedAt?: string;
  designApproval?: DesignApproval;
  designStartDate?: string;
  designCompletionDate?: string;
  productionStartDate?: string;
  productionEndDate?: string;
  shippingDate?: string;
  actualDeliveryDate?: string;
  user?: OrderUser;
  shippingAddress: AddressResponse;
  billingAddress?: AddressResponse;
  orderItems: OrderItem[];
  payment?: OrderPayment;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
}

// Simplified OrderResponse for list view
export interface OrderListItem {
  id: string;
  orderNumber: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "DESIGN_PENDING"
    | "DESIGN_APPROVED"
    | "DESIGN_REJECTED"
    | "PAYMENT_PENDING"
    | "PAYMENT_CONFIRMED"
    | "PROCESSING"
    | "PRODUCTION"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED";
  totalAmount: number;
  designApprovalRequired: boolean;
  designApprovalStatus?:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "EXPIRED"
    | "CANCELLED";
  templateId?: string;
  orderItems: OrderItem[];
  createdAt: string;
}

export interface ProductionRequirements {
  estimatedDays: number;
  materials: string[];
  processes: string[];
  specialRequirements?: string[];
  equipmentNeeded?: string[];
  skillsRequired?: string[];
}

export interface TimelinePhase {
  startDate: string;
  endDate: string;
  duration: number;
}

export interface TimelineCalculation {
  designPhase: TimelinePhase;
  productionPhase: TimelinePhase;
  shippingPhase: TimelinePhase;
  totalDuration: number;
  expectedDelivery: string;
}

export interface OrderFilters {
  status?: string;
  designApprovalStatus?: string;
  minTotal?: number;
  maxTotal?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  urgencyLevel?: string;
  templateId?: string;
}

// Design approval token responses
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

// Type guards and utilities
export const isOrderItem = (item: any): item is OrderItem => {
  return (
    item &&
    typeof item.productId === "string" &&
    typeof item.quantity === "number"
  );
};

export const isDesignApproval = (approval: any): approval is DesignApproval => {
  return (
    approval &&
    typeof approval.id === "string" &&
    typeof approval.status === "string"
  );
};

export const isOrderNote = (note: any): note is OrderNote => {
  return (
    note && typeof note.id === "string" && typeof note.content === "string"
  );
};

// Helper interface for cart items that need to be transformed
export interface CartItem {
  id?: string;
  productId?: string;
  templateId?: string;
  variantId?: string;
  sizeVariantId?: string;
  quantity: number;
  customizations?: OrderItemCustomization[] | Record<string, string>;
  designId?: string;
  productName?: string;
  name?: string;
  totalPrice?: number;
  total?: number;
}
