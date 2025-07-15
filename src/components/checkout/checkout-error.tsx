/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Clock,
  WifiOff,
  ShoppingCart,
  CreditCard,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckoutErrorProps {
  error?: string | Error;
  errorType?:
    | "session"
    | "network"
    | "payment"
    | "validation"
    | "address"
    | "general";
  onRetry?: () => void;
  showBackToCart?: boolean;
  showRetry?: boolean;
  className?: string;
}

const ERROR_CONFIGS = {
  session: {
    icon: Clock,
    title: "Session Expired",
    defaultMessage:
      "Your checkout session has expired. Please start over from your cart.",
    actions: ["backToCart"],
    variant: "destructive" as const,
  },
  network: {
    icon: WifiOff,
    title: "Connection Problem",
    defaultMessage:
      "Unable to connect to our servers. Please check your internet connection and try again.",
    actions: ["retry", "backToCart"],
    variant: "destructive" as const,
  },
  payment: {
    icon: CreditCard,
    title: "Payment Error",
    defaultMessage:
      "There was an issue processing your payment. Please try a different payment method.",
    actions: ["retry", "backToCart"],
    variant: "destructive" as const,
  },
  validation: {
    icon: AlertTriangle,
    title: "Validation Error",
    defaultMessage:
      "Please review and correct the highlighted fields before continuing.",
    actions: ["retry"],
    variant: "default" as const,
  },
  address: {
    icon: MapPin,
    title: "Address Issue",
    defaultMessage:
      "There's an issue with the selected address. Please verify or choose a different address.",
    actions: ["retry"],
    variant: "default" as const,
  },
  general: {
    icon: AlertTriangle,
    title: "Something Went Wrong",
    defaultMessage:
      "An unexpected error occurred. Please try again or contact support if the problem persists.",
    actions: ["retry", "backToCart"],
    variant: "destructive" as const,
  },
};

export function CheckoutError({
  error,
  errorType = "general",
  onRetry,
  showBackToCart = true,
  showRetry = true,
  className,
}: CheckoutErrorProps) {
  const router = useRouter();
  const config = ERROR_CONFIGS[errorType];
  const Icon = config.icon;

  // Helper function to extract error message
  const getErrorMessage = (error: string | Error | undefined): string => {
    if (!error) return config.defaultMessage;
    if (typeof error === "string") return error;
    return error.message || config.defaultMessage;
  };

  const handleBackToCart = () => {
    router.push("/dashboard/customer/cart");
  };

  const handleContactSupport = () => {
    // Implement contact support logic
    // This could open a chat widget, redirect to support page, etc.
    router.push("/support");
  };

  const displayMessage = getErrorMessage(error);
  const errorDetails = error instanceof Error ? error.stack : error;

  return (
    <Card className={cn("max-w-2xl mx-auto", className)}>
      <CardHeader>
        <CardTitle
          className={cn(
            "flex items-center gap-2",
            config.variant === "destructive"
              ? "text-destructive"
              : "text-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
          {config.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant={config.variant}>
          <AlertDescription className="text-sm">
            {displayMessage}
          </AlertDescription>
        </Alert>

        {/* Error-specific guidance */}
        {errorType === "session" && (
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Don&apos;t worry! Your cart items are still saved. You can:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Return to your cart and start checkout again</li>
              <li>Your items will be preserved for 24 hours</li>
            </ul>
          </div>
        )}

        {errorType === "network" && (
          <div className="text-sm text-muted-foreground space-y-2">
            <p>To resolve this issue:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Check your internet connection</li>
              <li>Try refreshing the page</li>
              <li>Disable any ad blockers temporarily</li>
            </ul>
          </div>
        )}

        {errorType === "payment" && (
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Payment issues can be caused by:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Insufficient funds</li>
              <li>Card restrictions or blocks</li>
              <li>Network connectivity issues</li>
              <li>Incorrect payment details</li>
            </ul>
          </div>
        )}

        {errorType === "validation" && (
          <div className="text-sm text-muted-foreground">
            <p>Please check all required fields and ensure:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>All required information is provided</li>
              <li>Email addresses are in the correct format</li>
              <li>Phone numbers include country codes</li>
              <li>Addresses are complete and accurate</li>
            </ul>
          </div>
        )}

        {errorType === "address" && (
          <div className="text-sm text-muted-foreground">
            <p>Address verification failed. Please ensure:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>The address is complete and accurate</li>
              <li>Postal codes match the selected country</li>
              <li>The address is within our delivery area</li>
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {config.actions.includes("retry") && showRetry && onRetry && (
            <Button
              onClick={onRetry}
              variant="default"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}

          {config.actions.includes("backToCart") && showBackToCart && (
            <Button
              onClick={handleBackToCart}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Button>
          )}
        </div>

        {/* Additional support options */}
        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground text-center">
            Need help?
            <Button
              variant="link"
              className="p-0 ml-1 h-auto font-normal"
              onClick={handleContactSupport}
            >
              Contact our support team
            </Button>
          </div>
        </div>

        {/* Error details for debugging (only in development) */}
        {process.env.NODE_ENV === "development" && errorDetails && (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer">Technical Details</summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
              {errorDetails}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

// Specialized error components for common scenarios
export function SessionExpiredError({ onRetry }: { onRetry?: () => void }) {
  return (
    <CheckoutError
      errorType="session"
      onRetry={onRetry}
      showRetry={false}
      showBackToCart={true}
    />
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <CheckoutError
      errorType="network"
      onRetry={onRetry}
      showRetry={true}
      showBackToCart={true}
    />
  );
}

export function PaymentError({
  error,
  onRetry,
}: {
  error?: string | Error;
  onRetry?: () => void;
}) {
  return (
    <CheckoutError
      errorType="payment"
      error={error}
      onRetry={onRetry}
      showRetry={true}
      showBackToCart={true}
    />
  );
}

export function ValidationError({
  error,
  onRetry,
}: {
  error?: string | Error;
  onRetry?: () => void;
}) {
  return (
    <CheckoutError
      errorType="validation"
      error={error}
      onRetry={onRetry}
      showRetry={true}
      showBackToCart={false}
    />
  );
}
