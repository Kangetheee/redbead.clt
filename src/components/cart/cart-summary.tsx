"use client";

import { CartResponse } from "@/lib/cart/types/cart.types";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatAmount } from "@/lib/utils";

interface CartSummaryProps {
  summary: CartResponse;
  showDetails?: boolean;
}

export default function CartSummary({
  summary,
  showDetails = true,
}: CartSummaryProps) {
  const hasItems = summary.summary.itemCount > 0;

  return (
    <div className="space-y-3">
      {/* Item Count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Items ({summary.summary.itemCount})
        </span>
        <span>{summary.summary.totalQuantity} pcs</span>
      </div>

      {/* Subtotal */}
      <div className="flex items-center justify-between">
        <span>Subtotal</span>
        <span className="font-medium">
          {formatAmount(summary.summary.subtotal)}
        </span>
      </div>

      <Separator />

      {/* Total */}
      <div className="flex items-center justify-between text-lg font-bold">
        <span>Total</span>
        <span>{formatAmount(summary.summary.total)}</span>
      </div>

      {/* Additional Info */}
      {showDetails && hasItems && (
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Estimated
            </Badge>
            <span className="text-xs text-muted-foreground">
              Final price may change based on shipping and taxes
            </span>
          </div>
        </div>
      )}

      {/* Empty state message */}
      {!hasItems && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Your cart is empty</p>
        </div>
      )}
    </div>
  );
}
