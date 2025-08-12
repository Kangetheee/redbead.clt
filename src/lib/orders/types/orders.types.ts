/* eslint-disable @typescript-eslint/no-explicit-any */
import { AddressResponse } from "@/lib/address/types/address.types";

export interface OrderAddress {
  id?: string;
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

// Updated to match API expectations
export interface OrderItem {
  id?: string;
  // Use productId instead of templateId based on API requirements
  productId: string;
  // Use variantId instead of sizeVariantId
  variantId: string;
  quantity: number;
  // Customizations should be an object, not an array
  customizations?: Array<{ name: string; value: string }>;

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
  designId: string;
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
  // Changed from noteType to type based on API docs
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
    | "CONFIRMED" // Added from API docs
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

  shippingAddress: AddressResponse;
  billingAddress?: AddressResponse;
  orderItems: OrderItem[] | string[];
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
    | "CONFIRMED" // Added from API docs
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
