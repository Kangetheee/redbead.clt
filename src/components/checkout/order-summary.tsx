/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useMemo } from "react";
import { CheckoutSession } from "@/lib/checkout/types/checkout.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

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
}: OrderSummaryProps) {
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
    }));
  }, [session.items]);

  // Calculate totals
  const calculatedTotals = useMemo(() => {
    const subtotal = session.subtotal;
    const shipping = shippingCost;
    const tax = session.estimatedTax;
    const discount = 0; // Would come from session if available
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
  }, [session, shippingCost, finalTotals]);

  // Session expiry calculation
  const sessionTimeRemaining = useMemo(() => {
    if (!showSessionTimer || !session.expiresAt) return null;

    const expiryTime = new Date(session.expiresAt).getTime();
    const now = Date.now();
    const timeLeft = Math.max(0, expiryTime - now);

    return {
      minutes: Math.floor(timeLeft / (1000 * 60)),
      isExpiringSoon: timeLeft < 10 * 60 * 1000, // Less than 10 minutes
      isCritical: timeLeft < 5 * 60 * 1000, // Less than 5 minutes
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

  const totalItems = processedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const hasCustomizations = processedItems.some(
    (item) => item.customizations.length > 0
  );
  const hasDesigns = processedItems.some((item) => item.hasDesign);

  return (
    <div className={cn(isSticky && "sticky top-4", className)}>
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Order Summary
            </div>
            <Badge variant="secondary" className="text-xs">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </Badge>
          </CardTitle>

          {/* Session Timer */}
          {sessionTimeRemaining && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Session expires in:
                </span>
                <span
                  className={cn(
                    "font-medium",
                    sessionTimeRemaining.isCritical && "text-destructive",
                    sessionTimeRemaining.isExpiringSoon &&
                      !sessionTimeRemaining.isCritical &&
                      "text-orange-600"
                  )}
                >
                  {sessionTimeRemaining.minutes}m
                </span>
              </div>
              <Progress
                value={(sessionTimeRemaining.minutes / 30) * 100}
                className={cn(
                  "h-1",
                  sessionTimeRemaining.isCritical && "bg-destructive/20",
                  sessionTimeRemaining.isExpiringSoon &&
                    !sessionTimeRemaining.isCritical &&
                    "bg-orange-200"
                )}
              />
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Items List */}
          {showItemDetails && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Package className="h-4 w-4" />
                Items ({processedItems.length})
              </div>

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
                        Qty: {item.quantity} × KES{" "}
                        {item.unitPrice.toLocaleString()}
                      </div>

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
                      KES {item.totalPrice.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coupon Section */}
          {onCouponApply && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Gift className="h-4 w-4" />
                Promo Code
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                  disabled={isApplyingCoupon}
                />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isApplyingCoupon}
                  onClick={() => onCouponApply("SAMPLE")}
                >
                  {isApplyingCoupon ? "Applying..." : "Apply"}
                </Button>
              </div>
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
                <span>KES {calculatedTotals.subtotal.toLocaleString()}</span>
              </div>

              {calculatedTotals.shipping > 0 && (
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    Shipping
                  </span>
                  <span>KES {calculatedTotals.shipping.toLocaleString()}</span>
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
                  <span>KES {calculatedTotals.tax.toLocaleString()}</span>
                </div>
              )}

              {calculatedTotals.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Gift className="h-3 w-3" />
                    Discount
                  </span>
                  <span>-KES {calculatedTotals.discount.toLocaleString()}</span>
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
              <span>KES {calculatedTotals.total.toLocaleString()}</span>
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
                <Package className="h-3 w-3" />
                Includes custom designs
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
          {session.availablePaymentMethods.length > 0 && (
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

          {/* Security & Trust Indicators */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Secure Checkout
              </div>
              {sessionTimeRemaining && (
                <div className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  Session Protected
                </div>
              )}
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
          {sessionTimeRemaining?.isExpiringSoon && (
            <Alert
              variant={
                sessionTimeRemaining.isCritical ? "destructive" : "default"
              }
              className="py-2"
            >
              <AlertTriangle className="h-3 w-3" />
              <AlertDescription className="text-xs">
                {sessionTimeRemaining.isCritical
                  ? "Your session expires soon! Complete your order quickly."
                  : "Your session will expire in a few minutes. Please complete your order soon."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
