/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Tag,
  Eye,
  EyeOff,
  Info,
  Shield,
  Zap,
  Star,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  className?: string;
  showEditOptions?: boolean;
  isReadOnly?: boolean;
}

const PAYMENT_METHOD_CONFIG = {
  MPESA: {
    icon: Smartphone,
    name: "M-Pesa",
    description: "Mobile money payment",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  BANK_TRANSFER: {
    icon: Building2,
    name: "Bank Transfer",
    description: "Direct bank transfer",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  CARD: {
    icon: CreditCard,
    name: "Credit/Debit Card",
    description: "Card payment",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
};

interface ProcessedItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customizations: string[];
  thumbnail?: string;
  hasDesign: boolean;
}

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
  className,
  showEditOptions = true,
  isReadOnly = false,
}: OrderReviewProps) {
  const [itemsExpanded, setItemsExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [showAllCustomizations, setShowAllCustomizations] = useState(false);

  // Process items to ensure consistent display
  const processedItems: ProcessedItem[] = useMemo(() => {
    return checkoutSession.items.map((item, index) => ({
      id: item.productId || item.templateId || `item-${index}`,
      name: item.productName || item.templateName || `Product ${index + 1}`,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      customizations: Array.isArray(item.customizations)
        ? item.customizations.map((custom) =>
            typeof custom === "string"
              ? custom
              : typeof custom === "object" && custom !== null
                ? (custom as any).displayName ||
                  (custom as any).value ||
                  "Custom option"
                : "Custom option"
          )
        : [],
      thumbnail: item.thumbnail,
      hasDesign: !!item.designId,
    }));
  }, [checkoutSession.items]);

  const formatAddress = (address: AddressInput): string => {
    const parts = [
      address.recipientName,
      address.companyName,
      address.street,
      address.street2,
      `${address.city}${address.state ? `, ${address.state}` : ""}`,
      `${address.postalCode}`,
      address.country,
    ].filter(Boolean);

    return parts.join("\n");
  };

  const formatPhoneForDisplay = (phone: string): string => {
    // Format phone number for better display
    if (phone.startsWith("+254")) {
      return phone.replace("+254", "0");
    }
    return phone;
  };

  const paymentConfig = PAYMENT_METHOD_CONFIG[paymentMethod];
  const PaymentIcon = paymentConfig.icon;

  const totals = finalTotals || {
    subtotal: checkoutSession.subtotal,
    tax: checkoutSession.estimatedTax,
    shipping: selectedShippingOption.cost,
    discount: 0,
    total: checkoutSession.estimatedTotal + selectedShippingOption.cost,
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
    <div className={cn("space-y-6", className)}>
      {/* Order Items Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items ({processedItems.length})
              <Badge variant="secondary" className="text-xs">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              {showEditOptions && onEditItems && !isReadOnly && (
                <Button variant="outline" size="sm" onClick={onEditItems}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Items
                </Button>
              )}
              <Collapsible open={itemsExpanded} onOpenChange={setItemsExpanded}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {itemsExpanded ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Show Details
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Always show first 3 items */}
            {processedItems.slice(0, 3).map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
              >
                <div className="h-12 w-12 rounded border overflow-hidden bg-background flex-shrink-0">
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.name}
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
                    {item.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Qty: {item.quantity} × KES {item.unitPrice.toLocaleString()}
                  </div>

                  {/* Customizations */}
                  {item.customizations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(showAllCustomizations
                        ? item.customizations
                        : item.customizations.slice(0, 2)
                      ).map((custom, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-xs px-1 py-0"
                        >
                          {custom}
                        </Badge>
                      ))}
                      {!showAllCustomizations &&
                        item.customizations.length > 2 && (
                          <Badge
                            variant="outline"
                            className="text-xs px-1 py-0 cursor-pointer hover:bg-muted"
                            onClick={() => setShowAllCustomizations(true)}
                          >
                            +{item.customizations.length - 2} more
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

            {/* Show remaining items count or expand button */}
            {processedItems.length > 3 && !itemsExpanded && (
              <div className="text-center py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setItemsExpanded(true)}
                  className="text-muted-foreground"
                >
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show {processedItems.length - 3} more items
                </Button>
              </div>
            )}

            {/* Expanded items */}
            <Collapsible open={itemsExpanded} onOpenChange={setItemsExpanded}>
              <CollapsibleContent>
                {processedItems.length > 3 && (
                  <div className="space-y-3 mt-3">
                    {processedItems.slice(3).map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                      >
                        <div className="h-12 w-12 rounded border overflow-hidden bg-background flex-shrink-0">
                          {item.thumbnail ? (
                            <Image
                              src={item.thumbnail}
                              alt={item.name}
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
                            {item.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Qty: {item.quantity} × KES{" "}
                            {item.unitPrice.toLocaleString()}
                          </div>

                          {/* Customizations */}
                          {item.customizations.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.customizations.map((custom, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs px-1 py-0"
                                >
                                  {custom}
                                </Badge>
                              ))}
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
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Order characteristics summary */}
          {(hasCustomizations || hasDesigns) && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {hasCustomizations && (
                  <div className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Custom Options
                  </div>
                )}
                {hasDesigns && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Custom Designs
                  </div>
                )}
              </div>
            </div>
          )}
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
            {showEditOptions && onEditShipping && !isReadOnly && (
              <Button variant="outline" size="sm" onClick={onEditShipping}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Address
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              SHIPPING ADDRESS
            </Label>
            <div className="mt-2 p-3 bg-muted/30 rounded-lg">
              <div className="whitespace-pre-line text-sm">
                {formatAddress(shippingAddress)}
              </div>
              {shippingAddress.phone && (
                <div className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
                  <Smartphone className="h-3 w-3" />
                  {formatPhoneForDisplay(shippingAddress.phone)}
                </div>
              )}
            </div>
          </div>

          {billingAddress && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                BILLING ADDRESS
              </Label>
              <div className="mt-2 p-3 bg-muted/30 rounded-lg">
                <div className="whitespace-pre-line text-sm">
                  {formatAddress(billingAddress)}
                </div>
              </div>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              SHIPPING METHOD
            </Label>
            <div className="mt-2 p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <Truck className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {selectedShippingOption.name}
                    </div>
                    {selectedShippingOption.description && (
                      <div className="text-xs text-muted-foreground">
                        {selectedShippingOption.description}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      {selectedShippingOption.estimatedDays && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {selectedShippingOption.estimatedDays}
                        </div>
                      )}
                      {selectedShippingOption.zone && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {selectedShippingOption.zone.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {selectedShippingOption.isFree
                      ? "FREE"
                      : `KES ${selectedShippingOption.cost.toLocaleString()}`}
                  </div>
                  {selectedShippingOption.originalCost !==
                    selectedShippingOption.cost && (
                    <div className="text-xs text-muted-foreground line-through">
                      KES {selectedShippingOption.originalCost.toLocaleString()}
                    </div>
                  )}
                </div>
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
            {showEditOptions && onEditPayment && !isReadOnly && (
              <Button variant="outline" size="sm" onClick={onEditPayment}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Payment
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn("p-3 border rounded-lg", paymentConfig.bgColor)}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-full">
                <PaymentIcon className={cn("h-4 w-4", paymentConfig.color)} />
              </div>
              <div className="flex-1">
                <div className="font-medium">{paymentConfig.name}</div>
                <div className="text-sm text-muted-foreground">
                  {paymentConfig.description}
                </div>
                {paymentMethod === "MPESA" && customerPhone && (
                  <div className="text-sm font-medium mt-1">
                    {formatPhoneForDisplay(customerPhone)}
                  </div>
                )}
                {paymentMethod === "BANK_TRANSFER" && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Bank details will be provided after order confirmation
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Shield className="mr-1 h-3 w-3" />
                  Secure
                </Badge>
                {paymentMethod === "MPESA" && (
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="mr-1 h-3 w-3" />
                    Instant
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes and Special Instructions */}
      {!isReadOnly && (
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
                  onChange={(e) =>
                    onSpecialInstructionsChange?.(e.target.value)
                  }
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      )}

      {/* Read-only notes display */}
      {isReadOnly && (notes || specialInstructions) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Order Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notes && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  ORDER NOTES
                </Label>
                <div className="mt-1 p-3 bg-muted/30 rounded-lg text-sm">
                  {notes}
                </div>
              </div>
            )}
            {specialInstructions && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  SPECIAL INSTRUCTIONS
                </Label>
                <div className="mt-1 p-3 bg-muted/30 rounded-lg text-sm">
                  {specialInstructions}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal ({totalItems} items)</span>
              <span>KES {totals.subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span
                className={
                  selectedShippingOption.isFree
                    ? "text-green-600 font-medium"
                    : ""
                }
              >
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
          <div className="space-y-3 pt-2">
            {checkoutSession.requiresDesignApproval && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Design Approval Required:</strong> Your order will be
                  held for design approval before production begins.
                </AlertDescription>
              </Alert>
            )}

            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Production will begin after payment confirmation and any
                required approvals.
              </AlertDescription>
            </Alert>

            {selectedShippingOption.urgencyMultiplier > 1 && (
              <Alert className="border-purple-200 bg-purple-50">
                <Zap className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-800">
                  <strong>Priority Processing:</strong> Your order will receive{" "}
                  {selectedShippingOption.urgencyMultiplier}x priority handling
                  throughout production and shipping.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
