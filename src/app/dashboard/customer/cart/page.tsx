/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, useClearCart } from "@/hooks/use-cart";
import { useInitializeCheckout } from "@/hooks/use-checkout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Trash2, ArrowRight, Plus, Minus } from "lucide-react";
import CartItem from "./cart-item";
import CartSummary from "@/components/cart/cart-summary";

export default function CartPage() {
  const router = useRouter();
  const { data: cart, isLoading, error } = useCart();
  const clearCartMutation = useClearCart();
  const initializeCheckoutMutation = useInitializeCheckout();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClearCart = async () => {
    await clearCartMutation.mutateAsync();
  };

  const handleCheckout = async () => {
    if (!cart?.items.length) return;

    setIsProcessing(true);
    try {
      const result = await initializeCheckoutMutation.mutateAsync({
        useCartItems: true,
      });

      if (result.success) {
        router.push(
          `/dashboard/customer/checkout?session=${result.data.sessionId}`
        );
      }
    } catch (error) {
      console.error("Failed to initialize checkout:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingCart className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-16 w-16 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                    <Skeleton className="h-10 w-[100px]" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-[120px]" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive">
              Failed to load cart. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isEmpty = !cart?.items.length;

  if (isEmpty) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingCart className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some products to get started with your order.
            </p>
            <Button onClick={() => router.push("/dashboard/customer/browse")}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          <Badge variant="secondary">
            {cart.summary.itemCount}{" "}
            {cart.summary.itemCount === 1 ? "item" : "items"}
          </Badge>
        </div>

        {!isEmpty && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={clearCartMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Shopping Cart</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove all items from your cart? This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearCart}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear Cart
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <CartSummary summary={cart.summary} />
            </CardContent>
            <Separator />
            <CardFooter className="pt-6">
              <Button
                onClick={handleCheckout}
                className="w-full"
                size="lg"
                disabled={isProcessing || initializeCheckoutMutation.isPending}
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
