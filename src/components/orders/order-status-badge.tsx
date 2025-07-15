import React from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  Truck,
  CreditCard,
  FileText,
  RefreshCw,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OrderStatusBadgeProps {
  status: string;
  variant?: "default" | "outline" | "secondary" | "destructive";
  size?: "sm" | "default" | "lg";
  showIcon?: boolean;
  className?: string;
}

// Define status configurations with colors, labels, and icons
const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dotColor: "bg-yellow-500",
  },
  DESIGN_PENDING: {
    label: "Design Pending",
    icon: FileText,
    className: "bg-blue-100 text-blue-800 border-blue-200",
    dotColor: "bg-blue-500",
  },
  DESIGN_APPROVED: {
    label: "Design Approved",
    icon: CheckCircle,
    className: "bg-green-100 text-green-800 border-green-200",
    dotColor: "bg-green-500",
  },
  DESIGN_REJECTED: {
    label: "Design Rejected",
    icon: XCircle,
    className: "bg-red-100 text-red-800 border-red-200",
    dotColor: "bg-red-500",
  },
  PAYMENT_PENDING: {
    label: "Payment Pending",
    icon: CreditCard,
    className: "bg-orange-100 text-orange-800 border-orange-200",
    dotColor: "bg-orange-500",
  },
  PAYMENT_CONFIRMED: {
    label: "Payment Confirmed",
    icon: CheckCircle,
    className: "bg-green-100 text-green-800 border-green-200",
    dotColor: "bg-green-500",
  },
  PROCESSING: {
    label: "Processing",
    icon: RefreshCw,
    className: "bg-purple-100 text-purple-800 border-purple-200",
    dotColor: "bg-purple-500",
  },
  PRODUCTION: {
    label: "In Production",
    icon: Package,
    className: "bg-purple-100 text-purple-800 border-purple-200",
    dotColor: "bg-purple-500",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    className: "bg-blue-100 text-blue-800 border-blue-200",
    dotColor: "bg-blue-500",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle,
    className: "bg-green-100 text-green-800 border-green-200",
    dotColor: "bg-green-500",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-100 text-red-800 border-red-200",
    dotColor: "bg-red-500",
  },
  REFUNDED: {
    label: "Refunded",
    icon: AlertTriangle,
    className: "bg-gray-100 text-gray-800 border-gray-200",
    dotColor: "bg-gray-500",
  },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

export default function OrderStatusBadge({
  status,
  variant = "default",
  size = "default",
  showIcon = true,
  className,
}: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status as StatusKey] || {
    label: status,
    icon: Clock,
    className: "bg-gray-100 text-gray-800 border-gray-200",
    dotColor: "bg-gray-500",
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    default: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    default: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  // For outline variant, we'll use different styling
  const variantClasses = {
    default: config.className,
    outline: `border-2 ${config.className.replace(/bg-\w+-100/, "bg-transparent")}`,
    secondary: "bg-secondary text-secondary-foreground border-secondary",
    destructive:
      "bg-destructive text-destructive-foreground border-destructive",
  };

  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border",
        sizeClasses[size],
        variant === "default" ? config.className : variantClasses[variant],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{config.label}</span>
    </Badge>
  );
}

// Export individual status badge components for convenience
export const PendingBadge = (props: Omit<OrderStatusBadgeProps, "status">) => (
  <OrderStatusBadge {...props} status="PENDING" />
);

export const ProcessingBadge = (
  props: Omit<OrderStatusBadgeProps, "status">
) => <OrderStatusBadge {...props} status="PROCESSING" />;

export const ShippedBadge = (props: Omit<OrderStatusBadgeProps, "status">) => (
  <OrderStatusBadge {...props} status="SHIPPED" />
);

export const DeliveredBadge = (
  props: Omit<OrderStatusBadgeProps, "status">
) => <OrderStatusBadge {...props} status="DELIVERED" />;

export const CancelledBadge = (
  props: Omit<OrderStatusBadgeProps, "status">
) => <OrderStatusBadge {...props} status="CANCELLED" />;

// Utility function to get status config (useful for other components)
export const getStatusConfig = (status: string) => {
  return STATUS_CONFIG[status as StatusKey] || STATUS_CONFIG.PENDING;
};

// Component for status with dot indicator (useful in lists)
export function OrderStatusDot({
  status,
  size = "default",
  className,
}: {
  status: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const config = getStatusConfig(status);

  const dotSizes = {
    sm: "h-2 w-2",
    default: "h-2.5 w-2.5",
    lg: "h-3 w-3",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("rounded-full", config.dotColor, dotSizes[size])} />
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
}

// Component for status progress indicator
export function OrderStatusProgress({
  currentStatus,
  className,
}: {
  currentStatus: string;
  className?: string;
}) {
  const statusFlow = [
    "PENDING",
    "DESIGN_PENDING",
    "DESIGN_APPROVED",
    "PAYMENT_CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
  ];

  const currentIndex = statusFlow.indexOf(currentStatus);
  const progressPercentage =
    currentIndex >= 0 ? ((currentIndex + 1) / statusFlow.length) * 100 : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Order Progress</span>
        <span>{Math.round(progressPercentage)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Pending</span>
        <span>Delivered</span>
      </div>
    </div>
  );
}
