"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, Flame, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type UrgencyLevel = "NORMAL" | "EXPEDITED" | "RUSH" | "EMERGENCY";

interface UrgencyOption {
  value: UrgencyLevel;
  label: string;
  description: string;
  icon: React.ElementType;
  multiplier: number;
  iconColor: string;
  badge?: string;
}

const urgencyOptions: UrgencyOption[] = [
  {
    value: "NORMAL",
    label: "Standard Delivery",
    description: "Regular processing and delivery time",
    icon: Clock,
    multiplier: 1,
    iconColor: "text-blue-500",
  },
  {
    value: "EXPEDITED",
    label: "Expedited Delivery",
    description: "Faster processing with priority handling",
    icon: Zap,
    multiplier: 1.5,
    iconColor: "text-orange-500",
    badge: "Popular",
  },
  {
    value: "RUSH",
    label: "Rush Order",
    description: "High priority with accelerated production",
    icon: Flame,
    multiplier: 2,
    iconColor: "text-red-500",
    badge: "Fast",
  },
  {
    value: "EMERGENCY",
    label: "Emergency Service",
    description: "Maximum priority with immediate attention",
    icon: AlertTriangle,
    multiplier: 3,
    iconColor: "text-red-600",
    badge: "Urgent",
  },
];

interface UrgencySelectorProps {
  value: UrgencyLevel;
  onChange: (urgency: UrgencyLevel) => void;
  baseShippingCost?: number;
  disabled?: boolean;
}

export function UrgencySelector({
  value,
  onChange,
  baseShippingCost = 0,
  disabled = false,
}: UrgencySelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Urgency</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={value}
          onValueChange={(value) => onChange(value as UrgencyLevel)}
          disabled={disabled}
        >
          <div className="space-y-3">
            {urgencyOptions.map((option) => {
              const Icon = option.icon;
              const additionalCost = baseShippingCost * (option.multiplier - 1);
              const isSelected = value === option.value;

              return (
                <div key={option.value} className="relative">
                  <Label
                    htmlFor={option.value}
                    className={cn(
                      "cursor-pointer",
                      isSelected && "ring-2 ring-primary rounded-lg",
                      disabled && "cursor-not-allowed opacity-50"
                    )}
                  >
                    <Card
                      className={cn(
                        "transition-all duration-200 hover:shadow-md",
                        isSelected && "border-primary",
                        disabled && "cursor-not-allowed"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem
                            value={option.value}
                            id={option.value}
                            className="mt-1"
                            disabled={disabled}
                          />

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Icon
                                  className={cn("h-4 w-4", option.iconColor)}
                                />
                                <span className="font-medium">
                                  {option.label}
                                </span>
                                {option.badge && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {option.badge}
                                  </Badge>
                                )}
                              </div>

                              <div className="text-right">
                                {option.multiplier === 1 ? (
                                  <span className="text-sm text-green-600 font-medium">
                                    No extra cost
                                  </span>
                                ) : (
                                  <div className="text-sm">
                                    <span className="font-medium">
                                      +KES {additionalCost.toLocaleString()}
                                    </span>
                                    <div className="text-xs text-muted-foreground">
                                      ({option.multiplier}x multiplier)
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground">
                              {option.description}
                            </p>

                            {option.multiplier > 1 && (
                              <div className="mt-2 text-xs text-orange-600">
                                ⚡ Processing time reduced by{" "}
                                {Math.round((1 - 1 / option.multiplier) * 100)}%
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Label>
                </div>
              );
            })}
          </div>
        </RadioGroup>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="text-sm">
            <div className="font-medium mb-1">What does urgency affect?</div>
            <ul className="text-muted-foreground space-y-1">
              <li>• Production queue priority</li>
              <li>• Design approval speed</li>
              <li>• Shipping method selection</li>
              <li>• Customer service attention</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
