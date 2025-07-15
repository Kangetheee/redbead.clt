/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useUpdateCartItem, useRemoveCartItem } from "@/hooks/use-cart";
import { CartItemResponse } from "@/lib/cart/types/cart.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Minus,
  Plus,
  Trash2,
  Image as ImageIcon,
  Palette,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface CartItemProps {
  item: CartItemResponse;
}

export default function CartItem({ item }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const updateCartItemMutation = useUpdateCartItem();
  const removeCartItemMutation = useRemoveCartItem();

  const handleQuantityChange = async (newQuantity: number) => {
    if (
      newQuantity < item.product.minOrderQuantity ||
      newQuantity > item.product.maxOrderQuantity
    ) {
      return;
    }

    setQuantity(newQuantity);
    setIsUpdating(true);

    try {
      await updateCartItemMutation.mutateAsync({
        cartItemId: item.id,
        values: { quantity: newQuantity },
      });
    } catch (error) {
      // Reset quantity on error
      setQuantity(item.quantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async () => {
    await removeCartItemMutation.mutateAsync(item.id);
  };

  const incrementQuantity = () => {
    const newQuantity = quantity + 1;
    if (newQuantity <= item.product.maxOrderQuantity) {
      handleQuantityChange(newQuantity);
    }
  };

  const decrementQuantity = () => {
    const newQuantity = quantity - 1;
    if (newQuantity >= item.product.minOrderQuantity) {
      handleQuantityChange(newQuantity);
    }
  };

  const handleQuantityInputChange = (value: string) => {
    const newQuantity = parseInt(value) || 1;
    if (
      newQuantity >= item.product.minOrderQuantity &&
      newQuantity <= item.product.maxOrderQuantity
    ) {
      handleQuantityChange(newQuantity);
    }
  };

  const unitPrice = item.totalPrice / item.quantity;
  const hasCustomizations = item.customizations.length > 0;
  const hasDesign = !!item.design;

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        isUpdating && "opacity-60",
        removeCartItemMutation.isPending && "opacity-40"
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Product Image */}
          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {item.product.thumbnailImage ? (
              <Image
                src={item.product.thumbnailImage}
                alt={item.product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}

            {/* Stock status indicator */}
            {item.product.stock <= 5 && item.product.stock > 0 && (
              <div className="absolute top-1 right-1">
                <Badge variant="destructive" className="text-xs px-1 py-0">
                  Low Stock
                </Badge>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg leading-tight mb-1">
                  {item.product.name}
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      Base Price: KES {item.product.basePrice.toLocaleString()}
                    </span>
                    {unitPrice !== item.product.basePrice && (
                      <span>
                        • Unit Price: KES {unitPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Customizations */}
                  {hasCustomizations && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Palette className="h-3 w-3" />
                        Customizations:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.customizations.map((customization, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {customization.option.displayName}:{" "}
                            {customization.value.displayName}
                            {customization.customValue &&
                              ` (${customization.customValue})`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Design */}
                  {hasDesign && (
                    <div className="flex items-center gap-2 text-sm">
                      <Eye className="h-3 w-3" />
                      <span className="font-medium">Design:</span>
                      <span>{item.design?.name}</span>
                    </div>
                  )}

                  {/* Stock warning */}
                  {item.product.stock < quantity && (
                    <div className="text-sm text-destructive">
                      Only {item.product.stock} items available in stock
                    </div>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="text-lg font-bold">
                  KES {item.totalPrice.toLocaleString()}
                </div>
                {quantity > 1 && (
                  <div className="text-sm text-muted-foreground">
                    KES {unitPrice.toLocaleString()} each
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Quantity and Actions */}
            <div className="flex items-center justify-between">
              {/* Quantity Selector */}
              <div className="flex items-center space-x-2">
                <Label
                  htmlFor={`quantity-${item.id}`}
                  className="text-sm font-medium"
                >
                  Quantity:
                </Label>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decrementQuantity}
                    disabled={
                      quantity <= item.product.minOrderQuantity ||
                      isUpdating ||
                      updateCartItemMutation.isPending
                    }
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>

                  <Input
                    id={`quantity-${item.id}`}
                    type="number"
                    min={item.product.minOrderQuantity}
                    max={item.product.maxOrderQuantity}
                    value={quantity}
                    onChange={(e) => handleQuantityInputChange(e.target.value)}
                    disabled={isUpdating || updateCartItemMutation.isPending}
                    className="w-16 h-8 text-center"
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={incrementQuantity}
                    disabled={
                      quantity >= item.product.maxOrderQuantity ||
                      quantity >= item.product.stock ||
                      isUpdating ||
                      updateCartItemMutation.isPending
                    }
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  ({item.product.minOrderQuantity}-
                  {item.product.maxOrderQuantity} allowed)
                </div>
              </div>

              {/* Remove Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={removeCartItemMutation.isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Item</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove &quot;{item.product.name}
                      &quote; from your cart?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRemoveItem}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Remove Item
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
