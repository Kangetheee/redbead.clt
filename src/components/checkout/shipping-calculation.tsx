"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { UrgencySelector } from "./urgency-selector";
import { ShippingOptions } from "./shipping-options";
import { useCalculateShipping } from "@/hooks/use-checkout";
import {
  AddressInput,
  ShippingOption,
  ShippingOptionsResponse,
} from "@/lib/checkout/types/checkout.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Info,
  AlertCircle,
  RefreshCw,
  MapPin,
  Calculator,
  Truck,
  Clock,
  Zap,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type UrgencyLevel = "NORMAL" | "EXPEDITED" | "RUSH" | "EMERGENCY";

interface ShippingCalculationProps {
  sessionId: string;
  shippingAddress: AddressInput;
  selectedOption: string;
  onOptionSelect: (optionId: string) => void;
  onShippingCalculated?: (options: ShippingOption[]) => void;
  onTotalsUpdated?: (totals: ShippingOptionsResponse["updatedTotals"]) => void;
  className?: string;
}

interface CalculationState {
  isCalculating: boolean;
  options: ShippingOption[];
  updatedTotals: ShippingOptionsResponse["updatedTotals"] | null;
  urgencyLevel: UrgencyLevel;
  error: string | null;
  retryCount: number;
  lastCalculatedAddress: string | null;
}

export function ShippingCalculation({
  sessionId,
  shippingAddress,
  selectedOption,
  onOptionSelect,
  onShippingCalculated,
  onTotalsUpdated,
  className,
}: ShippingCalculationProps) {
  const [state, setState] = useState<CalculationState>({
    isCalculating: false,
    options: [],
    updatedTotals: null,
    urgencyLevel: "NORMAL",
    error: null,
    retryCount: 0,
    lastCalculatedAddress: null,
  });

  const calculateShippingMutation = useCalculateShipping();

  // Memoize address string for comparison
  const addressString = useMemo(() => {
    return JSON.stringify({
      street: shippingAddress.street,
      city: shippingAddress.city,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country,
    });
  }, [shippingAddress]);

  // Check if address has changed
  const addressChanged = state.lastCalculatedAddress !== addressString;

  const handleUrgencyChange = useCallback(
    (newUrgency: UrgencyLevel) => {
      setState((prev) => ({ ...prev, urgencyLevel: newUrgency, error: null }));

      calculateShippingMutation.mutate(
        {
          sessionId,
          shippingAddress,
          urgencyLevel: newUrgency,
        },
        {
          onSuccess: (response) => {
            setState((prev) => ({
              ...prev,
              isCalculating: false,
              options: response.shippingOptions,
              updatedTotals: response.updatedTotals,
              error: null,
              lastCalculatedAddress: addressString,
            }));

            onShippingCalculated?.(response.shippingOptions);
            onTotalsUpdated?.(response.updatedTotals);

            // Auto-select first option if none selected
            if (response.shippingOptions.length > 0 && !selectedOption) {
              onOptionSelect(response.shippingOptions[0].id);
            }

            toast.success(
              `Found ${response.shippingOptions.length} shipping options`
            );
          },
          onError: (error) => {
            setState((prev) => ({
              ...prev,
              isCalculating: false,
              error: error.message || "Failed to calculate shipping options",
              retryCount: prev.retryCount + 1,
            }));
            toast.error("Failed to calculate shipping options");
          },
        }
      );
    },
    [
      sessionId,
      shippingAddress,
      addressString,
      onShippingCalculated,
      onTotalsUpdated,
      selectedOption,
      onOptionSelect,
      calculateShippingMutation,
    ]
  );

  // Calculate initial shipping on mount or address change
  useEffect(() => {
    if (addressChanged || state.options.length === 0) {
      setState((prev) => ({ ...prev, isCalculating: true, error: null }));
      handleUrgencyChange(state.urgencyLevel);
    }
  }, [
    addressChanged,
    handleUrgencyChange,
    state.urgencyLevel,
    state.options.length,
  ]);

  const handleRetry = useCallback(() => {
    if (state.retryCount < 3) {
      setState((prev) => ({ ...prev, error: null, retryCount: 0 }));
      handleUrgencyChange(state.urgencyLevel);
    } else {
      toast.error("Maximum retry attempts reached. Please try again later.");
    }
  }, [state.retryCount, state.urgencyLevel, handleUrgencyChange]);

  const getUrgencyInfo = (level: UrgencyLevel) => {
    const urgencyConfig = {
      NORMAL: {
        multiplier: 1,
        description: "Standard processing time",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      },
      EXPEDITED: {
        multiplier: 1.5,
        description: "50% faster processing",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      },
      RUSH: {
        multiplier: 2,
        description: "Priority handling",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
      },
      EMERGENCY: {
        multiplier: 3,
        description: "Immediate attention",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      },
    };
    return urgencyConfig[level];
  };

  const baseShippingCost = useMemo(() => {
    return (
      state.options.find((opt) => opt.urgencyMultiplier === 1)?.originalCost ||
      0
    );
  }, [state.options]);

  const selectedShippingOption = useMemo(() => {
    return state.options.find((opt) => opt.id === selectedOption);
  }, [state.options, selectedOption]);

  const urgencyInfo = getUrgencyInfo(state.urgencyLevel);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Address Summary */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{shippingAddress.recipientName}</p>
              <p className="text-sm text-muted-foreground">
                {shippingAddress.street}
                {shippingAddress.street2 && `, ${shippingAddress.street2}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {shippingAddress.city}
                {shippingAddress.state && `, ${shippingAddress.state}`}{" "}
                {shippingAddress.postalCode}
              </p>
              <p className="text-sm text-muted-foreground">
                {shippingAddress.country}
              </p>
            </div>
            {addressChanged && (
              <Badge variant="outline" className="text-xs">
                Address Changed
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Urgency Selector */}
      <UrgencySelector
        value={state.urgencyLevel}
        onChange={handleUrgencyChange}
        baseShippingCost={baseShippingCost}
        disabled={calculateShippingMutation.isPending}
      />

      {/* Urgency Level Impact */}
      {state.urgencyLevel !== "NORMAL" && (
        <Alert className={cn(urgencyInfo.bgColor, urgencyInfo.borderColor)}>
          <Zap className={cn("h-4 w-4", urgencyInfo.color)} />
          <AlertDescription className={urgencyInfo.color}>
            <strong>{state.urgencyLevel} priority selected:</strong>{" "}
            {urgencyInfo.description}. This will apply a{" "}
            {urgencyInfo.multiplier}x multiplier to shipping costs and
            prioritize your order throughout the entire process.
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {calculateShippingMutation.isPending && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-medium">Calculating shipping options...</p>
                <p className="text-sm text-muted-foreground">
                  Finding the best delivery options for your location
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-medium">Shipping calculation failed</p>
              <p className="text-sm">{state.error}</p>
              {state.retryCount > 0 && (
                <p className="text-xs mt-1">
                  Attempt {state.retryCount + 1} of 3
                </p>
              )}
            </div>
            {state.retryCount < 3 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Shipping Options */}
      {state.options.length > 0 && !calculateShippingMutation.isPending && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Available Shipping Options ({state.options.length})
            </CardTitle>
            {state.updatedTotals && (
              <div className="text-sm text-muted-foreground">
                Estimated total: KES{" "}
                {state.updatedTotals.estimatedTotal.toLocaleString()}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <ShippingOptions
              options={state.options}
              selectedOption={selectedOption}
              onOptionSelect={onOptionSelect}
            />
          </CardContent>
        </Card>
      )}

      {/* Selected Option Summary */}
      {selectedShippingOption && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-4 w-4 text-primary" />
              Selected Shipping Option
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {selectedShippingOption.name}
                </span>
                {selectedShippingOption.isFree && (
                  <Badge variant="secondary" className="text-xs">
                    FREE
                  </Badge>
                )}
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

            {selectedShippingOption.description && (
              <p className="text-sm text-muted-foreground">
                {selectedShippingOption.description}
              </p>
            )}

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                {selectedShippingOption.estimatedDays && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {selectedShippingOption.estimatedDays}
                  </div>
                )}
                {selectedShippingOption.zone && (
                  <div className="text-muted-foreground">
                    Zone: {selectedShippingOption.zone.name}
                  </div>
                )}
              </div>
              {selectedShippingOption.urgencyMultiplier > 1 && (
                <Badge variant="outline" className="text-xs">
                  {selectedShippingOption.urgencyMultiplier}x Priority
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Updated Totals */}
      {state.updatedTotals && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Updated Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>KES {state.updatedTotals.subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span
                  className={
                    selectedShippingOption?.isFree ? "text-green-600" : ""
                  }
                >
                  {selectedShippingOption?.isFree
                    ? "FREE"
                    : `KES ${state.updatedTotals.shippingCost.toLocaleString()}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Tax (Estimated)</span>
                <span>
                  KES {state.updatedTotals.estimatedTax.toLocaleString()}
                </span>
              </div>

              {state.updatedTotals.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>
                    -KES {state.updatedTotals.discount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex justify-between font-medium text-lg">
              <span>Estimated Total</span>
              <span>
                KES {state.updatedTotals.estimatedTotal.toLocaleString()}
              </span>
            </div>

            <div className="text-xs text-muted-foreground">
              * Final total may vary based on exact tax calculations
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Options Available */}
      {!calculateShippingMutation.isPending &&
        !state.error &&
        state.options.length === 0 &&
        state.lastCalculatedAddress && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No shipping options are available for this address. Please verify
              your address details or contact support for assistance.
              <Button
                variant="link"
                size="sm"
                className="ml-2 p-0 h-auto"
                onClick={handleRetry}
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        )}

      {/* Calculation Info */}
      {state.urgencyLevel !== "NORMAL" && state.options.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Priority Processing:</strong> Your{" "}
            {state.urgencyLevel.toLowerCase()}
            order will receive expedited handling throughout production and
            shipping. Estimated processing time is reduced by approximately{" "}
            {Math.round((1 - 1 / urgencyInfo.multiplier) * 100)}%.
          </AlertDescription>
        </Alert>
      )}

      {/* Debug Information (Development Only) */}
      {process.env.NODE_ENV === "development" && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer">Debug Information</summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
            {JSON.stringify(
              {
                sessionId,
                urgencyLevel: state.urgencyLevel,
                optionsCount: state.options.length,
                selectedOption,
                addressChanged,
                retryCount: state.retryCount,
              },
              null,
              2
            )}
          </pre>
        </details>
      )}
    </div>
  );
}
