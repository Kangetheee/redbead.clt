/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Hooks
import {
  useCheckoutSession,
  useValidateCheckout,
  useCompleteCheckout,
} from "@/hooks/use-checkout";
import { useAddresses, useDefaultAddress } from "@/hooks/use-address";
import { usePaymentMethods } from "@/hooks/use-payments";
import { useCheckoutPersistence } from "@/hooks/use-checkout-persistence";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { AddressSelector } from "@/components/checkout/address-selector";
import { ShippingCalculation } from "@/components/checkout/shipping-calculation";
import { OrderSummary } from "@/components/checkout/order-summary";
import { PaymentMethods } from "@/components/checkout/payment-methods";
import { CheckoutError } from "@/components/checkout/checkout-error";
import { CheckoutLoading } from "@/components/checkout/checkout-loading";
import {
  ShoppingCart,
  MapPin,
  Truck,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Clock,
} from "lucide-react";

// Types and Schemas
import { completeCheckoutSchema } from "@/lib/checkout/dto/checkout.dto";
import { ShippingOption } from "@/lib/checkout/types/checkout.types";
import { AddressType } from "@/lib/address/types/address.types";

type FormData = z.infer<typeof completeCheckoutSchema>;
type PaymentMethodType = "MPESA" | "BANK_TRANSFER" | "CARD";

// Step Configuration
const steps = [
  { id: 1, name: "Review Order", icon: ShoppingCart },
  { id: 2, name: "Shipping", icon: MapPin },
  { id: 3, name: "Delivery", icon: Truck },
  { id: 4, name: "Payment", icon: CreditCard },
  { id: 5, name: "Confirmation", icon: CheckCircle },
];

export default function CheckoutPage() {
  // Router and URL handling
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");

  // Local state
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);

  // Persistence hook
  const { clearStoredSession } = useCheckoutPersistence(sessionId || undefined);

  // Data fetching hooks
  const {
    data: checkoutSession,
    isLoading: sessionLoading,
    error: sessionError,
  } = useCheckoutSession(sessionId || "", !!sessionId);
  const { data: addresses } = useAddresses();
  const { data: defaultShipping } = useDefaultAddress("SHIPPING");
  const { data: defaultBilling } = useDefaultAddress("BILLING");
  const { data: paymentMethods } = usePaymentMethods();

  // Mutation hooks
  const validateCheckoutMutation = useValidateCheckout();
  const completeCheckoutMutation = useCompleteCheckout();

  // Form setup
  const form = useForm<FormData>({
    resolver: zodResolver(completeCheckoutSchema),
    defaultValues: {
      sessionId: sessionId || "",
      shippingAddressId: "",
      billingAddressId: "",
      paymentMethod: "MPESA",
      notes: "",
      specialInstructions: "",
    },
  });

  // Set default addresses when data loads
  useEffect(() => {
    if (defaultShipping?.success && !form.getValues("shippingAddressId")) {
      form.setValue("shippingAddressId", defaultShipping.data.id);
    }
    if (defaultBilling?.success && !form.getValues("billingAddressId")) {
      form.setValue("billingAddressId", defaultBilling.data.id);
    }
  }, [defaultShipping, defaultBilling, form]);

  // Redirect if no session
  useEffect(() => {
    if (!sessionId) {
      router.push("/dashboard/customer/cart");
    }
  }, [sessionId, router]);

  // Handle session expiry
  useEffect(() => {
    if (checkoutSession && new Date(checkoutSession.expiresAt) < new Date()) {
      clearStoredSession();
      router.push("/dashboard/customer/cart");
    }
  }, [checkoutSession, clearStoredSession, router]);

  // Auto-advance to shipping options when address is selected
  const watchShippingAddress = form.watch("shippingAddressId");
  useEffect(() => {
    if (watchShippingAddress && sessionId && currentStep === 2) {
      setCurrentStep(3);
    }
  }, [watchShippingAddress, sessionId, currentStep]);

  // Navigation handlers
  const handleNext = async () => {
    if (currentStep === 4) {
      await handleValidateCheckout();
    } else {
      setCurrentStep(Math.min(currentStep + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  // Validation handler
  const handleValidateCheckout = async () => {
    const formData = form.getValues();
    const shippingAddress = addresses?.success
      ? addresses.data.items.find((a) => a.id === formData.shippingAddressId)
      : null;

    if (!shippingAddress || !formData.selectedShippingOption) {
      return;
    }

    validateCheckoutMutation.mutate(
      {
        sessionId: sessionId!,
        shippingAddress: {
          recipientName: shippingAddress.recipientName,
          companyName: shippingAddress.companyName || undefined,
          street: shippingAddress.street,
          street2: shippingAddress.street2 || undefined,
          city: shippingAddress.city,
          state: shippingAddress.state || undefined,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
          phone: shippingAddress.phone || undefined,
        },
        selectedShippingOption: formData.selectedShippingOption,
        paymentMethod: formData.paymentMethod,
        customerPhone: formData.customerPhone,
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            setValidationResult(data.data);
            setCurrentStep(5);
          }
        },
      }
    );
  };

  // Order completion handler
  const handleCompleteOrder = async (data: FormData) => {
    completeCheckoutMutation.mutate(data, {
      onSuccess: (result) => {
        if (result.success) {
          clearStoredSession();
          router.push(
            `/dashboard/customer/checkout/confirmation/${result.data.orderId}`
          );
        }
      },
    });
  };

  // Shipping calculation handler
  const handleShippingCalculated = (options: ShippingOption[]) => {
    setShippingOptions(options);
    // Auto-select first option if none selected
    if (options.length > 0 && !form.getValues("selectedShippingOption")) {
      form.setValue("selectedShippingOption", options[0].id);
    }
  };

  // Loading state
  if (sessionLoading || !sessionId) {
    return <CheckoutLoading />;
  }

  // Error state
  if (sessionError || !checkoutSession) {
    return (
      <div className="container mx-auto py-8">
        <CheckoutError
          error={sessionError || "Checkout session not found"}
          showBackToCart={true}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Session expiry warning
  const timeUntilExpiry =
    new Date(checkoutSession.expiresAt).getTime() - Date.now();
  const showExpiryWarning = timeUntilExpiry < 10 * 60 * 1000; // 10 minutes

  // Navigation button states
  const isNextDisabled =
    (currentStep === 2 && !form.watch("shippingAddressId")) ||
    (currentStep === 3 && !form.watch("selectedShippingOption")) ||
    (currentStep === 4 && !form.watch("paymentMethod")) ||
    validateCheckoutMutation.isPending;

  const isSubmitDisabled =
    !validationResult?.isValid || completeCheckoutMutation.isPending;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground">Complete your order securely</p>
        </div>

        {/* Session expiry warning */}
        {showExpiryWarning && (
          <Alert className="mb-6">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Your checkout session will expire in{" "}
              {Math.ceil(timeUntilExpiry / 60000)} minutes. Please complete your
              order soon.
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Steps */}
        <CheckoutSteps steps={steps} currentStep={currentStep} />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCompleteOrder)}
            className="mt-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Step 1: Review Order */}
                {currentStep === 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Review Your Order
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {checkoutSession.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-4 py-4 border-b last:border-b-0"
                          >
                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                              <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">
                                {item.productName}
                              </h3>
                              <div className="text-sm text-muted-foreground">
                                Quantity: {item.quantity} × KES{" "}
                                {item.unitPrice.toLocaleString()}
                              </div>
                              {item.customizations.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.customizations.map((custom, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {custom}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                KES {item.totalPrice.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 2: Shipping Address */}
                {currentStep === 2 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Shipping Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AddressSelector
                        addresses={
                          addresses?.success ? addresses.data.items : []
                        }
                        selectedAddressId={
                          form.watch("shippingAddressId") || ""
                        }
                        onAddressSelect={(addressId: string) =>
                          form.setValue("shippingAddressId", addressId)
                        }
                        addressType="SHIPPING"
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Step 3: Delivery Options */}
                {currentStep === 3 && watchShippingAddress && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Delivery Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const address = addresses?.success
                          ? addresses.data.items.find(
                              (a) => a.id === watchShippingAddress
                            )
                          : null;

                        if (!address) {
                          return (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                Please select a shipping address to continue.
                              </AlertDescription>
                            </Alert>
                          );
                        }

                        return (
                          <ShippingCalculation
                            sessionId={sessionId!}
                            shippingAddress={{
                              recipientName: address.recipientName,
                              companyName: address.companyName || undefined,
                              street: address.street,
                              street2: address.street2 || undefined,
                              city: address.city,
                              state: address.state || undefined,
                              postalCode: address.postalCode,
                              country: address.country,
                              phone: address.phone || undefined,
                            }}
                            selectedOption={
                              form.watch("selectedShippingOption") || ""
                            }
                            onOptionSelect={(optionId: string) =>
                              form.setValue("selectedShippingOption", optionId)
                            }
                            onShippingCalculated={handleShippingCalculated}
                          />
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}

                {/* Step 4: Payment Method */}
                {currentStep === 4 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <PaymentMethods
                        methods={paymentMethods || []}
                        selectedMethod={form.watch("paymentMethod")}
                        onMethodSelect={(method: PaymentMethodType) =>
                          form.setValue("paymentMethod", method)
                        }
                        customerPhone={form.watch("customerPhone")}
                        onPhoneChange={(phone: string) =>
                          form.setValue("customerPhone", phone)
                        }
                      />

                      <Separator />

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Order Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Any additional notes for your order..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="specialInstructions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Special Instructions (Optional)
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Special delivery or handling instructions..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 5: Order Confirmation */}
                {currentStep === 5 && validationResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Order Confirmation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {validationResult.isValid ? (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            Your order is ready to be placed. Please review the
                            final details below.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Please review and fix the following issues:
                            <ul className="list-disc list-inside mt-2">
                              {validationResult.errors?.map(
                                (error: string, index: number) => (
                                  <li key={index}>{error}</li>
                                )
                              )}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}

                      {validationResult.warnings?.length > 0 && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Please note:
                            <ul className="list-disc list-inside mt-2">
                              {validationResult.warnings.map(
                                (warning: string, index: number) => (
                                  <li key={index}>{warning}</li>
                                )
                              )}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}

                      {validationResult.finalTotals && (
                        <div className="bg-muted p-4 rounded-lg">
                          <h4 className="font-medium mb-2">
                            Final Order Summary
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>
                                KES{" "}
                                {validationResult.finalTotals.subtotal.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shipping:</span>
                              <span>
                                KES{" "}
                                {validationResult.finalTotals.shipping.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tax:</span>
                              <span>
                                KES{" "}
                                {validationResult.finalTotals.tax.toLocaleString()}
                              </span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-medium">
                              <span>Total:</span>
                              <span>
                                KES{" "}
                                {validationResult.finalTotals.total.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {validationResult.estimatedDelivery && (
                        <div className="text-sm text-muted-foreground">
                          <strong>Estimated Delivery:</strong>{" "}
                          {validationResult.estimatedDelivery}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      Step {currentStep} of {steps.length}
                    </span>

                    {currentStep < 5 ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        disabled={isNextDisabled}
                      >
                        {validateCheckoutMutation.isPending
                          ? "Validating..."
                          : "Continue"}
                      </Button>
                    ) : (
                      <Button type="submit" disabled={isSubmitDisabled}>
                        {completeCheckoutMutation.isPending
                          ? "Placing Order..."
                          : "Place Order"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-4">
                  <OrderSummary
                    session={checkoutSession}
                    shippingCost={
                      shippingOptions.find(
                        (opt) => opt.id === form.watch("selectedShippingOption")
                      )?.cost || 0
                    }
                    finalTotals={validationResult?.finalTotals}
                  />
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
