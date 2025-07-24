/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Clock,
  WifiOff,
  ShoppingCart,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  ExternalLink,
  Info,
  CheckCircle,
  XCircle,
  Shield,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Home,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CheckoutErrorProps {
  error?: string | Error;
  errorType?:
    | "session"
    | "network"
    | "payment"
    | "validation"
    | "address"
    | "shipping"
    | "inventory"
    | "authentication"
    | "server"
    | "general";
  onRetry?: () => void;
  showBackToCart?: boolean;
  showRetry?: boolean;
  className?: string;
  sessionId?: string;
  orderTotal?: number;
  retryCount?: number;
  maxRetries?: number;
  autoRetry?: boolean;
  autoRetryDelay?: number;
  supportInfo?: {
    email?: string;
    phone?: string;
    chatUrl?: string;
    ticketUrl?: string;
  };
}

interface ErrorConfig {
  icon: React.ElementType;
  title: string;
  defaultMessage: string;
  actions: string[];
  variant: "default" | "destructive";
  color: string;
  bgColor: string;
  severity: "low" | "medium" | "high" | "critical";
  category: "user" | "system" | "external";
  recoverable: boolean;
}

const ERROR_CONFIGS: Record<string, ErrorConfig> = {
  session: {
    icon: Clock,
    title: "Session Expired",
    defaultMessage:
      "Your checkout session has expired. Your cart items are still saved and you can start over.",
    actions: ["backToCart", "startOver"],
    variant: "destructive",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    severity: "medium",
    category: "system",
    recoverable: true,
  },
  network: {
    icon: WifiOff,
    title: "Connection Problem",
    defaultMessage:
      "Unable to connect to our servers. Please check your internet connection and try again.",
    actions: ["retry", "backToCart", "contactSupport"],
    variant: "destructive",
    color: "text-red-600",
    bgColor: "bg-red-50",
    severity: "high",
    category: "external",
    recoverable: true,
  },
  payment: {
    icon: CreditCard,
    title: "Payment Error",
    defaultMessage:
      "There was an issue processing your payment. Please try a different payment method or contact support.",
    actions: ["retry", "changePayment", "contactSupport"],
    variant: "destructive",
    color: "text-red-600",
    bgColor: "bg-red-50",
    severity: "high",
    category: "external",
    recoverable: true,
  },
  validation: {
    icon: AlertTriangle,
    title: "Validation Error",
    defaultMessage:
      "Please review and correct the highlighted fields before continuing.",
    actions: ["retry"],
    variant: "default",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    severity: "low",
    category: "user",
    recoverable: true,
  },
  address: {
    icon: MapPin,
    title: "Address Issue",
    defaultMessage:
      "There's an issue with the selected address. Please verify or choose a different address.",
    actions: ["retry", "changeAddress"],
    variant: "default",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    severity: "medium",
    category: "user",
    recoverable: true,
  },
  shipping: {
    icon: MapPin,
    title: "Shipping Error",
    defaultMessage:
      "We couldn't calculate shipping for your location. Please verify your address or contact support.",
    actions: ["retry", "changeAddress", "contactSupport"],
    variant: "default",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    severity: "medium",
    category: "system",
    recoverable: true,
  },
  inventory: {
    icon: ShoppingCart,
    title: "Item Unavailable",
    defaultMessage:
      "Some items in your cart are no longer available. Please review your cart and try again.",
    actions: ["backToCart", "removeItems"],
    variant: "destructive",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    severity: "medium",
    category: "system",
    recoverable: true,
  },
  authentication: {
    icon: Shield,
    title: "Authentication Required",
    defaultMessage: "Please sign in to continue with your checkout.",
    actions: ["signIn", "continueAsGuest"],
    variant: "default",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    severity: "low",
    category: "user",
    recoverable: true,
  },
  server: {
    icon: AlertTriangle,
    title: "Server Error",
    defaultMessage:
      "Our servers are experiencing issues. Please try again in a few moments.",
    actions: ["retry", "backToCart", "contactSupport"],
    variant: "destructive",
    color: "text-red-600",
    bgColor: "bg-red-50",
    severity: "critical",
    category: "system",
    recoverable: true,
  },
  general: {
    icon: AlertTriangle,
    title: "Something Went Wrong",
    defaultMessage:
      "An unexpected error occurred. Please try again or contact support if the problem persists.",
    actions: ["retry", "backToCart", "contactSupport"],
    variant: "destructive",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    severity: "medium",
    category: "system",
    recoverable: true,
  },
};

const DEFAULT_SUPPORT_INFO = {
  email: "support@company.com",
  phone: "+254-700-000-000",
  chatUrl: "/support/chat",
  ticketUrl: "/support/ticket",
};

export function CheckoutError({
  error,
  errorType = "general",
  onRetry,
  showBackToCart = true,
  showRetry = true,
  className,
  sessionId,
  orderTotal,
  retryCount = 0,
  maxRetries = 3,
  autoRetry = false,
  autoRetryDelay = 3000,
  supportInfo = DEFAULT_SUPPORT_INFO,
}: CheckoutErrorProps) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);
  const [autoRetryTimer, setAutoRetryTimer] = useState<number>(0);
  const [showDetails, setShowDetails] = useState(false);

  const config = ERROR_CONFIGS[errorType];
  const Icon = config.icon;

  // Auto-retry logic
  useEffect(() => {
    if (autoRetry && onRetry && retryCount < maxRetries && config.recoverable) {
      const timer = setTimeout(() => {
        handleRetry();
      }, autoRetryDelay);

      // Countdown timer
      const countdownTimer = setInterval(() => {
        setAutoRetryTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setAutoRetryTimer(Math.floor(autoRetryDelay / 1000));

      return () => {
        clearTimeout(timer);
        clearInterval(countdownTimer);
      };
    }
  }, [
    autoRetry,
    onRetry,
    retryCount,
    maxRetries,
    autoRetryDelay,
    config.recoverable,
  ]);

  // Helper function to extract error message
  const getErrorMessage = (error: string | Error | undefined): string => {
    if (!error) return config.defaultMessage;
    if (typeof error === "string") return error;
    return error.message || config.defaultMessage;
  };

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;

    setIsRetrying(true);
    try {
      await onRetry();
      toast.success("Retrying...");
    } catch (error) {
      toast.error("Retry failed");
    } finally {
      setIsRetrying(false);
    }
  };

  const handleBackToCart = () => {
    router.push("/dashboard/customer/cart");
    toast.info("Returning to cart");
  };

  const handleContactSupport = (
    method: "email" | "phone" | "chat" | "ticket"
  ) => {
    const errorDetails = {
      errorType,
      message: getErrorMessage(error),
      sessionId,
      timestamp: new Date().toISOString(),
    };

    switch (method) {
      case "email":
        window.location.href = `mailto:${supportInfo.email}?subject=Checkout Error&body=Error Details: ${JSON.stringify(errorDetails, null, 2)}`;
        break;
      case "phone":
        if (supportInfo.phone) {
          window.location.href = `tel:${supportInfo.phone}`;
        }
        break;
      case "chat":
        if (supportInfo.chatUrl) {
          window.open(supportInfo.chatUrl, "_blank");
        }
        break;
      case "ticket":
        if (supportInfo.ticketUrl) {
          router.push(
            `${supportInfo.ticketUrl}?error=${encodeURIComponent(JSON.stringify(errorDetails))}`
          );
        }
        break;
    }
  };

  const handleStartOver = () => {
    // Clear any stored session data
    if (sessionId) {
      localStorage.removeItem(`checkout_session_${sessionId}`);
    }
    handleBackToCart();
  };

  const displayMessage = getErrorMessage(error);
  const errorDetails = error instanceof Error ? error.stack : error;
  const canRetry =
    showRetry && onRetry && retryCount < maxRetries && config.recoverable;
  const isMaxRetries = retryCount >= maxRetries;

  return (
    <Card className={cn("max-w-2xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={cn("flex items-center gap-3", config.color)}>
            <div className={cn("p-2 rounded-full", config.bgColor)}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <div>{config.title}</div>
              <div className="text-sm font-normal text-muted-foreground">
                Error occurred during checkout
              </div>
            </div>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Badge
              variant={
                config.severity === "critical" ? "destructive" : "secondary"
              }
            >
              {config.severity}
            </Badge>
            {retryCount > 0 && (
              <Badge variant="outline">Attempt {retryCount + 1}</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Error Message */}
        <Alert
          variant={config.variant}
          className={cn(config.bgColor, "border-current/20")}
        >
          <AlertDescription className="text-sm">
            {displayMessage}
          </AlertDescription>
        </Alert>

        {/* Auto-retry countdown */}
        {autoRetryTimer > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="flex items-center justify-between">
                <span>
                  Automatically retrying in {autoRetryTimer} seconds...
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoRetryTimer(0)}
                  className="text-blue-800 border-blue-300"
                >
                  Cancel
                </Button>
              </div>
              <Progress
                value={
                  ((autoRetryDelay / 1000 - autoRetryTimer) /
                    (autoRetryDelay / 1000)) *
                  100
                }
                className="mt-2 h-1"
              />
            </AlertDescription>
          </Alert>
        )}

        {/* Context-specific guidance */}
        {errorType === "session" && (
          <div className="space-y-3">
            <h4 className="font-medium">What happened?</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>
                Your checkout session expired after 30 minutes of inactivity
              </li>
              <li>Your cart items are still saved and secure</li>
              <li>You can start the checkout process again</li>
            </ul>
          </div>
        )}

        {errorType === "payment" && (
          <div className="space-y-3">
            <h4 className="font-medium">Common payment issues:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Insufficient funds or credit limit exceeded</li>
              <li>Card restrictions or blocks</li>
              <li>Network connectivity issues</li>
              <li>Incorrect payment details entered</li>
            </ul>
          </div>
        )}

        {errorType === "network" && (
          <div className="space-y-3">
            <h4 className="font-medium">To resolve connection issues:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Check your internet connection</li>
              <li>Try refreshing the page</li>
              <li>Disable any ad blockers or VPN temporarily</li>
              <li>Switch to a different network if possible</li>
            </ul>
          </div>
        )}

        {errorType === "inventory" && orderTotal && (
          <Alert>
            <ShoppingCart className="h-4 w-4" />
            <AlertDescription>
              <strong>Order value:</strong> KES {orderTotal.toLocaleString()}
              <br />
              Some items may have been removed due to stock changes. Please
              review your cart.
            </AlertDescription>
          </Alert>
        )}

        {/* Action buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {canRetry && (
              <Button
                onClick={handleRetry}
                disabled={isRetrying || autoRetryTimer > 0}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={cn("h-4 w-4", isRetrying && "animate-spin")}
                />
                {isRetrying ? "Retrying..." : "Try Again"}
              </Button>
            )}

            {isMaxRetries && (
              <Button
                onClick={handleStartOver}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Start Over
              </Button>
            )}

            {showBackToCart && (
              <Button
                onClick={handleBackToCart}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Cart
              </Button>
            )}

            <Button
              onClick={() => router.push("/dashboard")}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </div>

          {/* Support options */}
          {config.actions.includes("contactSupport") && (
            <div className="space-y-3">
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Need help? Contact our support team
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContactSupport("email")}
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-3 w-3" />
                    Email
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContactSupport("phone")}
                    className="flex items-center gap-2"
                  >
                    <Phone className="h-3 w-3" />
                    Call
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContactSupport("chat")}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Chat
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContactSupport("ticket")}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Ticket
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error details toggle */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <Info className="h-3 w-3" />
            {showDetails ? "Hide" : "Show"} Technical Details
          </Button>

          {showDetails && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground space-y-2 p-3 bg-muted rounded-lg">
                <div>
                  <strong>Error Type:</strong> {errorType}
                </div>
                <div>
                  <strong>Timestamp:</strong> {new Date().toISOString()}
                </div>
                {sessionId && (
                  <div>
                    <strong>Session ID:</strong> {sessionId}
                  </div>
                )}
                <div>
                  <strong>Retry Count:</strong> {retryCount}
                </div>
                {orderTotal && (
                  <div>
                    <strong>Order Total:</strong> KES{" "}
                    {orderTotal.toLocaleString()}
                  </div>
                )}
                <div>
                  <strong>User Agent:</strong> {navigator.userAgent}
                </div>
              </div>

              {process.env.NODE_ENV === "development" && errorDetails && (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer font-medium">
                    Stack Trace
                  </summary>
                  <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto whitespace-pre-wrap">
                    {errorDetails}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Secure Platform
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              24/7 Support
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Specialized error components for common scenarios
export function SessionExpiredError({
  onRetry,
  sessionId,
}: {
  onRetry?: () => void;
  sessionId?: string;
}) {
  return (
    <CheckoutError
      errorType="session"
      onRetry={onRetry}
      showRetry={false}
      showBackToCart={true}
      sessionId={sessionId}
    />
  );
}

export function NetworkError({
  onRetry,
  retryCount = 0,
}: {
  onRetry?: () => void;
  retryCount?: number;
}) {
  return (
    <CheckoutError
      errorType="network"
      onRetry={onRetry}
      showRetry={true}
      showBackToCart={true}
      retryCount={retryCount}
      autoRetry={retryCount < 2}
      autoRetryDelay={3000 + retryCount * 2000} // Exponential backoff
    />
  );
}

export function PaymentError({
  error,
  onRetry,
  orderTotal,
}: {
  error?: string | Error;
  onRetry?: () => void;
  orderTotal?: number;
}) {
  return (
    <CheckoutError
      errorType="payment"
      error={error}
      onRetry={onRetry}
      showRetry={true}
      showBackToCart={true}
      orderTotal={orderTotal}
      maxRetries={2} // Lower retry count for payment errors
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

export function InventoryError({ orderTotal }: { orderTotal?: number }) {
  return (
    <CheckoutError
      errorType="inventory"
      showRetry={false}
      showBackToCart={true}
      orderTotal={orderTotal}
    />
  );
}
