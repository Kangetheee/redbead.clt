"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useUpdateCartItem } from "@/hooks/use-cart";

interface QuantitySelectorProps {
  cartItemId: string;
  quantity: number;
  minQuantity?: number;
  maxQuantity?: number;
  size?: "sm" | "md" | "lg";
  sheetContext?: {
    isOpen: boolean;
    setUpdating: (updating: boolean) => void;
  };
}

export function QuantitySelector({
  cartItemId,
  quantity: initialQuantity,
  minQuantity = 1,
  maxQuantity = 999,
  size = "sm",
  sheetContext,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const updateCartItem = useUpdateCartItem();

  // Sync with external quantity changes
  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const updateQuantity = (newQuantity: number) => {
    if (
      newQuantity !== initialQuantity &&
      newQuantity >= minQuantity &&
      newQuantity <= maxQuantity
    ) {
      // Signal that we're starting an update (only if sheet context exists)
      if (sheetContext?.isOpen) {
        sheetContext.setUpdating(true);
      }

      updateCartItem.mutate(
        {
          cartItemId,
          values: { quantity: newQuantity },
        },
        {
          onSettled: () => {
            // Signal that update is complete (only if sheet context exists)
            if (sheetContext?.isOpen) {
              setTimeout(() => {
                sheetContext.setUpdating(false);
              }, 100); // Small delay to ensure state updates complete
            }
          },
          onError: () => {
            // Rollback quantity on error
            setQuantity(initialQuantity);
          },
        }
      );
    }
  };

  const handleDecrease = () => {
    const newQuantity = Math.max(minQuantity, quantity - 1);
    setQuantity(newQuantity);
    updateQuantity(newQuantity);
  };

  const handleIncrease = () => {
    const newQuantity = Math.min(maxQuantity, quantity + 1);
    setQuantity(newQuantity);
    updateQuantity(newQuantity);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || minQuantity;
    const clampedValue = Math.max(minQuantity, Math.min(maxQuantity, value));
    setQuantity(clampedValue);
  };

  const handleInputBlur = () => {
    updateQuantity(quantity);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      updateQuantity(quantity);
      e.currentTarget.blur();
    }
  };

  const buttonSize =
    size === "sm" ? "h-7 w-7" : size === "md" ? "h-8 w-8" : "h-9 w-9";
  const inputSize = size === "sm" ? "h-7" : size === "md" ? "h-8" : "h-9";

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        className={buttonSize}
        onClick={handleDecrease}
        disabled={quantity <= minQuantity || updateCartItem.isPending}
      >
        <Minus className="h-3 w-3" />
      </Button>

      <Input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        className={`w-16 text-center ${inputSize}`}
        min={minQuantity}
        max={maxQuantity}
        disabled={updateCartItem.isPending}
      />

      <Button
        variant="outline"
        size="icon"
        className={buttonSize}
        onClick={handleIncrease}
        disabled={quantity >= maxQuantity || updateCartItem.isPending}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}
