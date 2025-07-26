/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
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

// Import our order components
import CustomerOrderTimeline from "@/components/orders/order-timeline";
import CustomerOrderTracking from "./order-tracking";
import { useOrder } from "@/hooks/use-orders";

export default function CustomerOrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [isFavorited, setIsFavorited] = useState(false);

  // Fetch order data
  const { data: orderData, isLoading, refetch } = useOrder(orderId);
  const order = orderData?.success ? orderData.data : null;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      DESIGN_PENDING: {
        color: "bg-blue-100 text-blue-800",
        label: "Design Review",
      },
      DESIGN_APPROVED: {
        color: "bg-green-100 text-green-800",
        label: "Design Approved",
      },
      PAYMENT_PENDING: {
        color: "bg-orange-100 text-orange-800",
        label: "Payment Due",
      },
      PAYMENT_CONFIRMED: {
        color: "bg-green-100 text-green-800",
        label: "Payment Confirmed",
      },
      PROCESSING: {
        color: "bg-purple-100 text-purple-800",
        label: "Processing",
      },
      PRODUCTION: {
        color: "bg-purple-100 text-purple-800",
        label: "In Production",
      },
      SHIPPED: { color: "bg-blue-100 text-blue-800", label: "Shipped" },
      DELIVERED: { color: "bg-green-100 text-green-800", label: "Delivered" },
      CANCELLED: { color: "bg-red-100 text-red-800", label: "Cancelled" },
      REFUNDED: { color: "bg-gray-100 text-gray-800", label: "Refunded" },
    }[status] || { color: "bg-gray-100 text-gray-800", label: status };

    return <Badge className={statusConfig.color}>{statusConfig.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          <span>Loading order details...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Order not found or you don&apos;t have permission to view it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getProgressPercentage = () => {
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

  const canReorder = order.status === "DELIVERED";
  const needsDesignApproval = order.status === "DESIGN_PENDING";
  const needsPayment = order.status === "PAYMENT_PENDING";
  const isActive = !["DELIVERED", "CANCELLED", "REFUNDED"].includes(
    order.status
  );

  const handleReorder = () => {
    // Implement reorder functionality
    console.log("Reordering:", order.id);
  };

  const handleFavoriteToggle = () => {
    setIsFavorited(!isFavorited);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/customer/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Order #{order.orderNumber}
            </h1>
            <p className="text-muted-foreground">
              Placed on {format(new Date(order.createdAt), "MMMM dd, yyyy")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleFavoriteToggle}>
            {isFavorited ? (
              <Star className="h-4 w-4 mr-2 fill-current" />
            ) : (
              <StarOff className="h-4 w-4 mr-2" />
            )}
            {isFavorited ? "Favorited" : "Add to Favorites"}
          </Button>

          {canReorder && (
            <Button variant="outline" size="sm" onClick={handleReorder}>
              <Repeat className="h-4 w-4 mr-2" />
              Reorder
            </Button>
          )}

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Invoice
          </Button>
        </div>
      </div>

      {/* Status and Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Order Status</h3>
                {getStatusBadge(order.status)}
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
                {order.payment ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-500" />
                )}
                <span>Payment</span>
              </div>
              <div className="flex items-center gap-2">
                {["PROCESSING", "PRODUCTION", "SHIPPED", "DELIVERED"].includes(
                  order.status
                ) ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Clock className="h-4 w-4 text-gray-400" />
                )}
                <span>Production</span>
              </div>
              <div className="flex items-center gap-2">
                {order.status === "DELIVERED" ? (
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

      {/* Action Alerts */}
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
                  {order.orderItems.map((item, index) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <p className="font-medium">Product {item.productId}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${order.subtotalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${order.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${order.shippingAmount.toFixed(2)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${order.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
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
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    SHIPPING ADDRESS
                  </label>
                  <p className="mt-1">Address ID: {order.shippingAddress.id}</p>
                  {/* In a real app, display full address */}
                </div>

                {order.trackingNumber && (
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

                {order.expectedDelivery && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      EXPECTED DELIVERY
                    </label>
                    <p className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(
                        new Date(order.expectedDelivery),
                        "MMMM dd, yyyy"
                      )}
                    </p>
                  </div>
                )}

                {order.urgencyLevel && order.urgencyLevel !== "NORMAL" && (
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

          {/* Special Instructions */}
          {order.specialInstructions && (
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

        {/* Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <CustomerOrderTracking
            order={order}
            showEstimates={true}
            autoRefresh={false}
          />
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <CustomerOrderTimeline
            order={order}
            showEstimates={true}
            compact={false}
          />
        </TabsContent>

        {/* Support Tab */}
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
                  <Button variant="ghost" className="w-full justify-start">
                    Cancel this order
                  </Button>
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
                <span className="font-mono">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Order Date:</span>
                <span>{format(new Date(order.createdAt), "MMM dd, yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span>{format(new Date(order.updatedAt), "MMM dd, yyyy")}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
