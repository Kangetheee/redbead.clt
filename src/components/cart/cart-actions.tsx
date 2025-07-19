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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, ShoppingCart, Mail } from "lucide-react";
import { useClearCart } from "@/hooks/use-cart";
import { useInitializeCheckout } from "@/hooks/use-checkout";
import { useUserProfile } from "@/hooks/use-users";
import { useRouter } from "next/navigation";
import { CartResponse } from "@/lib/cart/types/cart.types";
import { toast } from "sonner";

interface CartActionsProps {
  cart: CartResponse;
  disabled?: boolean;
}

export function CartActions({ cart, disabled }: CartActionsProps) {
  const router = useRouter();
  const clearCart = useClearCart();
  const initializeCheckout = useInitializeCheckout();
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
    // If we have user profile with email, proceed directly
    if (userProfile?.email) {
      initializeCheckout.mutate(
        {
          useCartItems: true,
          guestEmail: userProfile.email, // Use user's email from profile
        },
        {
          onSuccess: (data) => {
            if (data.success) {
              router.push(`/checkout?session=${data.data.sessionId}`);
            }
          },
        }
      );
    } else {
      // No user email available - show email input dialog
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

    setEmailError("");

    // Proceed with guest checkout
    initializeCheckout.mutate(
      {
        useCartItems: true,
        guestEmail: guestEmail.trim(),
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            setIsGuestDialogOpen(false);
            setGuestEmail("");
            router.push(`/checkout?session=${data.data.sessionId}`);
          }
        },
        onError: () => {
          // Error handling is done in the hook
        },
      }
    );
  };

  const isEmpty = cart.items.length === 0;
  const isLoading =
    clearCart.isPending || initializeCheckout.isPending || isProfileLoading;

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
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleGuestCheckout} disabled={isLoading}>
              {isLoading ? "Processing..." : "Continue to Checkout"}
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

      {/* User Status Indicator (optional) */}
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
