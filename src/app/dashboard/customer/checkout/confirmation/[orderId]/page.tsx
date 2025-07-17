/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useOrderConfirmation } from "@/hooks/use-checkout";
import { usePaymentStatus } from "@/hooks/use-payments";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Package,
  Truck,
  Eye,
  Download,
  Share,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Smartphone,
  Building2,
} from "lucide-react";

interface OrderConfirmationPageProps {
  orderId: string;
}

const PAYMENT_STATUS_CONFIG = {
  PENDING: {
    icon: Clock,
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  PROCESSING: {
    icon: RefreshCw,
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  COMPLETED: {
    icon: CheckCircle,
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  FAILED: {
    icon: AlertCircle,
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  CANCELLED: {
    icon: AlertCircle,
    color: "bg-gray-500",
    textColor: "text-gray-700",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
};

const PAYMENT_METHOD_ICONS = {
  MPESA: Smartphone,
  BANK_TRANSFER: Building2,
  CARD: CreditCard,
};

export function OrderConfirmationPage({ orderId }: OrderConfirmationPageProps) {
  const router = useRouter();
  const [showPaymentPolling, setShowPaymentPolling] = useState(false);

  const {
    data: orderData,
    isLoading: orderLoading,
    error: orderError,
  } = useOrderConfirmation(orderId);

  const {
    data: paymentData,
    isLoading: paymentLoading,
    refetch: refetchPayment,
  } = usePaymentStatus(orderId, !!orderData);

  useEffect(() => {
    // Show payment polling for pending payments
    if (
      paymentData?.status === "PENDING" ||
      paymentData?.status === "PROCESSING"
    ) {
      setShowPaymentPolling(true);
    } else if (paymentData?.status === "COMPLETED") {
      setShowPaymentPolling(false);
    }
  }, [paymentData?.status]);

  const handleContinueShopping = () => {
    router.push("/dashboard/customer/products");
  };

  const handleViewOrders = () => {
    router.push("/dashboard/customer/orders");
  };

  const handleDownloadReceipt = () => {
    // Implementation for downloading receipt
    console.log("Download receipt for order:", orderId);
  };

  const handleShareOrder = () => {
    // Implementation for sharing order
    if (navigator.share) {
      navigator.share({
        title: `Order ${orderData?.orderNumber}`,
        text: `My order confirmation for order ${orderData?.orderNumber}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (orderLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (orderError || !orderData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <h2 className="text-xl font-semibold">Order Not Found</h2>
              <p className="text-muted-foreground">
                We couldn&apos;t find the order you&apos;re looking for. Please
                check the order ID and try again.
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
                <Button onClick={handleViewOrders}>View My Orders</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const paymentStatusConfig = paymentData?.status
    ? PAYMENT_STATUS_CONFIG[
        paymentData.status as keyof typeof PAYMENT_STATUS_CONFIG
      ]
    : PAYMENT_STATUS_CONFIG.PENDING;

  const PaymentIcon = paymentStatusConfig.icon;
  const PaymentMethodIcon =
    PAYMENT_METHOD_ICONS[
      paymentData?.method as keyof typeof PAYMENT_METHOD_ICONS
    ] || CreditCard;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Success Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-700">
                  Order Confirmed!
                </h1>
                <p className="text-muted-foreground">
                  Thank you for your order. We&apos;ve received your request and
                  will process it shortly.
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 text-sm">
                <Badge variant="outline" className="px-3 py-1">
                  Order #{orderData.orderNumber}
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  {new Date(orderData.createdAt).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        {paymentData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`p-4 rounded-lg ${paymentStatusConfig.bgColor} ${paymentStatusConfig.borderColor} border`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full ${paymentStatusConfig.color} flex items-center justify-center`}
                    >
                      <PaymentIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div
                        className={`font-medium ${paymentStatusConfig.textColor}`}
                      >
                        {paymentData.status === "PENDING" && "Payment Pending"}
                        {paymentData.status === "PROCESSING" &&
                          "Processing Payment"}
                        {paymentData.status === "COMPLETED" &&
                          "Payment Completed"}
                        {paymentData.status === "FAILED" && "Payment Failed"}
                        {paymentData.status === "CANCELLED" &&
                          "Payment Cancelled"}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <PaymentMethodIcon className="h-4 w-4" />
                        {paymentData.method} • KES{" "}
                        {paymentData.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {showPaymentPolling && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refetchPayment()}
                      disabled={paymentLoading}
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${paymentLoading ? "animate-spin" : ""}`}
                      />
                    </Button>
                  )}
                </div>

                {/* Payment Instructions */}
                {paymentData.status === "PENDING" &&
                  paymentData.method === "MPESA" && (
                    <Alert className="mt-4">
                      <Smartphone className="h-4 w-4" />
                      <AlertDescription>
                        Please check your phone for the M-Pesa prompt and enter
                        your PIN to complete the payment.
                      </AlertDescription>
                    </Alert>
                  )}

                {paymentData.status === "PENDING" &&
                  paymentData.method === "BANK_TRANSFER" && (
                    <Alert className="mt-4">
                      <Building2 className="h-4 w-4" />
                      <AlertDescription>
                        Bank transfer details have been sent to your email.
                        Please complete the transfer to proceed with your order.
                      </AlertDescription>
                    </Alert>
                  )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Order Information</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Number:</span>
                    <span className="font-medium">{orderData.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-medium">
                      KES {orderData.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Estimated Delivery:
                    </span>
                    <span className="font-medium">
                      {orderData.estimatedDelivery}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Shipping Address</h4>
                <div className="text-sm text-muted-foreground">
                  <div className="font-medium text-foreground">
                    {orderData.shippingAddress.recipientName}
                  </div>
                  <div className="whitespace-pre-line">
                    {orderData.shippingAddress.formattedAddress}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">Items Ordered</h4>
              <div className="space-y-2">
                {orderData.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 border rounded"
                  >
                    <div>
                      <div className="font-medium text-sm">
                        {item.productName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Quantity: {item.quantity}
                        {item.customizations.length > 0 && (
                          <span> • {item.customizations.join(", ")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              What&apos;s Next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orderData.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleContinueShopping} className="flex-1">
            Continue Shopping
          </Button>

          <Button
            variant="outline"
            onClick={handleViewOrders}
            className="flex-1"
          >
            <Eye className="mr-2 h-4 w-4" />
            View My Orders
          </Button>

          <Button variant="outline" onClick={handleDownloadReceipt}>
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>

          <Button variant="outline" onClick={handleShareOrder}>
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>

        {/* Support Contact */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Need help with your order?{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  Contact our support team
                </Link>{" "}
                or call us at{" "}
                <a
                  href="tel:+254700000000"
                  className="text-primary hover:underline"
                >
                  +254 700 000 000
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
