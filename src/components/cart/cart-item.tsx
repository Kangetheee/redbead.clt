"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit } from "lucide-react";
import { CartItemResponse } from "@/lib/cart/types/cart.types";
import { useRemoveCartItem } from "@/hooks/use-cart";
import { QuantitySelector } from "./quantity-selector";
import Image from "next/image";

interface CartItemProps {
  item: CartItemResponse;
  onEdit?: (item: CartItemResponse) => void;
}

export function CartItem({ item, onEdit }: CartItemProps) {
  const removeCartItem = useRemoveCartItem();

  const handleRemove = () => {
    removeCartItem.mutate(item.id);
  };

  const handleEdit = () => {
    onEdit?.(item);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <Image
              src={item.product.thumbnailImage || "/placeholder-product.jpg"}
              alt={item.product.name}
              fill
              className="object-cover rounded-md"
            />
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2">
              {item.product.name}
            </h3>

            {/* Customizations */}
            <div className="mt-2 space-y-1">
              {item.customizations.map((customization, index) => (
                <div key={index} className="text-xs text-muted-foreground">
                  <span className="font-medium">
                    {customization.option.displayName}:
                  </span>{" "}
                  {customization.customValue || customization.value.displayName}
                  {customization.value.priceAdjustment > 0 && (
                    <span className="text-green-600 ml-1">
                      (+${customization.value.priceAdjustment.toFixed(2)})
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Design Info */}
            {item.design && (
              <Badge variant="outline" className="mt-2">
                Design: {item.design.name}
              </Badge>
            )}
          </div>

          {/* Quantity and Price */}
          <div className="text-right space-y-2">
            <div className="font-medium">${item.totalPrice.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">
              ${(item.totalPrice / item.quantity).toFixed(2)} each
            </div>

            <QuantitySelector
              cartItemId={item.id}
              quantity={item.quantity}
              minQuantity={item.product.minOrderQuantity}
              maxQuantity={Math.min(
                item.product.maxOrderQuantity,
                item.product.stock
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              disabled={!onEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={removeCartItem.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
