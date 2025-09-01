"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, ImageIcon } from "lucide-react";
import { CartItemResponse } from "@/lib/cart/types/cart.types";
import { useRemoveCartItem } from "@/hooks/use-cart";
import { QuantitySelector } from "./quantity-selector";
import Image from "next/image";
import { useContext, createContext, useState, useEffect } from "react";

interface CartSheetContextType {
  isOpen: boolean;
  setUpdating: (updating: boolean) => void;
  closeSheet: () => void;
}

const CartSheetContext = createContext<CartSheetContextType | null>(null);

function useCartSheetSafe() {
  return useContext(CartSheetContext);
}

const getValidImageUrl = (
  imageUrl?: string | null,
  fallback = "/placeholder-product.jpg"
) => {
  if (!imageUrl) return fallback;

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/")) {
    return imageUrl;
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "https://rbdapi.oleq.app";
  const fullUrl = `${apiUrl}/${imageUrl}`;
  return fullUrl;
};
interface CartItemProps {
  item: CartItemResponse;
  onEdit?: (item: CartItemResponse) => void;
}

// Product Image Component with proper error handling
function ProductImage({
  item,
  className,
}: {
  item: CartItemResponse;
  className: string;
}) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the proper image URL with debugging
  const getImageSrc = (): string | null => {
    // Check thumbnailImage first
    if (item.product.thumbnailImage?.src) {
      const processedUrl = getValidImageUrl(item.product.thumbnailImage.src);
      return processedUrl;
    }

    // Check first image in array
    if (
      item.product.images &&
      Array.isArray(item.product.images) &&
      item.product.images.length > 0
    ) {
      const firstImage = item.product.images[0];

      if (firstImage && typeof firstImage === "object" && firstImage.src) {
        const processedUrl = getValidImageUrl(firstImage.src);
        return processedUrl;
      }
    }

    console.log("No valid image source found, using placeholder");
    return "/placeholder-product.jpg";
  };

  const imageSrc = getImageSrc();
  const shouldShowFallback = !imageSrc || imageError || !mounted;

  if (shouldShowFallback) {
    return (
      <div
        className={`${className} bg-muted flex items-center justify-center border border-border rounded-md`}
      >
        <ImageIcon className="h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={className}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center rounded-md z-10">
          <div className="animate-pulse">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      )}
      <Image
        src={imageSrc}
        alt={item.product.name || "Product image"}
        fill
        className="object-cover rounded-md"
        sizes="80px"
        onLoad={() => {
          setIsLoading(false);
        }}
        onError={(e) => {
          setImageError(true);
          setIsLoading(false);
          // Fallback to placeholder
          (e.target as HTMLImageElement).src = "/placeholder-product.jpg";
        }}
        priority={false}
      />
    </div>
  );
}

export function CartItem({ item, onEdit }: CartItemProps) {
  const removeCartItem = useRemoveCartItem();
  const cartSheetContext = useCartSheetSafe();

  const handleRemove = () => {
    if (cartSheetContext?.isOpen) {
      cartSheetContext.setUpdating(true);
    }

    removeCartItem.mutate(item.id, {
      onSettled: () => {
        if (cartSheetContext?.isOpen) {
          setTimeout(() => {
            cartSheetContext.setUpdating(false);
          }, 100);
        }
      },
    });
  };

  const handleEdit = () => {
    onEdit?.(item);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Product Image with Error Handling */}
          <div className="relative flex-shrink-0">
            <ProductImage item={item} className="relative w-20 h-20" />
            {item.product.isFeatured && (
              <Badge
                variant="secondary"
                className="absolute -top-2 -right-2 text-xs px-1 py-0 z-10"
              >
                ★
              </Badge>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-sm line-clamp-2">
                {item.product.name}
              </h3>
              {!item.product.isActive && (
                <Badge variant="destructive" className="text-xs shrink-0">
                  Inactive
                </Badge>
              )}
            </div>

            {/* Product Description */}
            {item.product.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {item.product.description}
              </p>
            )}

            {/* Fulfillment Type and Delivery */}
            {(item.fulfillmentType || item.estimatedDelivery) && (
              <div className="mt-1 flex items-center gap-2">
                {item.fulfillmentType && (
                  <Badge
                    variant={
                      item.fulfillmentType === "INVENTORY"
                        ? "default"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {item.fulfillmentType === "INVENTORY"
                      ? "In Stock"
                      : "Custom Made"}
                  </Badge>
                )}
                {item.estimatedDelivery && (
                  <span className="text-xs text-muted-foreground">
                    {item.estimatedDelivery}
                  </span>
                )}
              </div>
            )}

            {/* Product Metadata */}
            {item.product.metadata && (
              <div className="mt-1 flex flex-wrap gap-1">
                {item.product.metadata.material && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {item.product.metadata.material}
                  </Badge>
                )}
                {item.product.metadata.leadTime && (
                  <span className="text-xs text-muted-foreground">
                    • {item.product.metadata.leadTime}
                  </span>
                )}
              </div>
            )}

            {/* Variant Information */}
            {item.variant && (
              <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2 flex-wrap">
                <span className="font-medium">{item.variant.name}</span>
                {item.variant.sku && (
                  <span className="px-1.5 py-0.5 bg-muted rounded">
                    SKU: {item.variant.sku}
                  </span>
                )}
                {item.variant.stock <= 5 && item.variant.stock > 0 && (
                  <Badge variant="outline" className="text-xs text-orange-600">
                    Low stock: {item.variant.stock}
                  </Badge>
                )}
                {item.variant.stock === 0 && (
                  <Badge variant="destructive" className="text-xs">
                    Out of stock
                  </Badge>
                )}
              </div>
            )}

            {/* Customizations */}
            {item.customizations && item.customizations.length > 0 && (
              <div className="mt-2 space-y-1">
                {item.customizations.map((customization, index) => (
                  <div
                    key={`${customization.optionId}-${index}`}
                    className="text-xs text-muted-foreground"
                  >
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

            {/* Design ID if present */}
            {item.designId && (
              <div className="mt-1 text-xs text-muted-foreground">
                Design ID: {item.designId}
              </div>
            )}

            {/* Custom Design Status */}
            {item.isCustomDesign && (
              <div className="mt-1">
                <Badge variant="outline" className="text-xs">
                  Custom Design
                </Badge>
              </div>
            )}
          </div>

          {/* Quantity and Price */}
          <div className="text-right space-y-2 min-w-0 flex-shrink-0">
            <div className="space-y-1">
              <div className="font-semibold text-base">
                KES {item.totalPrice.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                KES {item.unitPrice.toLocaleString()} each
              </div>
              {item.quantity > 1 && (
                <div className="text-xs text-muted-foreground">
                  Qty: {item.quantity}
                </div>
              )}
            </div>

            <QuantitySelector
              cartItemId={item.id}
              quantity={item.quantity}
              maxQuantity={item.variant?.stock || 999}
              disabled={
                !item.product.isActive || (item.variant?.stock || 0) === 0
              }
              sheetContext={
                cartSheetContext
                  ? {
                      isOpen: cartSheetContext.isOpen,
                      setUpdating: cartSheetContext.setUpdating,
                    }
                  : undefined
              }
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                title="Edit item"
                className="h-8 w-8 p-0"
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
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Additional metadata
        {(item.createdAt || item.updatedAt) && (
          <div className="mt-3 pt-3 border-t border-muted text-xs text-muted-foreground">
            {item.createdAt && (
              <span>Added: {new Date(item.createdAt).toLocaleDateString()}</span>
            )}
            {item.updatedAt && item.updatedAt !== item.createdAt && (
              <span className="ml-4">
                Updated: {new Date(item.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        )} */}
      </CardContent>
    </Card>
  );
}

export { CartSheetContext };
