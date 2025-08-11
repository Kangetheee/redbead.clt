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
              src={
                item.product.thumbnailImage ||
                item.product.images?.[0] ||
                "/placeholder-product.jpg"
              }
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

            {/* Variant */}
            <div className="text-xs text-muted-foreground mt-1">
              {item.variant.name}
              {item.variant.sku && ` • SKU: ${item.variant.sku}`}
            </div>

            {/* Customizations */}
            {item.customizations && item.customizations.length > 0 && (
              <div className="mt-2 space-y-1">
                {item.customizations.map((customization, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    <span className="font-medium">
                      {customization.option.name}:
                    </span>{" "}
                    {customization.customValue ||
                      customization.option.metadata?.options?.find(
                        (opt) => opt.value === customization.valueId
                      )?.label ||
                      customization.valueId}
                    {customization.option.metadata?.options?.find(
                      (opt) => opt.value === customization.valueId
                    )?.priceAdjustment &&
                      customization.option.metadata.options.find(
                        (opt) => opt.value === customization.valueId
                      )!.priceAdjustment > 0 && (
                        <span className="text-green-600 ml-1">
                          (+KES{" "}
                          {customization.option.metadata.options
                            .find((opt) => opt.value === customization.valueId)!
                            .priceAdjustment.toLocaleString()}
                          )
                        </span>
                      )}
                  </div>
                ))}
              </div>
            )}

            {/* Category */}
            {item.product.category && (
              <Badge variant="outline" className="mt-2 text-xs">
                {item.product.category.name}
              </Badge>
            )}
          </div>

          {/* Quantity and Price */}
          <div className="text-right space-y-2">
            <div className="font-medium">
              KES {item.totalPrice.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              KES {item.unitPrice.toLocaleString()} each
            </div>

            <QuantitySelector
              cartItemId={item.id}
              quantity={item.quantity}
              maxQuantity={item.variant.stock}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                title="Edit item"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={removeCartItem.isPending}
              title="Remove item"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
