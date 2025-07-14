"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CreditCard, Smartphone, Building } from "lucide-react";

interface PaymentMethodsProps {
  selectedMethod?: string;
  onMethodSelect: (method: string) => void;
  availableMethods: string[];
  customerPhone?: string;
  onPhoneChange?: (phone: string) => void;
}

export function PaymentMethods({
  selectedMethod,
  onMethodSelect,
  availableMethods,
  customerPhone,
  onPhoneChange,
}: PaymentMethodsProps) {
  const paymentMethods = [
    {
      id: "MPESA",
      name: "M-Pesa",
      description: "Pay with M-Pesa mobile money",
      icon: Smartphone,
      requiresPhone: true,
    },
    {
      id: "BANK_TRANSFER",
      name: "Bank Transfer",
      description: "Direct bank transfer",
      icon: Building,
      requiresPhone: false,
    },
    {
      id: "CARD",
      name: "Credit/Debit Card",
      description: "Pay with credit or debit card",
      icon: CreditCard,
      requiresPhone: false,
    },
  ];

  const filteredMethods = paymentMethods.filter((method) =>
    availableMethods.includes(method.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedMethod}
          onValueChange={onMethodSelect}
          className="space-y-3"
        >
          {filteredMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div key={method.id} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                    <div className="rounded-md border p-3 hover:bg-accent">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {method.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>

                {/* Phone number input for M-Pesa */}
                {method.requiresPhone && selectedMethod === method.id && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+254712345678"
                      value={customerPhone || ""}
                      onChange={(e) => onPhoneChange?.(e.target.value)}
                      className="max-w-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter your M-Pesa registered phone number
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
