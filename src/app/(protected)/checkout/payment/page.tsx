/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Phone,
  Shield,
  Loader2,
} from "lucide-react";
import { usePaymentMethods, useInitiatePayment } from "@/hooks/use-payments";
import { useCreateOrder } from "@/hooks/use-orders";
import { useCart } from "@/hooks/use-cart";
import { formatAmount } from "@/lib/utils";
import { toast } from "sonner";

const paymentSchema = z.object({
  paymentMethod: z.string().min(1, "Please select a payment method"),
  customerPhone: z.string().optional(),
});

type PaymentForm = z.infer<typeof paymentSchema>;

// Define proper error type
interface ApiError {
  message?: string;
}

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");

  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: paymentMethods } = usePaymentMethods();
  const { data: cartData, isLoading: cartLoading } = useCart();
  const createOrder = useCreateOrder();
  const initiatePayment = useInitiatePayment();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
  });

  const selectedMethod = watch("paymentMethod");

  useEffect(() => {
    // Get checkout data from previous steps
    const stored = sessionStorage.getItem("checkoutData");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCheckoutData(parsed);

        // Pre-fill phone number if available from user profile or guest info
        if (parsed.guestInfo?.phone) {
          setValue("customerPhone", parsed.guestInfo.phone);
        }
      } catch (error) {
        console.error("Failed to parse checkout data:", error);
        router.push("/checkout");
      }
    } else {
      // Redirect back if no checkout data
      router.push("/checkout");
    }
  }, [router, setValue]);

  // Redirect if no session ID
  useEffect(() => {
    if (!sessionId) {
      router.push("/checkout");
    }
  }, [sessionId, router]);

  const transformCartItemsToOrderItems = (cartItems: any[]) => {
    return cartItems.map((item: any) => {
      // Map the cart item to the expected order item format
      const orderItem: any = {
        // Use productId if available, otherwise use templateId
        productId: item.productId || item.templateId || "",
        // Use variantId if available, otherwise use sizeVariantId
        variantId: item.variantId || item.sizeVariantId || "",
        quantity: item.quantity || 1,
      };

      // Handle customizations - convert array to object if needed
      if (item.customizations) {
        if (Array.isArray(item.customizations)) {
          // Convert array of customizations to object format
          const customizationsObj: any = {};
          item.customizations.forEach((customization: any) => {
            if (customization.optionId && customization.valueId) {
              customizationsObj[customization.optionId] =
                customization.customValue || customization.valueId;
            }
          });
          orderItem.customizations = customizationsObj;
        } else if (typeof item.customizations === "object") {
          // Already an object, use as is
          orderItem.customizations = item.customizations;
        }
      } else {
        // Provide empty object if no customizations
        orderItem.customizations = {};
      }

      // Add design ID if available
      if (item.designId) {
        orderItem.designId = item.designId;
      }

      return orderItem;
    });
  };

  const onSubmit = async (data: PaymentForm) => {
    if (!checkoutData || !sessionId) {
      toast.error("Missing checkout information");
      return;
    }

    setIsProcessing(true);

    try {
      // Check if we have items in cart or checkout session - fix undefined check
      const hasCartItems =
        cartData?.items &&
        Array.isArray(cartData.items) &&
        cartData.items.length > 0;
      const hasCheckoutSessionItems =
        checkoutData.checkoutSession?.items?.length > 0;
      const hasDirectItems = checkoutData.items?.length > 0;

      // Create the order payload with required fields
      const orderPayload: any = {
        paymentMethod: data.paymentMethod.toUpperCase(),
        customerPhone: data.customerPhone,
        urgencyLevel: checkoutData.urgencyLevel || "NORMAL",
      };

      // Handle address IDs - these are required for the API
      if (checkoutData.shippingAddressId) {
        orderPayload.shippingAddressId = checkoutData.shippingAddressId;
      } else {
        toast.error("Shipping address ID is required");
        return;
      }

      // Add billing address ID if available
      if (checkoutData.billingAddressId) {
        orderPayload.billingAddressId = checkoutData.billingAddressId;
      }

      // Add other optional fields if available
      if (checkoutData.customerId) {
        orderPayload.customerId = checkoutData.customerId;
      }

      if (checkoutData.couponCode) {
        orderPayload.couponCode = checkoutData.couponCode;
      }

      if (checkoutData.notes) {
        orderPayload.notes = checkoutData.notes;
      }

      if (checkoutData.expectedProductionDays) {
        orderPayload.expectedProductionDays =
          checkoutData.expectedProductionDays;
      }

      if (checkoutData.specialInstructions) {
        orderPayload.specialInstructions = checkoutData.specialInstructions;
      }

      if (checkoutData.designApprovalRequired !== undefined) {
        orderPayload.designApprovalRequired =
          checkoutData.designApprovalRequired;
      }

      if (checkoutData.templateId) {
        orderPayload.templateId = checkoutData.templateId;
      }

      // Determine the best source for items and transform them
      if (hasCartItems && cartData?.items) {
        const transformedItems = transformCartItemsToOrderItems(cartData.items);

        // Validate that all required fields are present after transformation
        const invalidItems = transformedItems.filter(
          (item: any) => !item.productId || !item.variantId || !item.quantity
        );

        if (invalidItems.length > 0) {
          toast.error(
            "Some cart items are missing required information. Please refresh your cart."
          );
          router.push("/checkout");
          return;
        }

        orderPayload.items = transformedItems;
        orderPayload.useCartItems = false; // We're providing items directly
      } else if (hasCheckoutSessionItems) {
        // Transform checkout session items if they exist
        const transformedItems = transformCartItemsToOrderItems(
          checkoutData.checkoutSession.items
        );
        orderPayload.items = transformedItems;
        orderPayload.useCartItems = false;
      } else if (hasDirectItems) {
        const transformedItems = transformCartItemsToOrderItems(
          checkoutData.items
        );
        orderPayload.items = transformedItems;
        orderPayload.useCartItems = false;
      } else {
        toast.error(
          "No items found in your cart. Please start checkout again."
        );
        router.push("/checkout");
        return;
      }

      const orderResult = await createOrder.mutateAsync(orderPayload);

      if (!orderResult || !orderResult.id) {
        throw new Error("Failed to create order");
      }

      // Store order ID for success page
      sessionStorage.setItem("completedOrderId", orderResult.id);

      // If payment method requires immediate processing (like M-Pesa), initiate payment
      if (data.paymentMethod.toLowerCase() === "mpesa") {
        try {
          const paymentResult = await initiatePayment.mutateAsync({
            orderId: orderResult.id,
            values: {
              method: data.paymentMethod,
              customerPhone: data.customerPhone,
            },
          });

          if (paymentResult.success) {
            // Show payment instructions if available
            if (paymentResult.data?.customerMessage) {
              toast.success(paymentResult.data.customerMessage, {
                duration: 10000,
              });
            }
          }
        } catch (paymentError) {
          console.error("Payment initiation failed:", paymentError);
          // Don't fail the entire flow - order was created successfully
          toast.warning(
            "Order created but payment initiation failed. Please contact support."
          );
        }
      }

      // Clear checkout data
      sessionStorage.removeItem("guestCheckoutInfo");
      sessionStorage.removeItem("checkoutData");
      sessionStorage.removeItem("selectedShippingOption");
      sessionStorage.removeItem("shippingAddress");
      sessionStorage.removeItem("selectedAddressId");
      sessionStorage.removeItem("tempAddress");

      // Redirect to success page
      router.push(`/checkout/success?order=${orderResult.id}`);
    } catch (error) {
      console.error("Failed to process order:", error);

      // Properly type the error and provide better error handling
      const apiError = error as ApiError;
      const errorMessage = apiError?.message || "Unknown error";

      // Check if it's a cart empty error and provide better guidance
      if (
        errorMessage.includes("Cart is empty") ||
        errorMessage.includes("No items")
      ) {
        toast.error(
          "Your cart appears to be empty. Please add items and try again."
        );
        router.push("/checkout");
      } else if (errorMessage.includes("session")) {
        toast.error("Your session has expired. Please start checkout again.");
        router.push("/checkout");
      } else {
        toast.error(`Failed to process your order: ${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    router.push(`/checkout/shipping?session=${sessionId}`);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "mpesa":
        return <Smartphone className="w-5 h-5" />;
      case "card":
        return <CreditCard className="w-5 h-5" />;
      case "bank_transfer":
        return <Phone className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  // Show loading state while checkout data or cart is loading
  if (!checkoutData || cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading payment page...</p>
        </div>
      </div>
    );
  }

  const selectedShippingOption = checkoutData.selectedShippingOption;
  const totals = checkoutData.calculatedTotals || checkoutData.checkoutSession;

  // Get items from multiple sources, prioritizing current cart - fix undefined check
  const orderItems =
    (cartData?.items && Array.isArray(cartData.items)
      ? cartData.items
      : null) ||
    checkoutData.checkoutSession?.items ||
    checkoutData.items ||
    [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shipping
          </Button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment</h1>
            <p className="text-gray-600">Complete your order securely</p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">
                Information
              </span>
            </div>
            <div className="flex-1 h-px bg-green-600 mx-4"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">
                Shipping
              </span>
            </div>
            <div className="flex-1 h-px bg-green-600 mx-4"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">
                Payment
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
                <CardDescription>
                  Choose how you&apos;d like to pay for your order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <RadioGroup
                      value={selectedMethod}
                      onValueChange={(value) =>
                        setValue("paymentMethod", value)
                      }
                      className="space-y-3"
                    >
                      {paymentMethods?.map((method) => (
                        <div
                          key={method.value}
                          className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <RadioGroupItem
                            value={method.value}
                            id={method.value}
                            disabled={!method.enabled}
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={method.value}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                {getPaymentMethodIcon(method.value)}
                                <div>
                                  <p className="font-medium">{method.name}</p>
                                  {!method.enabled && (
                                    <p className="text-sm text-gray-500">
                                      Currently unavailable
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Label>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                    {errors.paymentMethod && (
                      <p className="text-sm text-red-500 mt-2">
                        {errors.paymentMethod.message}
                      </p>
                    )}
                  </div>

                  {/* M-Pesa phone number field */}
                  {selectedMethod === "mpesa" && (
                    <div>
                      <Label htmlFor="customerPhone">M-Pesa Phone Number</Label>
                      <Input
                        id="customerPhone"
                        type="tel"
                        {...register("customerPhone")}
                        placeholder="+254 700 000 000"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        You&apos;ll receive a payment prompt on this number
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      Your payment information is secure and encrypted
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={isProcessing}
                    >
                      Back to Shipping
                    </Button>
                    <Button
                      type="submit"
                      disabled={isProcessing || !selectedMethod}
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        "Complete Order"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Order Review */}
            <Card>
              <CardHeader>
                <CardTitle>Review Your Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Shipping Address */}
                  <div>
                    <h4 className="font-medium mb-2">Shipping Address</h4>
                    <div className="text-sm text-gray-600">
                      <p>{checkoutData.shippingAddress?.recipientName}</p>
                      <p>{checkoutData.shippingAddress?.street}</p>
                      {checkoutData.shippingAddress?.street2 && (
                        <p>{checkoutData.shippingAddress.street2}</p>
                      )}
                      <p>
                        {checkoutData.shippingAddress?.city},{" "}
                        {checkoutData.shippingAddress?.state}{" "}
                        {checkoutData.shippingAddress?.postalCode}
                      </p>
                      <p>{checkoutData.shippingAddress?.country}</p>
                      {checkoutData.shippingAddress?.phone && (
                        <p>{checkoutData.shippingAddress.phone}</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Shipping Method */}
                  <div>
                    <h4 className="font-medium mb-2">Shipping Method</h4>
                    {selectedShippingOption && (
                      <div className="text-sm text-gray-600">
                        <p>{selectedShippingOption.name}</p>
                        {selectedShippingOption.description && (
                          <p>{selectedShippingOption.description}</p>
                        )}
                        {selectedShippingOption.estimatedDays && (
                          <p>
                            Estimated: {selectedShippingOption.estimatedDays}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Cart Items */}
                  {orderItems && orderItems.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">
                        Items ({orderItems.length}):
                      </h4>
                      {orderItems.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span className="truncate mr-2">
                            {item.productName || item.name || "Product"} ×{" "}
                            {item.quantity}
                          </span>
                          <span>
                            {formatAmount(item.totalPrice || item.total || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Show warning if no items */}
                  {(!orderItems || orderItems.length === 0) && (
                    <div className="space-y-2">
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          ⚠️ No items found in cart. Please go back and add
                          items.
                        </p>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatAmount(totals?.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>
                      {selectedShippingOption?.isFree
                        ? "Free"
                        : formatAmount(totals?.shippingCost || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatAmount(totals?.estimatedTax || 0)}</span>
                  </div>
                  {totals?.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{formatAmount(totals.discount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>
                      {formatAmount(
                        totals?.estimatedTotal || totals?.total || 0
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 text-center">
                    By completing your order, you agree to our Terms of Service
                    and Privacy Policy
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
