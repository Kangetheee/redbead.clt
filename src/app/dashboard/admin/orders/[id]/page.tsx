/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { getOrderAction } from "@/lib/orders/orders.action";
import { formatDate } from "@/lib/utils";

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
      return "secondary";
    case "PROCESSING":
    case "PRODUCTION":
    case "PAYMENT_CONFIRMED":
      return "default";
    case "SHIPPED":
    case "DELIVERED":
      return "outline";
    case "CANCELLED":
    case "REFUNDED":
      return "destructive";
    default:
      return "secondary";
  }
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const result = await getOrderAction(params.id);

  if (!result.success) {
    if (result.error?.includes("not found")) {
      notFound();
    }

    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Error Loading Order
          </h1>
          <p className="text-muted-foreground mb-4">{result.error}</p>
          <Button asChild>
            <Link href="/dashboard/admin/orders">Return to Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  const order = result.data;

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
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.product?.images && (
                            <div className="h-12 w-12 rounded border bg-muted flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">
                              {item.product?.name || "Unknown Product"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              SKU: {item.productId}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        ${item.totalPrice.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

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
                  {/* <div>
                    <p className="text-sm font-medium">Carrier</p>
                    <p className="text-sm text-muted-foreground">{order.shippingCarrier || "N/A"}</p>
                  </div> */}
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
                    <p>
                      {order.shippingAddress.name ||
                        order.shippingAddress.recipientName}
                    </p>
                    <p>{order.shippingAddress.street}</p>
                    <p>
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                    {order.shippingAddress.phone && (
                      <p>Phone: {order.shippingAddress.phone}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Order Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.notes}</p>
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
              <div>
                <p className="text-sm font-medium">Payment Method</p>
                <p className="text-sm text-muted-foreground">{order.payment}</p>
              </div>

              {order.payment && (
                <>
                  <div>
                    <p className="text-sm font-medium">Amount Paid</p>
                    <p className="text-sm text-muted-foreground">
                      ${order.payment.amount.toFixed(2)}
                    </p>
                  </div>
                </>
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
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      {order.billingAddress.name ||
                        order.billingAddress.recipientName}
                    </p>
                    <p>{order.billingAddress.street}</p>
                    <p>
                      {order.billingAddress.city}, {order.billingAddress.state}{" "}
                      {order.billingAddress.postalCode}
                    </p>
                    <p>{order.billingAddress.country}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Order Created</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                {order.status !== "PENDING" && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Status Updated</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.updatedAt)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Status: {formatOrderStatus(order.status)}
                      </p>
                    </div>
                  </div>
                )}

                {order.status === "DELIVERED" && order.expectedDelivery && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Delivered</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.expectedDelivery)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
