/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Edit,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  FileText,
  Truck,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Download,
  Mail,
  Phone,
  Copy,
  MoreHorizontal,
  RefreshCw,
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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useOrder } from "@/hooks/use-orders";
import { OrderResponse } from "@/lib/orders/types/orders.types";
import OrderStatusUpdate from "./order-status-update";
import OrderTimeline from "./order-timeline";
import NotesList from "./order-notes/notes-list";
import { formatCurrency } from "@/lib/utils";

interface OrderDetailViewProps {
  orderId: string;
}

export default function OrderDetailView({ orderId }: OrderDetailViewProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch order data - the hook uses select to return data directly
  const { data: order, isLoading, refetch } = useOrder(orderId);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Pending",
        icon: Clock,
      },
      DESIGN_PENDING: {
        color: "bg-blue-100 text-blue-800",
        label: "Design Pending",
        icon: FileText,
      },
      DESIGN_APPROVED: {
        color: "bg-green-100 text-green-800",
        label: "Design Approved",
        icon: CheckCircle,
      },
      DESIGN_REJECTED: {
        color: "bg-red-100 text-red-800",
        label: "Design Rejected",
        icon: AlertTriangle,
      },
      PAYMENT_PENDING: {
        color: "bg-orange-100 text-orange-800",
        label: "Payment Pending",
        icon: CreditCard,
      },
      PAYMENT_CONFIRMED: {
        color: "bg-green-100 text-green-800",
        label: "Payment Confirmed",
        icon: CheckCircle,
      },
      PROCESSING: {
        color: "bg-purple-100 text-purple-800",
        label: "Processing",
        icon: Package,
      },
      PRODUCTION: {
        color: "bg-purple-100 text-purple-800",
        label: "In Production",
        icon: Package,
      },
      SHIPPED: {
        color: "bg-blue-100 text-blue-800",
        label: "Shipped",
        icon: Truck,
      },
      DELIVERED: {
        color: "bg-green-100 text-green-800",
        label: "Delivered",
        icon: CheckCircle,
      },
      CANCELLED: {
        color: "bg-red-100 text-red-800",
        label: "Cancelled",
        icon: AlertTriangle,
      },
      REFUNDED: {
        color: "bg-gray-100 text-gray-800",
        label: "Refunded",
        icon: AlertTriangle,
      },
    }[status] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
      icon: Clock,
    };

    const Icon = statusConfig.icon;

    return (
      <Badge className={statusConfig.color}>
        <Icon className="mr-1 h-3 w-3" />
        {statusConfig.label}
      </Badge>
    );
  };

  const getUrgencyBadgeVariant = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case "EMERGENCY":
        return "destructive";
      case "RUSH":
        return "destructive";
      case "EXPEDITED":
        return "secondary";
      default:
        return "outline";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatAddress = (address: any) => {
    if (!address) return "No address provided";

    const parts = [
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : `Address ID: ${address.id}`;
  };

  // Helper function to get customer display info
  const getCustomerInfo = (order: any) => {
    if (order.customerId) {
      return {
        displayName: `Customer ${order.customerId}`,
        initials: order.customerId.slice(0, 2).toUpperCase(),
        isGuest: false,
      };
    }

    // For guest orders, try to use shipping address info
    if (order.shippingAddress?.recipientName) {
      const name = order.shippingAddress.recipientName;
      const nameParts = name.split(" ");
      const initials =
        nameParts.length > 1
          ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
          : name.slice(0, 2).toUpperCase();

      return {
        displayName: name,
        initials,
        isGuest: true,
      };
    }

    // Fallback for guest orders without customer info
    return {
      displayName: "Guest Customer",
      initials: "GU",
      isGuest: true,
    };
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          <span>Loading order details...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Order not found or you don&apos;t have permission to view it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const customerInfo = getCustomerInfo(order);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Order #{order.orderNumber}
            </h1>
            <div className="flex items-center gap-4 mt-1">
              {getStatusBadge(order.status)}
              <span className="text-sm text-muted-foreground">
                Created{" "}
                {format(new Date(order.createdAt), "MMM dd, yyyy 'at' HH:mm")}
              </span>
              {order.urgencyLevel && order.urgencyLevel !== "NORMAL" && (
                <Badge variant={getUrgencyBadgeVariant(order.urgencyLevel)}>
                  {order.urgencyLevel}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => copyToClipboard(order.orderNumber)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Order Number
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Send to Customer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/orders/${order.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Order
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button asChild>
            <Link href={`/orders/${order.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        SUBTOTAL
                      </Label>
                      <p className="font-medium">
                        {formatCurrency(order.subtotalAmount)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        TAX
                      </Label>
                      <p className="font-medium">
                        {formatCurrency(order.taxAmount)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        SHIPPING
                      </Label>
                      <p className="font-medium">
                        {formatCurrency(order.shippingAmount)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        TOTAL
                      </Label>
                      <p className="text-lg font-bold">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  </div>

                  {order.discountAmount > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Discount Applied
                        </span>
                        <span className="font-medium text-green-600">
                          -${order.discountAmount.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Customer Information - UPDATED */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{customerInfo.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {customerInfo.displayName}
                        </p>
                        {customerInfo.isGuest && (
                          <Badge variant="secondary" className="text-xs">
                            Guest Order
                          </Badge>
                        )}
                        {order.customerId && (
                          <p className="text-sm text-muted-foreground">
                            ID: {order.customerId}
                          </p>
                        )}
                      </div>
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
                    <Label className="text-xs font-medium text-muted-foreground">
                      SHIPPING ADDRESS
                    </Label>
                    <p className="mt-1">
                      {formatAddress(order.shippingAddress)}
                    </p>
                  </div>

                  {order.billingAddress && (
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        BILLING ADDRESS
                      </Label>
                      <p className="mt-1">
                        {formatAddress(order.billingAddress)}
                      </p>
                    </div>
                  )}

                  {order.trackingNumber && (
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        TRACKING
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-medium">{order.trackingNumber}</p>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(order.trackingNumber!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {order.expectedDelivery && (
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        EXPECTED DELIVERY
                      </Label>
                      <p className="mt-1">
                        {format(
                          new Date(order.expectedDelivery),
                          "MMM dd, yyyy"
                        )}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Information */}
              {order.payment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          METHOD
                        </Label>
                        <p className="font-medium">
                          {order.payment.method || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          STATUS
                        </Label>
                        <p className="font-medium">
                          {order.payment.status || "N/A"}
                        </p>
                      </div>
                      {order.payment.transactionId && (
                        <div className="md:col-span-2">
                          <Label className="text-xs font-medium text-muted-foreground">
                            TRANSACTION ID
                          </Label>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="font-medium font-mono">
                              {order.payment.transactionId}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(
                                  order.payment?.transactionId || ""
                                )
                              }
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Items Tab */}
            <TabsContent value="items">
              <Card>
                <CardHeader>
                  <CardTitle>Order Items ({order.orderItems.length})</CardTitle>
                  <CardDescription>
                    Products and specifications for this order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.orderItems.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="flex items-start justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">
                              {item.template?.name ||
                                `Template ${item.templateId}`}
                            </h4>
                            <Badge variant="outline">
                              Qty: {item.quantity}
                            </Badge>
                            {item.status && (
                              <Badge variant="secondary">
                                {item.status.replace("_", " ")}
                              </Badge>
                            )}
                          </div>

                          {item.sizeVariant && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">
                                SIZE
                              </Label>
                              <p className="text-sm">
                                {item.sizeVariant.displayName} (
                                {item.sizeVariant.dimensions.width}x
                                {item.sizeVariant.dimensions.height}{" "}
                                {item.sizeVariant.dimensions.unit})
                              </p>
                            </div>
                          )}

                          {item.customizations &&
                            item.customizations.length > 0 && (
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">
                                  CUSTOMIZATIONS
                                </Label>
                                <div className="mt-1 space-y-1">
                                  {item.customizations.map(
                                    (customization, idx) => (
                                      <div
                                        key={idx}
                                        className="text-sm p-2 bg-muted rounded"
                                      >
                                        <span className="font-medium">
                                          Option:
                                        </span>{" "}
                                        {customization.optionId} |
                                        <span className="font-medium">
                                          {" "}
                                          Value:
                                        </span>{" "}
                                        {customization.valueId}
                                        {customization.customValue && (
                                          <>
                                            <br />
                                            <span className="font-medium">
                                              Custom:
                                            </span>{" "}
                                            {customization.customValue}
                                          </>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {item.designId && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">
                                DESIGN ID
                              </Label>
                              <p className="text-sm font-mono">
                                {item.designId}
                              </p>
                            </div>
                          )}

                          {item.notes && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">
                                NOTES
                              </Label>
                              <p className="text-sm">{item.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Item {index + 1}
                          </p>
                          <p className="font-medium">
                            ${(item.unitPrice * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ${item.unitPrice.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline">
              <OrderTimeline order={order} />
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes">
              <NotesList orderId={order.id} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          {/* Order Status Update */}
          <OrderStatusUpdate order={order} onStatusUpdated={() => refetch()} />

          {/* Design Approval */}
          {order.designApprovalRequired && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Design Approval
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.designApproval ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <Badge variant="outline">
                        {order.designApproval.status}
                      </Badge>
                    </div>

                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        REQUESTED
                      </Label>
                      <p className="text-sm">
                        {format(
                          new Date(order.designApproval.requestedAt),
                          "MMM dd, yyyy"
                        )}
                      </p>
                    </div>

                    {order.designApproval.respondedAt && (
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          RESPONDED
                        </Label>
                        <p className="text-sm">
                          {format(
                            new Date(order.designApproval.respondedAt),
                            "MMM dd, yyyy"
                          )}
                        </p>
                      </div>
                    )}

                    {order.designApproval.rejectionReason && (
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          REJECTION REASON
                        </Label>
                        <p className="text-sm">
                          {order.designApproval.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Design approval not yet requested
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Production Information */}
          {order.expectedProductionDays && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Production
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      EXPECTED PRODUCTION DAYS
                    </Label>
                    <p className="text-sm font-medium">
                      {order.expectedProductionDays} days
                    </p>
                  </div>

                  {order.productionStartDate && (
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        PRODUCTION START
                      </Label>
                      <p className="text-sm">
                        {format(
                          new Date(order.productionStartDate),
                          "MMM dd, yyyy"
                        )}
                      </p>
                    </div>
                  )}

                  {order.productionEndDate && (
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        PRODUCTION END
                      </Label>
                      <p className="text-sm">
                        {format(
                          new Date(order.productionEndDate),
                          "MMM dd, yyyy"
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Send Customer Update
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper component for labels
function Label({ className, children, ...props }: any) {
  return (
    <label className={`text-sm font-medium ${className || ""}`} {...props}>
      {children}
    </label>
  );
}
