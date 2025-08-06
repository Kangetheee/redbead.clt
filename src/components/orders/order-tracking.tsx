/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Phone,
  AlertTriangle,
  Navigation,
  Home,
  Building,
  Eye,
  CreditCard,
  Palette,
  Factory,
  PackageCheck,
  ShoppingCart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import { OrderResponse } from "@/lib/orders/types/orders.types";
import { useOrder, usePaymentStatus } from "@/hooks/use-orders";
import { ORDER_STATUS, URGENCY_LEVELS } from "@/lib/orders/dto/orders.dto";

interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  icon?: React.ComponentType<{ className?: string }>;
}

export interface CustomerOrderTrackingProps {
  orderId: string;
  initialOrder?: OrderResponse;
  showEstimates?: boolean;
  autoRefresh?: boolean;
  onDesignApprovalClick?: () => void;
  onPaymentClick?: () => void;
}

const STATUS_CONFIG = {
  PENDING: {
    label: "Order Received",
    description: "Your order has been received and is being processed",
    icon: ShoppingCart,
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
    description: "Design has been approved and production will begin",
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-100",
  },
  DESIGN_REJECTED: {
    label: "Design Revision",
    description: "Design needs revision based on feedback",
    icon: AlertTriangle,
    color: "text-red-500",
    bgColor: "bg-red-100",
  },
  PAYMENT_PENDING: {
    label: "Payment Required",
    description: "Waiting for payment confirmation",
    icon: CreditCard,
    color: "text-orange-500",
    bgColor: "bg-orange-100",
  },
  PAYMENT_CONFIRMED: {
    label: "Payment Confirmed",
    description: "Payment received, starting production",
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-100",
  },
  PROCESSING: {
    label: "In Production",
    description: "Your order is being prepared for manufacturing",
    icon: Package,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
  },
  PRODUCTION: {
    label: "Manufacturing",
    description: "Your items are being manufactured",
    icon: Factory,
    color: "text-purple-500",
    bgColor: "bg-purple-100",
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
    description: "Package has been successfully delivered",
    icon: PackageCheck,
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
  REFUNDED: {
    label: "Refunded",
    description: "Order has been refunded",
    icon: CreditCard,
    color: "text-gray-500",
    bgColor: "bg-gray-100",
  },
} as const;

const URGENCY_DELIVERY_DAYS = {
  NORMAL: 7,
  EXPEDITED: 4,
  RUSH: 2,
  EMERGENCY: 1,
} as const;

export default function CustomerOrderTracking({
  orderId,
  initialOrder,
  showEstimates = true,
  autoRefresh = false,
  onDesignApprovalClick,
  onPaymentClick,
}: CustomerOrderTrackingProps) {
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch order data with auto-refresh capability
  const {
    data: orderResponse,
    refetch: refetchOrder,
    isLoading: isOrderLoading,
    error: orderError,
  } = useOrder(orderId, true);

  // FIX: orderResponse is directly OrderResponse | undefined due to select function
  const order: OrderResponse | undefined = orderResponse || initialOrder;

  // Fetch payment status if needed
  const { data: paymentStatusResponse, refetch: refetchPaymentStatus } =
    usePaymentStatus(
      orderId,
      !!(
        order?.status === "PAYMENT_PENDING" ||
        order?.status === "PAYMENT_CONFIRMED"
      )
    );

  // FIX: paymentStatusResponse is directly PaymentStatus | undefined due to select function
  const paymentStatus = paymentStatusResponse || null;

  // Generate tracking events based on order status and timeline
  useEffect(() => {
    if (!order) return;

    const events: TrackingEvent[] = [];
    const baseTimestamp = new Date(order.createdAt);

    // Always add order creation event
    events.push({
      id: "order_created",
      status: "Order Placed",
      description: `Order #${order.orderNumber} has been placed`,
      location: "Order Management System",
      timestamp: order.createdAt,
      type: "success",
      icon: ShoppingCart,
    });

    // Add events based on order progression
    if (order.designApprovalRequired) {
      if (order.designApprovalRequestedAt) {
        events.push({
          id: "design_requested",
          status: "Design Created",
          description: "Design has been created and sent for approval",
          location: "Design Department",
          timestamp: order.designApprovalRequestedAt,
          type: "info",
          icon: Palette,
        });
      }

      if (order.designApprovalCompletedAt) {
        events.push({
          id: "design_approved",
          status:
            order.designApprovalStatus === "APPROVED"
              ? "Design Approved"
              : "Design Feedback",
          description:
            order.designApprovalStatus === "APPROVED"
              ? "Design has been approved by customer"
              : "Customer provided feedback on design",
          location: "Customer Review",
          timestamp: order.designApprovalCompletedAt,
          type:
            order.designApprovalStatus === "APPROVED" ? "success" : "warning",
          icon:
            order.designApprovalStatus === "APPROVED"
              ? CheckCircle
              : AlertTriangle,
        });
      }
    }

    // Add production timeline events
    if (order.designStartDate) {
      events.push({
        id: "design_started",
        status: "Design Started",
        description: "Design work has begun",
        location: "Design Department",
        timestamp: order.designStartDate,
        type: "info",
        icon: Palette,
      });
    }

    if (order.designCompletionDate) {
      events.push({
        id: "design_completed",
        status: "Design Completed",
        description: "Design work has been completed",
        location: "Design Department",
        timestamp: order.designCompletionDate,
        type: "success",
        icon: CheckCircle,
      });
    }

    if (order.productionStartDate) {
      events.push({
        id: "production_started",
        status: "Production Started",
        description: "Manufacturing has begun",
        location: "Production Facility",
        timestamp: order.productionStartDate,
        type: "info",
        icon: Factory,
      });
    }

    if (order.productionEndDate) {
      events.push({
        id: "production_completed",
        status: "Production Completed",
        description: "Manufacturing has been completed",
        location: "Production Facility",
        timestamp: order.productionEndDate,
        type: "success",
        icon: PackageCheck,
      });
    }

    if (order.shippingDate && order.trackingNumber) {
      events.push({
        id: "shipped",
        status: "Package Shipped",
        description: `Package shipped with tracking number ${order.trackingNumber}`,
        location: "Shipping Center",
        timestamp: order.shippingDate,
        type: "success",
        icon: Truck,
      });

      // Add mock in-transit events for shipped orders
      if (order.status === "SHIPPED" || order.status === "DELIVERED") {
        const transitDate = new Date(order.shippingDate);
        transitDate.setDate(transitDate.getDate() + 1);

        events.push({
          id: "in_transit",
          status: "In Transit",
          description: "Package is on its way to destination",
          location: "Distribution Center",
          timestamp: transitDate.toISOString(),
          type: "info",
          icon: Truck,
        });
      }
    }

    if (order.actualDeliveryDate) {
      events.push({
        id: "delivered",
        status: "Delivered",
        description: "Package has been delivered successfully",
        location: "Delivery Address",
        timestamp: order.actualDeliveryDate,
        type: "success",
        icon: PackageCheck,
      });
    }

    // Sort events by timestamp
    events.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    setTrackingEvents(events);
  }, [order]);

  // Auto-refresh functionality
  useEffect(() => {
    if (
      autoRefresh &&
      order &&
      ["SHIPPED", "PROCESSING", "PRODUCTION"].includes(order.status)
    ) {
      const interval = setInterval(
        () => {
          handleRefreshTracking();
        },
        5 * 60 * 1000
      ); // Refresh every 5 minutes

      return () => clearInterval(interval);
    }
  }, [autoRefresh, order?.status]);

  const handleRefreshTracking = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchOrder(),
        paymentStatus && refetchPaymentStatus(),
      ]);
      setLastUpdated(new Date());
      toast.success("Tracking information updated");
    } catch (error) {
      console.error("Failed to refresh tracking data:", error);
      toast.error("Failed to refresh tracking information");
    } finally {
      setIsRefreshing(false);
    }
  };

  const getTrackingProgress = () => {
    if (!order) return 0;

    const statusProgressMap = {
      PENDING: 5,
      DESIGN_PENDING: 15,
      DESIGN_APPROVED: 25,
      DESIGN_REJECTED: 15,
      PAYMENT_PENDING: 20,
      PAYMENT_CONFIRMED: 30,
      PROCESSING: 40,
      PRODUCTION: 60,
      SHIPPED: 80,
      DELIVERED: 100,
      CANCELLED: 0,
      REFUNDED: 0,
    };

    return (
      statusProgressMap[order.status as keyof typeof statusProgressMap] || 0
    );
  };

  const getDeliveryEstimate = () => {
    if (order?.expectedDelivery) {
      return format(new Date(order.expectedDelivery), "EEEE, MMMM dd");
    }

    if (order?.urgencyLevel && order?.createdAt) {
      const deliveryDays =
        URGENCY_DELIVERY_DAYS[
          order.urgencyLevel as keyof typeof URGENCY_DELIVERY_DAYS
        ];
      const estimatedDate = new Date(order.createdAt);
      estimatedDate.setDate(estimatedDate.getDate() + deliveryDays);
      return format(estimatedDate, "EEEE, MMMM dd");
    }

    return "TBD";
  };

  const formatAddress = (address: any) => {
    if (!address) return "";

    const parts = [
      address.street,
      address.city,
      address.state,
      address.country,
      address.postalCode,
    ].filter(Boolean);

    return parts.join(", ");
  };

  const getCurrentStatusConfig = () => {
    if (!order) return STATUS_CONFIG.PENDING;
    return (
      STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ||
      STATUS_CONFIG.PENDING
    );
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case "success":
        return CheckCircle;
      case "warning":
        return AlertTriangle;
      case "error":
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      default:
        return "text-blue-500";
    }
  };

  if (isOrderLoading && !order) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">
              Loading order details...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orderError || !order) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Order Not Found</h3>
            <p className="text-muted-foreground">
              Unable to load order details. Please check the order ID and try
              again.
            </p>
            <Button onClick={() => refetchOrder()} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = getCurrentStatusConfig();
  const StatusIcon = statusConfig.icon;

  // If no tracking number and not shipped, show pre-shipment status
  if (
    !order.trackingNumber &&
    !["SHIPPED", "DELIVERED"].includes(order.status)
  ) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StatusIcon className="h-5 w-5" />
              Order Status
            </CardTitle>
            <CardDescription>
              Your order is being prepared for shipment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className={`p-4 ${statusConfig.bgColor} rounded-full`}>
                  <StatusIcon className={`h-8 w-8 ${statusConfig.color}`} />
                </div>
              </div>

              <div>
                <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                <Badge variant="outline" className="mt-2">
                  {statusConfig.label}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  {statusConfig.description}
                </p>
              </div>

              {showEstimates && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Estimated Delivery</p>
                  <p className="text-lg font-bold text-blue-600">
                    {getDeliveryEstimate()}
                  </p>
                  {order.urgencyLevel !== "NORMAL" && (
                    <Badge variant="secondary" className="mt-1">
                      {order.urgencyLevel} Priority
                    </Badge>
                  )}
                </div>
              )}

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Order Progress</span>
                  <span>{getTrackingProgress()}%</span>
                </div>
                <Progress value={getTrackingProgress()} className="h-2" />
              </div>
            </div>

            {/* Action Required Alerts */}
            {order.status === "DESIGN_PENDING" && (
              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  <strong>Action Required:</strong> Please review and approve
                  your design to continue production.
                  <Button
                    variant="link"
                    size="sm"
                    className="ml-2 p-0 h-auto"
                    onClick={onDesignApprovalClick}
                  >
                    Review Design
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {order.status === "PAYMENT_PENDING" && (
              <Alert>
                <CreditCard className="h-4 w-4" />
                <AlertDescription>
                  <strong>Payment Required:</strong> Complete your payment to
                  start production.
                  <Button
                    variant="link"
                    size="sm"
                    className="ml-2 p-0 h-auto"
                    onClick={onPaymentClick}
                  >
                    Complete Payment
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {paymentStatus && paymentStatus.status === "FAILED" && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Payment Failed:</strong> {paymentStatus.message}
                  <Button
                    variant="link"
                    size="sm"
                    className="ml-2 p-0 h-auto"
                    onClick={onPaymentClick}
                  >
                    Retry Payment
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Order Timeline for Pre-Shipment */}
        {trackingEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
              <CardDescription>
                Track the progress of your order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trackingEvents.map((event, index) => {
                  const Icon = event.icon || getStatusIcon(event.type);
                  const isLatest = index === trackingEvents.length - 1;

                  return (
                    <div key={event.id} className="relative">
                      {index < trackingEvents.length - 1 && (
                        <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
                      )}

                      <div className="flex gap-4">
                        <div
                          className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-background ${
                            isLatest
                              ? "bg-blue-100 ring-2 ring-blue-200"
                              : "bg-muted"
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${getStatusColor(event.type)}`}
                          />
                        </div>

                        <div className="flex-1 min-w-0 pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4
                                className={`font-medium ${isLatest ? "text-blue-600" : ""}`}
                              >
                                {event.status}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {event.description}
                              </p>

                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{event.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {format(
                                      new Date(event.timestamp),
                                      "MMM dd, h:mm a"
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {isLatest && (
                              <Badge variant="secondary" className="ml-2">
                                Latest
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Full tracking view for shipped orders
  return (
    <div className="space-y-6">
      {/* Tracking Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Package Tracking
              </CardTitle>
              <CardDescription>Track your package in real-time</CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshTracking}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>

              {order.trackingUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Carrier Site
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Order Number</p>
              <p className="font-mono text-lg">{order.orderNumber}</p>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Tracking Number</p>
              <div className="flex items-center justify-between">
                <p className="font-mono text-lg">{order.trackingNumber}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(order.trackingNumber!);
                    toast.success("Tracking number copied");
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Status</p>
              <Badge variant="outline" className="mt-1">
                {statusConfig.label}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Delivery Progress</span>
              <span>{getTrackingProgress()}%</span>
            </div>
            <Progress value={getTrackingProgress()} className="h-2" />
          </div>

          {/* Delivery Estimate */}
          {showEstimates && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Home className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Expected Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    {order.expectedDelivery
                      ? format(
                          new Date(order.expectedDelivery),
                          "EEEE, MMMM dd 'by' h:mm a"
                        )
                      : getDeliveryEstimate()}
                  </p>
                </div>
              </div>

              {order.status === "SHIPPED" && (
                <Badge className="bg-green-100 text-green-800">On Time</Badge>
              )}
            </div>
          )}

          {/* Last Updated */}
          <div className="text-xs text-muted-foreground text-center">
            Last updated: {format(lastUpdated, "MMM dd, yyyy 'at' h:mm a")}
          </div>
        </CardContent>
      </Card>

      {/* Tracking Events */}
      <Card>
        <CardHeader>
          <CardTitle>Tracking History</CardTitle>
          <CardDescription>
            Detailed movement history of your package
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trackingEvents.map((event, index) => {
              const Icon = event.icon || getStatusIcon(event.type);
              const isLatest = index === trackingEvents.length - 1;

              return (
                <div key={event.id} className="relative">
                  {index < trackingEvents.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
                  )}

                  <div className="flex gap-4">
                    <div
                      className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-background ${
                        isLatest
                          ? "bg-blue-100 ring-2 ring-blue-200"
                          : "bg-muted"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${getStatusColor(event.type)}`}
                      />
                    </div>

                    <div className="flex-1 min-w-0 pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4
                            className={`font-medium ${isLatest ? "text-blue-600" : ""}`}
                          >
                            {event.status}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </p>

                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {format(
                                  new Date(event.timestamp),
                                  "MMM dd, h:mm a"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {isLatest && (
                          <Badge variant="secondary" className="ml-2">
                            Latest
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Delivery Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Delivery Address</h4>
            <p className="text-sm text-muted-foreground">
              {formatAddress(order.shippingAddress)}
            </p>
          </div>

          {order.specialInstructions && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Special Instructions</h4>
                <p className="text-sm text-muted-foreground">
                  {order.specialInstructions}
                </p>
              </div>
            </>
          )}

          <Separator />

          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="outline" className="justify-start">
              <Phone className="h-4 w-4 mr-2" />
              Contact Carrier
            </Button>
            <Button variant="outline" className="justify-start">
              <Navigation className="h-4 w-4 mr-2" />
              Delivery Instructions
            </Button>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Delivery Note:</strong> Please ensure someone is available
              to receive the package. If no one is available, the carrier will
              attempt redelivery the next business day.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Having issues with your delivery? Our customer support team is
              here to help.
            </p>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Call Support
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Live Chat
              </Button>
            </div>

            {/* Order Details for Support */}
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Order Details for Support Reference:
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-medium">Order ID:</span> {order.id}
                </div>
                <div>
                  <span className="font-medium">Customer ID:</span>{" "}
                  {order.customerId}
                </div>
                <div>
                  <span className="font-medium">Order Date:</span>{" "}
                  {format(new Date(order.createdAt), "MMM dd, yyyy")}
                </div>
                <div>
                  <span className="font-medium">Total Amount:</span> $
                  {order.totalAmount.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
