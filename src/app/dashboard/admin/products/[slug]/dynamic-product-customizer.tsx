/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Info,
  Truck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProduct, useProductPriceCalculation } from "@/hooks/use-products";
import { useShippingCalculation } from "@/hooks/use-shipping";
import { useAddToCart } from "@/hooks/use-cart";

import {
  ProductResponse,
  ProductCustomizationOption,
  PriceCalculationRequest,
  PriceBreakdown,
} from "@/lib/products/types/products.types";
import { PriceCalculationDto } from "@/lib/products/dto/products.dto";
import { ShippingCalculationDto } from "@/lib/shipping/dto/shipping.dto";
import { formatCurrency } from "@/lib/utils";

interface DynamicProductCustomizerProps {
  productId: string;
  onConfigurationChange?: (config: Configuration) => void;
}

interface Configuration {
  selectedOptions: Record<string, string>;
  quantity: number;
  urgencyLevel: "NORMAL" | "EXPEDITED" | "RUSH" | "EMERGENCY";
}

export function DynamicProductCustomizer({
  productId,
  onConfigurationChange,
}: DynamicProductCustomizerProps) {
  // Fetch product data using the proper hook
  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useProduct(productId);

  const [config, setConfig] = useState<Configuration>({
    selectedOptions: {},
    quantity: 1,
    urgencyLevel: "NORMAL",
  });

  const addToCartMutation = useAddToCart();

  // Initialize default configuration when product loads
  useEffect(() => {
    if (product && product.availableOptions) {
      const defaultConfig: Configuration = {
        selectedOptions: {},
        quantity: product.minOrderQuantity || 1,
        urgencyLevel: "NORMAL",
      };

      // Set default values for required options
      product.availableOptions.forEach((customizationOption) => {
        if (
          customizationOption.option.required &&
          customizationOption.values.length > 0
        ) {
          const defaultValue =
            customizationOption.values.find((v) => v.id) ||
            customizationOption.values[0];
          defaultConfig.selectedOptions[customizationOption.option.id] =
            defaultValue.id;
        }
      });

      setConfig(defaultConfig);
    }
  }, [product]);

  // Prepare price calculation data
  const priceCalculationData: PriceCalculationDto = useMemo(
    () => ({
      quantity: config.quantity,
      customizations: config.selectedOptions,
      urgencyLevel: config.urgencyLevel,
    }),
    [config]
  );

  // Use product price calculation hook
  const { data: pricing, isLoading: isPricingLoading } =
    useProductPriceCalculation(
      productId,
      priceCalculationData,
      config.quantity > 0
    );

  // Prepare shipping calculation data
  const shippingCalculationData: ShippingCalculationDto = useMemo(() => {
    const estimatedWeight = (product?.weight || 0.1) * config.quantity;
    const orderValue =
      pricing?.totalPrice || (product?.basePrice || 0) * config.quantity;

    return {
      items: [
        {
          productId: productId,
          quantity: config.quantity,
          weight: estimatedWeight,
        },
      ],
      shippingAddress: {
        recipientName: "Customer",
        street: "Sample Street",
        city: "London",
        state: "England",
        postalCode: "SW1A 1AA",
        country: "GB", // Default to UK
      },
      orderValue: orderValue,
      urgencyLevel: config.urgencyLevel,
      totalWeight: estimatedWeight,
    };
  }, [
    productId,
    config.quantity,
    config.urgencyLevel,
    pricing?.totalPrice,
    product?.basePrice,
    product?.weight,
  ]);

  // Calculate shipping options
  const { data: shippingOptions, isLoading: isShippingLoading } =
    useShippingCalculation(
      shippingCalculationData,
      config.quantity > 0 && !!product
    );

  // Update configuration handler
  const updateConfiguration = (updates: Partial<Configuration>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigurationChange?.(newConfig);
  };

  // Quantity handlers
  const incrementQuantity = () => {
    const maxQuantity = product?.maxOrderQuantity || 10000;
    if (config.quantity < maxQuantity) {
      updateConfiguration({ quantity: config.quantity + 1 });
    }
  };

  const decrementQuantity = () => {
    const minQuantity = product?.minOrderQuantity || 1;
    if (config.quantity > minQuantity) {
      updateConfiguration({ quantity: config.quantity - 1 });
    }
  };

  // Validate quantity
  const quantityValidation = useMemo(() => {
    if (!product) return { valid: true, error: null };

    const min = product.minOrderQuantity || 1;
    const max = product.maxOrderQuantity;

    if (config.quantity < min) {
      return { valid: false, error: `Minimum quantity is ${min}` };
    }

    if (max && config.quantity > max) {
      return { valid: false, error: `Maximum quantity is ${max}` };
    }

    if (product.stock < config.quantity) {
      return { valid: false, error: `Only ${product.stock} items in stock` };
    }

    return { valid: true, error: null };
  }, [config.quantity, product]);

  // Validate required options
  const optionsValidation = useMemo(() => {
    if (!product?.availableOptions) return { valid: true, error: null };

    const requiredOptions = product.availableOptions.filter(
      (opt) => opt.option.required
    );
    const missingOptions = requiredOptions.filter(
      (opt) => !config.selectedOptions[opt.option.id]
    );

    if (missingOptions.length > 0) {
      return {
        valid: false,
        error: `Please select: ${missingOptions.map((opt) => opt.option.displayName).join(", ")}`,
      };
    }

    return { valid: true, error: null };
  }, [config.selectedOptions, product?.availableOptions]);

  const handleAddToCart = async () => {
    if (!product || !quantityValidation.valid || !optionsValidation.valid) {
      return;
    }

    try {
      const customizations = Object.entries(config.selectedOptions).map(
        ([optionId, valueId]) => ({
          optionId,
          valueId,
        })
      );

      await addToCartMutation.mutateAsync({
        productId,
        quantity: config.quantity,
        customizations,
      });

      toast.success(`${config.quantity} items added to cart`);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  // Loading state
  if (productLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (productError || !product) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {productError?.message || "Failed to load product configuration"}
        </AlertDescription>
      </Alert>
    );
  }

  const isFormValid = quantityValidation.valid && optionsValidation.valid;
  const totalPrice = pricing?.totalPrice || product.basePrice * config.quantity;

  return (
    <div className="space-y-6">
      {/* Product Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Product Configuration</CardTitle>
          <p className="text-sm text-muted-foreground">
            Customize your {product.name}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customization Options */}
          {product.availableOptions && product.availableOptions.length > 0 ? (
            product.availableOptions.map((customizationOption) => (
              <div key={customizationOption.option.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor={customizationOption.option.id}>
                    {customizationOption.option.displayName}
                  </Label>
                  {customizationOption.option.required && (
                    <Badge variant="secondary" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>

                <Select
                  value={
                    config.selectedOptions[customizationOption.option.id] || ""
                  }
                  onValueChange={(value) => {
                    updateConfiguration({
                      selectedOptions: {
                        ...config.selectedOptions,
                        [customizationOption.option.id]: value,
                      },
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={`Select ${customizationOption.option.displayName.toLowerCase()}`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {customizationOption.values.map((value) => (
                      <SelectItem key={value.id} value={value.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{value.displayName}</span>
                          {value.priceAdjustment > 0 && (
                            <span className="text-sm text-muted-foreground ml-2">
                              +{formatCurrency(value.priceAdjustment)}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No customization options available for this product</p>
            </div>
          )}

          <Separator />

          {/* Urgency Level */}
          <div className="space-y-2">
            <Label>Production Priority</Label>
            <Select
              value={config.urgencyLevel}
              onValueChange={(value: any) => {
                updateConfiguration({ urgencyLevel: value });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NORMAL">
                  <div className="flex justify-between items-center w-full">
                    <span>Standard</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      No extra cost
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="EXPEDITED">
                  <div className="flex justify-between items-center w-full">
                    <span>Expedited</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      +25%
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="RUSH">
                  <div className="flex justify-between items-center w-full">
                    <span>Rush</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      +50%
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="EMERGENCY">
                  <div className="flex justify-between items-center w-full">
                    <span>Emergency</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      +100%
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity Selection */}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={config.quantity <= (product.minOrderQuantity || 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-20 text-center font-medium text-lg">
                {config.quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                disabled={
                  product.maxOrderQuantity
                    ? config.quantity >= product.maxOrderQuantity
                    : config.quantity >= product.stock
                }
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Quantity validation */}
            {!quantityValidation.valid && (
              <p className="text-sm text-red-600">{quantityValidation.error}</p>
            )}

            {/* Options validation */}
            {!optionsValidation.valid && (
              <p className="text-sm text-red-600">{optionsValidation.error}</p>
            )}

            {/* Product constraints info */}
            <div className="text-xs text-muted-foreground space-y-1">
              {product.minOrderQuantity > 1 && (
                <p>Minimum order: {product.minOrderQuantity} items</p>
              )}
              {product.maxOrderQuantity && (
                <p>Maximum order: {product.maxOrderQuantity} items</p>
              )}
              <p>Available stock: {product.stock} items</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPricingLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Calculating price...</span>
            </div>
          ) : pricing ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>
                  Base Price ({config.quantity} ×{" "}
                  {formatCurrency(product.basePrice)})
                </span>
                <span>{formatCurrency(pricing.basePrice)}</span>
              </div>

              {pricing.customizationCost > 0 && (
                <div className="flex justify-between">
                  <span>Customization</span>
                  <span>+{formatCurrency(pricing.customizationCost)}</span>
                </div>
              )}

              {config.urgencyLevel !== "NORMAL" &&
                pricing.urgencyMultiplier > 1 && (
                  <div className="flex justify-between">
                    <span>Priority ({config.urgencyLevel.toLowerCase()})</span>
                    <span>
                      +{formatCurrency(pricing.totalPrice - pricing.subtotal)}
                    </span>
                  </div>
                )}

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(pricing.totalPrice)}</span>
              </div>

              <div className="text-sm text-muted-foreground text-center">
                {formatCurrency(pricing.pricePerUnit)} per item inc. VAT
              </div>

              {/* Show price breakdown if available */}
              {pricing.customizationBreakdown &&
                pricing.customizationBreakdown.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-2">
                      Customization Details:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {pricing.customizationBreakdown.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          ) : (
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
          )}

          {/* Shipping Information */}
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span className="font-medium">Shipping Options</span>
            </div>

            {isShippingLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Calculating shipping...</span>
              </div>
            ) : shippingOptions && shippingOptions.length > 0 ? (
              <div className="space-y-1">
                {shippingOptions.slice(0, 3).map((option, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{option.name}</span>
                    <span>
                      {option.isFree ? "Free" : formatCurrency(option.cost)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Standard UK shipping: £3.99 • Express: £7.99
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stock Warning */}
      {product.stock <= 10 && product.stock > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <Info className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Only {product.stock} items left in stock!
          </AlertDescription>
        </Alert>
      )}

      {/* Out of Stock Warning */}
      {product.stock === 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            This product is currently out of stock.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <Button
          className="w-full"
          size="lg"
          onClick={handleAddToCart}
          disabled={
            addToCartMutation.isPending || !isFormValid || product.stock === 0
          }
        >
          {addToCartMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Adding to Cart...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart • {formatCurrency(totalPrice)}
            </>
          )}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg">
            <Heart className="mr-2 h-4 w-4" />
            Save for Later
          </Button>
          <Button variant="outline" size="lg">
            Get Quote
          </Button>
        </div>
      </div>

      {/* Additional Product Info */}
      {product.metaDescription && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Product Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {product.metaDescription}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
