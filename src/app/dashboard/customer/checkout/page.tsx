/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCheckoutSession,
  useValidateCheckout,
  useCompleteCheckout,
} from "@/hooks/use-checkout";
import { useAddresses, useDefaultAddress } from "@/hooks/use-address";
import { usePaymentMethods } from "@/hooks/use-payments";
import { useCheckoutPersistence } from "@/hooks/use-checkout-persistence";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import {
  AddressSelector,
  AddressSelectorSkeleton,
} from "@/components/checkout/address-selector";
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
  RefreshCw,
} from "lucide-react";
import { completeCheckoutSchema } from "@/lib/checkout/dto/checkout.dto";
import { ShippingOption } from "@/lib/checkout/types/checkout.types";
import { AddressType } from "@/lib/address/types/address.types";
import { toast } from "sonner";

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

// Helper function to safely render customizations
const renderCustomization = (custom: any, index: number) => {
  let displayText = "";

  if (typeof custom === "string") {
    // If it's already a string, use it directly
    displayText = custom;
  } else if (typeof custom === "object" && custom !== null) {
    // If it's an object, try to extract meaningful display text
    if ("displayName" in custom) {
      displayText = custom.displayName;
    } else if ("value" in custom) {
      displayText = custom.value;
    } else if ("optionName" in custom && "valueName" in custom) {
      displayText = `${custom.optionName}: ${custom.valueName}`;
    } else if ("customValue" in custom && custom.customValue) {
      displayText = custom.customValue;
    } else if ("valueId" in custom && "optionId" in custom) {
      // Handle the case where we have IDs but need to show meaningful text
      displayText = `Customization ${index + 1}`;
    } else {
      // Fallback: create a readable representation
      try {
        const keys = Object.keys(custom);
        if (keys.length > 0) {
          displayText = `${keys[0]}: ${custom[keys[0]]}`;
        } else {
          displayText = `Customization ${index + 1}`;
        }
      } catch {
        displayText = `Customization ${index + 1}`;
      }
    }
  } else {
    // Fallback for other types
    displayText = String(custom);
  }

  return (
    <Badge key={index} variant="outline" className="text-xs">
      {displayText}
    </Badge>
  );
};

export default function CheckoutPage() {
  // Router and URL handling
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdRaw = searchParams.get("session");
  const sessionId = sessionIdRaw ? sessionIdRaw.split("?")[0] : null;

  // Local state
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isStepTransitioning, setIsStepTransitioning] = useState(false);

  // Persistence hook
  const { clearStoredSession, persistStep, getStoredStep } =
    useCheckoutPersistence(sessionId || undefined);

  // Data fetching hooks
  const {
    data: checkoutSession,
    isLoading: sessionLoading,
    error: sessionError,
    refetch: refetchSession,
  } = useCheckoutSession(sessionId || "", !!sessionId);

  const {
    data: addressesResponse,
    isLoading: addressesLoading,
    refetch: refetchAddresses,
  } = useAddresses();

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
      selectedShippingOption: "",
      customerPhone: "",
    },
  });

  // Extract addresses safely
  const addresses = addressesResponse?.success
    ? addressesResponse.data.items
    : [];

  // Session validation and redirection
  useEffect(() => {
    if (!sessionId) {
      router.push("/dashboard/customer/cart");
      return;
    }

    // Restore saved step if available
    const savedStep = getStoredStep();
    if (savedStep && savedStep !== currentStep) {
      setCurrentStep(savedStep);
    }
  }, [sessionId, router, getStoredStep, currentStep]);

  // Handle session expiry
  useEffect(() => {
    if (checkoutSession && new Date(checkoutSession.expiresAt) < new Date()) {
      clearStoredSession();
      router.push("/dashboard/customer/cart");
    }
  }, [checkoutSession, clearStoredSession, router]);

  // Set default addresses when data loads
  useEffect(() => {
    if (defaultShipping?.success && !form.getValues("shippingAddressId")) {
      form.setValue("shippingAddressId", defaultShipping.data.id);
    }
    if (defaultBilling?.success && !form.getValues("billingAddressId")) {
      form.setValue("billingAddressId", defaultBilling.data.id);
    }
  }, [defaultShipping, defaultBilling, form]);

  // Auto-progression logic with proper step validation
  const watchedValues = form.watch([
    "shippingAddressId",
    "selectedShippingOption",
    "paymentMethod",
  ]);
  const [shippingAddressId, selectedShippingOption, paymentMethod] =
    watchedValues;

  const advanceStep = useCallback(
    (newStep: number) => {
      setIsStepTransitioning(true);
      setTimeout(() => {
        setCurrentStep(newStep);
        persistStep(newStep);
        setIsStepTransitioning(false);
      }, 300);
    },
    [persistStep]
  );

  useEffect(() => {
    if (isStepTransitioning) return;

    // Auto-advance from step 2 to 3 when shipping address is selected
    if (currentStep === 2 && shippingAddressId && sessionId) {
      advanceStep(3);
    }
    // Auto-advance from step 3 to 4 when shipping option is selected
    else if (currentStep === 3 && shippingAddressId && selectedShippingOption) {
      advanceStep(4);
    }
  }, [
    currentStep,
    shippingAddressId,
    selectedShippingOption,
    sessionId,
    advanceStep,
    isStepTransitioning,
  ]);

  // Handle address selection with refetch
  const handleAddressSelect = useCallback(
    async (addressId: string) => {
      form.setValue("shippingAddressId", addressId);
      // Refetch addresses to ensure we have the latest data
      await refetchAddresses();
    },
    [form, refetchAddresses]
  );

  // Navigation handlers
  const handleNext = async () => {
    if (currentStep === 4) {
      await handleValidateCheckout();
    } else {
      const nextStep = Math.min(currentStep + 1, steps.length);
      advanceStep(nextStep);
    }
  };

  const handlePrevious = () => {
    const prevStep = Math.max(1, currentStep - 1);
    advanceStep(prevStep);
  };

  // Validation handler
  const handleValidateCheckout = async () => {
    const formData = form.getValues();
    const shippingAddress = addresses.find(
      (a) => a.id === formData.shippingAddressId
    );

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
            advanceStep(5);
          }
        },
      }
    );
  };

  const handleCompleteOrder = async (data: FormData) => {
    const shippingAddress = addresses.find(
      (addr) => addr.id === data.shippingAddressId
    );

    if (!shippingAddress) {
      toast.error("Shipping address not found");
      return;
    }

    const completeCheckoutData = {
      ...data,
      shippingAddressId: data.shippingAddressId,
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
    };

    completeCheckoutMutation.mutate(completeCheckoutData, {
      onSuccess: (result) => {
        if (result.success) {
          clearStoredSession();
          router.push(
            `/dashboard/customer/checkout/confirmation/${result.data.orderId}`
          );
        }
      },
      onError: (error) => {
        console.error("Checkout error:", error);
        toast.error("Failed to complete checkout. Please try again.");
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

  // Refresh session handler
  const handleRefreshSession = async () => {
    await refetchSession();
    await refetchAddresses();
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
          onRetry={handleRefreshSession}
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
    validateCheckoutMutation.isPending ||
    isStepTransitioning;

  const isSubmitDisabled =
    !validationResult?.isValid ||
    completeCheckoutMutation.isPending ||
    isStepTransitioning;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Checkout</h1>
              <p className="text-muted-foreground">
                Complete your order securely
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshSession}
              disabled={sessionLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${sessionLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
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
        <CheckoutSteps
          steps={steps}
          currentStep={currentStep}
          onStepClick={(step) => {
            // Allow navigation to previous completed steps
            if (step < currentStep) {
              advanceStep(step);
            }
          }}
        />

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
                              {item.customizations &&
                                Array.isArray(item.customizations) &&
                                item.customizations.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.customizations.map((custom, idx) =>
                                      renderCustomization(custom, idx)
                                    )}
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
                      {addressesLoading ? (
                        <AddressSelectorSkeleton />
                      ) : (
                        <AddressSelector
                          addresses={addresses}
                          selectedAddressId={
                            form.watch("shippingAddressId") || ""
                          }
                          onAddressSelect={handleAddressSelect}
                          addressType="SHIPPING"
                          sessionId={sessionId}
                          disabled={isStepTransitioning}
                        />
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Step 3: Delivery Options */}
                {currentStep === 3 && shippingAddressId && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Delivery Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const address = addresses.find(
                          (a) => a.id === shippingAddressId
                        );

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
                    disabled={currentStep === 1 || isStepTransitioning}
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
                          : isStepTransitioning
                            ? "Loading..."
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
