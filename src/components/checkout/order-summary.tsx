"use client";

import { CheckoutSession } from "@/lib/checkout/types/checkout.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

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
}

export function OrderSummary({
  session,
  shippingCost = 0,
  finalTotals,
}: OrderSummaryProps) {
  const displayTotals = finalTotals || {
    subtotal: session.subtotal,
    tax: session.estimatedTax,
    shipping: shippingCost,
    discount: 0,
    total: session.subtotal + session.estimatedTax + shippingCost,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items */}
        <div className="space-y-3">
          {session.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <div className="flex-1">
                <div className="font-medium">{item.productName}</div>
                <div className="text-muted-foreground">
                  Qty: {item.quantity} × KES {item.unitPrice.toLocaleString()}
                </div>
                {item.customizations.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.customizations.slice(0, 2).map((custom, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {custom}
                      </Badge>
                    ))}
                    {item.customizations.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.customizations.length - 2} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <div className="font-medium">
                KES {item.totalPrice.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>KES {displayTotals.subtotal.toLocaleString()}</span>
          </div>

          {displayTotals.shipping > 0 && (
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>KES {displayTotals.shipping.toLocaleString()}</span>
            </div>
          )}

          {displayTotals.tax > 0 && (
            <div className="flex justify-between">
              <span>Tax (Estimated)</span>
              <span>KES {displayTotals.tax.toLocaleString()}</span>
            </div>
          )}

          {displayTotals.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-KES {displayTotals.discount.toLocaleString()}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between font-medium text-lg">
          <span>Total</span>
          <span>KES {displayTotals.total.toLocaleString()}</span>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          {session.requiresDesignApproval && (
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs">
                Design Approval Required
              </Badge>
            </div>
          )}

          {!finalTotals && (
            <div>* Final amount may vary based on shipping and taxes</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
