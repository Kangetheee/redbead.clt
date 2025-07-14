"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Truck, Clock } from "lucide-react";
import { ShippingOption } from "@/lib/checkout/types/checkout.types";

interface ShippingOptionsProps {
  options: ShippingOption[];
  selectedOptionId?: string;
  onOptionSelect: (optionId: string) => void;
  loading?: boolean;
}

export function ShippingOptions({
  options,
  selectedOptionId,
  onOptionSelect,
  loading = false,
}: ShippingOptionsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">
              Calculating shipping options...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (options.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No shipping options available for this address
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Shipping Options
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedOptionId}
          onValueChange={onOptionSelect}
          className="space-y-3"
        >
          {options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.id} id={option.id} />
              <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                <div className="rounded-md border p-3 hover:bg-accent">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{option.name}</span>
                        {option.isFree && (
                          <Badge variant="secondary">Free</Badge>
                        )}
                        {option.urgencyMultiplier > 1 && (
                          <Badge variant="outline">Express</Badge>
                        )}
                      </div>
                      {option.description && (
                        <div className="text-sm text-muted-foreground">
                          {option.description}
                        </div>
                      )}
                      {option.estimatedDays && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {option.estimatedDays}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {option.isFree ? "Free" : `$${option.cost.toFixed(2)}`}
                      </div>
                      {option.originalCost !== option.cost && (
                        <div className="text-xs text-muted-foreground line-through">
                          ${option.originalCost.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
