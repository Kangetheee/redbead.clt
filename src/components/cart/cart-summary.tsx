"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CartResponse } from "@/lib/cart/types/cart.types";

interface CartSummaryProps {
  cart: CartResponse;
}

export function CartSummary({ cart }: CartSummaryProps) {
  const { summary } = cart;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Items ({summary.itemCount})</span>
          <span>${summary.subtotal.toFixed(2)}</span>
        </div>

        {summary.customizationAdjustments !== 0 && (
          <div className="flex justify-between text-sm">
            <span>Customization Adjustments</span>
            <span
              className={
                summary.customizationAdjustments > 0
                  ? "text-red-600"
                  : "text-green-600"
              }
            >
              {summary.customizationAdjustments > 0 ? "+" : ""}$
              {summary.customizationAdjustments.toFixed(2)}
            </span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between font-medium">
          <span>Total Quantity</span>
          <span>{summary.totalQuantity} items</span>
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>${summary.total.toFixed(2)}</span>
        </div>

        <div className="text-xs text-muted-foreground">
          * Shipping and taxes calculated at checkout
        </div>
      </CardContent>
    </Card>
  );
}
