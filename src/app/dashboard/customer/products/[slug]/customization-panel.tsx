/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */

"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Ruler,
  Package,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  Minus,
  Plus,
  Calculator,
  Home,
  Palette,
  Shirt,
  Layers,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  useProductBySlug,
  useProductPriceCalculation,
} from "@/hooks/use-products";
import type { PriceCalculationDto } from "@/lib/products/dto/products.dto";
import { formatCurrency } from "@/lib/utils";

// Updated interfaces based on API response
interface CustomizationOptionValue {
  id: string;
  value: string;
  displayName: string;
  description?: string;
  imageUrl?: string;
  hexColor?: string;
  priceAdjustment: number;
  sortOrder: number;
  isActive: boolean;
  optionId: string;
}

interface CustomizationOption {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  type: string;
  required: boolean;
  sortOrder: number;
}

interface ProductCustomizationOption {
  id: string;
  productId: string;
  optionId: string;
  required: boolean;
  sortOrder: number;
  option: CustomizationOption;
  values: CustomizationOptionValue[];
}

interface CustomizationSelection {
  optionId: string;
  valueId?: string;
  customValue?: string;
}

type UrgencyLevel = "NORMAL" | "EXPEDITED" | "RUSH" | "EMERGENCY";

// Helper function to safely get error message
const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "Unknown error";
};

// Enhanced hook for customization management using product data
const useCustomizationManagement = (product?: any) => {
  try {
    // Extract available options from product data
    const productOptions: ProductCustomizationOption[] =
      product?.availableOptions || [];

    // Debug logging for customizations
    useEffect(() => {
      console.log("=== CUSTOMIZATION DEBUG ===");
      console.log("Product ID:", product?.id);
      console.log("Product Options:", productOptions);
      console.log("Category ID:", product?.category?.id);
    }, [product, productOptions]);

    // Process customization options
    const allCustomizations = useMemo(() => {
      try {
        if (!productOptions || productOptions.length === 0) {
          return [];
        }

        // Sort options by sortOrder and ensure active values only
        const sortedOptions = productOptions
          .filter((productOption) => productOption && productOption.option) // Ensure valid options
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          .map((productOption) => ({
            ...productOption.option,
            required: productOption.required, // Use the product-specific required flag
            values:
              productOption.values?.filter(
                (value) => value && value.isActive !== false
              ) || [],
          }));

        console.log(
          "Final processed customization options:",
          sortedOptions.length
        );
        return sortedOptions;
      } catch (error) {
        console.error("Error processing product customizations:", error);
        return [];
      }
    }, [productOptions]);

    // Separate size options with better filtering
    const sizeOptions = useMemo(() => {
      try {
        return allCustomizations.filter((opt) => {
          if (!opt || !opt.displayName) return false;

          const nameMatch = opt.name?.toLowerCase().includes("size") || false;
          const displayNameMatch =
            opt.displayName?.toLowerCase().includes("size") || false;
          const dimensionMatch =
            opt.displayName?.toLowerCase().includes("dimension") || false;
          const measurementMatch =
            opt.displayName?.toLowerCase().includes("measurement") || false;

          return (
            nameMatch || displayNameMatch || dimensionMatch || measurementMatch
          );
        });
      } catch (error) {
        console.error("Error filtering size options:", error);
        return [];
      }
    }, [allCustomizations]);

    // Separate material options with better filtering
    const materialOptions = useMemo(() => {
      try {
        return allCustomizations.filter((opt) => {
          if (!opt || !opt.displayName) return false;

          const materialMatch =
            opt.displayName?.toLowerCase().includes("material") || false;
          const fabricMatch =
            opt.displayName?.toLowerCase().includes("fabric") || false;
          const textureMatch =
            opt.displayName?.toLowerCase().includes("texture") || false;
          const finishMatch =
            opt.displayName?.toLowerCase().includes("finish") || false;

          return materialMatch || fabricMatch || textureMatch || finishMatch;
        });
      } catch (error) {
        console.error("Error filtering material options:", error);
        return [];
      }
    }, [allCustomizations]);

    // Color options
    const colorOptions = useMemo(() => {
      try {
        return allCustomizations.filter((opt) => {
          if (!opt || !opt.displayName) return false;

          const colorMatch =
            opt.displayName?.toLowerCase().includes("color") || false;
          const nameMatch = opt.name?.toLowerCase().includes("color") || false;
          const typeMatch = opt.type === "COLOR_PICKER" || false;

          return colorMatch || nameMatch || typeMatch;
        });
      } catch (error) {
        console.error("Error filtering color options:", error);
        return [];
      }
    }, [allCustomizations]);

    // Other customization options (excluding size, material, and color)
    const otherOptions = useMemo(() => {
      try {
        const sizeIds = new Set(sizeOptions.map((opt) => opt.id));
        const materialIds = new Set(materialOptions.map((opt) => opt.id));
        const colorIds = new Set(colorOptions.map((opt) => opt.id));

        return allCustomizations.filter(
          (opt) =>
            opt &&
            opt.id &&
            !sizeIds.has(opt.id) &&
            !materialIds.has(opt.id) &&
            !colorIds.has(opt.id)
        );
      } catch (error) {
        console.error("Error filtering other options:", error);
        return [];
      }
    }, [allCustomizations, sizeOptions, materialOptions, colorOptions]);

    return {
      allCustomizations,
      sizeOptions,
      materialOptions,
      colorOptions,
      otherOptions,
      isLoading: false,
      error: null,
      hasOptions: allCustomizations.length > 0,
    };
  } catch (error) {
    console.error("Error in useCustomizationManagement:", error);
    return {
      allCustomizations: [],
      sizeOptions: [],
      materialOptions: [],
      colorOptions: [],
      otherOptions: [],
      isLoading: false,
      error: error,
      hasOptions: false,
    };
  }
};

export default function ProductDetailPage() {
  try {
    const params = useParams();

    // Extract slug correctly with validation
    const productSlug = Array.isArray(params?.slug)
      ? params.slug[0]
      : (params?.slug as string);

    // Debug logging
    useEffect(() => {
      console.log("=== PRODUCT DETAIL DEBUG ===");
      console.log("Raw params:", params);
      console.log("params.slug:", params?.slug);
      console.log("Extracted productSlug:", productSlug);
      console.log("ProductSlug type:", typeof productSlug);
      console.log("ProductSlug length:", productSlug?.length);
    }, [params, productSlug]);

    // State for customization with proper typing
    const [quantity, setQuantity] = useState(1);
    const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>("NORMAL");
    const [selectedCustomizations, setSelectedCustomizations] = useState<
      Record<string, CustomizationSelection>
    >({});
    const [selectedImage, setSelectedImage] = useState(0);

    // Validate productSlug before making API calls
    if (
      !productSlug ||
      typeof productSlug !== "string" ||
      productSlug.trim() === ""
    ) {
      console.error("Invalid productSlug:", productSlug);
      return (
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h2 className="text-2xl font-semibold mb-2">
                Invalid Product URL
              </h2>
              <p className="text-muted-foreground mb-6 text-center">
                The product URL is missing or invalid.
              </p>
              <Button asChild>
                <Link href="/dashboard/customer/design-studio">
                  Back to Design Studio
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Fetch product data with enhanced error handling
    const {
      data: product,
      isLoading: loadingProduct,
      error: productError,
    } = useProductBySlug(productSlug);

    // Debug product fetch results
    useEffect(() => {
      console.log("=== PRODUCT FETCH DEBUG ===");
      console.log("Product data:", product);
      console.log("Loading:", loadingProduct);
      console.log("Error:", productError);
    }, [product, loadingProduct, productError]);

    // Enhanced customization management with error handling
    const {
      allCustomizations,
      sizeOptions,
      materialOptions,
      colorOptions,
      otherOptions,
      isLoading: loadingCustomizations,
      error: customizationError,
      hasOptions,
    } = useCustomizationManagement(product);

    // Price calculation parameters with updated format
    const priceParams: PriceCalculationDto = useMemo(() => {
      try {
        // Convert selectedCustomizations to the format expected by the API
        const customizations: Record<string, any> = {};

        Object.entries(selectedCustomizations).forEach(
          ([optionId, selection]) => {
            if (selection.valueId) {
              customizations[optionId] = selection.valueId;
            } else if (selection.customValue) {
              customizations[optionId] = selection.customValue;
            }
          }
        );

        return {
          quantity: Math.max(1, quantity),
          customizations,
          urgencyLevel,
        };
      } catch (error) {
        console.error("Error creating price params:", error);
        return {
          quantity: 1,
          customizations: {},
          urgencyLevel: "NORMAL" as UrgencyLevel,
        };
      }
    }, [quantity, selectedCustomizations, urgencyLevel]);

    // Fetch price calculation with better error handling
    const {
      data: priceBreakdown,
      isLoading: loadingPrice,
      error: priceError,
    } = useProductPriceCalculation(
      product?.id || "",
      priceParams,
      !!product?.id && quantity > 0
    );

    // Enhanced customization change handler
    const handleCustomizationChange = (
      optionId: string,
      valueId?: string,
      customValue?: string
    ) => {
      try {
        setSelectedCustomizations((prev) => ({
          ...prev,
          [optionId]: {
            optionId,
            valueId,
            customValue,
          },
        }));
      } catch (error) {
        console.error("Error updating customization:", error);
      }
    };

    // Get current customization value with type safety
    const getCurrentCustomizationValue = (optionId: string) => {
      try {
        const current = selectedCustomizations[optionId];
        if (!current) return "";
        return current.valueId || "";
      } catch (error) {
        console.error("Error getting customization value:", error);
        return "";
      }
    };

    // Get current custom value
    const getCurrentCustomValue = (optionId: string) => {
      try {
        const current = selectedCustomizations[optionId];
        if (!current) return "";
        return current.customValue || "";
      } catch (error) {
        console.error("Error getting custom value:", error);
        return "";
      }
    };

    // Enhanced customization option renderer
    const renderCustomizationOption = (
      option: CustomizationOption & { values: CustomizationOptionValue[] }
    ): React.ReactNode => {
      try {
        const currentValue = getCurrentCustomizationValue(option.id);
        const currentCustomValue = getCurrentCustomValue(option.id);

        if (!option.type) {
          return (
            <div className="p-3 border border-dashed rounded-md text-center text-sm text-muted-foreground">
              Invalid option type
            </div>
          );
        }

        switch (option.type) {
          case "DROPDOWN":
            if (!option.values || option.values.length === 0) {
              return (
                <div className="p-3 border border-dashed rounded-md text-center text-sm text-muted-foreground">
                  No values available for this option
                </div>
              );
            }
            return (
              <Select
                value={currentValue}
                onValueChange={(value) =>
                  handleCustomizationChange(option.id, value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={`Select ${option.displayName?.toLowerCase() || "option"}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {option.values.map((value) => (
                    <SelectItem key={value.id} value={value.id}>
                      <div className="flex justify-between items-center w-full">
                        <span>{value.displayName}</span>
                        {value.priceAdjustment !== 0 && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {value.priceAdjustment > 0 ? "+" : ""}$
                            {value.priceAdjustment.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );

          case "COLOR_PICKER":
            if (!option.values || option.values.length === 0) {
              return (
                <div className="p-3 border border-dashed rounded-md text-center text-sm text-muted-foreground">
                  No color values available for this option
                </div>
              );
            }
            return (
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => (
                  <button
                    key={value.id}
                    onClick={() =>
                      handleCustomizationChange(option.id, value.id)
                    }
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      currentValue === value.id
                        ? "border-primary ring-2 ring-primary/20 shadow-md"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: value.hexColor || "#ccc" }}
                    title={`${value.displayName}${
                      value.priceAdjustment !== 0
                        ? ` (${value.priceAdjustment > 0 ? "+" : ""}$${value.priceAdjustment.toFixed(2)})`
                        : ""
                    }`}
                  />
                ))}
              </div>
            );

          case "TEXT_INPUT":
            return (
              <Input
                placeholder={`Enter ${option.displayName?.toLowerCase() || "value"}`}
                value={currentCustomValue}
                onChange={(e) =>
                  handleCustomizationChange(
                    option.id,
                    undefined,
                    e.target.value
                  )
                }
                className="w-full"
              />
            );

          case "NUMBER_INPUT":
            return (
              <Input
                type="number"
                placeholder={`Enter ${option.displayName?.toLowerCase() || "number"}`}
                value={currentCustomValue}
                onChange={(e) =>
                  handleCustomizationChange(
                    option.id,
                    undefined,
                    e.target.value
                  )
                }
                className="w-full"
              />
            );

          case "CHECKBOX":
            if (!option.values || option.values.length === 0) {
              return (
                <div className="p-3 border border-dashed rounded-md text-center text-sm text-muted-foreground">
                  No values available for this option
                </div>
              );
            }
            return (
              <div className="space-y-2">
                {option.values.map((value) => {
                  const currentValues = currentValue
                    ? currentValue.split(",")
                    : [];
                  const isChecked = currentValues.includes(value.id);

                  return (
                    <div key={value.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`${option.id}-${value.id}`}
                        checked={isChecked}
                        onChange={(e) => {
                          try {
                            if (e.target.checked) {
                              const newValue = [...currentValues, value.id];
                              handleCustomizationChange(
                                option.id,
                                newValue.join(",")
                              );
                            } else {
                              const newValue = currentValues.filter(
                                (id: string) => id !== value.id
                              );
                              handleCustomizationChange(
                                option.id,
                                newValue.join(",")
                              );
                            }
                          } catch (error) {
                            console.error(
                              "Error handling checkbox change:",
                              error
                            );
                          }
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label
                        htmlFor={`${option.id}-${value.id}`}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <span className="text-sm">{value.displayName}</span>
                        {value.priceAdjustment !== 0 && (
                          <Badge variant="outline" className="text-xs">
                            {value.priceAdjustment > 0 ? "+" : ""}$
                            {value.priceAdjustment.toFixed(2)}
                          </Badge>
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>
            );

          case "RADIO":
            if (!option.values || option.values.length === 0) {
              return (
                <div className="p-3 border border-dashed rounded-md text-center text-sm text-muted-foreground">
                  No values available for this option
                </div>
              );
            }
            return (
              <div className="space-y-2">
                {option.values.map((value) => (
                  <div key={value.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`${option.id}-${value.id}`}
                      name={option.id}
                      value={value.id}
                      checked={currentValue === value.id}
                      onChange={() =>
                        handleCustomizationChange(option.id, value.id)
                      }
                      className="border-gray-300 text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor={`${option.id}-${value.id}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span className="text-sm">{value.displayName}</span>
                      {value.priceAdjustment !== 0 && (
                        <Badge variant="outline" className="text-xs">
                          {value.priceAdjustment > 0 ? "+" : ""}$
                          {value.priceAdjustment.toFixed(2)}
                        </Badge>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            );

          case "FILE_UPLOAD":
            return (
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // For now, just store the file name
                    handleCustomizationChange(option.id, undefined, file.name);
                  }
                }}
                accept="image/*"
                className="w-full"
              />
            );

          default:
            return (
              <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
                <p>Unsupported option type: {option.type}</p>
              </div>
            );
        }
      } catch (error) {
        console.error("Error rendering customization option:", error);
        return (
          <div className="p-3 border border-red-200 bg-red-50 rounded-md text-center text-sm text-red-600">
            Error rendering option
          </div>
        );
      }
    };

    // Handle quantity change with validation
    const handleQuantityChange = (newQuantity: number) => {
      try {
        if (!product) return;
        const min = product.minOrderQuantity || 1;
        const max = product.maxOrderQuantity || 10000;
        const validQuantity = Math.max(
          min,
          Math.min(max, Math.max(1, newQuantity || 1))
        );
        setQuantity(validQuantity);
      } catch (error) {
        console.error("Error changing quantity:", error);
        setQuantity(1); // Fallback to 1
      }
    };

    // Validate required customizations
    const validateCustomizations = () => {
      try {
        const requiredOptions = allCustomizations.filter((opt) => opt.required);
        const missingOptions = requiredOptions.filter((opt) => {
          const selection = selectedCustomizations[opt.id];
          return !selection || (!selection.valueId && !selection.customValue);
        });

        return {
          isValid: missingOptions.length === 0,
          missingOptions,
        };
      } catch (error) {
        console.error("Error validating customizations:", error);
        return {
          isValid: false,
          missingOptions: [],
        };
      }
    };

    // Set initial quantity when product loads
    useEffect(() => {
      try {
        if (
          product &&
          product.minOrderQuantity &&
          quantity < product.minOrderQuantity
        ) {
          setQuantity(product.minOrderQuantity);
        }
      } catch (error) {
        console.error("Error setting initial quantity:", error);
        setQuantity(1);
      }
    }, [product, quantity]);

    // Loading states
    if (loadingProduct) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            <span>Loading product...</span>
          </div>
        </div>
      );
    }

    // Enhanced error states with debugging info
    if (productError) {
      console.error("Product error:", productError);
      return (
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h2 className="text-2xl font-semibold mb-2">
                Error Loading Product
              </h2>
              <p className="text-muted-foreground mb-6 text-center">
                There was an error loading this product. Please try again.
              </p>

              <div className="flex gap-2">
                <Button onClick={() => window.location.reload()}>
                  <Loader2 className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/customer/design-studio">
                    Back to Design Studio
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (!product) {
      return (
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h2 className="text-2xl font-semibold mb-2">Product Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The product you&apos;re looking for doesn&apos;t exist or has
                been removed.
              </p>
              <div className="text-sm text-gray-500 mb-4">
                <p>Product slug: {productSlug}</p>
              </div>
              <Button asChild>
                <Link href="/dashboard/customer/design-studio">
                  Back to Design Studio
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Error handling for customizations (non-blocking)
    if (customizationError) {
      console.error("Customization error:", customizationError);
    }

    if (priceError) {
      console.error("Price calculation error:", priceError);
    }

    const urgencyOptions = [
      {
        value: "NORMAL" as UrgencyLevel,
        label: "Standard",
        description: "Normal processing time",
      },
      {
        value: "EXPEDITED" as UrgencyLevel,
        label: "Expedited",
        description: "Faster processing",
      },
      {
        value: "RUSH" as UrgencyLevel,
        label: "Rush",
        description: "Priority processing",
      },
      {
        value: "EMERGENCY" as UrgencyLevel,
        label: "Emergency",
        description: "Immediate processing",
      },
    ];

    const validation = validateCustomizations();

    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Development Debug Panel */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <details>
              <summary className="cursor-pointer font-medium text-blue-700">
                🐛 Development Debug Info
              </summary>
              <div className="mt-3 text-sm space-y-2">
                <div>
                  <strong>Product Slug:</strong> {productSlug || "N/A"}
                </div>
                <div>
                  <strong>Product ID:</strong> {product?.id || "N/A"}
                </div>
                <div>
                  <strong>Product Name:</strong> {product?.name || "N/A"}
                </div>
                <div>
                  <strong>Category ID:</strong> {product?.category?.id || "N/A"}
                </div>
                <div>
                  <strong>Available Options:</strong>{" "}
                  {product?.availableOptions?.length || 0}
                </div>
                <div>
                  <strong>All Customizations:</strong>{" "}
                  {allCustomizations?.length || 0}
                </div>
                <div>
                  <strong>Size Options:</strong> {sizeOptions?.length || 0}
                </div>
                <div>
                  <strong>Material Options:</strong>{" "}
                  {materialOptions?.length || 0}
                </div>
                <div>
                  <strong>Color Options:</strong> {colorOptions?.length || 0}
                </div>
                <div>
                  <strong>Other Options:</strong> {otherOptions?.length || 0}
                </div>
                <div>
                  <strong>Selected Customizations:</strong>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                    {JSON.stringify(selectedCustomizations, null, 2)}
                  </pre>
                </div>
              </div>
            </details>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/customer">
                  <Home className="h-4 w-4" />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/customer/design-studio">Categories</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {product?.category && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href={`/dashboard/customer/browse/${product?.category?.slug || ""}`}
                    >
                      {product?.category?.name || "Category"}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product?.name || "Product"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square relative overflow-hidden rounded-lg border bg-muted">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImage] || product.images[0]}
                  alt={product.name || "Product image"}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {product.images &&
              Array.isArray(product.images) &&
              product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square relative overflow-hidden rounded border-2 transition-colors ${
                        selectedImage === index
                          ? "border-primary"
                          : "border-muted hover:border-muted-foreground"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name || "Product"} ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized={true}
                        onError={(e) => {
                          console.warn("Thumbnail image failed to load:", e);
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
          </div>

          {/* Product Information & Configuration */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">
                    {product?.name || "Product"}
                  </h1>
                  <div className="flex items-center gap-2">
                    {product?.isFeatured && (
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {(product?.stock || 0) > 0 ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          In Stock ({product?.stock || 0})
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Out of Stock
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* SKU */}
              {product.sku && (
                <p className="text-sm text-muted-foreground">
                  SKU: {product.sku}
                </p>
              )}

              {/* Description */}
              {product.description && (
                <p className="text-muted-foreground">{product.description}</p>
              )}
            </div>

            {/* Price Display */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      $
                      {priceBreakdown
                        ? priceBreakdown.pricePerUnit?.toFixed(2) ||
                          (product?.basePrice || 0).toFixed(2)
                        : (product?.basePrice || 0).toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">per unit</span>
                    {loadingPrice && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>

                  {priceBreakdown && (
                    <div className="space-y-2">
                      <div className="text-lg font-semibold">
                        Total: {formatCurrency(priceBreakdown.totalPrice || 0)}
                      </div>
                      {(priceBreakdown.customizationCost || 0) > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Includes $
                          {(priceBreakdown.customizationCost || 0).toFixed(2)}{" "}
                          in customizations
                        </div>
                      )}
                      {(priceBreakdown.urgencyMultiplier || 1) !== 1 && (
                        <div className="text-sm text-muted-foreground">
                          Urgency surcharge:{" "}
                          {(
                            ((priceBreakdown.urgencyMultiplier || 1) - 1) *
                            100
                          ).toFixed(0)}
                          %
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Configure Your Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Validation Messages */}
                {!validation.isValid && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700 font-medium">
                      Please complete the following required options:
                    </p>
                    <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                      {validation.missingOptions.map((option) => (
                        <li key={option.id}>{option.displayName}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Quantity */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= (product?.minOrderQuantity || 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        handleQuantityChange(Number(e.target.value) || 1)
                      }
                      className="w-24 text-center"
                      min={product?.minOrderQuantity || 1}
                      max={product?.maxOrderQuantity || undefined}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={
                        product?.maxOrderQuantity
                          ? quantity >= product.maxOrderQuantity
                          : false
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Min: {product?.minOrderQuantity || 1}
                    {product?.maxOrderQuantity &&
                      ` • Max: ${product.maxOrderQuantity}`}
                  </p>
                </div>

                {/* Urgency Level */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Processing Speed
                  </label>
                  <Select
                    value={urgencyLevel}
                    onValueChange={(value: UrgencyLevel) =>
                      setUrgencyLevel(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="space-y-1">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Options */}
                {colorOptions.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      <h4 className="font-medium">Color Options</h4>
                    </div>
                    {colorOptions.map((option) => (
                      <div key={option.id} className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          {option.displayName}
                          {option.required && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        {option.description && (
                          <p className="text-xs text-muted-foreground">
                            {option.description}
                          </p>
                        )}
                        {renderCustomizationOption(option)}
                      </div>
                    ))}
                  </div>
                )}

                {/* Size Options */}
                {sizeOptions.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Shirt className="h-4 w-4" />
                      <h4 className="font-medium">Size & Fit</h4>
                    </div>
                    {sizeOptions.map((option) => (
                      <div key={option.id} className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          {option.displayName}
                          {option.required && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        {option.description && (
                          <p className="text-xs text-muted-foreground">
                            {option.description}
                          </p>
                        )}
                        {renderCustomizationOption(option)}
                      </div>
                    ))}
                  </div>
                )}

                {/* Material Options */}
                {materialOptions.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      <h4 className="font-medium">Material & Finish</h4>
                    </div>
                    {materialOptions.map((option) => (
                      <div key={option.id} className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          {option.displayName}
                          {option.required && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        {option.description && (
                          <p className="text-xs text-muted-foreground">
                            {option.description}
                          </p>
                        )}
                        {renderCustomizationOption(option)}
                      </div>
                    ))}
                  </div>
                )}

                {/* Other Customization Options */}
                {otherOptions.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Additional Options</h4>
                    {otherOptions.map((option) => (
                      <div key={option.id} className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          {option.displayName}
                          {option.required && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        {option.description && (
                          <p className="text-xs text-muted-foreground">
                            {option.description}
                          </p>
                        )}
                        {renderCustomizationOption(option)}
                      </div>
                    ))}
                  </div>
                )}

                {/* No Customizations Available */}
                {!loadingCustomizations &&
                  !hasOptions &&
                  !customizationError && (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        No customization options available for this product.
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                disabled={(product?.stock || 0) === 0 || !validation.isValid}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" className="w-full" size="lg" asChild>
                <Link
                  href={`/dashboard/customer/design-studio/${product?.id || ""}`}
                >
                  <Palette className="h-5 w-5 mr-2" />
                  Start Designing
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="customizations">Customizations</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose max-w-none">
                  <p>{product?.description || "No description available."}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Min Order</div>
                      <div className="text-xs text-muted-foreground">
                        {product?.minOrderQuantity || 1} units
                      </div>
                    </div>
                  </div>

                  {product?.weight && (
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Weight</div>
                        <div className="text-xs text-muted-foreground">
                          {product.weight} lbs
                        </div>
                      </div>
                    </div>
                  )}

                  {product?.template && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Lead Time</div>
                        <div className="text-xs text-muted-foreground">
                          {product.template.leadTime || "N/A"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {product?.dimensions && (
                    <div className="flex justify-between">
                      <span className="font-medium">Dimensions</span>
                      <span className="text-muted-foreground">
                        {JSON.stringify(product.dimensions)}
                      </span>
                    </div>
                  )}

                  {product?.weight && (
                    <div className="flex justify-between">
                      <span className="font-medium">Weight</span>
                      <span className="text-muted-foreground">
                        {product.weight} lbs
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="font-medium">Base Price</span>
                    <span className="text-muted-foreground">
                      ${(product?.basePrice || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium">Stock</span>
                    <span className="text-muted-foreground">
                      {product?.stock || 0} units
                    </span>
                  </div>

                  {product?.sku && (
                    <div className="flex justify-between">
                      <span className="font-medium">SKU</span>
                      <span className="text-muted-foreground">
                        {product.sku}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customizations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Customizations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {hasOptions ? (
                    <>
                      {/* Color Options */}
                      {colorOptions.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-medium text-lg flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            Color Options
                          </h4>
                          {colorOptions.map((option) => (
                            <div
                              key={option.id}
                              className="border-b pb-4 last:border-b-0"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium">
                                    {option.displayName || "Option"}
                                  </h5>
                                  <div className="flex gap-2">
                                    <Badge variant="outline">
                                      {option.type}
                                    </Badge>
                                    {option.required && (
                                      <Badge variant="destructive">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {option.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {option.description}
                                  </p>
                                )}
                                {option.values && option.values.length > 0 && (
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">
                                      Available options:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {option.values.map((value) => (
                                        <Badge
                                          key={value.id}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {value.displayName}
                                          {value.priceAdjustment !== 0 && (
                                            <span className="ml-1">
                                              (
                                              {value.priceAdjustment > 0
                                                ? "+"
                                                : ""}
                                              $
                                              {value.priceAdjustment.toFixed(2)}
                                              )
                                            </span>
                                          )}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Size Options */}
                      {sizeOptions.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-medium text-lg flex items-center gap-2">
                            <Shirt className="h-5 w-5" />
                            Size & Fit Options
                          </h4>
                          {sizeOptions.map((option) => (
                            <div
                              key={option.id}
                              className="border-b pb-4 last:border-b-0"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium">
                                    {option.displayName || "Option"}
                                  </h5>
                                  <div className="flex gap-2">
                                    <Badge variant="outline">
                                      {option.type}
                                    </Badge>
                                    {option.required && (
                                      <Badge variant="destructive">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {option.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {option.description}
                                  </p>
                                )}
                                {option.values && option.values.length > 0 && (
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">
                                      Available options:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {option.values.map((value) => (
                                        <Badge
                                          key={value.id}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {value.displayName}
                                          {value.priceAdjustment !== 0 && (
                                            <span className="ml-1">
                                              (
                                              {value.priceAdjustment > 0
                                                ? "+"
                                                : ""}
                                              $
                                              {value.priceAdjustment.toFixed(2)}
                                              )
                                            </span>
                                          )}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Material Options */}
                      {materialOptions.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-medium text-lg flex items-center gap-2">
                            <Layers className="h-5 w-5" />
                            Material & Finish Options
                          </h4>
                          {materialOptions.map((option) => (
                            <div
                              key={option.id}
                              className="border-b pb-4 last:border-b-0"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium">
                                    {option.displayName || "Option"}
                                  </h5>
                                  <div className="flex gap-2">
                                    <Badge variant="outline">
                                      {option.type}
                                    </Badge>
                                    {option.required && (
                                      <Badge variant="destructive">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {option.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {option.description}
                                  </p>
                                )}
                                {option.values && option.values.length > 0 && (
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">
                                      Available options:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {option.values.map((value) => (
                                        <Badge
                                          key={value.id}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {value.displayName}
                                          {value.priceAdjustment !== 0 && (
                                            <span className="ml-1">
                                              (
                                              {value.priceAdjustment > 0
                                                ? "+"
                                                : ""}
                                              $
                                              {value.priceAdjustment.toFixed(2)}
                                              )
                                            </span>
                                          )}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Other Options */}
                      {otherOptions.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-medium text-lg">
                            Additional Options
                          </h4>
                          {otherOptions.map((option) => (
                            <div
                              key={option.id}
                              className="border-b pb-4 last:border-b-0"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium">
                                    {option.displayName || "Option"}
                                  </h5>
                                  <div className="flex gap-2">
                                    <Badge variant="outline">
                                      {option.type}
                                    </Badge>
                                    {option.required && (
                                      <Badge variant="destructive">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {option.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {option.description}
                                  </p>
                                )}
                                {option.values && option.values.length > 0 && (
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">
                                      Available options:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {option.values.map((value) => (
                                        <Badge
                                          key={value.id}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {value.displayName}
                                          {value.priceAdjustment !== 0 && (
                                            <span className="ml-1">
                                              (
                                              {value.priceAdjustment > 0
                                                ? "+"
                                                : ""}
                                              $
                                              {value.priceAdjustment.toFixed(2)}
                                              )
                                            </span>
                                          )}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No customization options available for this product.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    console.error("Critical error in ProductDetailPage:", error);
    // This will be caught by the error boundary
    throw error;
  }
}
