/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Package,
  Truck,
  MapPin,
  CreditCard,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  Eye,
  Loader2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { useOrder, useDesignApproval } from "@/hooks/use-orders";
import { OrderResponse } from "@/lib/orders/types/orders.types";

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

function formatOrderStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getOrderStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "PENDING":
    case "PAYMENT_PENDING":
    case "DESIGN_PENDING":
      return "secondary";
    case "PROCESSING":
    case "PRODUCTION":
    case "PAYMENT_CONFIRMED":
    case "DESIGN_APPROVED":
      return "default";
    case "SHIPPED":
    case "DELIVERED":
      return "outline";
    case "CANCELLED":
    case "REFUNDED":
    case "DESIGN_REJECTED":
      return "destructive";
    default:
      return "secondary";
  }
}

function DesignApprovalSection({ order }: { order: OrderResponse }) {
  const { data: designApproval, isLoading: designApprovalLoading } =
    useDesignApproval(order.id);

  if (!order.designApprovalRequired) {
    return null;
  }

  const getApprovalStatusBadge = (status?: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending Approval
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Not Requested
          </Badge>
        );
    }
  };

  const handleSendApproval = () => {
    window.location.href = `/dashboard/admin/communication/approvals/create?orderId=${order.id}`;
  };

  const handleViewApproval = () => {
    if (order.designApproval?.id) {
      window.location.href = `/dashboard/admin/communication/approvals/${order.designApproval.id}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Design Approval
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {designApprovalLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getApprovalStatusBadge(order.designApproval?.status)}
                </div>

                {order.designApproval?.requestedAt && (
                  <p className="text-sm text-muted-foreground">
                    Requested: {formatDate(order.designApproval.requestedAt)}
                  </p>
                )}

                {order.designApproval?.respondedAt && (
                  <p className="text-sm text-muted-foreground">
                    Responded: {formatDate(order.designApproval.respondedAt)}
                  </p>
                )}

                {order.designApproval?.expiresAt && (
                  <p className="text-sm text-muted-foreground">
                    Expires: {formatDate(order.designApproval.expiresAt)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!order.designApproval ? (
                  <Button onClick={handleSendApproval} size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Send Approval
                  </Button>
                ) : (
                  <Button
                    onClick={handleViewApproval}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                )}
              </div>
            </div>

            {order.designApproval?.rejectionReason && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Rejection Reason:</strong>{" "}
                  {order.designApproval.rejectionReason}
                </AlertDescription>
              </Alert>
            )}

            {order.designApproval?.comments && (
              <div>
                <p className="text-sm font-medium">Customer Comments:</p>
                <p className="text-sm text-muted-foreground">
                  {order.designApproval.comments}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-8 w-64" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { data: orderResult, isLoading, error } = useOrder(params.id);

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (error || !orderResult?.success) {
    if (error?.message?.includes("not found")) {
      notFound();
    }

    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading order: {error?.message}
            <Link href="/dashboard/admin/orders" className="ml-2 underline">
              Return to orders
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const order = orderResult.data as OrderResponse;

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard/admin/orders">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">
              Order {order.orderNumber}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getOrderStatusVariant(order.status)}>
              {formatOrderStatus(order.status)}
            </Badge>
            {order.urgencyLevel && order.urgencyLevel !== "NORMAL" && (
              <Badge variant="destructive" className="text-xs">
                {order.urgencyLevel}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              Created {formatDate(order.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/admin/orders/${order.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Order
            </Button>
          </Link>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items ({order.orderItems?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.orderItems && order.orderItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Customizations</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded border bg-muted flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-medium">
                                Product ID: {item.productId}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          {Object.keys(item.customizations).length > 0 ? (
                            <div className="text-sm">
                              {Object.entries(item.customizations).map(
                                ([key, value]) => (
                                  <div key={key}>
                                    <strong>{key}:</strong> {String(value)}
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">No items found</p>
              )}
            </CardContent>
          </Card>

          {/* Design Approval Section */}
          <DesignApprovalSection order={order} />

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.trackingNumber && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Tracking Number</p>
                    <p className="text-sm text-muted-foreground">
                      {order.trackingNumber}
                    </p>
                  </div>
                  {order.trackingUrl && (
                    <div>
                      <p className="text-sm font-medium">Tracking URL</p>
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Track Package
                      </a>
                    </div>
                  )}
                </div>
              )}

              {order.expectedDelivery && (
                <div>
                  <p className="text-sm font-medium">Expected Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.expectedDelivery)}
                  </p>
                </div>
              )}

              {order.shippingAddress && (
                <div>
                  <p className="text-sm font-medium">Shipping Address</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Address ID: {order.shippingAddress.id}</p>
                    {/* Add more address fields based on your address structure */}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Notes and Special Instructions */}
          {(order.notes || order.specialInstructions) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes & Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.notes && (
                  <div>
                    <p className="text-sm font-medium">Order Notes</p>
                    <p className="text-sm text-muted-foreground">
                      {order.notes}
                    </p>
                  </div>
                )}

                {order.specialInstructions && (
                  <div>
                    <p className="text-sm font-medium">Special Instructions</p>
                    <p className="text-sm text-muted-foreground">
                      {order.specialInstructions}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${order.subtotalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span>${order.shippingAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>${order.taxAmount.toFixed(2)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-${order.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.payment ? (
                <>
                  <div>
                    <p className="text-sm font-medium">Payment Status</p>
                    <p className="text-sm text-muted-foreground">
                      {order.status.includes("PAYMENT_CONFIRMED")
                        ? "Confirmed"
                        : "Pending"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Amount</p>
                    <p className="text-sm text-muted-foreground">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No payment information
                </p>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Customer ID</p>
                <p className="text-sm text-muted-foreground">
                  {order.customerId || "Guest"}
                </p>
              </div>

              {order.billingAddress && (
                <div>
                  <p className="text-sm font-medium">Billing Address</p>
                  <p className="text-sm text-muted-foreground">
                    Address ID: {order.billingAddress.id}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {order.urgencyLevel && (
                  <div>
                    <p className="text-sm font-medium">Urgency Level</p>
                    <Badge variant="outline">{order.urgencyLevel}</Badge>
                  </div>
                )}

                {order.expectedProductionDays && (
                  <div>
                    <p className="text-sm font-medium">
                      Expected Production Days
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.expectedProductionDays} days
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium">
                    Design Approval Required
                  </p>
                  <Badge
                    variant={
                      order.designApprovalRequired ? "default" : "outline"
                    }
                  >
                    {order.designApprovalRequired ? "Yes" : "No"}
                  </Badge>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
