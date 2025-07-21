/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShoppingCart } from "lucide-react";
import { useOrders } from "@/hooks/use-orders";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderResponse } from "@/lib/orders/types/orders.types";

// Status color mapping
const STATUS_COLORS = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
  design_pending:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
  design_approved:
    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  design_rejected:
    "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
  payment_pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
  payment_confirmed:
    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  processing:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
  production:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
  shipped:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
  delivered:
    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
  refunded: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
  default: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
} as const;

function getStatusColors(status: string): string {
  const normalizedStatus = status
    .toLowerCase()
    .replace(/[^a-z]/g, "_") as keyof typeof STATUS_COLORS;
  return STATUS_COLORS[normalizedStatus] || STATUS_COLORS.default;
}

function formatOrderStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

interface OrderItemProps {
  order: OrderResponse;
}

function OrderItem({ order }: OrderItemProps) {
  return (
    <Link
      href={`/dashboard/admin/orders/${order.id}`}
      className="block transition-colors hover:bg-muted/50 rounded-lg p-3 -mx-3"
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="text-sm">
            {order.customerId?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium leading-none truncate">
              {order.orderNumber || `Order #${order.id?.slice(-8)}`}
            </p>
            <Badge className={getStatusColors(order.status)} variant="outline">
              {formatOrderStatus(order.status)}
            </Badge>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="truncate">
              Customer: {order.customerId?.slice(-8) || "Unknown"}
            </span>
            <span>•</span>
            <span>
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShoppingCart className="h-3 w-3" />
              {order.orderItems?.length || 0} items
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-medium">
            ${(order.totalAmount || 0).toFixed(2)}
          </div>
          {order.urgencyLevel && order.urgencyLevel !== "NORMAL" && (
            <div className="text-xs text-orange-600 font-medium">
              {order.urgencyLevel}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function RecentOrders() {
  const {
    data: ordersData,
    isLoading,
    error,
    isError,
  } = useOrders({
    limit: 5,
  });

  if (isLoading) {
    return <OrdersSkeleton />;
  }

  if (isError || error) {
    console.error("Orders fetch error:", error);
    return (
      <div className="text-center py-8 text-red-500">
        <div className="text-sm font-medium">Failed to load recent orders</div>
        <div className="text-xs text-muted-foreground mt-1">
          Please try refreshing the page
        </div>
      </div>
    );
  }

  // Handle orders data structure safely
  let orders: OrderResponse[] = [];
  if (ordersData && "success" in ordersData && ordersData.success) {
    orders = ordersData.data?.items || [];
  } else if (ordersData && "items" in ordersData) {
    // Fallback for direct items access
    orders = (ordersData as any).items || [];
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="text-sm">No recent orders found</div>
        <div className="text-xs mt-1">Orders will appear here once created</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {orders.map((order) => (
        <OrderItem key={order.id} order={order} />
      ))}
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-56" />
          </div>
          <div className="text-right space-y-1">
            <Skeleton className="h-4 w-16 ml-auto" />
            <Skeleton className="h-3 w-12 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}
