"use client";

import { useState, useEffect } from "react";
import { useAddToCart } from "@/hooks/use-cart";
import { useProductPriceCalculation } from "@/hooks/use-products";
import { ProductResponse } from "@/lib/products/types/products.types";
import {
  CustomizationChoiceDto,
  CreateCartItemDto,
} from "@/lib/cart/dto/cart.dto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Minus, Plus, ShoppingCart, Heart } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface AddToCartFormProps {
  product: ProductResponse;
  customizations: CustomizationChoiceDto[];
  designId?: string;
}

export default function AddToCartForm({
  product,
  customizations,
  designId,
}: AddToCartFormProps) {
  const [quantity, setQuantity] = useState(product.minOrderQuantity || 1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const addToCartMutation = useAddToCart();

  // Calculate price based on quantity and customizations
  const { data: priceData, isLoading: isPriceLoading } =
    useProductPriceCalculation(
      product.id,
      {
        quantity,
        urgencyLevel: "NORMAL",
      },
      true
    );

  useEffect(() => {
    // Ensure quantity stays within bounds
    if (quantity < product.minOrderQuantity) {
      setQuantity(product.minOrderQuantity);
    }
    if (product.maxOrderQuantity && quantity > product.maxOrderQuantity) {
      setQuantity(product.maxOrderQuantity);
    }
  }, [quantity, product.minOrderQuantity, product.maxOrderQuantity]);

  const handleQuantityChange = (newQuantity: number) => {
    const clampedQuantity = Math.max(
      product.minOrderQuantity,
      Math.min(
        product.maxOrderQuantity || Infinity,
        Math.min(product.stock, newQuantity)
      )
    );
    setQuantity(clampedQuantity);
  };

  const incrementQuantity = () => {
    handleQuantityChange(quantity + 1);
  };

  const decrementQuantity = () => {
    handleQuantityChange(quantity - 1);
  };

  const handleAddToCart = async () => {
    if (product.stock < quantity) {
      toast.error("Not enough stock available");
      return;
    }

    // Check for required customizations
    const requiredOptions =
      product.availableOptions?.filter((opt) => opt.option.required) || [];
    const providedOptions = customizations.map((c) => c.optionId);
    const missingRequired = requiredOptions.filter(
      (opt) => !providedOptions.includes(opt.option.id)
    );

    if (missingRequired.length > 0) {
      toast.error(
        `Please select: ${missingRequired.map((opt) => opt.option.displayName).join(", ")}`
      );
      return;
    }

    const cartItem: CreateCartItemDto = {
      productId: product.id,
      quantity,
      customizations,
      designId,
    };

    try {
      await addToCartMutation.mutateAsync(cartItem);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const calculateCustomizationTotal = () => {
    return customizations.reduce((total, customization) => {
      const option = product.availableOptions?.find(
        (opt) => opt.option.id === customization.optionId
      );
      const value = option?.values.find((v) => v.id === customization.valueId);
      return total + (value?.priceAdjustment || 0);
    }, 0);
  };

  const basePrice = product.basePrice;
  const customizationAdjustment = calculateCustomizationTotal();
  const unitPrice = basePrice + customizationAdjustment;
  const totalPrice = priceData?.totalPrice || unitPrice * quantity;

  const isOutOfStock = product.stock === 0;
  const isQuantityExceeded = quantity > product.stock;

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Add to Cart</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Display */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Base Price:</span>
            <span className="font-medium">{formatCurrency(basePrice)}</span>
          </div>

          {customizationAdjustment !== 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Customizations:</span>
              <span
                className={`font-medium ${customizationAdjustment > 0 ? "text-blue-600" : "text-green-600"}`}
              >
                {formatCurrency(customizationAdjustment)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
            <span>Unit Price:</span>
            <span>{formatCurrency(unitPrice)}</span>
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={decrementQuantity}
              disabled={quantity <= product.minOrderQuantity}
            >
              <Minus className="h-4 w-4" />
            </Button>

            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) =>
                handleQuantityChange(parseInt(e.target.value) || 1)
              }
              min={product.minOrderQuantity}
              max={Math.min(
                product.maxOrderQuantity || Infinity,
                product.stock
              )}
              className="w-20 text-center"
            />

            <Button
              variant="outline"
              size="icon"
              onClick={incrementQuantity}
              disabled={
                quantity >= (product.maxOrderQuantity || Infinity) ||
                quantity >= product.stock
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            Min: {product.minOrderQuantity}
            {product.maxOrderQuantity && ` • Max: ${product.maxOrderQuantity}`}
            {` • Available: ${product.stock}`}
          </div>
        </div>

        {/* Total Price */}
        <div className="text-center py-4 border rounded-lg bg-gray-50">
          <div className="text-sm text-gray-600 mb-1">Total Price</div>
          <div className="text-2xl font-bold text-blue-600">
            {isPriceLoading ? "Calculating..." : formatCurrency(totalPrice)}
          </div>
          {quantity > 1 && (
            <div className="text-sm text-gray-600">
              {formatCurrency(totalPrice / quantity)} per item
            </div>
          )}
        </div>

        {/* Alerts */}
        {isOutOfStock && (
          <Alert variant="destructive">
            <AlertDescription>
              This product is currently out of stock.
            </AlertDescription>
          </Alert>
        )}

        {isQuantityExceeded && (
          <Alert variant="destructive">
            <AlertDescription>
              Only {product.stock} items available in stock.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleAddToCart}
            disabled={
              isOutOfStock || isQuantityExceeded || addToCartMutation.isPending
            }
            className="w-full"
            size="lg"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
          </Button>

          <Button
            variant="outline"
            onClick={handleWishlist}
            className="w-full"
            size="lg"
          >
            <Heart
              className={`h-5 w-5 mr-2 ${isWishlisted ? "fill-current text-red-500" : ""}`}
            />
            {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Free shipping on orders over $50</p>
          <p>• 30-day return policy</p>
          <p>• Secure checkout guaranteed</p>
        </div>
      </CardContent>
    </Card>
  );
}
