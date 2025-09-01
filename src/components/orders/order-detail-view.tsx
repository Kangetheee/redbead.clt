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
  Building,
  Loader2,
  XCircle,
  Plus,
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
import { toast } from "sonner";

import { useOrder, useCustomerNotes } from "@/hooks/use-orders";
import {
  OrderResponse,
  OrderItem,
  OrderPayment,
  DesignApproval,
  OrderAddress,
  OrderUser,
} from "@/lib/orders/types/orders.types";
import { formatCurrency } from "@/lib/utils";

interface OrderDetailViewProps {
  orderId: string;
}

interface CustomerInfo {
  displayName: string;
  initials: string;
  isGuest: boolean;
}

const getProductName = (item: OrderItem): string => {
  return item.product?.name || `Product ${item.productId}`;
};

const formatCustomizations = (
  customizations?: any[]
): Array<{ name: string; value: string }> => {
  if (!customizations || !Array.isArray(customizations)) return [];

  return customizations.map((customization, index) => {
    if (
      typeof customization === "object" &&
      customization.name &&
      customization.value
    ) {
      return {
        name: customization.name,
        value: customization.value,
      };
    }

    // Handle other formats if needed
    return {
      name: `Customization ${index + 1}`,
      value: String(customization),
    };
  });
};

// Status configuration with proper typing
const getStatusConfig = (status: string) => {
  const statusConfigs: Record<
    string,
    { color: string; label: string; icon: any }
  > = {
    PENDING: {
      color: "bg-yellow-100 text-yellow-800",
      label: "Pending",
      icon: Clock,
    },
    CONFIRMED: {
      color: "bg-blue-100 text-blue-800",
      label: "Confirmed",
      icon: CheckCircle,
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
      icon: XCircle,
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
      icon: XCircle,
    },
    REFUNDED: {
      color: "bg-gray-100 text-gray-800",
      label: "Refunded",
      icon: AlertTriangle,
    },
  };

  return (
    statusConfigs[status] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
      icon: Clock,
    }
  );
};

export default function OrderDetailView({ orderId }: OrderDetailViewProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: order, isLoading, refetch, error } = useOrder(orderId);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatAddress = (address: OrderAddress | null | undefined): string => {
    if (!address) return "No address provided";

    const parts = [
      address.recipientName,
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : `Address ID: ${address.id}`;
  };

  const AddressDisplay = ({
    address,
    title,
    icon: Icon,
  }: {
    address: OrderAddress | null | undefined;
    title: string;
    icon: any;
  }) => {
    if (!address) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No address provided</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Recipient
            </p>
            <p className="font-medium">
              {address.recipientName || "No name provided"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Address
            </p>
            <div className="space-y-1">
              {address.street && <p className="text-sm">{address.street}</p>}
              <p className="text-sm">
                {[address.city, address.state, address.postalCode]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {address.country && (
                <p className="text-sm font-medium">{address.country}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Helper function to get customer display info
  const getCustomerInfo = (order: OrderResponse): CustomerInfo => {
    if (order.user) {
      return {
        displayName: order.user.name || `Customer ${order.user.id}`,
        initials: order.user.name
          ? order.user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : order.user.id.slice(0, 2).toUpperCase(),
        isGuest: order.user.type === "guest",
      };
    }

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

    return {
      displayName: "Customer",
      initials: "GU",
      isGuest: true,
    };
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading order details...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error?.message ||
              "Order not found or you don't have permission to view it."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const customerInfo = getCustomerInfo(order);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Button variant="outline" size="sm" asChild>
        <Link href="/orders">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Link>
      </Button>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
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
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
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
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Subtotal
                      </p>
                      <p className="font-medium">
                        {formatCurrency(order.subtotalAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Tax
                      </p>
                      <p className="font-medium">
                        {formatCurrency(order.taxAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Shipping
                      </p>
                      <p className="font-medium">
                        {order.shippingAmount > 0
                          ? formatCurrency(order.shippingAmount)
                          : "Free"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Total
                      </p>
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
                          -{formatCurrency(order.discountAmount)}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Customer Information */}
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
                        <AvatarImage src={order.user?.avatar || undefined} />
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
                        {order.user?.id && (
                          <p className="text-sm text-muted-foreground">
                            ID: {order.user.id}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Customer contact info */}
                    {order.user && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
                        {order.user.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{order.user.email}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(order.user.email)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        {order.user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{order.user.phone}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(order.user.phone)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping & Tracking Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping & Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.trackingNumber && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Tracking Number
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-medium font-mono">
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
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Expected Delivery
                      </p>
                      <p className="mt-1 font-medium">
                        {format(
                          new Date(order.expectedDelivery),
                          "EEEE, MMM dd, yyyy"
                        )}
                      </p>
                    </div>
                  )}

                  {order.shippingAddress && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Delivery Address
                      </p>
                      <p className="mt-1 text-sm">
                        {formatAddress(order.shippingAddress)}
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
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          Method
                        </p>
                        <p className="font-medium">
                          {order.payment.method || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          Status
                        </p>
                        <Badge
                          variant={
                            order.payment.status === "SUCCESS"
                              ? "default"
                              : order.payment.status === "PENDING"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {order.payment.status || "N/A"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          Amount Paid
                        </p>
                        <p className="font-medium text-green-600">
                          {formatCurrency(order.payment.amount)}
                        </p>
                      </div>
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
                    {order.orderItems.length > 0 ? (
                      order.orderItems.map((item, index) => (
                        <div
                          key={item.id || index}
                          className="flex items-start justify-between p-4 border rounded-lg"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">
                                {getProductName(item)}
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

                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase">
                                Product ID
                              </p>
                              <p className="text-sm font-mono">
                                {item.productId}
                              </p>
                            </div>

                            {item.variantId && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase">
                                  Variant
                                </p>
                                <p className="text-sm">
                                  {item.variant?.displayName || item.variantId}
                                </p>
                                {item.variant?.dimensions && (
                                  <p className="text-xs text-muted-foreground">
                                    Dimensions:{" "}
                                    {JSON.stringify(item.variant.dimensions)}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Updated customizations handling */}
                            {item.customizations &&
                              item.customizations.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground uppercase">
                                    Customizations
                                  </p>
                                  <div className="mt-1 space-y-1">
                                    {formatCustomizations(
                                      item.customizations
                                    ).map((customization, idx) => (
                                      <div
                                        key={idx}
                                        className="text-sm p-2 bg-muted rounded"
                                      >
                                        <span className="font-medium">
                                          {customization.name}:
                                        </span>{" "}
                                        {customization.value}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Item {index + 1}
                            </p>
                            <p className="font-medium">
                              {formatCurrency(item.totalPrice)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(item.unitPrice)} each
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">
                          No items found
                        </h3>
                        <p className="text-muted-foreground">
                          This order doesn&apos;t have any items listed.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AddressDisplay
                  address={order.shippingAddress}
                  title="Shipping Address"
                  icon={Truck}
                />

                {order.billingAddress ? (
                  <AddressDisplay
                    address={order.billingAddress}
                    title="Billing Address"
                    icon={CreditCard}
                  />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Billing Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          No separate billing address - using shipping address
                          for billing.
                        </AlertDescription>
                      </Alert>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/addresses">
                            <MapPin className="h-4 w-4 mr-2" />
                            Manage Addresses
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Address Management Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Address Management</CardTitle>
                  <CardDescription>
                    Manage your saved addresses for future orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" asChild>
                      <Link href="/addresses">
                        <MapPin className="h-4 w-4 mr-2" />
                        View All Addresses
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/addresses?add=true">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Address
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
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
                      <Badge
                        variant={
                          order.designApproval.status === "APPROVED"
                            ? "default"
                            : order.designApproval.status === "REJECTED"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {order.designApproval.status}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Customer Email
                      </p>
                      <p className="text-sm">
                        {order.designApproval.customerEmail}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Requested
                      </p>
                      <p className="text-sm">
                        {format(
                          new Date(order.designApproval.requestedAt),
                          "MMM dd, yyyy 'at' HH:mm"
                        )}
                      </p>
                    </div>

                    {order.designApproval.respondedAt && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          Responded
                        </p>
                        <p className="text-sm">
                          {format(
                            new Date(order.designApproval.respondedAt),
                            "MMM dd, yyyy 'at' HH:mm"
                          )}
                        </p>
                      </div>
                    )}

                    {order.designApproval.previewImages &&
                      order.designApproval.previewImages.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase">
                            Preview Images
                          </p>
                          <div className="flex gap-2 mt-1">
                            {order.designApproval.previewImages.map(
                              (image, idx) => (
                                <img
                                  key={idx}
                                  src={image}
                                  alt={`Preview ${idx + 1}`}
                                  className="w-16 h-16 object-cover rounded border"
                                />
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <Badge variant="outline">
                        {order.designApprovalStatus || "Not Requested"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Design approval has not been requested yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Internal Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Internal Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Order
              </Button>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}
