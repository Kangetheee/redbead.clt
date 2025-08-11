/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, CreditCard, Smartphone, Phone, Shield } from "lucide-react";
import { usePaymentMethods, useInitiatePayment } from "@/hooks/use-payments";
import { useCreateOrder } from "@/hooks/use-orders";
import { toast } from "sonner";

const paymentSchema = z.object({
  paymentMethod: z.string().min(1, "Please select a payment method"),
  customerPhone: z.string().optional(),
});

type PaymentForm = z.infer<typeof paymentSchema>;

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: paymentMethods } = usePaymentMethods();
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
      const parsed = JSON.parse(stored);
      setCheckoutData(parsed);
    } else {
      // Redirect back if no checkout data
      router.push("/checkout");
    }
  }, [router]);

  const onSubmit = async (data: PaymentForm) => {
    if (!checkoutData) {
      toast.error("Missing checkout information");
      return;
    }

    setIsProcessing(true);

    try {
      // Create the order first
      const orderResult = await createOrder.mutateAsync({
        shippingAddressId: checkoutData.shippingAddressId,
        billingAddressId: checkoutData.billingAddressId,
        paymentMethod: data.paymentMethod,
        customerPhone: data.customerPhone || checkoutData.guestInfo?.phone,
        useCartItems: true, // Assuming we're using cart items
        notes: "Order created through checkout flow",
      });

      if (!orderResult) {
        throw new Error("Failed to create order");
      }

      // Store order ID for success page
      sessionStorage.setItem("completedOrderId", orderResult.id);

      // If payment method requires immediate processing (like M-Pesa), initiate payment
      if (data.paymentMethod === "mpesa") {
        const paymentResult = await initiatePayment.mutateAsync({
          orderId: orderResult.id,
          values: {
            method: data.paymentMethod,
            customerPhone: data.customerPhone || checkoutData.guestInfo?.phone,
          },
        });

        if (paymentResult.success) {
          // Show payment instructions if available
          if (paymentResult.data.customerMessage) {
            toast.success(paymentResult.data.customerMessage, {
              duration: 10000,
            });
          }
        }
      }

      // Clear checkout data
      sessionStorage.removeItem("guestCheckout");
      sessionStorage.removeItem("checkoutData");

      // Redirect to success page
      router.push("/checkout/success");
    } catch (error) {
      console.error("Failed to process order:", error);
      toast.error("Failed to process your order. Please try again.");
      router.push("/checkout/failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    router.push("/checkout/shipping");
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

  const selectedShippingOption = checkoutData?.shippingOptions?.find(
    (option: any) => option.id === checkoutData?.selectedShippingMethod
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
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
                        defaultValue={checkoutData?.guestInfo?.phone}
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
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isProcessing || !selectedMethod}
                      size="lg"
                    >
                      {isProcessing ? "Processing..." : "Complete Order"}
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
                      <p>
                        {checkoutData?.guestInfo?.firstName}{" "}
                        {checkoutData?.guestInfo?.lastName}
                      </p>
                      <p>{checkoutData?.guestInfo?.email}</p>
                      <p>{checkoutData?.guestInfo?.phone}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Shipping Method */}
                  <div>
                    <h4 className="font-medium mb-2">Shipping Method</h4>
                    {selectedShippingOption && (
                      <div className="text-sm text-gray-600">
                        <p>{selectedShippingOption.name}</p>
                        <p>{selectedShippingOption.description}</p>
                        <p>Estimated: {selectedShippingOption.estimatedDays}</p>
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
                  <div className="flex justify-between text-sm">
                    <span>Items (3)</span>
                    <span>$150.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>
                      {selectedShippingOption?.isFree
                        ? "Free"
                        : `${selectedShippingOption?.cost || 0}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>$12.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>
                      $
                      {(150 + 12 + (selectedShippingOption?.cost || 0)).toFixed(
                        2
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
