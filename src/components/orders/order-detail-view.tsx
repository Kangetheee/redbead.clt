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

import { useOrder } from "@/hooks/use-orders";
import { useAddress } from "@/hooks/use-address";
import { OrderResponse } from "@/lib/orders/types/orders.types";
import { AddressResponse } from "@/lib/address/types/address.types";
import { ORDER_STATUS, URGENCY_LEVELS } from "@/lib/orders/dto/orders.dto";
import OrderStatusUpdate from "./order-status-update";
import OrderTimeline from "./order-timeline";
import NotesList from "./order-notes/notes-list";
import { formatCurrency } from "@/lib/utils";

interface OrderDetailViewProps {
  orderId: string;
}

export default function OrderDetailView({ orderId }: OrderDetailViewProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch order data using the hook
  const { data: orderData, isLoading, refetch, error } = useOrder(orderId);

  // orderData is directly the OrderResponse or undefined (hook's select function extracts it)
  const order: OrderResponse | undefined = orderData;

  // Fetch address details if we only have address IDs
  const { data: shippingAddressData } = useAddress(
    order?.shippingAddress?.id || ""
  );
  const { data: billingAddressData } = useAddress(
    order?.billingAddress?.id || ""
  );

  const getStatusBadge = (status: (typeof ORDER_STATUS)[number]) => {
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

  const getUrgencyBadgeVariant = (
    urgencyLevel: (typeof URGENCY_LEVELS)[number]
  ) => {
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
    toast.success("Copied to clipboard");
  };

  // Updated formatAddress function to use AddressResponse structure
  const formatAddress = (address: AddressResponse | null | undefined) => {
    if (!address) return "No address provided";

    // Use formattedAddress if available, otherwise construct from parts
    if (address.formattedAddress) {
      return address.formattedAddress;
    }

    const parts = [
      address.street,
      address.street2,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : `Address ID: ${address.id}`;
  };

  // Enhanced address display component
  const AddressDisplay = ({
    address,
    title,
    icon: Icon,
  }: {
    address: AddressResponse | null | undefined;
    title: string;
    icon: any;
  }) => {
    if (!address) return null;

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
            <p className="font-medium">{address.recipientName}</p>
            {address.name && address.name !== address.recipientName && (
              <p className="text-sm text-muted-foreground">({address.name})</p>
            )}
          </div>

          {address.companyName && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Company
              </p>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{address.companyName}</p>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Address
            </p>
            <div className="space-y-1">
              <p className="text-sm">{address.street}</p>
              {address.street2 && <p className="text-sm">{address.street2}</p>}
              <p className="text-sm">
                {[address.city, address.state, address.postalCode]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p className="text-sm font-medium">{address.country}</p>
            </div>
          </div>

          {address.phone && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Phone
              </p>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{address.phone}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(address.phone!)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {address.email && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Email
              </p>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{address.email}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(address.email!)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Badge variant="outline">{address.addressType}</Badge>
            {address.isDefault && <Badge variant="secondary">Default</Badge>}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Helper function to get customer display info
  const getCustomerInfo = (order: OrderResponse) => {
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

  // Get the actual address data (either from order directly or from separate fetch)
  const shippingAddress =
    (shippingAddressData?.success ? shippingAddressData.data : null) ||
    order?.shippingAddress;
  const billingAddress =
    (billingAddressData?.success ? billingAddressData.data : null) ||
    order?.billingAddress;

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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
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

                    {/* Customer contact info from shipping address */}
                    {shippingAddress && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
                        {shippingAddress.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {shippingAddress.email}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(shippingAddress.email!)
                              }
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        {shippingAddress.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {shippingAddress.phone}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(shippingAddress.phone!)
                              }
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

                  {order.actualDeliveryDate && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Delivered On
                      </p>
                      <p className="mt-1 font-medium text-green-600">
                        {format(
                          new Date(order.actualDeliveryDate),
                          "EEEE, MMM dd, yyyy"
                        )}
                      </p>
                    </div>
                  )}

                  {shippingAddress && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Delivery Address
                      </p>
                      <p className="mt-1 text-sm">
                        {formatAddress(shippingAddress)}
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
                      {order.payment.transactionId && (
                        <div className="md:col-span-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase">
                            Transaction ID
                          </p>
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
                      {order.payment.amount && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase">
                            Amount Paid
                          </p>
                          <p className="font-medium text-green-600">
                            {formatCurrency(order.payment.amount)}
                          </p>
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
                              <p className="text-xs font-medium text-muted-foreground uppercase">
                                Size
                              </p>
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
                                <p className="text-xs font-medium text-muted-foreground uppercase">
                                  Customizations
                                </p>
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
                              <p className="text-xs font-medium text-muted-foreground uppercase">
                                Design ID
                              </p>
                              <p className="text-sm font-mono">
                                {item.designId}
                              </p>
                            </div>
                          )}

                          {item.notes && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase">
                                Notes
                              </p>
                              <p className="text-sm">{item.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Item {index + 1}
                          </p>
                          {item.sizeVariant?.price && (
                            <>
                              <p className="font-medium">
                                {formatCurrency(
                                  item.sizeVariant.price * item.quantity
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(item.sizeVariant.price)} each
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AddressDisplay
                  address={shippingAddress}
                  title="Shipping Address"
                  icon={Truck}
                />

                {billingAddress && (
                  <AddressDisplay
                    address={billingAddress}
                    title="Billing Address"
                    icon={CreditCard}
                  />
                )}
              </div>

              {!billingAddress && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No separate billing address - using shipping address for
                    billing.
                  </AlertDescription>
                </Alert>
              )}
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
                      <Badge
                        variant={
                          order.designApproval.status === "APPROVED"
                            ? "default"
                            : order.designApproval.status === "REJECTED"
                              ? "destructive"
                              : order.designApproval.status === "EXPIRED"
                                ? "secondary"
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

                    {order.designApproval.rejectionReason && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          Rejection Reason
                        </p>
                        <p className="text-sm">
                          {order.designApproval.rejectionReason}
                        </p>
                      </div>
                    )}

                    {order.designApproval.expiresAt && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          Expires At
                        </p>
                        <p className="text-sm">
                          {format(
                            new Date(order.designApproval.expiresAt),
                            "MMM dd, yyyy 'at' HH:mm"
                          )}
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
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      Expected Production Days
                    </p>
                    <p className="text-sm font-medium">
                      {order.expectedProductionDays} days
                    </p>
                  </div>

                  {order.productionStartDate && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Production Start
                      </p>
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
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Production End
                      </p>
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
