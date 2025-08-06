/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOrderConfirmation } from "@/hooks/use-checkout";
import { OrderConfirmation } from "@/lib/checkout/types/checkout.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  Package,
  Truck,
  Clock,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Star,
  AlertTriangle,
  Info,
  Download,
  Share,
  Copy,
  ExternalLink,
  ArrowRight,
  Home,
  ShoppingCart,
  Receipt,
  Calendar,
  Building,
  Globe,
  Shield,
  Zap,
  Timer,
  User,
  Eye,
  FileText,
  Heart,
  Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Label } from "recharts";

interface OrderConfirmationProps {
  orderId: string;
  isGuest?: boolean;
  showShareOptions?: boolean;
  showDownloadReceipt?: boolean;
  returnUrl?: string;
  className?: string;
}

const ORDER_STATUS_CONFIG = {
  PENDING: {
    icon: Clock,
    label: "Order Received",
    description: "Your order is being processed",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  CONFIRMED: {
    icon: CheckCircle,
    label: "Order Confirmed",
    description: "Your order has been confirmed",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  PROCESSING: {
    icon: Package,
    label: "Processing",
    description: "Your order is being prepared",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  SHIPPED: {
    icon: Truck,
    label: "Shipped",
    description: "Your order is on its way",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
};

const PAYMENT_STATUS_CONFIG = {
  PENDING: {
    icon: Clock,
    label: "Payment Pending",
    description: "Awaiting payment confirmation",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  COMPLETED: {
    icon: CheckCircle,
    label: "Payment Completed",
    description: "Payment successfully processed",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  FAILED: {
    icon: AlertTriangle,
    label: "Payment Failed",
    description: "Payment was not successful",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
};

export function OrderConfirmationComponent({
  orderId,
  isGuest = false,
  showShareOptions = true,
  showDownloadReceipt = true,
  returnUrl,
  className,
}: OrderConfirmationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [showDetails, setShowDetails] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Hooks
  const {
    data: orderData,
    isLoading,
    error,
    refetch,
  } = useOrderConfirmation(orderId, !!orderId);

  // Auto-refresh every 30 seconds for payment updates
  useEffect(() => {
    if (orderData?.paymentStatus === "PENDING") {
      const interval = setInterval(() => {
        refetch();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [orderData?.paymentStatus, refetch]);

  const handleCopyOrderNumber = () => {
    if (orderData?.orderNumber) {
      navigator.clipboard.writeText(orderData.orderNumber);
      toast.success("Order number copied to clipboard");
    }
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    toast.success("Order ID copied to clipboard");
  };

  const handleShareOrder = async () => {
    setIsSharing(true);

    try {
      const shareData = {
        title: `Order ${orderData?.orderNumber || orderId}`,
        text: `I just placed an order for ${orderData?.totalAmount ? `KES ${orderData.totalAmount.toLocaleString()}` : "my items"}!`,
        url: window.location.href,
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Order link copied to clipboard");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error("Failed to share order");
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownloadReceipt = () => {
    // This would integrate with your receipt generation system
    toast.info("Receipt download will be available shortly");
  };

  const getDefaultReturnUrl = () => {
    if (returnUrl) return returnUrl;
    return isGuest ? "/" : "/dashboard/customer/orders";
  };

  const formatAddress = (address: any) => {
    if (!address) return "";
    return `${address.recipientName}\n${address.formattedAddress}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <div>
            <h1 className="text-2xl font-bold">Loading Order Details...</h1>
            <p className="text-muted-foreground">
              Please wait while we fetch your order information
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !orderData) {
    return (
      <div className={cn("max-w-4xl mx-auto", className)}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
              <div>
                <h2 className="text-xl font-bold">Order Not Found</h2>
                <p className="text-muted-foreground mt-1">
                  We couldn&apos;t find an order with ID: {orderId}
                </p>
              </div>
              <div className="flex justify-center gap-2">
                <Button onClick={() => refetch()} variant="outline">
                  Try Again
                </Button>
                <Button onClick={() => router.push(getDefaultReturnUrl())}>
                  {isGuest ? "Continue Shopping" : "View Orders"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig =
    ORDER_STATUS_CONFIG[orderData.status as keyof typeof ORDER_STATUS_CONFIG] ||
    ORDER_STATUS_CONFIG.PENDING;
  const paymentConfig =
    PAYMENT_STATUS_CONFIG[
      orderData.paymentStatus as keyof typeof PAYMENT_STATUS_CONFIG
    ] || PAYMENT_STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;
  const PaymentIcon = paymentConfig.icon;

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      {/* Success Header */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-green-800">
                Order Confirmed!
              </h1>
              <p className="text-green-700 mt-2">
                Thank you for your order. We&apos;ve received your request and
                will start processing it shortly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                <span className="font-medium">
                  Order #{orderData.orderNumber}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyOrderNumber}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(orderData.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn("text-xs", statusConfig.color)}
                >
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Status */}
      <Card
        className={cn(
          paymentConfig.bgColor,
          "border-2",
          paymentConfig.color === "text-yellow-600"
            ? "border-yellow-200"
            : paymentConfig.color === "text-green-600"
              ? "border-green-200"
              : "border-red-200"
        )}
      >
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <PaymentIcon className={cn("h-5 w-5", paymentConfig.color)} />
            <div className="flex-1">
              <div className={cn("font-medium", paymentConfig.color)}>
                {paymentConfig.label}
              </div>
              <div className={cn("text-sm", paymentConfig.color, "opacity-80")}>
                {paymentConfig.description}
              </div>
            </div>
            {orderData.paymentStatus === "PENDING" && (
              <Badge variant="outline" className="text-xs">
                <Timer className="h-3 w-3 mr-1" />
                Auto-refresh
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items ({orderData.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orderData.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 border rounded-lg"
                  >
                    <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center flex-shrink-0">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="flex-1">
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </div>

                      {/* Customizations */}
                      {item.customizations.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.customizations
                            .slice(0, 3)
                            .map((custom, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs"
                              >
                                {custom}
                              </Badge>
                            ))}
                          {item.customizations.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.customizations.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          {orderData.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      DELIVERY ADDRESS
                    </Label>
                    <div className="mt-2 p-3 bg-muted/30 rounded-lg">
                      <div className="whitespace-pre-line text-sm">
                        {formatAddress(orderData.shippingAddress)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      ESTIMATED DELIVERY
                    </Label>
                    <div className="mt-2 p-3 bg-muted/30 rounded-lg">
                      <div className="text-sm">
                        {orderData.estimatedDelivery || "To be determined"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          {orderData.nextSteps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5" />
                  What Happens Next
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orderData.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium mt-0.5 flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Totals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-2xl font-bold text-center">
                KES {orderData.totalAmount.toLocaleString()}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant="outline" className={statusConfig.color}>
                    {statusConfig.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <Badge variant="outline" className={paymentConfig.color}>
                    {paymentConfig.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>{orderData.items.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {showDownloadReceipt && (
                <Button
                  onClick={handleDownloadReceipt}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </Button>
              )}

              {showShareOptions && (
                <Button
                  onClick={handleShareOrder}
                  variant="outline"
                  className="w-full"
                  disabled={isSharing}
                >
                  <Share className="mr-2 h-4 w-4" />
                  {isSharing ? "Sharing..." : "Share Order"}
                </Button>
              )}

              <Button
                onClick={() => handleCopyOrderId()}
                variant="outline"
                className="w-full"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Order ID
              </Button>

              <Separator />

              <Button
                onClick={() => router.push(getDefaultReturnUrl())}
                className="w-full"
              >
                {isGuest ? (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View All Orders
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Support Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Questions about your order? We&apos;re here to help.
              </div>

              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  support@company.com
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  +254-700-000-000
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Security Notice */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-800">Your Order is Secure</p>
              <p className="text-green-700 mt-1">
                This order confirmation and all your data are protected with
                industry-standard encryption. Keep your order number safe for
                future reference.
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-green-600">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>Data Protected</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span>Instant Updates</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Information (Development Only) */}
      {process.env.NODE_ENV === "development" && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium">
            Debug Information
          </summary>
          <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto">
            {JSON.stringify(orderData, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
