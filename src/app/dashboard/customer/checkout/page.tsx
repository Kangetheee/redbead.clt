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
  useSessionExpired,
  useSessionTimeRemaining,
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
import { OrderReview } from "@/components/checkout/order-review";
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
  Shield,
  Timer,
} from "lucide-react";
import { completeCheckoutSchema } from "@/lib/checkout/dto/checkout.dto";
import {
  ShippingOption,
  CheckoutValidation,
} from "@/lib/checkout/types/checkout.types";
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
    displayText = custom;
  } else if (typeof custom === "object" && custom !== null) {
    if ("displayName" in custom) {
      displayText = custom.displayName;
    } else if ("value" in custom) {
      displayText = custom.value;
    } else if ("optionName" in custom && "valueName" in custom) {
      displayText = `${custom.optionName}: ${custom.valueName}`;
    } else if ("customValue" in custom && custom.customValue) {
      displayText = custom.customValue;
    } else if ("valueId" in custom && "optionId" in custom) {
      displayText = `Customization ${index + 1}`;
    } else {
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
  const [validationResult, setValidationResult] =
    useState<CheckoutValidation | null>(null);
  const [isStepTransitioning, setIsStepTransitioning] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Persistence hook
  const { clearStoredSession, persistStep, getStoredStep } =
    useCheckoutPersistence(sessionId || undefined);

  // Session monitoring hooks
  const timeRemaining = useSessionTimeRemaining(sessionId || "");
  const isSessionExpired = useSessionExpired(sessionId || "");

  // Data fetching hooks with better error handling
  const {
    data: checkoutSession,
    isLoading: sessionLoading,
    error: sessionError,
    refetch: refetchSession,
  } = useCheckoutSession(sessionId || "", !!sessionId);

  const {
    data: addressesResponse,
    isLoading: addressesLoading,
    error: addressesError,
    refetch: refetchAddresses,
  } = useAddresses();

  const { data: defaultShipping } = useDefaultAddress("SHIPPING");
  const { data: defaultBilling } = useDefaultAddress("BILLING");
  const { data: paymentMethods, isLoading: paymentMethodsLoading } =
    usePaymentMethods();

  // Mutation hooks with enhanced error handling
  const validateCheckoutMutation = useValidateCheckout();
  const completeCheckoutMutation = useCompleteCheckout();

  // Form setup with better validation
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
    mode: "onChange",
  });

  // Extract addresses safely
  const addresses = addressesResponse?.success
    ? addressesResponse.data.items
    : [];

  // Session validation and redirection
  useEffect(() => {
    if (!sessionId) {
      toast.error("No checkout session found");
      router.push("/dashboard/customer/cart");
      return;
    }

    // Restore saved step if available
    const savedStep = getStoredStep();
    if (savedStep && savedStep !== currentStep && savedStep <= 5) {
      setCurrentStep(savedStep);
    }
  }, [sessionId, router, getStoredStep, currentStep]);

  // Handle session expiry with better UX
  useEffect(() => {
    if (isSessionExpired) {
      toast.error("Your checkout session has expired");
      clearStoredSession();
      router.push("/dashboard/customer/cart");
    }
  }, [isSessionExpired, clearStoredSession, router]);

  // Session timeout warnings
  useEffect(() => {
    if (timeRemaining !== null) {
      if (timeRemaining === 5) {
        toast.warning("Your session will expire in 5 minutes", {
          duration: 10000,
        });
      } else if (timeRemaining === 1) {
        toast.error("Your session will expire in 1 minute!", {
          duration: 15000,
        });
      }
    }
  }, [timeRemaining]);

  // Set default addresses when data loads
  useEffect(() => {
    if (defaultShipping?.success && !form.getValues("shippingAddressId")) {
      form.setValue("shippingAddressId", defaultShipping.data.id);
    }
    if (defaultBilling?.success && !form.getValues("billingAddressId")) {
      form.setValue("billingAddressId", defaultBilling.data.id);
    }
  }, [defaultShipping, defaultBilling, form]);

  // Auto-progression logic with better validation
  const watchedValues = form.watch([
    "shippingAddressId",
    "selectedShippingOption",
    "paymentMethod",
  ]);
  const [shippingAddressId, selectedShippingOption, paymentMethod] =
    watchedValues;

  const advanceStep = useCallback(
    (newStep: number) => {
      if (newStep < 1 || newStep > steps.length) return;

      setIsStepTransitioning(true);
      setTimeout(() => {
        setCurrentStep(newStep);
        persistStep(newStep);
        setIsStepTransitioning(false);
      }, 300);
    },
    [persistStep]
  );

  // Enhanced auto-progression
  useEffect(() => {
    if (isStepTransitioning) return;

    // Auto-advance from step 2 to 3 when shipping address is selected
    if (currentStep === 2 && shippingAddressId && sessionId) {
      const address = addresses.find((a) => a.id === shippingAddressId);
      if (address) {
        advanceStep(3);
      }
    }
    // Auto-advance from step 3 to 4 when shipping option is selected
    else if (currentStep === 3 && shippingAddressId && selectedShippingOption) {
      const option = shippingOptions.find(
        (opt) => opt.id === selectedShippingOption
      );
      if (option) {
        advanceStep(4);
      }
    }
  }, [
    currentStep,
    shippingAddressId,
    selectedShippingOption,
    sessionId,
    advanceStep,
    isStepTransitioning,
    addresses,
    shippingOptions,
  ]);

  // Enhanced address selection
  const handleAddressSelect = useCallback(
    async (addressId: string) => {
      try {
        form.setValue("shippingAddressId", addressId);
        await refetchAddresses();

        // Clear any previous shipping options when address changes
        if (currentStep >= 3) {
          setShippingOptions([]);
          form.setValue("selectedShippingOption", "");
        }

        toast.success("Address selected");
      } catch (error) {
        toast.error("Failed to select address");
        console.error("Address selection error:", error);
      }
    },
    [form, refetchAddresses, currentStep]
  );

  // Navigation handlers with validation
  const handleNext = async () => {
    try {
      if (currentStep === 4) {
        await handleValidateCheckout();
      } else {
        const nextStep = Math.min(currentStep + 1, steps.length);
        advanceStep(nextStep);
      }
    } catch (error) {
      toast.error("Failed to proceed to next step");
      console.error("Navigation error:", error);
    }
  };

  const handlePrevious = () => {
    const prevStep = Math.max(1, currentStep - 1);
    advanceStep(prevStep);
  };

  // Enhanced validation handler
  const handleValidateCheckout = async () => {
    try {
      const formData = form.getValues();
      const shippingAddress = addresses.find(
        (a) => a.id === formData.shippingAddressId
      );

      if (!shippingAddress || !formData.selectedShippingOption) {
        toast.error("Please complete all required fields");
        return;
      }

      const validationData = {
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
      };

      validateCheckoutMutation.mutate(validationData, {
        onSuccess: (result) => {
          if (result.isValid) {
            setValidationResult(result);
            advanceStep(5);
            toast.success("Order validated successfully");
          } else {
            setValidationResult(result);
            // Show validation errors
            result.errors?.forEach((error) => toast.error(error));
            result.warnings?.forEach((warning) => toast.warning(warning));
          }
        },
        onError: (error) => {
          toast.error(`Validation failed: ${error.message}`);
          console.error("Validation error:", error);
        },
      });
    } catch (error) {
      toast.error("Unexpected error during validation");
      console.error("Validation error:", error);
    }
  };

  // Enhanced order completion
  const handleCompleteOrder = async (data: FormData) => {
    try {
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
          clearStoredSession();
          toast.success("Order placed successfully!");
          router.push(
            `/dashboard/customer/checkout/confirmation/${result.orderId}`
          );
        },
        onError: (error) => {
          console.error("Checkout error:", error);
          toast.error("Failed to complete checkout. Please try again.");
        },
      });
    } catch (error) {
      toast.error("Unexpected error during checkout");
      console.error("Checkout completion error:", error);
    }
  };

  // Enhanced shipping calculation handler
  const handleShippingCalculated = (options: ShippingOption[]) => {
    setShippingOptions(options);
    // Auto-select first option if none selected and options are available
    if (options.length > 0 && !form.getValues("selectedShippingOption")) {
      form.setValue("selectedShippingOption", options[0].id);
    }
  };

  // Enhanced refresh session handler
  const handleRefreshSession = async () => {
    try {
      setRetryCount((prev) => prev + 1);
      await Promise.all([refetchSession(), refetchAddresses()]);
      toast.success("Session refreshed");
    } catch (error) {
      toast.error("Failed to refresh session");
      console.error("Session refresh error:", error);
    }
  };

  // Enhanced error handling for failed states
  const handleRetryAfterError = useCallback(async () => {
    try {
      await handleRefreshSession();
      // Reset validation result on retry
      setValidationResult(null);
    } catch (error) {
      console.error("Retry error:", error);
    }
  }, []);

  // Loading state
  if (sessionLoading || !sessionId) {
    return <CheckoutLoading />;
  }

  // Error state with retry options
  if (sessionError || !checkoutSession) {
    return (
      <div className="container mx-auto py-8">
        <CheckoutError
          error={sessionError || "Checkout session not found"}
          errorType="session"
          showBackToCart={true}
          onRetry={retryCount < 3 ? handleRetryAfterError : undefined}
          showRetry={retryCount < 3}
        />
      </div>
    );
  }

  // Address loading error
  if (addressesError) {
    return (
      <div className="container mx-auto py-8">
        <CheckoutError
          error="Failed to load addresses"
          errorType="address"
          showBackToCart={true}
          onRetry={refetchAddresses}
        />
      </div>
    );
  }

  // Navigation button states with better validation
  const isNextDisabled =
    (currentStep === 2 && !form.watch("shippingAddressId")) ||
    (currentStep === 3 && !form.watch("selectedShippingOption")) ||
    (currentStep === 4 &&
      (!form.watch("paymentMethod") ||
        (form.watch("paymentMethod") === "MPESA" &&
          !form.watch("customerPhone")))) ||
    validateCheckoutMutation.isPending ||
    isStepTransitioning;

  const isSubmitDisabled =
    !validationResult?.isValid ||
    completeCheckoutMutation.isPending ||
    isStepTransitioning;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Secure Checkout</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Your information is protected with SSL encryption
              </p>
            </div>
            <div className="flex items-center gap-2">
              {timeRemaining !== null && timeRemaining > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {timeRemaining}m remaining
                </Badge>
              )}
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
        </div>

        {/* Session expiry warning */}
        {timeRemaining !== null && timeRemaining <= 10 && timeRemaining > 0 && (
          <Alert className="mb-6" variant="destructive">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Your checkout session will expire in {timeRemaining} minutes.
              Please complete your order soon or your cart items may be
              released.
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Steps */}
        <CheckoutSteps
          steps={steps}
          currentStep={currentStep}
          onStepClick={(step) => {
            // Allow navigation to previous completed steps with validation
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
                        Review Your Order ({checkoutSession.items.length} items)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {checkoutSession.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-4 py-4 border-b last:border-b-0"
                          >
                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                              {item.thumbnail ? (
                                <img
                                  src={item.thumbnail}
                                  alt={item.productName || "Product"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">
                                {item.productName ||
                                  item.templateName ||
                                  "Product"}
                              </h3>
                              <div className="text-sm text-muted-foreground">
                                Quantity: {item.quantity} × KES{" "}
                                {item.unitPrice.toLocaleString()}
                              </div>
                              {item.customizations &&
                                Array.isArray(item.customizations) &&
                                item.customizations.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.customizations
                                      .slice(0, 3)
                                      .map((custom, idx) =>
                                        renderCustomization(custom, idx)
                                      )}
                                    {item.customizations.length > 3 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        +{item.customizations.length - 3} more
                                      </Badge>
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

                        {/* Order requirements */}
                        {checkoutSession.requiresDesignApproval && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              This order requires design approval before
                              production begins.
                            </AlertDescription>
                          </Alert>
                        )}
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
                      {paymentMethodsLoading ? (
                        <div>Loading payment methods...</div>
                      ) : (
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
                      )}

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
                            final details below and click &quot;Place
                            Order&quot; to complete your purchase.
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

                      {validationResult.warnings &&
                        validationResult.warnings.length > 0 && (
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
                            {validationResult.finalTotals.discount > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Discount:</span>
                                <span>
                                  -KES{" "}
                                  {validationResult.finalTotals.discount.toLocaleString()}
                                </span>
                              </div>
                            )}
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

                      {validationResult.estimatedProductionDays && (
                        <div className="text-sm text-muted-foreground">
                          <strong>Production Time:</strong>{" "}
                          {validationResult.estimatedProductionDays} business
                          days
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

              {/* Enhanced Order Summary Sidebar */}
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
