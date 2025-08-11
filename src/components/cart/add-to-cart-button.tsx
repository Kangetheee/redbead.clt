"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
import { useAddToCart } from "@/hooks/use-cart";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CustomizationChoiceDto } from "@/lib/cart/dto/cart.dto";

interface AddToCartButtonProps {
  productId: string;
  variantId: string;
  quantity?: number;
  customizations?: CustomizationChoiceDto[];
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  showSuccessState?: boolean;
}

export function AddToCartButton({
  productId,
  variantId,
  quantity = 1,
  customizations = [],
  variant = "default",
  size = "default",
  className,
  disabled,
  children,
  showSuccessState = true,
}: AddToCartButtonProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const addToCart = useAddToCart();

  const isLoading = addToCart.isPending;
  const isSuccess = addToCart.isSuccess && showSuccess;

  useEffect(() => {
    if (addToCart.isSuccess && showSuccessState) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        addToCart.reset();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [addToCart.isSuccess, addToCart.reset, showSuccessState]);

  const handleAddToCart = () => {
    if (disabled || isLoading) return;

    addToCart.mutate({
      productId,
      variantId,
      quantity,
      customizations,
    });
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          Adding...
        </>
      );
    }

    if (isSuccess) {
      return (
        <>
          <Check className="h-4 w-4" />
          Added to Cart
        </>
      );
    }

    if (children) {
      return children;
    }

    return (
      <>
        <ShoppingCart className="h-4 w-4" />
        Add to Cart
      </>
    );
  };

  return (
    <Button
      onClick={handleAddToCart}
      variant={isSuccess ? "outline" : variant}
      size={size}
      disabled={disabled || isLoading}
      className={cn(
        "gap-2 transition-all duration-200",
        isSuccess && "border-green-500 text-green-600",
        className
      )}
    >
      {getButtonContent()}
    </Button>
  );
}
