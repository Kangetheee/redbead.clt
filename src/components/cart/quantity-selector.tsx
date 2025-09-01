"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Loader2 } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { useUpdateCartItem } from "@/hooks/use-cart";
import { useCartSheet } from "./cart-sheet-dialog";

interface QuantitySelectorProps {
  cartItemId: string;
  quantity: number;
  minQuantity?: number;
  maxQuantity?: number;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
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
  disabled = false,
  sheetContext,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isLocallyUpdating, setIsLocallyUpdating] = useState(false);
  const updateCartItem = useUpdateCartItem();

  const cartSheet = (() => {
    if (sheetContext) {
      return sheetContext;
    }
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useCartSheet();
    } catch {
      return null; // Not within cart sheet context
    }
  })();

  // Debounce timer for input changes
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track if we've synced with the initial quantity
  const lastInitialQuantity = useRef(initialQuantity);

  // Sync with external quantity changes only when they actually change
  if (lastInitialQuantity.current !== initialQuantity) {
    setQuantity(initialQuantity);
    lastInitialQuantity.current = initialQuantity;
  }

  const updateQuantity = useCallback(
    (newQuantity: number) => {
      if (
        newQuantity !== initialQuantity &&
        newQuantity >= minQuantity &&
        newQuantity <= maxQuantity
      ) {
        setIsLocallyUpdating(true);

        // Notify cart sheet that update is starting
        if (cartSheet?.isOpen) {
          cartSheet.setUpdating(true);
        }

        updateCartItem.mutate(
          {
            cartItemId,
            values: { quantity: newQuantity },
          },
          {
            onSuccess: () => {
              console.log(
                `Successfully updated quantity for item ${cartItemId} to ${newQuantity}`
              );
            },
            onError: (error) => {
              console.error("Failed to update quantity:", error);
              // Rollback quantity on error
              setQuantity(initialQuantity);
            },
            onSettled: () => {
              setIsLocallyUpdating(false);

              // Notify cart sheet that update is complete - no delay
              if (cartSheet?.isOpen) {
                cartSheet.setUpdating(false);
              }
            },
          }
        );
      }
    },
    [
      cartItemId,
      initialQuantity,
      minQuantity,
      maxQuantity,
      updateCartItem,
      cartSheet,
    ]
  );

  const handleDecrease = useCallback(() => {
    if (isLocallyUpdating || updateCartItem.isPending) return;

    const newQuantity = Math.max(minQuantity, quantity - 1);
    setQuantity(newQuantity);
    updateQuantity(newQuantity);
  }, [
    quantity,
    minQuantity,
    updateQuantity,
    isLocallyUpdating,
    updateCartItem.isPending,
  ]);

  const handleIncrease = useCallback(() => {
    if (isLocallyUpdating || updateCartItem.isPending) return;

    const newQuantity = Math.min(maxQuantity, quantity + 1);
    setQuantity(newQuantity);
    updateQuantity(newQuantity);
  }, [
    quantity,
    maxQuantity,
    updateQuantity,
    isLocallyUpdating,
    updateCartItem.isPending,
  ]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value) || minQuantity;
      const clampedValue = Math.max(minQuantity, Math.min(maxQuantity, value));
      setQuantity(clampedValue);

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounce timer for input changes
      debounceTimerRef.current = setTimeout(() => {
        updateQuantity(clampedValue);
        debounceTimerRef.current = null;
      }, 500); // 500ms debounce
    },
    [minQuantity, maxQuantity, updateQuantity]
  );

  const handleInputBlur = useCallback(() => {
    // Clear debounce timer and update immediately on blur
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    updateQuantity(quantity);
  }, [quantity, updateQuantity]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        // Clear debounce timer and update immediately on Enter
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
        updateQuantity(quantity);
        e.currentTarget.blur();
      }
    },
    [quantity, updateQuantity]
  );

  const isUpdating = updateCartItem.isPending || isLocallyUpdating;
  const isDisabled = disabled || isUpdating;
  const buttonSize =
    size === "sm" ? "h-7 w-7" : size === "md" ? "h-8 w-8" : "h-9 w-9";
  const inputSize = size === "sm" ? "h-7" : size === "md" ? "h-8" : "h-9";

  return (
    <div className="flex items-center gap-1 relative">
      <Button
        variant="outline"
        size="icon"
        className={buttonSize}
        onClick={handleDecrease}
        disabled={quantity <= minQuantity || isDisabled}
      >
        {isUpdating && quantity <= minQuantity ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Minus className="h-3 w-3" />
        )}
      </Button>

      <div className="relative">
        <Input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className={`w-16 text-center ${inputSize} ${isUpdating ? "bg-muted" : ""}`}
          min={minQuantity}
          max={maxQuantity}
          disabled={isDisabled}
        />
        {isUpdating && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        className={buttonSize}
        onClick={handleIncrease}
        disabled={quantity >= maxQuantity || isDisabled}
      >
        {isUpdating && quantity >= maxQuantity ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Plus className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}
