"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  XCircle,
  RefreshCw,
  ArrowLeft,
  Phone,
  Mail,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";

export default function CheckoutFailedPage() {
  const router = useRouter();
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    // Get error details from URL params or session storage
    const urlParams = new URLSearchParams(window.location.search);
    const error =
      urlParams.get("error") || sessionStorage.getItem("checkoutError");
    setErrorDetails(error);
  }, []);

  const handleRetryCheckout = () => {
    // Clear any error state and retry checkout
    sessionStorage.removeItem("checkoutError");
    router.push("/checkout/payment");
  };

  const handleReturnToCart = () => {
    router.push("/cart");
  };

  const handleStartOver = () => {
    // Clear all checkout data and start fresh
    sessionStorage.removeItem("guestCheckout");
    sessionStorage.removeItem("checkoutData");
    sessionStorage.removeItem("checkoutError");
    router.push("/checkout");
  };

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "payment_failed":
        return {
          title: "Payment Failed",
          description:
            "Your payment could not be processed. This might be due to insufficient funds, network issues, or an invalid payment method.",
          suggestions: [
            "Check your account balance or payment method",
            "Ensure you have a stable internet connection",
            "Try a different payment method",
            "Contact your bank if the issue persists",
          ],
        };
      case "order_creation_failed":
        return {
          title: "Order Creation Failed",
          description:
            "We couldn't create your order due to a technical issue. Your payment has not been processed.",
          suggestions: [
            "Check if all required information was provided",
            "Verify your shipping address is complete and valid",
            "Try refreshing the page and starting over",
            "Contact support if the problem continues",
          ],
        };
      case "shipping_calculation_failed":
        return {
          title: "Shipping Error",
          description:
            "We couldn't calculate shipping for your address. Please verify your shipping information.",
          suggestions: [
            "Double-check your shipping address",
            "Ensure your postal code is correct",
            "Try a different shipping address",
            "Contact support for shipping options",
          ],
        };
      case "inventory_unavailable":
        return {
          title: "Items Unavailable",
          description:
            "Some items in your cart are no longer available or have insufficient stock.",
          suggestions: [
            "Review your cart for availability",
            "Remove unavailable items and try again",
            "Check for similar products",
            "Contact support for restock information",
          ],
        };
      default:
        return {
          title: "Checkout Failed",
          description:
            "Something went wrong during checkout. Don't worry, no payment has been processed.",
          suggestions: [
            "Try refreshing the page and starting over",
            "Check your internet connection",
            "Clear your browser cache and cookies",
            "Contact our support team for assistance",
          ],
        };
    }
  };

  const errorInfo = getErrorMessage(errorDetails);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Error Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {errorInfo.title}
          </h1>
          <p className="text-gray-600">{errorInfo.description}</p>
        </div>

        <div className="space-y-6">
          {/* Error Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                What Happened?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{errorInfo.description}</p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-800 mb-2">
                  Don&apos;t worry - no payment has been charged to your
                  account.
                </p>
                <p className="text-sm text-yellow-700">
                  You can safely retry your order or contact our support team
                  for assistance.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle>How to Fix This</CardTitle>
              <CardDescription>
                Try these solutions to complete your order:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {errorInfo.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-600">{suggestion}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>What Would You Like to Do?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Button
                  onClick={handleRetryCheckout}
                  className="w-full"
                  size="lg"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Payment Again
                </Button>

                <Button
                  onClick={handleReturnToCart}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Cart
                </Button>

                <Button
                  onClick={handleStartOver}
                  variant="outline"
                  className="w-full"
                >
                  Start Checkout Over
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Common Solutions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Fixes</CardTitle>
              <CardDescription>
                Common solutions that often resolve checkout issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-sm mb-1">
                    Check Your Internet Connection
                  </h4>
                  <p className="text-xs text-gray-600">
                    Ensure you have a stable internet connection and try
                    refreshing the page.
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-sm mb-1">
                    Clear Browser Data
                  </h4>
                  <p className="text-xs text-gray-600">
                    Clear your browser&apos;s cache and cookies, then try the
                    checkout process again.
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-sm mb-1">
                    Try a Different Browser
                  </h4>
                  <p className="text-xs text-gray-600">
                    Sometimes switching to a different browser or device can
                    resolve the issue.
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-sm mb-1">
                    Disable Browser Extensions
                  </h4>
                  <p className="text-xs text-gray-600">
                    Ad blockers or other extensions might interfere with the
                    checkout process.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Information */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>
                Our support team is here to assist you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-sm">Call Us</p>
                    <p className="text-sm text-gray-600">+254 700 000 000</p>
                    <p className="text-xs text-gray-500">
                      Monday - Friday: 8AM - 6PM EAT
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-sm">Email Support</p>
                    <p className="text-sm text-gray-600">
                      support@yourstore.com
                    </p>
                    <p className="text-xs text-gray-500">
                      We&apos;ll respond within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-sm">Live Chat</p>
                    <p className="text-sm text-gray-600">Available 24/7</p>
                    <Button size="sm" className="mt-2">
                      Start Chat
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> When contacting support, please mention
                  the error type and any steps you&apos;ve already tried. This
                  helps us resolve your issue faster.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-1">
                    Will I be charged if checkout fails?
                  </h4>
                  <p className="text-xs text-gray-600">
                    No, payment is only processed after successful order
                    creation. If checkout fails, no charges are made.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">
                    Can I save my cart and try again later?
                  </h4>
                  <p className="text-xs text-gray-600">
                    Yes, your cart items are automatically saved. You can return
                    later to complete your purchase.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">
                    What if my payment method isn&apos;t working?
                  </h4>
                  <p className="text-xs text-gray-600">
                    Try a different payment method or contact your bank. You can
                    also contact our support for alternative payment options.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">
                    How long do I have to complete my order?
                  </h4>
                  <p className="text-xs text-gray-600">
                    Cart items are held for 24 hours. After that, items may
                    become unavailable due to stock changes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back to Shopping */}
          <div className="text-center pt-6">
            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              className="text-gray-600"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
