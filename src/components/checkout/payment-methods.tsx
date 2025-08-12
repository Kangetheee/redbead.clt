/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Smartphone,
  CreditCard,
  Building2,
  Shield,
  Info,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Phone,
  DollarSign,
  AlertTriangle,
  Star,
  Globe,
  Lock,
  Wifi,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type PaymentMethodType = "MPESA" | "BANK_TRANSFER" | "CARD";

interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  description?: string;
  isActive: boolean;
  isRecommended?: boolean;
  fees?: {
    percentage?: number;
    fixed?: number;
  };
  processingTime?: string;
  availableCountries?: string[];
  minAmount?: number;
  maxAmount?: number;
}

interface PaymentMethodsProps {
  methods: PaymentMethod[];
  selectedMethod: PaymentMethodType;
  onMethodSelect: (method: PaymentMethodType) => void;
  customerPhone?: string;
  onPhoneChange: (phone: string) => void;
  orderTotal?: number;
  disabled?: boolean;
  showInstructions?: boolean;
  showFees?: boolean;
  currency?: string;
  countryCode?: string;
  className?: string;
}

// Phone validation schema
const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required for M-Pesa payments")
    .refine(isValidPhoneNumber, {
      message: "Please enter a valid phone number",
    }),
});

const PAYMENT_METHOD_CONFIG = {
  MPESA: {
    icon: Smartphone,
    title: "M-Pesa",
    shortTitle: "M-Pesa",
    description: "Pay securely with your M-Pesa mobile money account",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    iconBg: "bg-green-100",
    instructions: [
      "You'll receive an STK push notification on your phone",
      "Enter your M-Pesa PIN to complete the payment",
      "Payment is processed instantly and securely",
      "You'll receive an SMS confirmation from M-Pesa",
    ],
    requirements: [
      "Valid M-Pesa registered phone number",
      "Sufficient M-Pesa balance or linked bank account",
      "Phone must be switched on and have network coverage",
    ],
    processingTime: "Instant",
    fees: "No additional fees",
    security: "256-bit SSL encryption + M-Pesa security",
    badges: ["instant", "popular"],
    supportedCountries: ["KE"],
  },
  BANK_TRANSFER: {
    icon: Building2,
    title: "Bank Transfer",
    shortTitle: "Bank Transfer",
    description: "Direct bank transfer or mobile banking",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconBg: "bg-blue-100",
    instructions: [
      "Bank details will be provided after order confirmation",
      "Transfer funds using the provided account details",
      "Use your order number as the payment reference",
      "Upload payment confirmation for faster processing",
    ],
    requirements: [
      "Active bank account with online/mobile banking",
      "Ability to make domestic transfers",
      "Valid government-issued ID for verification",
    ],
    processingTime: "1-2 business days",
    fees: "Bank charges may apply (typically KES 25-50)",
    security: "Secure bank-to-bank transfer with SSL encryption",
    badges: ["bank-verified"],
    supportedCountries: ["KE", "UG", "TZ", "RW"],
  },
  CARD: {
    icon: CreditCard,
    title: "Credit/Debit Card",
    shortTitle: "Card",
    description: "Pay with Visa, Mastercard, or local cards",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    iconBg: "bg-purple-100",
    instructions: [
      "Enter your card details securely on the next page",
      "Supports international and local cards",
      "3D Secure authentication for added security",
      "Instant payment confirmation and receipt",
    ],
    requirements: [
      "Valid credit or debit card",
      "Sufficient funds or available credit limit",
      "Card enabled for online/international transactions",
    ],
    processingTime: "Instant",
    fees: "2.5% processing fee",
    security: "PCI DSS compliant with 3D Secure authentication",
    badges: ["secure", "international"],
    supportedCountries: ["KE", "UG", "TZ", "RW", "ET", "Global"],
  },
};

export function PaymentMethods({
  methods,
  selectedMethod,
  onMethodSelect,
  customerPhone,
  onPhoneChange,
  orderTotal,
  disabled = false,
  showInstructions = true,
  showFees = true,
  currency = "KES",
  countryCode = "KE",
  className,
}: PaymentMethodsProps) {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isValidating, setIsValidating] = useState(false);
  const [expandedMethod, setExpandedMethod] =
    useState<PaymentMethodType | null>(null);

  const form = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: customerPhone || "",
    },
    mode: "onChange",
  });

  // Update form when external phone changes
  useEffect(() => {
    if (customerPhone !== form.getValues("phone")) {
      form.setValue("phone", customerPhone || "");
    }
  }, [customerPhone, form]);

  // Validate phone number for M-Pesa
  useEffect(() => {
    if (selectedMethod === "MPESA") {
      const phone = form.getValues("phone");
      if (phone) {
        setIsValidating(true);
        const isValid = isValidPhoneNumber(phone);

        setTimeout(() => {
          if (isValid) {
            setValidationErrors((prev) => ({ ...prev, phone: "" }));
            // Only show success toast once
            if (validationErrors.phone) {
              toast.success("Valid M-Pesa number");
            }
          } else {
            setValidationErrors((prev) => ({
              ...prev,
              phone: "Please enter a valid phone number (e.g., +254712345678)",
            }));
          }
          setIsValidating(false);
        }, 500);
      }
    }
  }, [selectedMethod, form.watch("phone"), validationErrors.phone]);

  const getPaymentIcon = (type: PaymentMethodType) => {
    const IconComponent = PAYMENT_METHOD_CONFIG[type]?.icon || CreditCard;
    const config = PAYMENT_METHOD_CONFIG[type];

    return (
      <div className={cn("p-2 rounded-lg", config?.iconBg)}>
        <IconComponent className={cn("h-5 w-5", config?.color)} />
      </div>
    );
  };

  const calculateFees = (method: PaymentMethod): number => {
    if (!method.fees || !orderTotal) return 0;

    let fee = 0;
    if (method.fees.percentage) {
      fee += (orderTotal * method.fees.percentage) / 100;
    }
    if (method.fees.fixed) {
      fee += method.fees.fixed;
    }

    return fee;
  };

  const getBadges = (method: PaymentMethod, config: any) => {
    const badges = [];

    if (method.isRecommended) badges.push("recommended");
    if (config.badges) badges.push(...config.badges);

    return badges
      .map((badge) => {
        switch (badge) {
          case "instant":
            return { label: "Instant", variant: "secondary", icon: Zap };
          case "popular":
            return { label: "Popular", variant: "default", icon: Star };
          case "secure":
            return { label: "Secure", variant: "outline", icon: Shield };
          case "international":
            return { label: "International", variant: "outline", icon: Globe };
          case "bank-verified":
            return {
              label: "Bank Verified",
              variant: "outline",
              icon: Building2,
            };
          case "recommended":
            return { label: "Recommended", variant: "default", icon: Star };
          default:
            return null;
        }
      })
      .filter(Boolean);
  };

  const handleMethodChange = (methodType: PaymentMethodType) => {
    onMethodSelect(methodType);

    // Clear validation errors when switching methods
    setValidationErrors({});

    // Reset phone validation for non-M-Pesa methods
    if (methodType !== "MPESA") {
      form.clearErrors("phone");
    }

    // Expand method details
    setExpandedMethod(methodType);

    toast.success(`${PAYMENT_METHOD_CONFIG[methodType].title} selected`);
  };

  const handlePhoneChange = (phone: string) => {
    form.setValue("phone", phone);
    onPhoneChange(phone);

    // Clear previous validation errors
    if (validationErrors.phone) {
      setValidationErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const activePaymentMethods = methods.filter((method) => {
    // Filter by country support if specified
    const config = PAYMENT_METHOD_CONFIG[method.type];
    if (
      config.supportedCountries &&
      !config.supportedCountries.includes(countryCode) &&
      !config.supportedCountries.includes("Global")
    ) {
      return false;
    }

    // Filter by amount limits
    if (orderTotal) {
      if (method.minAmount && orderTotal < method.minAmount) return false;
      if (method.maxAmount && orderTotal > method.maxAmount) return false;
    }

    return method.isActive;
  });

  const selectedConfig = PAYMENT_METHOD_CONFIG[selectedMethod];
  const selectedMethodData = activePaymentMethods.find(
    (m) => m.type === selectedMethod
  );

  if (activePaymentMethods.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No payment methods are currently available for your location or order
          amount. Please contact support for assistance.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Choose Payment Method
          </CardTitle>
          {orderTotal && (
            <div className="text-sm text-muted-foreground">
              Order total: {currency} {orderTotal.toLocaleString()}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedMethod}
            onValueChange={handleMethodChange}
            disabled={disabled}
            className="space-y-3"
          >
            {activePaymentMethods.map((method) => {
              const config = PAYMENT_METHOD_CONFIG[method.type];
              const fees = calculateFees(method);
              const totalWithFees = orderTotal ? orderTotal + fees : 0;
              const badges = getBadges(method, config);

              if (!config) return null;

              return (
                <div key={method.id} className="relative">
                  <Label
                    htmlFor={method.id}
                    className={cn(
                      "cursor-pointer block",
                      selectedMethod === method.type &&
                        "ring-2 ring-primary rounded-lg",
                      disabled && "cursor-not-allowed opacity-50"
                    )}
                  >
                    <Card
                      className={cn(
                        "transition-all duration-200 hover:shadow-md",
                        selectedMethod === method.type &&
                          "border-primary shadow-sm",
                        disabled && "cursor-not-allowed"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem
                            value={method.type}
                            id={method.id}
                            className="mt-1"
                            disabled={disabled}
                          />

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                {getPaymentIcon(method.type)}
                                <div>
                                  <div className="font-medium flex items-center gap-2">
                                    {config.title}
                                    {badges.map((badge, idx) => {
                                      if (!badge) return null;
                                      const BadgeIcon = badge.icon;
                                      return (
                                        <Badge
                                          key={idx}
                                          variant={badge.variant as any}
                                          className="text-xs h-5"
                                        >
                                          <BadgeIcon className="mr-1 h-3 w-3" />
                                          {badge.label}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {method.description || config.description}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    <Shield className="mr-1 h-3 w-3" />
                                    Secure
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {method.processingTime ||
                                      config.processingTime}
                                  </Badge>
                                </div>

                                {showFees && fees > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    +{currency} {fees.toLocaleString()} fee
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center gap-4">
                                {config.supportedCountries && (
                                  <span className="flex items-center gap-1">
                                    <Globe className="h-3 w-3" />
                                    {config.supportedCountries.includes(
                                      "Global"
                                    )
                                      ? "Global"
                                      : config.supportedCountries.join(", ")}
                                  </span>
                                )}
                              </div>
                              {showFees && fees > 0 && orderTotal && (
                                <span className="flex items-center gap-1 font-medium">
                                  <DollarSign className="h-3 w-3" />
                                  Total: {currency}{" "}
                                  {totalWithFees.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* M-Pesa Phone Number Input */}
      {selectedMethod === "MPESA" && (
        <Card
          className={cn(selectedConfig.bgColor, selectedConfig.borderColor)}
        >
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className={cn("h-4 w-4", selectedConfig.color)} />
              M-Pesa Phone Number
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="+254712345678"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handlePhoneChange(e.target.value);
                          }}
                          disabled={disabled}
                          className={cn(
                            "pl-10",
                            validationErrors.phone && "border-destructive",
                            !validationErrors.phone &&
                              field.value &&
                              isValidPhoneNumber(field.value) &&
                              "border-green-500"
                          )}
                        />
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        {isValidating && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                          </div>
                        )}
                        {!isValidating &&
                          field.value &&
                          isValidPhoneNumber(field.value) && (
                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                          )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter the phone number linked to your M-Pesa account
                    </FormDescription>
                    <FormMessage />
                    {validationErrors.phone && (
                      <p className="text-sm text-destructive mt-1">
                        {validationErrors.phone}
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </Form>

            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Make sure your phone is on and has network coverage to receive
                the STK push prompt.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Bank Transfer Information */}
      {selectedMethod === "BANK_TRANSFER" && (
        <Card
          className={cn(selectedConfig.bgColor, selectedConfig.borderColor)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className={cn("h-4 w-4", selectedConfig.color)} />
              Bank Transfer Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Bank transfer details will be provided immediately after order
                confirmation. Please ensure payment is made within 24 hours to
                secure your order.
              </AlertDescription>
            </Alert>

            <div className="mt-4 space-y-2 text-sm bg-muted/30 p-3 rounded-lg">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Payment Reference:
                </span>
                <span className="font-mono">Your Order Number</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Processing Time:</span>
                <span>1-2 business days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank Charges:</span>
                <span>May apply (typically {currency} 25-50)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card Payment Information */}
      {selectedMethod === "CARD" && (
        <Card
          className={cn(selectedConfig.bgColor, selectedConfig.borderColor)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className={cn("h-4 w-4", selectedConfig.color)} />
              Card Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Accepted Cards</div>
                  <div className="text-muted-foreground">
                    Visa, Mastercard, Local cards
                  </div>
                </div>
                <div>
                  <div className="font-medium">Security</div>
                  <div className="text-muted-foreground">3D Secure enabled</div>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your card details are encrypted and processed securely. We
                  don&apos;t store your card information.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Instructions */}
      {showInstructions &&
        selectedConfig &&
        (expandedMethod === selectedMethod || selectedMethod) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                How {selectedConfig.title} Payment Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {selectedConfig.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium mt-0.5 flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-sm">{instruction}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="font-medium">Requirements</div>
                  <ul className="text-muted-foreground space-y-1">
                    {selectedConfig.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="font-medium">Payment Details</div>
                  <div className="space-y-1 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Processing: {selectedConfig.processingTime}
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3" />
                      Fees: {selectedConfig.fees}
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-3 w-3" />
                      Security: {selectedConfig.security}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              {selectedMethodData && orderTotal && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-medium mb-2">Payment Summary</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Order Total:</span>
                      <span>
                        {currency} {orderTotal.toLocaleString()}
                      </span>
                    </div>
                    {calculateFees(selectedMethodData) > 0 && (
                      <div className="flex justify-between">
                        <span>Payment Fee:</span>
                        <span>
                          {currency}{" "}
                          {calculateFees(selectedMethodData).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total to Pay:</span>
                      <span>
                        {currency}{" "}
                        {(
                          orderTotal + calculateFees(selectedMethodData)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      {/* Security Assurance */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-800">
                Secure Payment Processing
              </p>
              <p className="text-green-700 mt-1">
                All payments are processed through secure, encrypted channels.
                Your financial information is protected with industry-standard
                security measures including SSL encryption and PCI DSS
                compliance.
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-green-600">
                <div className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>PCI Compliant</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  <span>Real-time Processing</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
