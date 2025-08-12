/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Loader2 } from "lucide-react";
import { useCartItems, useCartSummary } from "@/hooks/use-cart";
import { formatAmount } from "@/lib/utils";
import { useInitializeCheckout } from "@/hooks/use-checkout";
import { InitCheckoutDto } from "@/lib/checkout/dto/checkout.dto";
import { useAddresses } from "@/hooks/use-address";
import { Session } from "@/lib/session/session.types";

interface CheckoutClientProps {
  session: Session;
}

export default function CheckoutClient({ session }: CheckoutClientProps) {
  const router = useRouter();
  const [localCartItems, setLocalCartItems] = useState<any[]>([]);
  const [isLoadingLocalCart, setIsLoadingLocalCart] = useState(false);

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

  // Address hooks
  const { data: addressesData } = useAddresses({ page: 1, limit: 10 });

  // Checkout hooks
  const initializeCheckoutMutation = useInitializeCheckout();

  // Load cart items from localStorage if cart is empty
  useEffect(() => {
    const loadLocalCartItems = () => {
      try {
        const cartSessionId = localStorage.getItem("cart-session-id");
        if (cartSessionId) {
          const storedCartItems = localStorage.getItem(
            `cart-items-${cartSessionId}`
          );
          if (storedCartItems) {
            const parsedItems = JSON.parse(storedCartItems);
            console.log("Found cart items in localStorage:", parsedItems);
            setLocalCartItems(parsedItems);
            return parsedItems;
          }
        }
      } catch (error) {
        console.error("Failed to load cart items from localStorage:", error);
      }
      return [];
    };

    // Only load from localStorage if server cart is empty and not loading
    if (!isLoadingItems && (!cartItems || cartItems.length === 0)) {
      loadLocalCartItems();
    }
  }, [cartItems, isLoadingItems]);

  // Get effective cart items (server cart or local cart)
  const effectiveCartItems = cartItems?.length ? cartItems : localCartItems;
  const hasCartItems = effectiveCartItems?.length > 0;

  // Handle checkout submission
  const handleCheckout = async () => {
    try {
      setIsLoadingLocalCart(true);

      // Check if cart items are still loading
      if (isLoadingItems) {
        console.log("Cart items are still loading, please wait...");
        return;
      }

      // Use server cart items if available, otherwise use localStorage items
      const itemsToCheckout = cartItems?.length ? cartItems : localCartItems;

      if (!itemsToCheckout?.length) {
        console.log(
          "No cart items found in server or localStorage, redirecting to cart"
        );
        router.push("/cart");
        return;
      }

      console.log("Initializing checkout with items:", itemsToCheckout);

      // Always try with useCartItems: true first if we have server cart items
      if (cartItems?.length) {
        try {
          const initData: InitCheckoutDto = {
            useCartItems: true,
          };

          const checkoutResult =
            await initializeCheckoutMutation.mutateAsync(initData);
          sessionStorage.setItem("checkoutSessionId", checkoutResult.sessionId);
          router.push(`/checkout/shipping?session=${checkoutResult.sessionId}`);
          return; // Success, exit early
        } catch (serverCartError) {
          console.log(
            "Server cart checkout failed, falling back to explicit items:",
            serverCartError
          );
          // Continue to fallback below
        }
      }

      // Fallback: Always send explicit items if server cart fails or if using localStorage
      console.log("Using explicit items for checkout initialization");
      const initData: InitCheckoutDto = {
        useCartItems: false,
        items: itemsToCheckout.map((item) => ({
          productId: item.productId || item.product?.id,
          variantId: item.variantId || item.variant?.id,
          quantity: item.quantity,
          customizations: item.customizations || [],
          unitPrice: item.unitPrice || item.product?.price || 0,
        })),
      };

      console.log("Sending explicit items:", initData.items);
      const checkoutResult =
        await initializeCheckoutMutation.mutateAsync(initData);

      // Store session ID and navigate
      sessionStorage.setItem("checkoutSessionId", checkoutResult.sessionId);
      router.push(`/checkout/shipping?session=${checkoutResult.sessionId}`);
    } catch (error) {
      console.error("Failed to initialize checkout:", error);
    } finally {
      setIsLoadingLocalCart(false);
    }
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
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Proceeding with your account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      {session.user.avatar ? (
                        <img
                          src={session.user.avatar}
                          alt="User Avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-green-900">
                        User ID: {session.user.id}
                      </p>
                      <p className="text-sm text-green-700">
                        Role: {session.user.role}
                      </p>
                      {session.user.phone && (
                        <p className="text-sm text-green-700">
                          Phone: {session.user.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Show saved addresses if any */}
                {addressesData?.success &&
                  addressesData.data.items.length > 0 && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Saved Addresses ({addressesData.data.items.length})
                      </h4>
                      <p className="text-sm text-blue-700">
                        You can select from your saved addresses in the next
                        step.
                      </p>
                    </div>
                  )}

                <Button
                  onClick={handleCheckout}
                  className="w-full"
                  size="lg"
                  disabled={
                    initializeCheckoutMutation.isPending ||
                    isLoadingItems ||
                    isLoadingSummary ||
                    isLoadingLocalCart ||
                    !hasCartItems
                  }
                >
                  {initializeCheckoutMutation.isPending ||
                  isLoadingLocalCart ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Initializing...
                    </>
                  ) : isLoadingItems || isLoadingSummary ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading Cart...
                    </>
                  ) : !hasCartItems ? (
                    "Cart is Empty"
                  ) : (
                    `Continue to Shipping${!cartItems?.length && localCartItems?.length ? " (Local Cart)" : ""}`
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <OrderSummaryCard
            cartItems={effectiveCartItems}
            cartSummary={cartSummary}
            isLoadingItems={isLoadingItems}
            isLoadingSummary={isLoadingSummary}
            itemsError={itemsError}
            summaryError={summaryError}
            router={router}
            isUsingLocalCart={!cartItems?.length && localCartItems?.length > 0}
          />
        </div>
      </div>
    </div>
  );
}

// Order Summary Component
function OrderSummaryCard({
  cartItems,
  cartSummary,
  isLoadingItems,
  isLoadingSummary,
  itemsError,
  summaryError,
  router,
  isUsingLocalCart = false,
}: {
  cartItems: any;
  cartSummary: any;
  isLoadingItems: boolean;
  isLoadingSummary: boolean;
  itemsError: any;
  summaryError: any;
  router: any;
  isUsingLocalCart?: boolean;
}) {
  // Calculate totals for local cart items if needed
  const calculateLocalCartTotal = (items: any[]) => {
    if (!items?.length) return 0;
    return items.reduce((total, item) => {
      const itemPrice = item.totalPrice || item.price * item.quantity || 0;
      return total + itemPrice;
    }, 0);
  };

  const localCartTotal = isUsingLocalCart
    ? calculateLocalCartTotal(cartItems)
    : 0;
  const itemCount = cartItems?.length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Order Summary
          {isUsingLocalCart && (
            <span className="text-sm font-normal text-orange-600 ml-2">
              (From Local Storage)
            </span>
          )}
        </CardTitle>
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
            <Button variant="outline" onClick={() => router.push("/cart")}>
              View Cart
            </Button>
          </div>
        ) : !cartItems?.length ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Button variant="outline" onClick={() => router.push("/products")}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cart Items */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {cartItems.map((item: any, index: number) => (
                <div
                  key={item.id || index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {(item.product?.thumbnailImage || item.thumbnailImage) && (
                    <img
                      src={item.product?.thumbnailImage || item.thumbnailImage}
                      alt={item.product?.name || item.name || "Product"}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.product?.name || item.name || "Product"}
                    </h4>
                    {(item.variant || item.variantName) && (
                      <p className="text-xs text-gray-500">
                        {item.variant?.name || item.variantName}
                      </p>
                    )}
                    {item.customizations?.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {item.customizations.map(
                          (customization: any, index: number) => (
                            <span key={customization.optionId || index}>
                              {customization.option?.name || customization.name}
                              :{" "}
                              {customization.customValue ||
                                customization.valueId ||
                                customization.value}
                              {index < item.customizations.length - 1 && ", "}
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
                    {formatAmount(
                      item.totalPrice || item.price * item.quantity || 0
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Summary */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Items ({itemCount})</span>
                <span>
                  {isUsingLocalCart
                    ? formatAmount(localCartTotal)
                    : formatAmount(cartSummary?.summary?.subtotal || 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span className="text-gray-500">Calculated at next step</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span className="text-gray-500">Calculated at next step</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium text-lg">
                <span>Subtotal</span>
                <span>
                  {isUsingLocalCart
                    ? formatAmount(localCartTotal)
                    : formatAmount(cartSummary?.summary?.total || 0)}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Final total will be calculated after shipping and tax
              </p>
              {isUsingLocalCart && (
                <p className="text-xs text-orange-600">
                  Using items from local storage - totals are estimated
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
