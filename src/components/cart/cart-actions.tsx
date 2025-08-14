/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, ShoppingCart, Mail } from "lucide-react";
import { useClearCart /*useCartSummary*/ } from "@/hooks/use-cart";
import { useUserProfile } from "@/hooks/use-users";
import { useRouter } from "next/navigation";
import { CartResponse } from "@/lib/cart/types/cart.types";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface CartActionsProps {
  cart: CartResponse;
  disabled?: boolean;
}

export function CartActions({ cart, disabled }: CartActionsProps) {
  const router = useRouter();
  const clearCart = useClearCart();
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();

  const [guestEmail, setGuestEmail] = useState("");
  const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleClearCart = () => {
    clearCart.mutate();
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCheckout = () => {
    // If we have authenticated user, proceed directly to checkout
    if (userProfile?.email) {
      router.push("/checkout");
    } else {
      // No user authentication - show guest email dialog
      setIsGuestDialogOpen(true);
    }
  };

  const handleGuestCheckout = () => {
    // Validate email
    if (!guestEmail.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(guestEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // Check if cart has items
    if (cart.summary.itemCount === 0) {
      setEmailError("Your cart is empty");
      return;
    }

    setEmailError("");

    // Proceed to checkout with guest email in URL
    setIsGuestDialogOpen(false);
    setGuestEmail("");
    router.push(`/checkout?guest=${encodeURIComponent(guestEmail.trim())}`);
  };

  const isEmpty = cart.summary.itemCount === 0;
  const isLoading = clearCart.isPending || isProfileLoading;

  return (
    <div className="space-y-3">
      <Link href="/checkout">
        <Button
          disabled={isEmpty || disabled || isLoading}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {isLoading
            ? "Processing..."
            : `Proceed to Checkout (${formatCurrency(cart.summary.total)})`}
        </Button>
      </Link>

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
              <AlertDialogAction
                onClick={handleClearCart}
                disabled={clearCart.isPending}
              >
                {clearCart.isPending ? "Clearing..." : "Clear Cart"}
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
        disabled={isLoading}
      >
        Continue Shopping
      </Button>

      {/* User Status Indicator */}
      {!isProfileLoading && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {userProfile?.email ? (
              <>Signed in as {userProfile.name || userProfile.email}</>
            ) : (
              <>Checking out as guest</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
