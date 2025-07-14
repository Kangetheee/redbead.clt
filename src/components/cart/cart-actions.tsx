"use client";

import { Button } from "@/components/ui/button";
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
import { Trash2, ShoppingCart } from "lucide-react";
import { useClearCart } from "@/hooks/use-cart";
import { useInitializeCheckout } from "@/hooks/use-checkout";
import { useRouter } from "next/navigation";
import { CartResponse } from "@/lib/cart/types/cart.types";

interface CartActionsProps {
  cart: CartResponse;
  disabled?: boolean;
}

export function CartActions({ cart, disabled }: CartActionsProps) {
  const router = useRouter();
  const clearCart = useClearCart();
  const initializeCheckout = useInitializeCheckout();

  const handleClearCart = () => {
    clearCart.mutate();
  };

  const handleCheckout = () => {
    initializeCheckout.mutate(
      { useCartItems: true },
      {
        onSuccess: (data) => {
          if (data.success) {
            router.push(`/checkout?session=${data.data.sessionId}`);
          }
        },
      }
    );
  };

  const isEmpty = cart.items.length === 0;
  const isLoading = clearCart.isPending || initializeCheckout.isPending;

  return (
    <div className="space-y-3">
      {/* Checkout Button */}
      <Button
        onClick={handleCheckout}
        disabled={isEmpty || disabled || isLoading}
        className="w-full"
        size="lg"
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        Proceed to Checkout (${cart.summary.total.toFixed(2)})
      </Button>

      {/* Clear Cart Button */}
      {!isEmpty && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled || isLoading}
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Cart
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear Cart</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove all items from your cart? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearCart}>
                Clear Cart
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Continue Shopping */}
      <Button
        variant="ghost"
        onClick={() => router.push("/products")}
        className="w-full"
      >
        Continue Shopping
      </Button>
    </div>
  );
}
