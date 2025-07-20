/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Minus, Plus, ShoppingCart, Heart, Info, Truck } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import {
  useProductConfigurator,
  useDynamicPricing,
  useCalculateAdvancedPrice,
} from "@/hooks/use-products";
import {
  useCalculateShipping,
  useShippingEstimate,
} from "@/hooks/use-shipping";
import { addToCartAction } from "@/lib/cart/cart.actions";
import { formatAmount } from "@/lib/utils";

interface DynamicProductCustomizerProps {
  productId: string;
  templateId: string;
  basePrice: number;
  onConfigurationChange?: (config: any) => void;
}

interface Configuration {
  selectedDimensions: Record<string, string>;
  selectedMaterials: Record<string, string>;
  selectedOptions: Record<string, string>;
  quantity: number;
  urgencyLevel: "NORMAL" | "EXPEDITED" | "RUSH" | "EMERGENCY";
}

export function DynamicProductCustomizer({
  productId,
  templateId,
  basePrice,
  onConfigurationChange,
}: DynamicProductCustomizerProps) {
  const { toast } = useToast();
  const { template, configuration, isLoading, validateQuantity } =
    useProductConfigurator(templateId);

  const [config, setConfig] = useState<Configuration>({
    selectedDimensions: {},
    selectedMaterials: {},
    selectedOptions: {},
    quantity: 50,
    urgencyLevel: "NORMAL",
  });

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [designAreaDimensions, setDesignAreaDimensions] = useState({
    width: 200,
    height: 50,
  });

  // Initialize default values when template loads
  useEffect(() => {
    if (template && configuration) {
      const defaultConfig: Configuration = {
        selectedDimensions: {},
        selectedMaterials: {},
        selectedOptions: {},
        quantity: template.minOrder || 50,
        urgencyLevel: "NORMAL",
      };

      // Set default dimensions
      template.dimensions?.forEach((dimension) => {
        const defaultOption = dimension.options?.find((opt) => opt.isDefault);
        if (defaultOption) {
          defaultConfig.selectedDimensions[dimension.name] =
            defaultOption.value;
        }
      });

      // Set default materials
      template.materials?.forEach((material) => {
        const defaultOption = material.options?.find((opt) => opt.isDefault);
        if (defaultOption) {
          defaultConfig.selectedMaterials[material.name] = defaultOption.value;
        }
      });

      // Set default options
      template.options?.forEach((option) => {
        const defaultChoice = option.options?.find(
          (choice) => choice.isDefault
        );
        if (defaultChoice) {
          defaultConfig.selectedOptions[option.name] = defaultChoice.value;
        }
      });

      setConfig(defaultConfig);
    }
  }, [template, configuration]);

  // Update design area dimensions when width changes
  useEffect(() => {
    if (config.selectedDimensions.width && template?.canvasSettings) {
      const widthValue = config.selectedDimensions.width;
      const baseWidth = template.canvasSettings.width;

      // Calculate new dimensions based on selected width
      let newWidth = baseWidth;
      let newHeight = template.canvasSettings.height;

      switch (widthValue) {
        case "10mm":
          newWidth = 100;
          newHeight = 40;
          break;
        case "15mm":
          newWidth = 150;
          newHeight = 45;
          break;
        case "20mm":
          newWidth = 200;
          newHeight = 50;
          break;
        case "25mm":
          newWidth = 250;
          newHeight = 60;
          break;
        default:
          newWidth = baseWidth;
          newHeight = template.canvasSettings.height;
      }

      setDesignAreaDimensions({ width: newWidth, height: newHeight });
    }
  }, [config.selectedDimensions.width, template]);

  // Dynamic pricing calculation
  const { pricing, isCalculating, recalculate } = useDynamicPricing(productId, {
    quantity: config.quantity,
    selectedDimensions: config.selectedDimensions,
    selectedMaterials: config.selectedMaterials,
    customizations: config.selectedOptions,
    urgencyLevel: config.urgencyLevel,
  });

  // Fixed shipping calculation with proper data structure
  const shippingCalculationData = useMemo(
    () => ({
      items: [
        {
          productId: productId,
          quantity: config.quantity,
          weight: 0.01 * config.quantity, // Estimate weight
          dimensions: {
            length: 20,
            width: 10,
            height: 2,
            unit: "cm" as const,
          },
          value: pricing?.totalPrice || basePrice * config.quantity,
        },
      ],
      shippingAddress: {
        address1: "",
        city: "",
        state: "",
        postalCode: "",
        country: "GB",
      },
      orderValue: pricing?.totalPrice || basePrice * config.quantity,
      urgencyLevel: config.urgencyLevel,
    }),
    [
      productId,
      config.quantity,
      config.urgencyLevel,
      pricing?.totalPrice,
      basePrice,
    ]
  );

  const { data: shippingOptions, isLoading: isCalculatingShipping } =
    useCalculateShipping(shippingCalculationData, {
      enabled: config.quantity > 0,
    });

  // Alternative: Use shipping estimate for simpler calculation
  const { data: shippingEstimate } = useShippingEstimate({
    country: "GB",
    weight: 0.01 * config.quantity,
    orderValue: pricing?.totalPrice || basePrice * config.quantity,
    urgencyLevel: config.urgencyLevel,
  });

  // Update configuration handler
  const updateConfiguration = (updates: Partial<Configuration>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigurationChange?.(newConfig);

    // Trigger price recalculation
    setTimeout(() => recalculate(), 100);
  };

  // Quantity handlers
  const incrementQuantity = () => {
    const maxQuantity = template?.maxOrder || 10000;
    if (config.quantity < maxQuantity) {
      updateConfiguration({ quantity: config.quantity + 1 });
    }
  };

  const decrementQuantity = () => {
    const minQuantity = template?.minOrder || 1;
    if (config.quantity > minQuantity) {
      updateConfiguration({ quantity: config.quantity - 1 });
    }
  };

  // Add to cart handler
  const handleAddToCart = async () => {
    setIsAddingToCart(true);

    try {
      const result = await addToCartAction({
        productId,
        quantity: config.quantity,
        customizations: {
          ...config.selectedDimensions,
          ...config.selectedMaterials,
          ...config.selectedOptions,
          urgencyLevel: config.urgencyLevel,
        },
        savedForLater: false,
      });

      if (result.success) {
        toast({
          title: "Added to cart",
          description: `${config.quantity} items added to your cart.`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add to cart",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const quantityValidation = useMemo(() => {
    return validateQuantity(config.quantity);
  }, [config.quantity, validateQuantity]);

  if (isLoading) {
    return <div className="animate-pulse">Loading configuration...</div>;
  }

  if (!template) {
    return <div>Template not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Product Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Product Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dimensions */}
          {template.dimensions?.map((dimension) => (
            <div key={dimension.name} className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor={dimension.name}>{dimension.displayName}</Label>
                {dimension.required && (
                  <Badge variant="secondary">Required</Badge>
                )}
              </div>
              {dimension.description && (
                <p className="text-sm text-muted-foreground">
                  {dimension.description}
                </p>
              )}
              <Select
                value={config.selectedDimensions[dimension.name] || ""}
                onValueChange={(value) => {
                  updateConfiguration({
                    selectedDimensions: {
                      ...config.selectedDimensions,
                      [dimension.name]: value,
                    },
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={`Select ${dimension.displayName.toLowerCase()}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {dimension.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex justify-between items-center w-full">
                        <span>{option.displayName}</span>
                        {option.priceAdjustment > 0 && (
                          <span className="text-sm text-muted-foreground">
                            +{formatAmount(option.priceAdjustment)}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {/* Materials */}
          {template.materials?.map((material) => (
            <div key={material.name} className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor={material.name}>{material.displayName}</Label>
                {material.required && (
                  <Badge variant="secondary">Required</Badge>
                )}
              </div>
              {material.description && (
                <p className="text-sm text-muted-foreground">
                  {material.description}
                </p>
              )}
              <Select
                value={config.selectedMaterials[material.name] || ""}
                onValueChange={(value) => {
                  updateConfiguration({
                    selectedMaterials: {
                      ...config.selectedMaterials,
                      [material.name]: value,
                    },
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={`Select ${material.displayName.toLowerCase()}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {material.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex justify-between items-center w-full">
                        <span>{option.displayName}</span>
                        {option.priceAdjustment > 0 && (
                          <span className="text-sm text-muted-foreground">
                            +{formatAmount(option.priceAdjustment)}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {/* Additional Options */}
          {template.options?.map((option) => (
            <div key={option.name} className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor={option.name}>{option.displayName}</Label>
                {option.required && <Badge variant="secondary">Required</Badge>}
              </div>
              {option.description && (
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              )}
              <Select
                value={config.selectedOptions[option.name] || ""}
                onValueChange={(value) => {
                  updateConfiguration({
                    selectedOptions: {
                      ...config.selectedOptions,
                      [option.name]: value,
                    },
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={`Select ${option.displayName.toLowerCase()}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {option.options?.map((choice) => (
                    <SelectItem key={choice.value} value={choice.value}>
                      <div className="flex justify-between items-center w-full">
                        <span>{choice.displayName}</span>
                        {choice.priceAdjustment > 0 && (
                          <span className="text-sm text-muted-foreground">
                            +{formatAmount(choice.priceAdjustment)}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          <Separator />

          {/* Design Check */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Have your design checked?</h4>
                <p className="text-sm text-muted-foreground">
                  Our design team can review your artwork for print quality and
                  suggest improvements.
                </p>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm">
                    No
                  </Button>
                  <Button variant="outline" size="sm">
                    Yes
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={config.quantity <= (template.minOrder || 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-20 text-center font-medium">
                {config.quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                disabled={
                  template.maxOrder
                    ? config.quantity >= template.maxOrder
                    : false
                }
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {!quantityValidation.valid && (
              <p className="text-sm text-red-600">{quantityValidation.error}</p>
            )}

            {template.minOrder > 1 && (
              <p className="text-xs text-muted-foreground">
                Min Order: {template.minOrder} • Lead Time: {template.leadTime}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Design Area Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Design Area Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <div className="text-sm text-muted-foreground">
              Design area adjusts based on your selected dimensions
            </div>
            <div
              className="border-2 border-dashed border-muted-foreground/30 bg-muted/20 flex items-center justify-center transition-all duration-300"
              style={{
                width: `${designAreaDimensions.width}px`,
                height: `${designAreaDimensions.height}px`,
                minWidth: "100px",
                minHeight: "40px",
              }}
            >
              <span className="text-xs text-muted-foreground">
                {designAreaDimensions.width}×{designAreaDimensions.height}px
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Selected: {config.selectedDimensions.width || "No width selected"}{" "}
              × {config.selectedMaterials.fabric || "No material selected"}
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
          {isCalculating ? (
            <div className="animate-pulse">Calculating price...</div>
          ) : pricing ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Base Price</span>
                <span>{formatAmount(pricing.basePrice)}</span>
              </div>

              {pricing.customizationCost > 0 && (
                <div className="flex justify-between">
                  <span>Customization</span>
                  <span>+{formatAmount(pricing.customizationCost)}</span>
                </div>
              )}

              {pricing.dimensionPricing && pricing.dimensionPricing > 0 && (
                <div className="flex justify-between">
                  <span>Size Adjustment</span>
                  <span>+{formatAmount(pricing.dimensionPricing)}</span>
                </div>
              )}

              {pricing.materialPricing && pricing.materialPricing > 0 && (
                <div className="flex justify-between">
                  <span>Material Adjustment</span>
                  <span>+{formatAmount(pricing.materialPricing)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatAmount(pricing.subtotal)}</span>
              </div>

              <div className="flex justify-between font-bold text-lg">
                <span>Total ({config.quantity} items)</span>
                <span>{formatAmount(pricing.totalPrice)}</span>
              </div>

              <div className="text-sm text-muted-foreground text-center">
                {formatAmount(pricing.pricePerUnit)} per item inc. VAT
              </div>
            </div>
          ) : (
            <div className="flex justify-between font-bold text-lg">
              <span>Total ({config.quantity} items)</span>
              <span>{formatAmount(basePrice * config.quantity)}</span>
            </div>
          )}

          {/* Shipping Information */}
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span className="font-medium">Shipping</span>
            </div>

            {isCalculatingShipping ? (
              <div className="text-sm text-muted-foreground">
                Calculating shipping...
              </div>
            ) : (shippingOptions && shippingOptions.length > 0) ||
              (shippingEstimate && shippingEstimate.length > 0) ? (
              <div className="space-y-1">
                {(shippingOptions || shippingEstimate)
                  ?.slice(0, 2)
                  .map((option, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{option.name}</span>
                      <span>
                        {option.isFree ? "Free" : formatAmount(option.cost)}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Standard UK shipping: £3.99
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <Button
          className="w-full"
          size="lg"
          onClick={handleAddToCart}
          disabled={isAddingToCart || !quantityValidation.valid}
        >
          {isAddingToCart ? (
            "Adding to Cart..."
          ) : (
            <>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </>
          )}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg">
            <Heart className="mr-2 h-4 w-4" />
            Save Design
          </Button>
          <Button variant="outline" size="lg">
            Upload Artwork
          </Button>
        </div>
      </div>
    </div>
  );
}
