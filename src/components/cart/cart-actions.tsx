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
import { useClearCart } from "@/hooks/use-cart";
import {
  useInitializeCheckout,
  useInitializeGuestCheckout,
} from "@/hooks/use-checkout";
import { useUserProfile } from "@/hooks/use-users";
import { useRouter } from "next/navigation";
import { PaginatedData1 } from "@/lib/shared/types";
import { CartItemResponse } from "@/lib/cart/types/cart.types";

interface CartActionsProps {
  cart: PaginatedData1<CartItemResponse>;
  disabled?: boolean;
}

export function CartActions({ cart, disabled }: CartActionsProps) {
  const router = useRouter();
  const clearCart = useClearCart();
  const initializeCheckout = useInitializeCheckout();
  const initializeGuestCheckout = useInitializeGuestCheckout();
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
    // If we have authenticated user, proceed with authenticated checkout
    if (userProfile?.email) {
      // Authenticated checkout can use cart items directly via useCartItems flag
      initializeCheckout.mutate(
        {
          useCartItems: true,
        },
        {
          onSuccess: (data) => {
            router.push(`/checkout?session=${data.sessionId}`);
          },
        }
      );
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
    if (cart.summary.length === 0) {
      setEmailError("Your cart is empty");
      return;
    }

    setEmailError("");

    // Transform cart items to checkout items format
    const checkoutItems = cart.summary.map((item) => ({
      productId: item.templateId,
      quantity: item.quantity,
      customizations: item.customizations.map((custom) => ({
        optionId: custom.optionId,
        valueId: custom.valueId,
        customValue: custom.customValue,
      })),
      designId: item.designId,
    }));

    // Proceed with guest checkout
    initializeGuestCheckout.mutate(
      {
        guestEmail: guestEmail.trim(),
        items: checkoutItems,
      },
      {
        onSuccess: (data) => {
          setIsGuestDialogOpen(false);
          setGuestEmail("");
          router.push(`/checkout?session=${data.sessionId}`);
        },
        onError: () => {
          // Error handling is done in the hook via toast
        },
      }
    );
  };

  const isEmpty = cart.summary.length === 0;
  const isLoading =
    clearCart.isPending ||
    initializeCheckout.isPending ||
    initializeGuestCheckout.isPending ||
    isProfileLoading;

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
        {isLoading
          ? "Processing..."
          : `Proceed to Checkout (KES ${cart.meta.total.toLocaleString()})`}
      </Button>

      {/* Guest Email Dialog */}
      <Dialog open={isGuestDialogOpen} onOpenChange={setIsGuestDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Enter Your Email
            </DialogTitle>
            <DialogDescription>
              Please provide your email address to continue with checkout.
              We&apos;ll use this to send you order updates and receipts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="guest-email">Email Address</Label>
              <Input
                id="guest-email"
                type="email"
                placeholder="your@email.com"
                value={guestEmail}
                onChange={(e) => {
                  setGuestEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                className={emailError ? "border-red-500" : ""}
                autoFocus
                disabled={initializeGuestCheckout.isPending}
              />
              {emailError && (
                <p className="text-sm text-red-500">{emailError}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsGuestDialogOpen(false);
                setGuestEmail("");
                setEmailError("");
              }}
              disabled={initializeGuestCheckout.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGuestCheckout}
              disabled={initializeGuestCheckout.isPending}
            >
              {initializeGuestCheckout.isPending
                ? "Processing..."
                : "Continue to Checkout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
