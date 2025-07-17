/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  CheckoutSession,
  AddressInput,
  ShippingOption,
} from "@/lib/checkout/types/checkout.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ShoppingCart,
  MapPin,
  CreditCard,
  Truck,
  Clock,
  DollarSign,
  Edit,
  ChevronDown,
  ChevronUp,
  Package,
  FileText,
  AlertCircle,
  CheckCircle,
  Smartphone,
  Building2,
} from "lucide-react";

interface OrderReviewProps {
  checkoutSession: CheckoutSession;
  shippingAddress: AddressInput;
  billingAddress?: AddressInput;
  selectedShippingOption: ShippingOption;
  paymentMethod: "MPESA" | "BANK_TRANSFER" | "CARD";
  customerPhone?: string;
  notes?: string;
  specialInstructions?: string;
  onNotesChange?: (notes: string) => void;
  onSpecialInstructionsChange?: (instructions: string) => void;
  onEditShipping?: () => void;
  onEditPayment?: () => void;
  onEditItems?: () => void;
  finalTotals?: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  };
}

const PAYMENT_METHOD_ICONS = {
  MPESA: Smartphone,
  BANK_TRANSFER: Building2,
  CARD: CreditCard,
};

const PAYMENT_METHOD_NAMES = {
  MPESA: "M-Pesa",
  BANK_TRANSFER: "Bank Transfer",
  CARD: "Credit/Debit Card",
};

export function OrderReview({
  checkoutSession,
  shippingAddress,
  billingAddress,
  selectedShippingOption,
  paymentMethod,
  customerPhone,
  notes,
  specialInstructions,
  onNotesChange,
  onSpecialInstructionsChange,
  onEditShipping,
  onEditPayment,
  onEditItems,
  finalTotals,
}: OrderReviewProps) {
  const [itemsExpanded, setItemsExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);

  const formatAddress = (address: AddressInput) => {
    const parts = [
      address.recipientName,
      address.companyName,
      address.street,
      address.street2,
      `${address.city}${address.state ? `, ${address.state}` : ""}`,
      address.postalCode,
      address.country,
    ].filter(Boolean);

    return parts.join("\n");
  };

  const PaymentIcon = PAYMENT_METHOD_ICONS[paymentMethod];
  const totals = finalTotals || {
    subtotal: checkoutSession.subtotal,
    tax: checkoutSession.estimatedTax,
    shipping: selectedShippingOption.cost,
    discount: 0,
    total: checkoutSession.estimatedTotal + selectedShippingOption.cost,
  };

  return (
    <div className="space-y-6">
      {/* Order Items Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items ({checkoutSession.items.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              {onEditItems && (
                <Button variant="outline" size="sm" onClick={onEditItems}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              <Collapsible open={itemsExpanded} onOpenChange={setItemsExpanded}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {itemsExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Collapsible open={itemsExpanded} onOpenChange={setItemsExpanded}>
            <div className="space-y-2">
              {checkoutSession.items.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-2">
                  <div className="h-12 w-12 rounded border overflow-hidden bg-muted">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.productName}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {item.productName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Qty: {item.quantity} × KES{" "}
                      {item.unitPrice.toLocaleString()}
                    </div>
                    {item.customizations.length > 0 && (
                      <div className="text-xs text-muted-foreground truncate">
                        {item.customizations.join(", ")}
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-medium">
                    KES {item.totalPrice.toLocaleString()}
                  </div>
                </div>
              ))}

              {checkoutSession.items.length > 3 && !itemsExpanded && (
                <div className="text-center text-sm text-muted-foreground py-2">
                  +{checkoutSession.items.length - 3} more items
                </div>
              )}
            </div>

            <CollapsibleContent>
              {checkoutSession.items.length > 3 && (
                <div className="space-y-2 mt-2">
                  {checkoutSession.items.slice(3).map((item, index) => (
                    <div
                      key={index + 3}
                      className="flex items-center gap-3 p-2"
                    >
                      <div className="h-12 w-12 rounded border overflow-hidden bg-muted">
                        {item.thumbnail ? (
                          <Image
                            src={item.thumbnail}
                            alt={item.productName}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {item.productName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Qty: {item.quantity} × KES{" "}
                          {item.unitPrice.toLocaleString()}
                        </div>
                        {item.customizations.length > 0 && (
                          <div className="text-xs text-muted-foreground truncate">
                            {item.customizations.join(", ")}
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-medium">
                        KES {item.totalPrice.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Shipping Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Information
            </CardTitle>
            {onEditShipping && (
              <Button variant="outline" size="sm" onClick={onEditShipping}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Shipping Address</Label>
            <div className="mt-1 text-sm text-muted-foreground whitespace-pre-line">
              {formatAddress(shippingAddress)}
            </div>
            {shippingAddress.phone && (
              <div className="mt-1 text-sm text-muted-foreground">
                📞 {shippingAddress.phone}
              </div>
            )}
          </div>

          {billingAddress && (
            <div>
              <Label className="text-sm font-medium">Billing Address</Label>
              <div className="mt-1 text-sm text-muted-foreground whitespace-pre-line">
                {formatAddress(billingAddress)}
              </div>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium">Shipping Method</Label>
            <div className="mt-1 flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                <div>
                  <div className="font-medium text-sm">
                    {selectedShippingOption.name}
                  </div>
                  {selectedShippingOption.description && (
                    <div className="text-xs text-muted-foreground">
                      {selectedShippingOption.description}
                    </div>
                  )}
                  {selectedShippingOption.estimatedDays && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {selectedShippingOption.estimatedDays}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-sm font-medium">
                {selectedShippingOption.isFree
                  ? "FREE"
                  : `KES ${selectedShippingOption.cost.toLocaleString()}`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
            {onEditPayment && (
              <Button variant="outline" size="sm" onClick={onEditPayment}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-3 border rounded">
            <PaymentIcon className="h-5 w-5" />
            <div className="flex-1">
              <div className="font-medium">
                {PAYMENT_METHOD_NAMES[paymentMethod]}
              </div>
              {paymentMethod === "MPESA" && customerPhone && (
                <div className="text-sm text-muted-foreground">
                  {customerPhone}
                </div>
              )}
              {paymentMethod === "BANK_TRANSFER" && (
                <div className="text-sm text-muted-foreground">
                  Bank details will be provided after order confirmation
                </div>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="mr-1 h-3 w-3" />
              Secure
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Notes and Special Instructions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Order Notes
            </CardTitle>
            <Collapsible open={notesExpanded} onOpenChange={setNotesExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {notesExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notes">Order Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information about your order..."
                value={notes || ""}
                onChange={(e) => onNotesChange?.(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="special-instructions">
                Special Instructions (Optional)
              </Label>
              <Textarea
                id="special-instructions"
                placeholder="Special delivery or production instructions..."
                value={specialInstructions || ""}
                onChange={(e) => onSpecialInstructionsChange?.(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>KES {totals.subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>
                {selectedShippingOption.isFree
                  ? "FREE"
                  : `KES ${totals.shipping.toLocaleString()}`}
              </span>
            </div>

            {totals.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-KES {totals.discount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span>Tax (Estimated)</span>
              <span>KES {totals.tax.toLocaleString()}</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>KES {totals.total.toLocaleString()}</span>
          </div>

          {/* Important Notices */}
          <div className="space-y-2 pt-2">
            {checkoutSession.requiresDesignApproval && (
              <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-yellow-800">
                    Design Approval Required
                  </div>
                  <div className="text-yellow-700">
                    Your order will be held for design approval before
                    production begins.
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
              <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-blue-700">
                Production will begin after payment confirmation and any
                required approvals.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
