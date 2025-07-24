/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Package,
  Truck,
  MessageSquare,
  Star,
  StarOff,
  Repeat,
  Clock,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  RefreshCw,
  Copy,
  Share2,
  Shield,
  AlertCircle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import OrderTimeline from "@/components/orders/order-timeline";
import OrderStatusBadge from "@/components/orders/order-status-badge";
import { useOrderConfirmation } from "@/hooks/use-checkout";
import { useOrder } from "@/hooks/use-orders";

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [isFavorited, setIsFavorited] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: confirmationData,
    isLoading: confirmationLoading,
    error: confirmationError,
    refetch: refetchConfirmation,
  } = useOrderConfirmation(orderId, !!orderId);

  // Also fetch detailed order data
  const {
    data: orderData,
    isLoading: orderLoading,
    error: orderError,
    refetch: refetchOrder,
  } = useOrder(orderId);

  const order = orderData?.success ? orderData.data : null;
  const confirmation = confirmationData;

  // Handle data refreshing
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchConfirmation(), refetchOrder()]);
      toast.success("Order details refreshed");
    } catch (error) {
      toast.error("Failed to refresh order details");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh every 30 seconds for active orders
  useEffect(() => {
    if (order && isOrderActive(order.status)) {
      const interval = setInterval(() => {
        refetchOrder();
        refetchConfirmation();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [order, refetchOrder, refetchConfirmation]);

  const isOrderActive = (status: string) => {
    return !["DELIVERED", "CANCELLED", "REFUNDED"].includes(status);
  };

  const getProgressPercentage = () => {
    if (!order) return 0;

    const statusFlow = [
      "PENDING",
      "DESIGN_PENDING",
      "DESIGN_APPROVED",
      "PAYMENT_CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
    ];

    const currentIndex = statusFlow.indexOf(order.status);
    return currentIndex >= 0
      ? ((currentIndex + 1) / statusFlow.length) * 100
      : 0;
  };

  const handleCopyOrderNumber = () => {
    if (confirmation?.orderNumber) {
      navigator.clipboard.writeText(confirmation.orderNumber);
      toast.success("Order number copied to clipboard");
    }
  };

  const handleShare = async () => {
    if (navigator.share && confirmation) {
      try {
        await navigator.share({
          title: `Order #${confirmation.orderNumber}`,
          text: `My order #${confirmation.orderNumber} - Total: KES ${confirmation.totalAmount.toLocaleString()}`,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success("Order link copied to clipboard");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Order link copied to clipboard");
    }
  };

  const handleReorder = () => {
    if (order) {
      // Implementation would depend on your reorder logic
      router.push(`/dashboard/customer/reorder/${order.id}`);
      toast.success("Redirecting to reorder...");
    }
  };

  const handleFavoriteToggle = () => {
    setIsFavorited(!isFavorited);
    toast.success(
      isFavorited ? "Removed from favorites" : "Added to favorites"
    );
  };

  // Loading state
  if (confirmationLoading || orderLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (confirmationError || orderError || (!confirmation && !order)) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Order not found or you don&apos;t have permission to view it.
            <Button
              variant="link"
              size="sm"
              className="ml-2 p-0 h-auto"
              onClick={() => router.push("/dashboard/customer/orders")}
            >
              View all orders
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Use confirmation data if available, otherwise fall back to order data
  const displayData = confirmation || order;
  if (!displayData) return null;

  const canReorder = order?.status === "DELIVERED";
  const needsDesignApproval = order?.status === "DESIGN_PENDING";
  const needsPayment =
    order?.status === "PAYMENT_PENDING" ||
    confirmation?.paymentStatus === "PENDING";
  const isActive = order
    ? isOrderActive(order.status)
    : confirmation?.status
      ? isOrderActive(confirmation.status)
      : false;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/customer/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Order #
                {confirmation?.orderNumber || order?.orderNumber || orderId}
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyOrderNumber}
                className="p-1"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground">
              Placed on{" "}
              {format(
                new Date(
                  confirmation?.createdAt || order?.createdAt || Date.now()
                ),
                "MMMM dd, yyyy 'at' hh:mm a"
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>

          <Button variant="outline" size="sm" onClick={handleFavoriteToggle}>
            {isFavorited ? (
              <Star className="h-4 w-4 mr-2 fill-current" />
            ) : (
              <StarOff className="h-4 w-4 mr-2" />
            )}
            {isFavorited ? "Favorited" : "Favorite"}
          </Button>

          {canReorder && (
            <Button variant="outline" size="sm" onClick={handleReorder}>
              <Repeat className="h-4 w-4 mr-2" />
              Reorder
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Invoice
          </Button>
        </div>
      </div>

      {/* Enhanced Status and Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Order Status</h3>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge
                    status={order?.status || confirmation?.status || "PENDING"}
                    size="default"
                  />
                  {isActive && (
                    <Badge variant="outline" className="animate-pulse">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="font-semibold">
                  {Math.round(getProgressPercentage())}% Complete
                </p>
              </div>
            </div>

            <div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Order Placed</span>
              </div>
              <div className="flex items-center gap-2">
                {order?.payment ||
                confirmation?.paymentStatus === "COMPLETED" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-500" />
                )}
                <span>Payment</span>
              </div>
              <div className="flex items-center gap-2">
                {order &&
                ["PROCESSING", "PRODUCTION", "SHIPPED", "DELIVERED"].includes(
                  order.status
                ) ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Clock className="h-4 w-4 text-gray-400" />
                )}
                <span>Production</span>
              </div>
              <div className="flex items-center gap-2">
                {order?.status === "DELIVERED" ||
                confirmation?.status === "DELIVERED" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Clock className="h-4 w-4 text-gray-400" />
                )}
                <span>Delivered</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Action Alerts */}
      {needsDesignApproval && (
        <Alert className="border-blue-200 bg-blue-50">
          <FileText className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Design Approval Required:</strong> Please review and approve
            the design mockups for your order.
            <Button
              variant="link"
              size="sm"
              className="ml-2 text-blue-800 p-0 h-auto"
            >
              Review Design
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {needsPayment && (
        <Alert className="border-orange-200 bg-orange-50">
          <CreditCard className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Payment Required:</strong> Complete your payment to proceed
            with production.
            <Button
              variant="link"
              size="sm"
              className="ml-2 text-orange-800 p-0 h-auto"
            >
              Make Payment
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Success message for newly created orders */}
      {confirmation && !order && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Order Placed Successfully!</strong> Your order has been
            received and is being processed.
            {confirmation.estimatedDelivery && (
              <span> Expected delivery: {confirmation.estimatedDelivery}</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Order Details</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        {/* Order Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {confirmation?.items ? (
                    confirmation.items.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                          {item.customizations &&
                            item.customizations.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.customizations
                                  .slice(0, 2)
                                  .map((custom, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {custom}
                                    </Badge>
                                  ))}
                                {item.customizations.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{item.customizations.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    ))
                  ) : order?.orderItems ? (
                    order.orderItems.map((item, index) => (
                      <div key={item.id} className="flex justify-between">
                        <div>
                          <p className="font-medium">
                            Product {item.productId}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      No items information available
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  {order && (
                    <>
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>KES {order.subtotalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>KES {order.taxAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>KES {order.shippingAmount.toLocaleString()}</span>
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>
                            -KES {order.discountAmount.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>
                      KES{" "}
                      {(
                        confirmation?.totalAmount ||
                        order?.totalAmount ||
                        0
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {confirmation?.shippingAddress ? (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      SHIPPING ADDRESS
                    </label>
                    <div className="mt-1">
                      <p className="font-medium">
                        {confirmation.shippingAddress.recipientName}
                      </p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {confirmation.shippingAddress.formattedAddress}
                      </p>
                    </div>
                  </div>
                ) : (
                  order?.shippingAddress && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        SHIPPING ADDRESS
                      </label>
                      <p className="mt-1">
                        Address ID: {order.shippingAddress.id}
                      </p>
                    </div>
                  )
                )}

                {order?.trackingNumber && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      TRACKING NUMBER
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-mono text-sm">
                        {order.trackingNumber}
                      </p>
                      {order.trackingUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {(confirmation?.estimatedDelivery ||
                  order?.expectedDelivery) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      EXPECTED DELIVERY
                    </label>
                    <p className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(
                        new Date(
                          confirmation?.estimatedDelivery ||
                            order!.expectedDelivery!
                        ),
                        "MMMM dd, yyyy"
                      )}
                    </p>
                  </div>
                )}

                {order?.urgencyLevel && order.urgencyLevel !== "NORMAL" && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      PRIORITY LEVEL
                    </label>
                    <Badge variant="destructive" className="mt-1">
                      {order.urgencyLevel}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Next Steps */}
          {confirmation?.nextSteps && confirmation.nextSteps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {confirmation.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Special Instructions */}
          {order?.specialInstructions && (
            <Card>
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {order.specialInstructions}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Enhanced Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Order Tracking
              </CardTitle>
              <CardDescription>
                Real-time updates on your order progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {order?.trackingNumber ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Tracking Number</p>
                        <p className="font-mono text-sm">
                          {order.trackingNumber}
                        </p>
                      </div>
                      {order.trackingUrl && (
                        <Button asChild>
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Track Package
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Mock tracking updates */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-green-500 rounded-full" />
                      <div>
                        <p className="font-medium">Package shipped</p>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(order.updatedAt),
                            "MMM dd, yyyy 'at' hh:mm a"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <div>
                        <p className="font-medium">Order processed</p>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(order.createdAt),
                            "MMM dd, yyyy 'at' hh:mm a"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">
                    No tracking available yet
                  </h3>
                  <p className="text-muted-foreground">
                    Tracking information will appear here once your order ships
                  </p>
                  {isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={handleRefresh}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Check for Updates
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          {order ? (
            <OrderTimeline
              order={order}
              showFilters={false}
              maxHeight="600px"
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">
                    Timeline not available
                  </h3>
                  <p className="text-muted-foreground">
                    Order timeline will be available once processing begins
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Enhanced Support Tab */}
        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Need Help?
              </CardTitle>
              <CardDescription>Get support for your order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Button variant="outline" className="justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
                <Button variant="outline" className="justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
                <Button variant="outline" className="justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Live Chat
                </Button>
                <Button variant="outline" className="justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  FAQ
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Common Actions</h4>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    Report an issue with this order
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Request order modification
                  </Button>
                  {isActive && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive hover:text-destructive"
                    >
                      Cancel this order
                    </Button>
                  )}
                  <Button variant="ghost" className="w-full justify-start">
                    Request refund
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-mono">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>Order Number:</span>
                <span className="font-mono">
                  {confirmation?.orderNumber || order?.orderNumber || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Order Date:</span>
                <span>
                  {format(
                    new Date(
                      confirmation?.createdAt || order?.createdAt || Date.now()
                    ),
                    "MMM dd, yyyy"
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span>
                  {format(
                    new Date(
                      order?.updatedAt || confirmation?.createdAt || Date.now()
                    ),
                    "MMM dd, yyyy"
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span>
                  <Badge
                    variant={
                      confirmation?.paymentStatus === "COMPLETED" ||
                      order?.payment
                        ? "default"
                        : "destructive"
                    }
                  >
                    {confirmation?.paymentStatus ||
                      (order?.payment ? "COMPLETED" : "PENDING")}
                  </Badge>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Security Information */}
          <Card className="border-muted">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-800">Secure Order</p>
                  <p className="text-muted-foreground">
                    Your order and personal information are protected with
                    industry-standard encryption and security measures.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
