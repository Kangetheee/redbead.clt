"use client";

import { ShippingOption } from "@/lib/checkout/types/checkout.types";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Truck, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShippingOptionsProps {
  options: ShippingOption[];
  selectedOption: string;
  onOptionSelect: (optionId: string) => void;
}

export function ShippingOptions({
  options,
  selectedOption,
  onOptionSelect,
}: ShippingOptionsProps) {
  const getUrgencyIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("emergency") || lowerName.includes("rush")) {
      return <Zap className="h-4 w-4 text-red-500" />;
    }
    if (lowerName.includes("expedited") || lowerName.includes("express")) {
      return <Clock className="h-4 w-4 text-orange-500" />;
    }
    return <Truck className="h-4 w-4 text-blue-500" />;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Choose Delivery Option</h3>

      <RadioGroup value={selectedOption} onValueChange={onOptionSelect}>
        <div className="space-y-3">
          {options.map((option) => (
            <div key={option.id} className="relative">
              <Label
                htmlFor={option.id}
                className={cn(
                  "cursor-pointer",
                  selectedOption === option.id &&
                    "ring-2 ring-primary rounded-lg"
                )}
              >
                <Card
                  className={cn(
                    "transition-all duration-200 hover:shadow-md",
                    selectedOption === option.id && "border-primary"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem
                        value={option.id}
                        id={option.id}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getUrgencyIcon(option.name)}
                            <span className="font-medium">{option.name}</span>
                            {option.isFree && (
                              <Badge variant="secondary" className="text-xs">
                                Free
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            {option.isFree ? (
                              <span className="font-medium text-green-600">
                                Free
                              </span>
                            ) : (
                              <div>
                                <span className="font-medium">
                                  KES {option.cost.toLocaleString()}
                                </span>
                                {option.originalCost !== option.cost && (
                                  <span className="text-sm text-muted-foreground line-through ml-2">
                                    KES {option.originalCost.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {option.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {option.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>
                            {option.estimatedDays
                              ? `${option.estimatedDays} delivery`
                              : "Delivery time varies"}
                          </span>
                          {option.zone && <span>Zone: {option.zone.name}</span>}
                        </div>

                        {option.urgencyMultiplier > 1 && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {option.urgencyMultiplier}x urgency fee applied
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}
