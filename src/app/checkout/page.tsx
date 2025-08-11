"use client";

import { useState } from "react";
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
import { ShoppingCart, User, Mail, Phone, Loader2 } from "lucide-react";
import { useCartItems, useCartSummary } from "@/hooks/use-cart";
import { formatAmount } from "@/lib/utils";

const guestCheckoutSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
});

type GuestCheckoutForm = z.infer<typeof guestCheckoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const [isGuest, setIsGuest] = useState(true);

  // Cart data hooks
  const {
    data: cartItems,
    isLoading: isLoadingItems,
    error: itemsError,
  } = useCartItems();
  const {
    data: cartSummary,
    isLoading: isLoadingSummary,
    error: summaryError,
  } = useCartSummary();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GuestCheckoutForm>({
    resolver: zodResolver(guestCheckoutSchema),
  });

  const onSubmit = async (data: GuestCheckoutForm) => {
    try {
      // Check if cart has items
      if (!cartItems?.length) {
        router.push("/cart");
        return;
      }

      // Store guest info and cart data in sessionStorage for the checkout process
      const checkoutSnapshot = {
        guestInfo: data,
        cartItems: cartItems,
        cartSummary: cartSummary,
        timestamp: new Date().toISOString(),
      };

      sessionStorage.setItem("guestCheckout", JSON.stringify(data));
      sessionStorage.setItem(
        "checkoutSnapshot",
        JSON.stringify(checkoutSnapshot)
      );

      router.push("/checkout/shipping");
    } catch (error) {
      console.error("Failed to process guest checkout:", error);
    }
  };

  const handleExistingCustomerLogin = () => {
    // Store cart snapshot before redirecting to login
    if (cartItems?.length && cartSummary) {
      const checkoutSnapshot = {
        cartItems: cartItems,
        cartSummary: cartSummary,
        timestamp: new Date().toISOString(),
      };
      sessionStorage.setItem(
        "checkoutSnapshot",
        JSON.stringify(checkoutSnapshot)
      );
    }

    // Redirect to login with checkout redirect
    router.push("/auth/login?redirect=/checkout/shipping");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">
            Complete your order in just a few steps
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">
                Information
              </span>
            </div>
            <div className="flex-1 h-px bg-gray-300 mx-4"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm text-gray-500">Shipping</span>
            </div>
            <div className="flex-1 h-px bg-gray-300 mx-4"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm text-gray-500">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Customer Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </CardTitle>
              <CardDescription>
                Are you a new customer or do you have an account with us?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Button
                  type="button"
                  variant={isGuest ? "default" : "outline"}
                  onClick={() => setIsGuest(true)}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <ShoppingCart className="w-6 h-6" />
                  <span>Continue as Guest</span>
                </Button>
                <Button
                  type="button"
                  variant={!isGuest ? "default" : "outline"}
                  onClick={handleExistingCustomerLogin}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <User className="w-6 h-6" />
                  <span>I have an account</span>
                </Button>
              </div>

              {isGuest && (
                <>
                  <Separator className="my-6" />
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          {...register("firstName")}
                          className={errors.firstName ? "border-red-500" : ""}
                        />
                        {errors.firstName && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          {...register("lastName")}
                          className={errors.lastName ? "border-red-500" : ""}
                        />
                        {errors.lastName && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                          placeholder="your@email.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          {...register("phone")}
                          className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                          placeholder="+254 700 000 000"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isSubmitting || !cartItems?.length}
                    >
                      {isSubmitting ? "Processing..." : "Continue to Shipping"}
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingItems || isLoadingSummary ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading cart...</span>
                </div>
              ) : itemsError || summaryError ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-4">Failed to load cart data</p>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/cart")}
                  >
                    View Cart
                  </Button>
                </div>
              ) : !cartItems?.length ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Your cart is empty</p>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/products")}
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        {item.product.thumbnailImage && (
                          <img
                            src={item.product.thumbnailImage}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {item.variant.name}
                          </p>
                          {item.customizations.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {item.customizations.map(
                                (customization, index) => (
                                  <span key={customization.optionId}>
                                    {customization.option.name}:{" "}
                                    {customization.customValue ||
                                      customization.valueId}
                                    {index < item.customizations.length - 1 &&
                                      ", "}
                                  </span>
                                )
                              )}
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatAmount(item.totalPrice)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Summary */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Items ({cartSummary.itemCount})</span>
                      <span>{formatAmount(cartSummary.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span className="text-gray-500">
                        Calculated at next step
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span className="text-gray-500">
                        Calculated at next step
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium text-lg">
                      <span>Subtotal</span>
                      <span>{formatAmount(cartSummary.total)}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Final total will be calculated after shipping and tax
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
