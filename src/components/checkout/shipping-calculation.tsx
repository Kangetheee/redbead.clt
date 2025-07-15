"use client";

import { useState, useEffect } from "react";
import { UrgencySelector } from "./urgency-selector";
import { ShippingOptions } from "./shipping-options";
import { useCalculateShipping } from "@/hooks/use-checkout";
import {
  AddressInput,
  ShippingOption,
} from "@/lib/checkout/types/checkout.types";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Info } from "lucide-react";

type UrgencyLevel = "NORMAL" | "EXPEDITED" | "RUSH" | "EMERGENCY";

interface ShippingCalculationProps {
  sessionId: string;
  shippingAddress: AddressInput;
  selectedOption: string;
  onOptionSelect: (optionId: string) => void;
  onShippingCalculated?: (options: ShippingOption[]) => void;
}

export function ShippingCalculation({
  sessionId,
  shippingAddress,
  selectedOption,
  onOptionSelect,
  onShippingCalculated,
}: ShippingCalculationProps) {
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>("NORMAL");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);

  const calculateShippingMutation = useCalculateShipping();

  const handleUrgencyChange = (newUrgency: UrgencyLevel) => {
    setUrgencyLevel(newUrgency);

    calculateShippingMutation.mutate(
      {
        sessionId,
        shippingAddress,
        urgencyLevel: newUrgency,
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            setShippingOptions(data.data.shippingOptions);
            onShippingCalculated?.(data.data.shippingOptions);
          }
        },
      }
    );
  };

  // Calculate initial shipping on mount
  useEffect(() => {
    handleUrgencyChange("NORMAL");
  }, [sessionId, shippingAddress]);

  const baseShippingCost =
    shippingOptions.find((opt) => opt.urgencyMultiplier === 1)?.originalCost ||
    0;

  return (
    <div className="space-y-6">
      <UrgencySelector
        value={urgencyLevel}
        onChange={handleUrgencyChange}
        baseShippingCost={baseShippingCost}
        disabled={calculateShippingMutation.isPending}
      />

      {calculateShippingMutation.isPending && (
        <Card>
          <CardContent className="p-6 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Calculating shipping options...
            </p>
          </CardContent>
        </Card>
      )}

      {calculateShippingMutation.error && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to calculate shipping costs. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {shippingOptions.length > 0 && (
        <>
          <ShippingOptions
            options={shippingOptions}
            selectedOption={selectedOption}
            onOptionSelect={onOptionSelect}
          />

          {urgencyLevel !== "NORMAL" && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {urgencyLevel} delivery selected. Your order will receive
                priority handling throughout the entire process.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}
