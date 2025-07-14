"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckoutSession } from "@/lib/checkout/types/checkout.types";
import Image from "next/image";

interface OrderSummaryProps {
  session: CheckoutSession;
  shippingCost?: number;
  selectedShippingName?: string;
}

export function OrderSummary({
  session,
  shippingCost = 0,
  selectedShippingName,
}: OrderSummaryProps) {
  const finalTotal = session.subtotal + session.estimatedTax + shippingCost;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items */}
        <div className="space-y-3">
          {session.items.map((item, index) => (
            <div key={index} className="flex gap-3">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src={item.thumbnail || "/placeholder-product.jpg"}
                  alt={item.productName}
                  fill
                  className="object-cover rounded"
                />
                <Badge
                  variant="secondary"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {item.quantity}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm line-clamp-2">
                  {item.productName}
                </div>
                {item.customizations.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {item.customizations.join(", ")}
                  </div>
                )}
              </div>
              <div className="text-sm font-medium">
                ${item.totalPrice.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${session.subtotal.toFixed(2)}</span>
          </div>

          {selectedShippingName && (
            <div className="flex justify-between text-sm">
              <span>Shipping ({selectedShippingName})</span>
              <span>
                {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>
          )}

          {session.estimatedTax > 0 && (
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>${session.estimatedTax.toFixed(2)}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Additional Info */}
        {session.requiresDesignApproval && (
          <div className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded">
            <span className="font-medium">Design Approval Required:</span>{" "}
            You&apos;ll receive an email to approve your design before
            production begins.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
