/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  Package,
  User,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Truck,
  AlertTriangle,
  ExternalLink,
  Eye,
  Edit,
  MoreHorizontal,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

import { OrderResponse } from "@/lib/orders/types/orders.types";
import OrderStatusBadge from "./order-status-badge";
import { cn } from "@/lib/utils";

interface OrderSummaryCardProps {
  order: OrderResponse;
  variant?: "default" | "compact" | "detailed";
  showActions?: boolean;
  className?: string;
  onStatusUpdate?: (orderId: string) => void;
}

export default function OrderSummaryCard({
  order,
  variant = "default",
  showActions = true,
  className,
  onStatusUpdate,
}: OrderSummaryCardProps) {
  const getProgressPercentage = (status: string) => {
    const statusFlow = [
      "PENDING",
      "CONFIRMED",
      "DESIGN_PENDING",
      "DESIGN_APPROVED",
      "PAYMENT_CONFIRMED",
      "PROCESSING",
      "PRODUCTION",
      "SHIPPED",
      "DELIVERED",
    ];

    const currentIndex = statusFlow.indexOf(status);
    return currentIndex >= 0
      ? ((currentIndex + 1) / statusFlow.length) * 100
      : 0;
  };

  const getUrgencyColor = (urgencyLevel?: string) => {
    switch (urgencyLevel) {
      case "EMERGENCY":
        return "text-red-600 bg-red-50";
      case "RUSH":
        return "text-orange-600 bg-orange-50";
      case "EXPEDITED":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const isOverdue = () => {
    if (!order.expectedDelivery) return false;
    return (
      new Date(order.expectedDelivery) < new Date() &&
      !["DELIVERED", "CANCELLED", "REFUNDED"].includes(order.status)
    );
  };

  // Helper function to get customer display info
  const getCustomerInfo = () => {
    const customerId = order.customerId || "GUEST";
    const customerDisplayName = order.customerId
      ? `Customer ${customerId}`
      : "Guest Order";
    const avatarFallback = customerId.slice(0, 2).toUpperCase();

    return {
      customerId,
      customerDisplayName,
      avatarFallback,
    };
  };

  const customerInfo = getCustomerInfo();

  if (variant === "compact") {
    return (
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Link
                  href={`/orders/${order.id}`}
                  className="font-medium hover:underline"
                >
                  {order.orderNumber}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {customerInfo.customerId} • ${order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <OrderStatusBadge status={order.status} size="sm" />
              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/orders/${order.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/orders/${order.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{customerInfo.avatarFallback}</AvatarFallback>
            </Avatar>
            <div>
              <Link
                href={`/orders/${order.id}`}
                className="font-semibold hover:underline"
              >
                {order.orderNumber}
              </Link>
              <p className="text-sm text-muted-foreground">
                {customerInfo.customerDisplayName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {order.urgencyLevel && order.urgencyLevel !== "NORMAL" && (
              <Badge className={getUrgencyColor(order.urgencyLevel)}>
                {order.urgencyLevel}
              </Badge>
            )}
            <OrderStatusBadge status={order.status} />
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/orders/${order.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/orders/${order.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Order
                    </Link>
                  </DropdownMenuItem>
                  {order.trackingUrl && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Track Package
                        </a>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Progress Bar for Order Status */}
        {variant === "detailed" && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Order Progress</span>
              <span>{Math.round(getProgressPercentage(order.status))}%</span>
            </div>
            <Progress
              value={getProgressPercentage(order.status)}
              className="h-2"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {Array.isArray(order.orderItems) ? order.orderItems.length : 0}{" "}
                Items
              </p>
              <p className="text-xs text-muted-foreground">
                Total quantity:{" "}
                {Array.isArray(order.orderItems)
                  ? order.orderItems.reduce((sum, item) => {
                      if (typeof item === "object" && "quantity" in item) {
                        return sum + item.quantity;
                      }
                      return sum;
                    }, 0)
                  : 0}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                ${order.totalAmount.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {order.payment?.method || "Payment pending"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {format(new Date(order.createdAt), "MMM dd")}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(order.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {order.trackingNumber ? (
              <>
                <Truck className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{order.trackingNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    Tracking number
                  </p>
                </div>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {order.shippingAddress.id
                      ? `Address ID: ${order.shippingAddress.id}`
                      : "Address info"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Shipping address
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Expected Delivery */}
        {order.expectedDelivery && (
          <div
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg",
              isOverdue()
                ? "bg-red-50 text-red-700"
                : "bg-blue-50 text-blue-700"
            )}
          >
            {isOverdue() ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            <div>
              <p className="text-sm font-medium">
                {isOverdue() ? "Overdue" : "Expected"} delivery
              </p>
              <p className="text-xs">
                {format(new Date(order.expectedDelivery), "MMM dd, yyyy")}
                {isOverdue() && (
                  <span className="ml-1">
                    ({formatDistanceToNow(new Date(order.expectedDelivery))}{" "}
                    ago)
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Design Approval Status */}
        {order.designApprovalRequired && variant === "detailed" && (
          <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Design Approval</span>
            </div>
            <Badge variant="outline">
              {order.designApproval?.status || "Pending"}
            </Badge>
          </div>
        )}

        {/* Special Instructions */}
        {order.specialInstructions && variant === "detailed" && (
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              SPECIAL INSTRUCTIONS
            </p>
            <p className="text-sm">{order.specialInstructions}</p>
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="pt-0">
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" asChild>
              <Link href={`/orders/${order.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Link>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link href={`/orders/${order.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            {order.trackingUrl && (
              <Button variant="outline" asChild>
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
