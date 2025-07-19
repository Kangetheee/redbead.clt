"use client";

import { CartSummary as CartSummaryType } from "@/lib/cart/types/cart.types";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CartSummaryProps {
  summary: CartSummaryType;
  showDetails?: boolean;
}

export default function CartSummary({
  summary,
  showDetails = true,
}: CartSummaryProps) {
  const hasCustomizationAdjustments = summary.customizationAdjustments !== 0;
  const customizationSavings = summary.customizationAdjustments < 0;

  return (
    <div className="space-y-3">
      {/* Item Count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Items ({summary.itemCount})
        </span>
        <span>{summary.totalQuantity} pcs</span>
      </div>

      {/* Subtotal */}
      <div className="flex items-center justify-between">
        <span>Subtotal</span>
        <span className="font-medium">
          KSH {summary.subtotal.toLocaleString()}
        </span>
      </div>

      {/* Customization Adjustments */}
      {hasCustomizationAdjustments && showDetails && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className={customizationSavings ? "text-green-600" : ""}>
              Customization {customizationSavings ? "Discount" : "Charges"}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    {customizationSavings
                      ? "Savings from bulk customization discounts"
                      : "Additional charges for product customizations"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span
            className={`font-medium ${customizationSavings ? "text-green-600" : ""}`}
          >
            {customizationSavings ? "-" : "+"}KES{" "}
            {Math.abs(summary.customizationAdjustments).toLocaleString()}
          </span>
        </div>
      )}

      <Separator />

      {/* Total */}
      <div className="flex items-center justify-between text-lg font-bold">
        <span>Total</span>
        <span>KES {summary.total.toLocaleString()}</span>
      </div>

      {/* Additional Info */}
      {showDetails && (
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Estimated
            </Badge>
            <span className="text-xs text-muted-foreground">
              Final price may change based on shipping and taxes
            </span>
          </div>

          {hasCustomizationAdjustments && customizationSavings && (
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs bg-green-600">
                Savings
              </Badge>
              <span className="text-xs text-green-600">
                You saved KES{" "}
                {Math.abs(summary.customizationAdjustments).toLocaleString()}{" "}
                with bulk customizations!
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
