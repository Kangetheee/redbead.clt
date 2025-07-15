"use client";

import { PaymentMethod } from "@/lib/payments/types/payments.types";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Smartphone, CreditCard, Building2, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

type PaymentMethodType = "MPESA" | "BANK_TRANSFER" | "CARD";

interface PaymentMethodsProps {
  methods: PaymentMethod[];
  selectedMethod: PaymentMethodType; // Changed from string to PaymentMethodType
  onMethodSelect: (method: PaymentMethodType) => void; // Changed from string to PaymentMethodType
  customerPhone?: string;
  onPhoneChange: (phone: string) => void;
}

export function PaymentMethods({
  methods,
  selectedMethod,
  onMethodSelect,
  customerPhone,
  onPhoneChange,
}: PaymentMethodsProps) {
  const getPaymentIcon = (type: string) => {
    switch (type) {
      case "MPESA":
        return <Smartphone className="h-5 w-5 text-green-600" />;
      case "CARD":
        return <CreditCard className="h-5 w-5 text-blue-600" />;
      case "BANK_TRANSFER":
        return <Building2 className="h-5 w-5 text-purple-600" />;
      case "CASH":
        return <Banknote className="h-5 w-5 text-orange-600" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatFees = (fees: PaymentMethod["fees"]) => {
    if (!fees) return null;

    const parts = [];
    if (fees.percentage) parts.push(`${fees.percentage}%`);
    if (fees.fixed) parts.push(`KES ${fees.fixed}`);

    return parts.length > 0 ? `${parts.join(" + ")} fee` : null;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Payment Method</h3>

      <RadioGroup
        value={selectedMethod}
        onValueChange={(value) => onMethodSelect(value as PaymentMethodType)} // Type assertion needed here
      >
        <div className="space-y-3">
          {methods
            .filter((method) => method.isActive)
            .map((method) => (
              <div key={method.id} className="relative">
                <Label
                  htmlFor={method.id}
                  className={cn(
                    "cursor-pointer",
                    selectedMethod === method.type &&
                      "ring-2 ring-primary rounded-lg"
                  )}
                >
                  <Card
                    className={cn(
                      "transition-all duration-200 hover:shadow-md",
                      selectedMethod === method.type && "border-primary"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem
                          value={method.type}
                          id={method.id}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getPaymentIcon(method.type)}
                              <span className="font-medium">{method.name}</span>
                            </div>
                            {formatFees(method.fees) && (
                              <Badge variant="outline" className="text-xs">
                                {formatFees(method.fees)}
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground">
                            {method.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              </div>
            ))}
        </div>
      </RadioGroup>

      {/* Phone number input for MPESA */}
      {selectedMethod === "MPESA" && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <Label htmlFor="customerPhone" className="text-sm font-medium">
            M-Pesa Phone Number
          </Label>
          <Input
            id="customerPhone"
            type="tel"
            placeholder="+254 7XX XXX XXX"
            value={customerPhone || ""}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            You will receive an M-Pesa prompt on this number
          </p>
        </div>
      )}

      {/* Bank transfer details */}
      {selectedMethod === "BANK_TRANSFER" && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Bank Transfer Instructions</h4>
          <p className="text-sm text-muted-foreground">
            Bank transfer details will be provided after order confirmation.
            Please ensure payment is made within 24 hours to secure your order.
          </p>
        </div>
      )}
    </div>
  );
}
