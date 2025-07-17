/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import { usePaymentMethods } from "@/hooks/use-payments";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  Smartphone,
  Building2,
  Banknote,
  Shield,
  Info,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const paymentFormSchema = z.object({
  paymentMethod: z.enum(["MPESA", "BANK_TRANSFER", "CARD"]),
  customerPhone: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" })
    .optional(),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  onPaymentMethodChange?: (
    method: "MPESA" | "BANK_TRANSFER" | "CARD",
    phone?: string
  ) => void;
  selectedMethod?: "MPESA" | "BANK_TRANSFER" | "CARD";
  customerPhone?: string;
  disabled?: boolean;
  showInstructions?: boolean;
}

const PAYMENT_METHOD_INFO = {
  MPESA: {
    icon: Smartphone,
    title: "M-Pesa",
    description: "Pay securely with your M-Pesa mobile money account",
    instructions: [
      "You'll receive an STK push notification on your phone",
      "Enter your M-Pesa PIN to complete the payment",
      "Payment is processed instantly",
    ],
    fees: "No additional fees",
    security: "256-bit SSL encryption",
    color: "bg-green-500",
  },
  BANK_TRANSFER: {
    icon: Building2,
    title: "Bank Transfer",
    description: "Direct bank transfer or mobile banking",
    instructions: [
      "Transfer funds to our provided bank account",
      "Use the order number as reference",
      "Payment confirmation may take 1-2 business days",
    ],
    fees: "Bank charges may apply",
    security: "Secure bank-to-bank transfer",
    color: "bg-blue-500",
  },
  CARD: {
    icon: CreditCard,
    title: "Credit/Debit Card",
    description: "Pay with Visa, Mastercard, or local cards",
    instructions: [
      "Secure payment processing",
      "Supports international and local cards",
      "Instant payment confirmation",
    ],
    fees: "Standard processing fees apply",
    security: "PCI DSS compliant",
    color: "bg-purple-500",
  },
};

export function PaymentForm({
  onPaymentMethodChange,
  selectedMethod,
  customerPhone,
  disabled = false,
  showInstructions = true,
}: PaymentFormProps) {
  const { data: paymentMethodsData, isLoading } = usePaymentMethods();
  const [showPhoneInput, setShowPhoneInput] = useState(
    selectedMethod === "MPESA"
  );

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentMethod: selectedMethod || "MPESA",
      customerPhone: customerPhone || "",
    },
  });

  const watchedMethod = form.watch("paymentMethod");
  const watchedPhone = form.watch("customerPhone");

  const handleMethodChange = (method: "MPESA" | "BANK_TRANSFER" | "CARD") => {
    form.setValue("paymentMethod", method);
    setShowPhoneInput(method === "MPESA");

    if (method === "MPESA") {
      // Phone is required for M-Pesa
      onPaymentMethodChange?.(method, watchedPhone);
    } else {
      // Clear phone for other methods
      form.setValue("customerPhone", "");
      onPaymentMethodChange?.(method);
    }
  };

  const handlePhoneChange = (phone: string) => {
    form.setValue("customerPhone", phone);
    if (watchedMethod === "MPESA") {
      onPaymentMethodChange?.(watchedMethod, phone);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center space-x-3 p-4 border rounded-lg"
            >
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const availableMethods =
    paymentMethodsData?.filter((method) => method.isActive) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
          <CardDescription>
            Choose how you&apos;d like to pay for your order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <RadioGroup
              value={watchedMethod}
              onValueChange={handleMethodChange}
              disabled={disabled}
            >
              <div className="space-y-3">
                {availableMethods.map((method) => {
                  const info =
                    PAYMENT_METHOD_INFO[
                      method.type as keyof typeof PAYMENT_METHOD_INFO
                    ];
                  if (!info) return null;

                  const Icon = info.icon;

                  return (
                    <div
                      key={method.id}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={method.type} id={method.type} />
                      <Label
                        htmlFor={method.type}
                        className="flex items-center justify-between w-full cursor-pointer p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${info.color}`}
                          />
                          <Icon className="h-5 w-5" />
                          <div>
                            <div className="font-medium">{info.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {info.description}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {method.fees?.percentage && (
                            <div className="text-xs text-muted-foreground">
                              {method.fees.percentage}% fee
                            </div>
                          )}
                          <Badge variant="outline" className="text-xs">
                            <Shield className="mr-1 h-3 w-3" />
                            Secure
                          </Badge>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>

            {/* M-Pesa Phone Number Input */}
            {showPhoneInput && watchedMethod === "MPESA" && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        M-Pesa Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+254712345678"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handlePhoneChange(e.target.value);
                          }}
                          disabled={disabled}
                        />
                      </FormControl>
                      <FormMessage />
                      <div className="text-xs text-muted-foreground">
                        Enter the phone number linked to your M-Pesa account
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </Form>
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      {showInstructions && watchedMethod && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Payment Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {PAYMENT_METHOD_INFO[watchedMethod].instructions.map(
                (instruction, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{instruction}</span>
                  </div>
                )
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <div className="text-sm font-medium">Fees</div>
                <div className="text-sm text-muted-foreground">
                  {PAYMENT_METHOD_INFO[watchedMethod].fees}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Security</div>
                <div className="text-sm text-muted-foreground">
                  {PAYMENT_METHOD_INFO[watchedMethod].security}
                </div>
              </div>
            </div>

            {/* Special Alerts */}
            {watchedMethod === "BANK_TRANSFER" && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Bank transfer details will be provided after order
                  confirmation. Please ensure you use the correct reference
                  number for faster processing.
                </AlertDescription>
              </Alert>
            )}

            {watchedMethod === "MPESA" && !form.getValues("customerPhone") && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please enter your M-Pesa phone number to proceed with payment.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
