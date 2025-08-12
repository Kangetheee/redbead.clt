/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useRef, useMemo } from "react";
import { format } from "date-fns";
import {
  Download,
  Printer,
  Mail,
  Calendar,
  MapPin,
  Package,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Building2,
  Phone,
  Globe,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  OrderResponse,
  OrderItem,
  OrderPayment,
  isOrderItem,
} from "@/lib/orders/types/orders.types";
import { AddressResponse } from "@/lib/address/types/address.types";

interface InvoiceComponentProps {
  order: OrderResponse;
  companyInfo?: CompanyInfo;
  showActions?: boolean;
  onDownload?: () => void;
  onPrint?: () => void;
  onEmail?: () => void;
}

interface CompanyInfo {
  name: string;
  address: CompanyAddress;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  taxId?: string;
  registrationNumber?: string;
}

interface CompanyAddress {
  street: string;
  street2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface PaymentStatusConfig {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: "RedBead Printing Co.",
  address: {
    street: "123 Printing Street",
    city: "Nairobi",
    state: "Nairobi County",
    country: "Kenya",
    postalCode: "00100",
  },
  phone: "+254 700 000 000",
  email: "billing@redbead.com",
  website: "www.redbead.com",
  taxId: "P051234567M",
  registrationNumber: "CPR/2020/123456",
};

const PAYMENT_STATUS_CONFIG: Record<string, PaymentStatusConfig> = {
  SUCCESS: {
    label: "Paid",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  PENDING: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  FAILED: {
    label: "Failed",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertTriangle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: AlertTriangle,
  },
};

// Helper function to format currency for Kenya
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
};

// Helper function to safely extract order items - Updated to use correct field names
const extractOrderItems = (orderItems: (OrderItem | string)[]): OrderItem[] => {
  if (!Array.isArray(orderItems)) return [];

  return orderItems.map((item, index) => {
    if (typeof item === "string") {
      return {
        id: item,
        productId: `unknown-${index}`, // Updated from templateId
        variantId: "unknown", // Updated from sizeVariantId
        quantity: 1,
      };
    }
    return item;
  });
};

// Helper function to get product name - Updated to use correct field
const getProductName = (item: OrderItem): string => {
  return item.template?.name || `Product ${item.productId}`;
};

// Helper function to format company address
const formatCompanyAddress = (address: CompanyAddress): string => {
  const parts = [
    address.street,
    address.street2,
    address.city,
    address.state,
    address.country,
    address.postalCode,
  ].filter(Boolean);

  return parts.join(", ");
};

// Helper function to format customer address
const formatCustomerAddress = (address: AddressResponse): string => {
  if (!address) return "";

  // Use formattedAddress if available
  if (address.formattedAddress) {
    return address.formattedAddress;
  }

  // Construct from parts
  const parts = [
    address.street,
    address.street2,
    address.city,
    address.state,
    address.country,
    address.postalCode,
  ].filter(Boolean);

  return parts.join(", ");
};

// Helper function to format customer info for billing section
const formatCustomerInfo = (address: AddressResponse): string[] => {
  const parts = [];

  if (address.recipientName) {
    parts.push(address.recipientName);
  }

  if (address.companyName) {
    parts.push(address.companyName);
  }

  parts.push(formatCustomerAddress(address));

  if (address.phone) {
    parts.push(`Phone: ${address.phone}`);
  }

  if (address.email) {
    parts.push(`Email: ${address.email}`);
  }

  return parts;
};

export default function OrderInvoice({
  order,
  companyInfo = DEFAULT_COMPANY_INFO,
  showActions = true,
  onDownload,
  onPrint,
  onEmail,
}: InvoiceComponentProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Extract order items safely
  const orderItems = useMemo(
    () => extractOrderItems(order.orderItems),
    [order.orderItems]
  );

  // Get payment status configuration
  const getPaymentStatus = (): PaymentStatusConfig => {
    if (order.payment?.status) {
      return (
        PAYMENT_STATUS_CONFIG[order.payment.status] ||
        PAYMENT_STATUS_CONFIG.PENDING
      );
    }

    // Derive status from order status
    if (order.status === "PAYMENT_CONFIRMED") {
      return PAYMENT_STATUS_CONFIG.SUCCESS;
    } else if (order.status === "PAYMENT_PENDING") {
      return PAYMENT_STATUS_CONFIG.PENDING;
    } else if (order.status === "CANCELLED") {
      return PAYMENT_STATUS_CONFIG.CANCELLED;
    }

    return PAYMENT_STATUS_CONFIG.PENDING;
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download implementation
      window.print();
    }
  };

  const handleEmail = () => {
    if (onEmail) {
      onEmail();
    } else {
      // Default email implementation
      const subject = `Invoice ${order.orderNumber}`;
      const body = `Please find attached the invoice for order ${order.orderNumber}.`;
      window.open(
        `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      );
    }
  };

  const paymentStatus = getPaymentStatus();
  const PaymentIcon = paymentStatus.icon;
  const dueDate = order.expectedDelivery
    ? new Date(order.expectedDelivery)
    : new Date(new Date(order.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from creation

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Action Bar */}
      {showActions && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Invoice {order.orderNumber}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Generated on {format(new Date(), "MMMM dd, yyyy")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Content */}
      <Card>
        <CardContent className="p-8" ref={invoiceRef}>
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-start gap-4">
              {companyInfo.logo && (
                <img
                  src={companyInfo.logo}
                  alt={companyInfo.name}
                  className="w-16 h-16 object-contain"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{companyInfo.name}</h1>
                <div className="text-sm text-muted-foreground mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>{formatCompanyAddress(companyInfo.address)}</span>
                  </div>
                  {companyInfo.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>{companyInfo.phone}</span>
                    </div>
                  )}
                  {companyInfo.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span>{companyInfo.email}</span>
                    </div>
                  )}
                  {companyInfo.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-3 w-3" />
                      <span>{companyInfo.website}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <h2 className="text-3xl font-bold text-primary">INVOICE</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div>
                  <span className="font-medium">Invoice #:</span>{" "}
                  {order.orderNumber}
                </div>
                <div>
                  <span className="font-medium">Date:</span>{" "}
                  {format(new Date(order.createdAt), "MMM dd, yyyy")}
                </div>
                <div>
                  <span className="font-medium">Due Date:</span>{" "}
                  {format(dueDate, "MMM dd, yyyy")}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <Badge className={paymentStatus.color} variant="outline">
                    <PaymentIcon className="h-3 w-3 mr-1" />
                    {paymentStatus.label}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Bill To
              </h3>
              <div className="space-y-1 text-sm">
                {order.billingAddress ? (
                  formatCustomerInfo(order.billingAddress).map(
                    (line, index) => (
                      <div
                        key={index}
                        className={index === 0 ? "font-medium" : ""}
                      >
                        {line}
                      </div>
                    )
                  )
                ) : (
                  <>
                    <div className="font-medium">
                      {order.customerId
                        ? `Customer ID: ${order.customerId}`
                        : "Guest Customer"}
                    </div>
                    {order.shippingAddress &&
                      formatCustomerInfo(order.shippingAddress).map(
                        (line, index) => <div key={index}>{line}</div>
                      )}
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Ship To
              </h3>
              <div className="space-y-1 text-sm">
                {order.shippingAddress ? (
                  formatCustomerInfo(order.shippingAddress).map(
                    (line, index) => (
                      <div
                        key={index}
                        className={index === 0 ? "font-medium" : ""}
                      >
                        {line}
                      </div>
                    )
                  )
                ) : (
                  <div className="text-muted-foreground">
                    No shipping address provided
                  </div>
                )}
                {order.specialInstructions && (
                  <div className="text-muted-foreground italic mt-2">
                    Special Instructions: {order.specialInstructions}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Order Details
            </h3>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.length > 0 ? (
                    orderItems.map((item, index) => {
                      const unitPrice = item.sizeVariant?.price || 0;
                      const total = unitPrice * item.quantity;

                      return (
                        <TableRow key={item.id || index}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                Item #{index + 1}
                              </div>
                              {item.customizations &&
                                Array.isArray(item.customizations) &&
                                item.customizations.length > 0 && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {item.customizations.length}{" "}
                                    customization(s)
                                  </div>
                                )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {getProductName(item)}
                              </div>
                              {item.template?.slug && (
                                <div className="text-xs text-muted-foreground">
                                  {item.template.slug}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>
                                {item.sizeVariant?.displayName ||
                                  item.variantId}
                              </div>
                              {item.sizeVariant?.dimensions && (
                                <div className="text-xs text-muted-foreground">
                                  {item.sizeVariant.dimensions.width}
                                  {item.sizeVariant.dimensions.unit} ×{" "}
                                  {item.sizeVariant.dimensions.height}
                                  {item.sizeVariant.dimensions.unit}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(unitPrice)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(total)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No items found in this order
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end mb-8">
            <div className="w-full max-w-md space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotalAmount)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatCurrency(order.taxAmount)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>
                  {order.shippingAmount > 0
                    ? formatCurrency(order.shippingAmount)
                    : "Free"}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Method:</span>{" "}
                  {order.payment?.method || "MPESA"}
                </div>
                {order.payment?.transactionId && (
                  <div>
                    <span className="font-medium">Transaction ID:</span>{" "}
                    {order.payment.transactionId}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <Badge className={paymentStatus.color} variant="outline">
                    <PaymentIcon className="h-3 w-3 mr-1" />
                    {paymentStatus.label}
                  </Badge>
                </div>
                {order.payment?.amount && (
                  <div>
                    <span className="font-medium">Amount Paid:</span>{" "}
                    {formatCurrency(order.payment.amount)}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Order Date:</span>{" "}
                  {format(new Date(order.createdAt), "MMM dd, yyyy")}
                </div>
                {order.expectedDelivery && (
                  <div>
                    <span className="font-medium">Expected Delivery:</span>{" "}
                    {format(new Date(order.expectedDelivery), "MMM dd, yyyy")}
                  </div>
                )}
                {order.urgencyLevel && order.urgencyLevel !== "NORMAL" && (
                  <div>
                    <span className="font-medium">Priority:</span>
                    <Badge variant="outline" className="ml-2">
                      {order.urgencyLevel}
                    </Badge>
                  </div>
                )}
                {order.trackingNumber && (
                  <div>
                    <span className="font-medium">Tracking:</span>{" "}
                    {order.trackingNumber}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {order.notes && (
            <div className="mb-8">
              <h3 className="font-semibold mb-3">Notes</h3>
              <div className="p-4 bg-muted rounded-lg text-sm">
                {order.notes}
              </div>
            </div>
          )}

          {/* Terms and Footer */}
          <div className="border-t pt-6 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Terms & Conditions</h3>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Payment is due within 30 days of invoice date.</p>
                <p>• Late payments may incur additional charges.</p>
                <p>• All sales are final unless otherwise agreed upon.</p>
                <p>
                  • Custom printed items are non-returnable unless defective.
                </p>
              </div>
            </div>

            {companyInfo.taxId && (
              <div className="text-xs text-muted-foreground">
                Tax ID: {companyInfo.taxId} | Registration:{" "}
                {companyInfo.registrationNumber}
              </div>
            )}

            <div className="text-center text-xs text-muted-foreground">
              Thank you for your business!
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Status Alert */}
      {paymentStatus.label === "Pending" && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Payment Pending:</strong> This invoice is awaiting payment.
            Please complete your payment to proceed with production.
          </AlertDescription>
        </Alert>
      )}

      {paymentStatus.label === "Failed" && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Payment Failed:</strong> There was an issue processing your
            payment. Please contact our support team or try again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
