"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Package,
  Clock,
  Mail,
  Phone,
  ArrowRight,
} from "lucide-react";
import { useOrder } from "@/hooks/use-orders";
import { usePaymentStatus } from "@/hooks/use-payments";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);

  const { data: order, isLoading: orderLoading } = useOrder(
    orderId!,
    !!orderId
  );
  const { data: paymentStatus, isLoading: paymentLoading } = usePaymentStatus(
    orderId!,
    !!orderId
  );

  useEffect(() => {
    // Get order ID from session storage
    const storedOrderId = sessionStorage.getItem("completedOrderId");
    if (storedOrderId) {
      setOrderId(storedOrderId);
    } else {
      // Redirect to home if no order ID found
      router.push("/");
    }
  }, [router]);

  if (orderLoading || paymentLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <Button onClick={() => router.push("/")}>Return Home</Button>
        </div>
      </div>
    );
  }

  const isPaymentPending = paymentStatus?.paymentStatus === "PENDING";
  const isPaymentSuccess = paymentStatus?.paymentStatus === "SUCCESS";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isPaymentSuccess ? "Order Confirmed!" : "Order Received!"}
          </h1>
          <p className="text-gray-600">
            {isPaymentSuccess
              ? "Thank you for your purchase. Your order has been confirmed."
              : isPaymentPending
                ? "Your order is being processed. Complete payment to confirm your order."
                : "Your order has been received and is being processed."}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Details
                </CardTitle>
                <CardDescription>Order #{order.orderNumber}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Order Number
                    </p>
                    <p className="text-sm text-gray-600">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Order Date
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Order Status
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      {order.status.toLowerCase().replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Total Amount
                    </p>
                    <p className="text-sm text-gray-600">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isPaymentSuccess
                        ? "bg-green-500"
                        : isPaymentPending
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                    }`}
                  ></div>
                  <div>
                    <p className="font-medium">
                      {isPaymentSuccess
                        ? "Payment Confirmed"
                        : isPaymentPending
                          ? "Payment Pending"
                          : "Payment Processing"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {isPaymentSuccess
                        ? "Your payment has been successfully processed."
                        : isPaymentPending
                          ? "Please complete your M-Pesa payment to confirm your order."
                          : "Your payment is being processed."}
                    </p>
                  </div>
                </div>

                {isPaymentPending && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Complete Your Payment:</strong> Check your phone
                      for the M-Pesa payment prompt. Enter your M-Pesa PIN to
                      complete the transaction.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Delivery Address</h4>
                    <div className="text-sm text-gray-600">
                      <p>{order.shippingAddress.recipientName}</p>
                      <p>{order.shippingAddress.street}</p>
                      {order.shippingAddress.street2 && (
                        <p>{order.shippingAddress.street2}</p>
                      )}
                      <p>
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state}{" "}
                        {order.shippingAddress.postalCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>

                  {order.expectedDelivery && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Estimated Delivery
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(order.expectedDelivery).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>What&apos;s Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!isPaymentSuccess && isPaymentPending && (
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Complete Your Payment</p>
                        <p className="text-sm text-gray-600">
                          Check your phone for the M-Pesa payment prompt and
                          enter your PIN.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {isPaymentSuccess ? "1" : "2"}
                    </div>
                    <div>
                      <p className="font-medium">Order Confirmation</p>
                      <p className="text-sm text-gray-600">
                        You&apos;ll receive an email confirmation with your
                        order details.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {isPaymentSuccess ? "2" : "3"}
                    </div>
                    <div>
                      <p className="font-medium">Design & Production</p>
                      <p className="text-sm text-gray-600">
                        Our team will start working on your custom design and
                        production.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {isPaymentSuccess ? "3" : "4"}
                    </div>
                    <div>
                      <p className="font-medium">Shipping & Delivery</p>
                      <p className="text-sm text-gray-600">
                        We&apos;ll send you tracking information once your order
                        ships.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Actions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{formatCurrency(order.shippingAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatCurrency(order.taxAmount)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(order.discountAmount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Link href={`/orders/`}>
                    <Button className="w-full" variant="outline">
                      View Order Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>

                  <Button className="w-full" onClick={() => router.push("/")}>
                    Continue Shopping
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-gray-600" />
                    <p className="text-sm font-medium">Need Help?</p>
                  </div>
                  <p className="text-xs text-gray-600">
                    Contact our support team if you have any questions about
                    your order.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Phone className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-500">
                      +254 700 000 000
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
