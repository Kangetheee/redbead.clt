/* eslint-disable @typescript-eslint/no-explicit-any */

export interface OrderTableFilters {
  page?: number;
  limit?: number;
  status?: string;
  designApprovalStatus?: string;
  urgencyLevel?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  minTotal?: number;
  maxTotal?: number;
}

export interface OrderTableProps {
  filters?: OrderTableFilters;
  onFiltersChange?: (filters: OrderTableFilters) => void;
  showFilters?: boolean;
  compact?: boolean;
  pageSize?: number;
  variant?: "admin" | "customer";
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
}

// lib/orders/constants/status.ts
export const ORDER_STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: "Clock",
    description: "Order received and under review",
    nextStates: [
      "DESIGN_PENDING",
      "PAYMENT_PENDING",
      "PROCESSING",
      "CANCELLED",
    ],
  },
  DESIGN_PENDING: {
    label: "Design Review",
    color: "bg-blue-100 text-blue-800",
    icon: "FileText",
    description: "Waiting for customer design approval",
    nextStates: ["DESIGN_APPROVED", "DESIGN_REJECTED", "CANCELLED"],
  },
  DESIGN_APPROVED: {
    label: "Design Approved",
    color: "bg-green-100 text-green-800",
    icon: "CheckCircle",
    description: "Design approved by customer",
    nextStates: ["PAYMENT_PENDING", "PROCESSING"],
  },
  DESIGN_REJECTED: {
    label: "Design Rejected",
    color: "bg-red-100 text-red-800",
    icon: "XCircle",
    description: "Design rejected, requires revision",
    nextStates: ["DESIGN_PENDING", "CANCELLED"],
  },
  PAYMENT_PENDING: {
    label: "Payment Due",
    color: "bg-orange-100 text-orange-800",
    icon: "CreditCard",
    description: "Waiting for payment confirmation",
    nextStates: ["PAYMENT_CONFIRMED", "CANCELLED"],
  },
  PAYMENT_CONFIRMED: {
    label: "Payment Confirmed",
    color: "bg-green-100 text-green-800",
    icon: "CheckCircle",
    description: "Payment received and confirmed",
    nextStates: ["PROCESSING"],
  },
  PROCESSING: {
    label: "Processing",
    color: "bg-purple-100 text-purple-800",
    icon: "Package",
    description: "Order is being prepared for production",
    nextStates: ["PRODUCTION", "SHIPPED", "CANCELLED"],
  },
  PRODUCTION: {
    label: "In Production",
    color: "bg-purple-100 text-purple-800",
    icon: "Package",
    description: "Order is in production",
    nextStates: ["SHIPPED", "CANCELLED"],
  },
  SHIPPED: {
    label: "Shipped",
    color: "bg-blue-100 text-blue-800",
    icon: "Truck",
    description: "Order has been shipped",
    nextStates: ["DELIVERED"],
  },
  DELIVERED: {
    label: "Delivered",
    color: "bg-green-100 text-green-800",
    icon: "CheckCircle",
    description: "Order delivered successfully",
    nextStates: ["REFUNDED"],
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: "XCircle",
    description: "Order has been cancelled",
    nextStates: ["REFUNDED"],
  },
  REFUNDED: {
    label: "Refunded",
    color: "bg-gray-100 text-gray-800",
    icon: "RotateCcw",
    description: "Order has been refunded",
    nextStates: [],
  },
} as const;

export const URGENCY_LEVELS = {
  NORMAL: {
    label: "Standard",
    description: "5-7 business days",
    color: "text-green-600 bg-green-50 border-green-200",
    priceMultiplier: 1.0,
    badge: "Standard",
  },
  EXPEDITED: {
    label: "Expedited",
    description: "3-4 business days",
    color: "text-orange-600 bg-orange-50 border-orange-200",
    priceMultiplier: 1.15,
    badge: "+15%",
  },
  RUSH: {
    label: "Rush",
    description: "1-2 business days",
    color: "text-red-600 bg-red-50 border-red-200",
    priceMultiplier: 1.35,
    badge: "+35%",
  },
  EMERGENCY: {
    label: "Emergency",
    description: "Same day/next day",
    color: "text-red-600 bg-red-50 border-red-200",
    priceMultiplier: 1.75,
    badge: "+75%",
  },
} as const;

export const NOTE_TYPES = {
  GENERAL: { icon: "MessageSquare", color: "bg-blue-100 text-blue-800" },
  URGENCY: { icon: "AlertTriangle", color: "bg-red-100 text-red-800" },
  TIMELINE: { icon: "Clock", color: "bg-yellow-100 text-yellow-800" },
  SHIPPING: { icon: "Package", color: "bg-green-100 text-green-800" },
  CUSTOMIZATION: { icon: "Star", color: "bg-purple-100 text-purple-800" },
  PRODUCTION: { icon: "Package", color: "bg-orange-100 text-orange-800" },
  QUALITY: { icon: "AlertTriangle", color: "bg-red-100 text-red-800" },
  DESIGN_APPROVAL: { icon: "FileText", color: "bg-indigo-100 text-indigo-800" },
} as const;

// lib/orders/utils/helpers.ts
export const getOrderStatusConfig = (status: string) => {
  return (
    ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG] || {
      label: status,
      color: "bg-gray-100 text-gray-800",
      icon: "Clock",
      description: "",
      nextStates: [],
    }
  );
};

export const getUrgencyConfig = (urgency: string) => {
  return (
    URGENCY_LEVELS[urgency as keyof typeof URGENCY_LEVELS] ||
    URGENCY_LEVELS.NORMAL
  );
};

export const getNoteTypeConfig = (type: string) => {
  return NOTE_TYPES[type as keyof typeof NOTE_TYPES] || NOTE_TYPES.GENERAL;
};

export const calculateOrderProgress = (status: string): number => {
  const statusFlow = [
    "PENDING",
    "DESIGN_APPROVED",
    "PAYMENT_CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
  ];
  const currentIndex = statusFlow.indexOf(status);
  return currentIndex >= 0 ? ((currentIndex + 1) / statusFlow.length) * 100 : 0;
};

export const getOrderRiskLevel = (order: any) => {
  const isOverdue =
    order.expectedDelivery && new Date(order.expectedDelivery) < new Date();
  const isHighValue = order.totalAmount > 1000;
  const isUrgent = ["RUSH", "EMERGENCY"].includes(order.urgencyLevel || "");
  const needsApproval = order.status === "DESIGN_PENDING";

  if (isOverdue || (isUrgent && needsApproval)) return "HIGH";
  if (isHighValue || isUrgent) return "MEDIUM";
  return "LOW";
};
