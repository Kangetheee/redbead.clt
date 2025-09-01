/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { CheckoutSession } from "@/lib/checkout/types/checkout.types";
import {
  useSessionTimeRemaining,
  useSessionExpired,
} from "@/hooks/use-checkout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ShoppingCart,
  Package,
  Truck,
  Calculator,
  Gift,
  AlertTriangle,
  Info,
  Clock,
  Shield,
  Tag,
  Percent,
  DollarSign,
  Timer,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Zap,
  Star,
  CheckCircle,
  XCircle,
  Globe,
  Building,
  User,
  Phone,
  Mail,
  Copy,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface OrderSummaryProps {
  session: CheckoutSession;
  shippingCost?: number;
  finalTotals?: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  };
  showItemDetails?: boolean;
  isSticky?: boolean;
  className?: string;
  onCouponApply?: (code: string) => void;
  isApplyingCoupon?: boolean;
  showSessionTimer?: boolean;
  couponCode?: string;
  appliedDiscount?: number;
  showCustomerInfo?: boolean;
  showPaymentMethods?: boolean;
  currency?: string;
  showAdvancedDetails?: boolean;
}

interface ProcessedItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customizations: string[];
  hasDesign: boolean;
  thumbnail?: string;
  productId?: string;
  templateId?: string;
  sizeVariant?: string;
}

export function OrderSummary({
  session,
  shippingCost = 0,
  finalTotals,
  showItemDetails = true,
  isSticky = true,
  className,
  onCouponApply,
  isApplyingCoupon = false,
  showSessionTimer = false,
  couponCode = "",
  appliedDiscount = 0,
  showCustomerInfo = false,
  showPaymentMethods = false,
  currency = "KES",
  showAdvancedDetails = false,
}: OrderSummaryProps) {
  const [itemsExpanded, setItemsExpanded] = useState(showItemDetails);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [couponInput, setCouponInput] = useState(couponCode);

  // Session timing hooks
  const sessionTimeRemaining = useSessionTimeRemaining(session.sessionId);
  const isSessionExpired = useSessionExpired(session.sessionId);

  // Process items to ensure consistent display
  const processedItems: ProcessedItem[] = useMemo(() => {
    return session.items.map((item, index) => ({
      id: item.productId || item.templateId || `item-${index}`,
      name: item.productName || item.templateName || `Product ${index + 1}`,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      customizations: Array.isArray(item.customizations)
        ? item.customizations.map((custom) => getCustomizationLabel(custom))
        : [],
      hasDesign: !!item.designId,
      thumbnail: item.thumbnail,
      productId: item.productId,
      templateId: item.templateId,
      sizeVariant: item.variantName,
    }));
  }, [session.items]);

  // Calculate totals
  const calculatedTotals = useMemo(() => {
    const subtotal = session.subtotal;
    const shipping = shippingCost;
    const tax = session.estimatedTax;
    const discount = appliedDiscount;
    const total = subtotal + shipping + tax - discount;

    return (
      finalTotals || {
        subtotal,
        tax,
        shipping,
        discount,
        total,
      }
    );
  }, [session, shippingCost, finalTotals, appliedDiscount]);

  // Session expiry calculation with enhanced details
  const sessionStatus = useMemo(() => {
    if (!showSessionTimer || !session.expiresAt) return null;

    const expiryTime = new Date(session.expiresAt).getTime();
    const now = Date.now();
    const timeLeft = Math.max(0, expiryTime - now);
    const minutes = Math.floor(timeLeft / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return {
      minutes,
      seconds,
      totalSeconds: Math.floor(timeLeft / 1000),
      isExpiringSoon: timeLeft < 10 * 60 * 1000, // Less than 10 minutes
      isCritical: timeLeft < 5 * 60 * 1000, // Less than 5 minutes
      isExpired: timeLeft <= 0,
      progressPercentage: Math.max(
        0,
        Math.min(100, (timeLeft / (30 * 60 * 1000)) * 100)
      ), // Assuming 30 min session
    };
  }, [session.expiresAt, showSessionTimer]);

  // Helper function to safely display customization
  const getCustomizationLabel = (customization: any): string => {
    if (typeof customization === "string") {
      return customization;
    }

    if (customization && typeof customization === "object") {
      return (
        customization.label ||
        customization.name ||
        customization.value ||
        customization.displayName ||
        `${customization.optionName || "Option"}: ${customization.valueName || customization.value || "Custom"}`
      );
    }

    return "Custom option";
  };

  const handleCouponSubmit = () => {
    if (couponInput.trim() && onCouponApply) {
      onCouponApply(couponInput.trim());
    }
  };

  const handleCopySessionId = () => {
    navigator.clipboard.writeText(session.sessionId);
    toast.success("Session ID copied to clipboard");
  };

  const totalItems = processedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const hasCustomizations = processedItems.some(
    (item) => item.customizations.length > 0
  );
  const hasDesigns = processedItems.some((item) => item.hasDesign);
  const hasVariants = processedItems.some((item) => item.sizeVariant);

  // Determine status colors and messages
  const getSessionStatusColor = () => {
    if (!sessionStatus) return "";
    if (sessionStatus.isExpired) return "text-destructive";
    if (sessionStatus.isCritical) return "text-destructive";
    if (sessionStatus.isExpiringSoon) return "text-orange-600";
    return "text-primary";
  };

  const getSessionStatusMessage = () => {
    if (!sessionStatus) return "";
    if (sessionStatus.isExpired) return "Session expired";
    if (sessionStatus.isCritical) return "Session expiring soon!";
    if (sessionStatus.isExpiringSoon) return "Session expires soon";
    return "Session active";
  };

  return (
    <div className={cn(isSticky && "sticky top-4", className)}>
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Order Summary
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </Badge>
              {showAdvancedDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDetailsExpanded(!detailsExpanded)}
                  className="p-1 h-6"
                >
                  {detailsExpanded ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          </CardTitle>

          {/* Session Timer */}
          {sessionStatus && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {getSessionStatusMessage()}:
                </span>
                <span className={cn("font-medium", getSessionStatusColor())}>
                  {sessionStatus.isExpired
                    ? "Expired"
                    : `${sessionStatus.minutes}m ${sessionStatus.seconds}s`}
                </span>
              </div>
              <Progress
                value={sessionStatus.progressPercentage}
                className={cn(
                  "h-1",
                  sessionStatus.isCritical && "bg-destructive/20",
                  sessionStatus.isExpiringSoon &&
                    !sessionStatus.isCritical &&
                    "bg-orange-200"
                )}
              />
              {sessionStatus.isCritical && (
                <div className="text-xs text-destructive">
                  ⚠️ Complete your order quickly to avoid losing your session
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Customer Information */}
          {showCustomerInfo && session.customerInfo && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                Customer Info
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2">
                  {session.customerInfo.isGuest ? (
                    <>
                      <Badge variant="outline" className="text-xs">
                        Guest
                      </Badge>
                      {session.customerInfo.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {session.customerInfo.email}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Registered User
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Items List */}
          {showItemDetails && (
            <Collapsible open={itemsExpanded} onOpenChange={setItemsExpanded}>
              <div className="space-y-3">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center justify-between w-full p-0 h-auto font-medium text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Items ({processedItems.length})
                    </div>
                    {itemsExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {processedItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex gap-3 p-2 rounded-lg bg-muted/30"
                      >
                        <div className="w-12 h-12 rounded border overflow-hidden bg-background flex-shrink-0">
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {item.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Qty: {item.quantity} × {currency}{" "}
                            {item.unitPrice.toLocaleString()}
                          </div>

                          {/* Size Variant */}
                          {item.sizeVariant && (
                            <div className="mt-1">
                              <Badge
                                variant="outline"
                                className="text-xs px-1 py-0"
                              >
                                {item.sizeVariant}
                              </Badge>
                            </div>
                          )}

                          {/* Customizations */}
                          {item.customizations.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.customizations
                                .slice(0, 2)
                                .map((custom, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs px-1 py-0"
                                  >
                                    {custom}
                                  </Badge>
                                ))}
                              {item.customizations.length > 2 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs px-1 py-0"
                                >
                                  +{item.customizations.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Design indicator */}
                          {item.hasDesign && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              <Tag className="h-2 w-2 mr-1" />
                              Custom Design
                            </Badge>
                          )}
                        </div>

                        <div className="text-sm font-medium">
                          {currency} {item.totalPrice.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}

          {/* Coupon Section */}
          {onCouponApply && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Gift className="h-4 w-4" />
                Promo Code
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1"
                  disabled={isApplyingCoupon}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCouponSubmit();
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isApplyingCoupon || !couponInput.trim()}
                  onClick={handleCouponSubmit}
                >
                  {isApplyingCoupon ? "Applying..." : "Apply"}
                </Button>
              </div>
              {appliedDiscount > 0 && (
                <div className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Coupon applied! You saved {currency}{" "}
                  {appliedDiscount.toLocaleString()}
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Totals Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calculator className="h-4 w-4" />
              Price Breakdown
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Subtotal ({totalItems} items)
                </span>
                <span>
                  {currency} {calculatedTotals.subtotal.toLocaleString()}
                </span>
              </div>

              {calculatedTotals.shipping > 0 && (
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    Shipping
                  </span>
                  <span>
                    {currency} {calculatedTotals.shipping.toLocaleString()}
                  </span>
                </div>
              )}

              {calculatedTotals.shipping === 0 && shippingCost === 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    Shipping
                  </span>
                  <span className="font-medium">FREE</span>
                </div>
              )}

              {calculatedTotals.tax > 0 && (
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    Tax (Estimated)
                  </span>
                  <span>
                    {currency} {calculatedTotals.tax.toLocaleString()}
                  </span>
                </div>
              )}

              {calculatedTotals.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Gift className="h-3 w-3" />
                    Discount
                  </span>
                  <span>
                    -{currency} {calculatedTotals.discount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Final Total */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Total
              </span>
              <span>
                {currency} {calculatedTotals.total.toLocaleString()}
              </span>
            </div>

            {!finalTotals && (
              <div className="text-xs text-muted-foreground italic">
                * Final amount may vary based on shipping selection and tax
                calculations
              </div>
            )}
          </div>

          {/* Order Characteristics */}
          <div className="space-y-2">
            {session.requiresDesignApproval && (
              <Alert className="py-2">
                <Clock className="h-3 w-3" />
                <AlertDescription className="text-xs">
                  <strong>Design Approval Required:</strong> Production will
                  begin after design approval.
                </AlertDescription>
              </Alert>
            )}

            {hasCustomizations && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Tag className="h-3 w-3" />
                Includes custom options
              </div>
            )}

            {hasDesigns && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Star className="h-3 w-3" />
                Includes custom designs
              </div>
            )}

            {hasVariants && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Package className="h-3 w-3" />
                Size variants selected
              </div>
            )}

            {session.requiresShipping && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Truck className="h-3 w-3" />
                Physical delivery required
              </div>
            )}
          </div>

          {/* Payment Methods Preview */}
          {showPaymentMethods && session.availablePaymentMethods.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">
                Available Payment Methods:
              </div>
              <div className="flex flex-wrap gap-1">
                {session.availablePaymentMethods.map((method) => (
                  <Badge key={method} variant="outline" className="text-xs">
                    {method === "MPESA"
                      ? "M-Pesa"
                      : method === "BANK_TRANSFER"
                        ? "Bank Transfer"
                        : method === "CARD"
                          ? "Card"
                          : method}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Details */}
          {showAdvancedDetails && (
            <Collapsible
              open={detailsExpanded}
              onOpenChange={setDetailsExpanded}
            >
              <CollapsibleContent>
                <div className="space-y-3 pt-2 border-t">
                  <div className="text-xs font-medium text-muted-foreground">
                    Session Details:
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <span>Session ID:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopySessionId}
                        className="h-4 p-0 font-mono text-xs hover:bg-transparent"
                      >
                        {session.sessionId.slice(0, 8)}...
                        <Copy className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                    <div className="flex justify-between">
                      <span>Expires At:</span>
                      <span>
                        {new Date(session.expiresAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer Type:</span>
                      <span>
                        {session.customerInfo.isGuest ? "Guest" : "Registered"}
                      </span>
                    </div>
                    {session.customerInfo.email && (
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <span className="truncate ml-2">
                          {session.customerInfo.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Security & Trust Indicators */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Secure Checkout
              </div>
              {sessionStatus && !sessionStatus.isExpired && (
                <div className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  Session Protected
                </div>
              )}
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                SSL Encrypted
              </div>
            </div>
          </div>

          {/* Customer Type Info */}
          {session.customerInfo.isGuest && (
            <Alert className="py-2">
              <Info className="h-3 w-3" />
              <AlertDescription className="text-xs">
                You&apos;re checking out as a guest.
                {session.customerInfo.email && (
                  <span>
                    {" "}
                    Order updates will be sent to {session.customerInfo.email}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Session Expiry Warning */}
          {sessionStatus?.isExpiringSoon && (
            <Alert
              variant={sessionStatus.isCritical ? "destructive" : "default"}
              className="py-2"
            >
              <AlertTriangle className="h-3 w-3" />
              <AlertDescription className="text-xs">
                {sessionStatus.isCritical
                  ? "Your session expires soon! Complete your order quickly."
                  : "Your session will expire in a few minutes. Please complete your order soon."}
              </AlertDescription>
            </Alert>
          )}

          {/* Session Expired */}
          {sessionStatus?.isExpired && (
            <Alert variant="destructive" className="py-2">
              <XCircle className="h-3 w-3" />
              <AlertDescription className="text-xs">
                Your session has expired. Please refresh the page to start over.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
