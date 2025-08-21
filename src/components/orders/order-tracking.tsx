"use client";

import React from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Truck,
  Package,
  Clock,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Eye,
  Palette,
  ArrowRight,
  Calendar,
  Info,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

import { useOrder, useTrackOrder } from "@/hooks/use-orders";
import { formatCurrency } from "@/lib/utils";

interface OrderTrackingProps {
  orderId: string;
  userId: string;
}

const STATUS_CONFIG = {
  PENDING: {
    label: "Order Received",
    description: "Your order has been received and is being processed",
    icon: Package,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
  },
  DESIGN_PENDING: {
    label: "Design Review",
    description: "Waiting for design approval",
    icon: Palette,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
  },
  DESIGN_APPROVED: {
    label: "Design Approved",
    description: "Design approved, moving to production",
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-100",
  },
  PROCESSING: {
    label: "In Production",
    description: "Your order is being prepared",
    icon: Package,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
  },
  SHIPPED: {
    label: "Shipped",
    description: "Your package is on its way",
    icon: Truck,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
  },
  DELIVERED: {
    label: "Delivered",
    description: "Package delivered successfully",
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-100",
  },
  CANCELLED: {
    label: "Cancelled",
    description: "Order has been cancelled",
    icon: AlertTriangle,
    color: "text-red-500",
    bgColor: "bg-red-100",
  },
} as const;

export default function OrderTracking({ orderId, userId }: OrderTrackingProps) {
  const router = useRouter();
  const {
    data: order,
    isLoading: orderLoading,
    refetch: refetchOrder,
    error: orderError,
  } = useOrder(orderId);

  const {
    data: tracking,
    isLoading: trackingLoading,
    refetch: refetchTracking,
    error: trackingError,
  } = useTrackOrder(orderId, !!order);

  const isLoading = orderLoading || trackingLoading;

  const handleDesignApprovalClick = () => {
    router.push(`/orders/${orderId}/design-approval`);
  };

  // Check if the order belongs to the current user
  const isAuthorized = order && order.user.id === userId;

  const handleRefresh = async () => {
    await Promise.all([refetchOrder(), refetchTracking()]);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orderError || trackingError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Error Loading Order</h3>
            <p className="text-muted-foreground mb-4">
              {orderError?.message ||
                trackingError?.message ||
                "Unable to load order details."}
            </p>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!order || !tracking) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Order Not Found</h3>
            <p className="text-muted-foreground">
              Unable to load order details.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show unauthorized access message if user doesn't own this order
  if (!isAuthorized) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You don&apos;t have permission to view this order.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/orders")}
            >
              View Your Orders
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusConfig =
    STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ||
    STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <StatusIcon className="h-5 w-5" />
                Order #{tracking.orderNumber}
              </CardTitle>
              <CardDescription>
                Placed {format(new Date(order.createdAt), "MMM dd, yyyy")}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Display */}
          <div className="text-center space-y-4">
            <div
              className={`p-4 ${statusConfig.bgColor} rounded-full inline-block`}
            >
              <StatusIcon className={`h-8 w-8 ${statusConfig.color}`} />
            </div>

            <div>
              <Badge variant="outline" className="mb-2">
                {tracking.status}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {tracking.statusDescription}
              </p>
            </div>

            {tracking.nextStep && (
              <Alert>
                <ArrowRight className="h-4 w-4" />
                <AlertDescription>
                  <strong>Next Step:</strong> {tracking.nextStep}
                </AlertDescription>
              </Alert>
            )}

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{tracking.progressPercentage}%</span>
              </div>
              <Progress value={tracking.progressPercentage} className="h-2" />
            </div>
          </div>

          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-muted rounded-lg text-center">
              <p className="text-sm font-medium">Total Amount</p>
              <p className="text-lg font-bold">
                {formatCurrency(tracking.totalAmount)}
              </p>
            </div>

            {order.trackingNumber && (
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-sm font-medium">Tracking Number</p>
                <p className="font-mono text-sm">{order.trackingNumber}</p>
              </div>
            )}

            {order.expectedDelivery && (
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-sm font-medium">Expected Delivery</p>
                <p className="text-sm font-semibold">
                  {format(new Date(order.expectedDelivery), "MMM dd, yyyy")}
                </p>
              </div>
            )}
          </div>

          {/* Tracking Status Message */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-500" />
              <p className="font-medium">Last Update</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {format(
                new Date(tracking.lastUpdate),
                "MMM dd, yyyy 'at' h:mm a"
              )}
            </p>
          </div>

          {/* Action Required Alerts */}
          {tracking.designApproval &&
            tracking.designApproval.status === "PENDING" && (
              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  <strong>Action Required:</strong> Please review and approve
                  your design.
                  <Button
                    variant="link"
                    size="sm"
                    className="ml-2 p-0 h-auto"
                    onClick={handleDesignApprovalClick}
                  >
                    Review Design
                  </Button>
                </AlertDescription>
              </Alert>
            )}

          {/* Tracking URL */}
          {order.trackingUrl && (
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Track with Carrier
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracking Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Tracking Timeline</CardTitle>
          <CardDescription>Latest updates on your order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tracking.timeline.map((event, index) => (
              <div key={index} className="relative">
                {index < tracking.timeline.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
                )}

                <div className="flex gap-4">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-background bg-muted">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0 pb-4">
                    <h4 className="font-medium">{event.status}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(
                            new Date(event.timestamp),
                            "MMM dd, yyyy 'at' h:mm a"
                          )}
                        </span>
                      </div>
                      {event.updatedBy && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>By: {event.updatedBy}</span>
                        </div>
                      )}
                    </div>
                    {event.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        {event.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>Status of individual items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tracking.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{item.productName}</h4>
                  {item.variantName && (
                    <p className="text-sm text-muted-foreground">
                      {item.variantName}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                  {item.estimatedCompletion && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Est. completion:{" "}
                      {format(
                        new Date(item.estimatedCompletion),
                        "MMM dd, yyyy"
                      )}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="mt-1">
                    {item.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.statusDescription}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium">
              {tracking.shippingAddress.recipientName}
            </p>
            <p className="text-sm text-muted-foreground">
              {tracking.shippingAddress.street}
            </p>
            <p className="text-sm text-muted-foreground">
              {tracking.shippingAddress.city}{" "}
              {tracking.shippingAddress.postalCode}
            </p>
            <p className="text-sm text-muted-foreground">
              {tracking.shippingAddress.country}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          {tracking.canCancel ? (
            <Button variant="outline" className="text-red-600">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Cancel Order
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">
              This order cannot be cancelled at this stage
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
