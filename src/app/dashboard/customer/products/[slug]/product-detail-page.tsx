/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  useProductBySlug,
  useProductPriceCalculation,
} from "@/hooks/use-products";
import type { PriceCalculationDto } from "@/lib/products/dto/products.dto";

export function ProductDetailPage() {
  const params = useParams();
  const productSlug = params.productSlug as string;

  // State for customization
  const [quantity, setQuantity] = useState(1);
  const [urgencyLevel, setUrgencyLevel] = useState<
    "NORMAL" | "EXPEDITED" | "RUSH" | "EMERGENCY"
  >("NORMAL");
  const [selectedCustomizations, setSelectedCustomizations] = useState<
    Record<string, any>
  >({});
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch product data
  const { data: product, isLoading: loadingProduct } =
    useProductBySlug(productSlug);

  // Price calculation parameters
  const priceParams: PriceCalculationDto = useMemo(
    () => ({
      quantity,
      customizations: selectedCustomizations,
      urgencyLevel,
    }),
    [quantity, selectedCustomizations, urgencyLevel]
  );

  // Fetch price calculation
  const { data: priceBreakdown, isLoading: loadingPrice } =
    useProductPriceCalculation(
      product?.id || "",
      priceParams,
      !!product?.id && quantity > 0
    );

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    if (!product) return;
    const min = product.minOrderQuantity;
    const max = product.maxOrderQuantity || 10000;
    const validQuantity = Math.max(min, Math.min(max, newQuantity));
    setQuantity(validQuantity);
  };

  // Handle customization change
  const handleCustomizationChange = (optionId: string, value: any) => {
    setSelectedCustomizations((prev) => ({
      ...prev,
      [optionId]: value,
    }));
  };

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

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-2xl font-semibold mb-2">Product Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The product you&apos;re looking for doesn&apos;t exist or has been
              removed.
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

  const urgencyOptions = [
    {
      value: "NORMAL",
      label: "Standard",
      description: "Normal processing time",
    },
    {
      value: "EXPEDITED",
      label: "Expedited",
      description: "Faster processing",
    },
    { value: "RUSH", label: "Rush", description: "Priority processing" },
    {
      value: "EMERGENCY",
      label: "Emergency",
      description: "Immediate processing",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
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
          {product.category && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href={`/dashboard/customer/browse/${product.category.slug}`}
                  >
                    {product.category.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square relative overflow-hidden rounded-lg border bg-muted">
            {product.images.length > 0 ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Image Thumbnails */}
          {product.images.length > 1 && (
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
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
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
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <div className="flex items-center gap-2">
                  {product.isFeatured && (
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {product.stock > 0 ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        In Stock ({product.stock})
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
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          {/* Price Display */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    $
                    {priceBreakdown
                      ? priceBreakdown.pricePerUnit.toFixed(2)
                      : product.basePrice.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">per unit</span>
                  {loadingPrice && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>

                {priceBreakdown && (
                  <div className="space-y-2">
                    <div className="text-lg font-semibold">
                      Total: ${priceBreakdown.totalPrice.toFixed(2)}
                    </div>
                    {priceBreakdown.customizationCost > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Includes ${priceBreakdown.customizationCost.toFixed(2)}{" "}
                        in customizations
                      </div>
                    )}
                    {priceBreakdown.urgencyMultiplier !== 1 && (
                      <div className="text-sm text-muted-foreground">
                        Urgency surcharge:{" "}
                        {((priceBreakdown.urgencyMultiplier - 1) * 100).toFixed(
                          0
                        )}
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
              {/* Quantity */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= product.minOrderQuantity}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      handleQuantityChange(Number(e.target.value))
                    }
                    className="w-24 text-center"
                    min={product.minOrderQuantity}
                    max={product.maxOrderQuantity}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={
                      product.maxOrderQuantity
                        ? quantity >= product.maxOrderQuantity
                        : false
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Min: {product.minOrderQuantity}
                  {product.maxOrderQuantity &&
                    ` • Max: ${product.maxOrderQuantity}`}
                </p>
              </div>

              {/* Urgency Level */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Processing Speed</label>
                <Select
                  value={urgencyLevel}
                  onValueChange={(value: any) => setUrgencyLevel(value)}
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

              {/* Customization Options */}
              {product.availableOptions &&
                product.availableOptions.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Customization Options</h4>
                    {product.availableOptions.map((option) => (
                      <div key={option.option.id} className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          {option.option.displayName}
                          {option.option.required && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>

                        {option.option.type === "DROPDOWN" && (
                          <Select
                            value={
                              selectedCustomizations[option.option.id] || ""
                            }
                            onValueChange={(value) =>
                              handleCustomizationChange(option.option.id, value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select option" />
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
                        )}

                        {option.option.type === "TEXT_INPUT" && (
                          <Input
                            placeholder="Enter custom text"
                            value={
                              selectedCustomizations[option.option.id] || ""
                            }
                            onChange={(e) =>
                              handleCustomizationChange(
                                option.option.id,
                                e.target.value
                              )
                            }
                          />
                        )}

                        {option.option.type === "NUMBER_INPUT" && (
                          <Input
                            type="number"
                            placeholder="Enter number"
                            value={
                              selectedCustomizations[option.option.id] || ""
                            }
                            onChange={(e) =>
                              handleCustomizationChange(
                                option.option.id,
                                Number(e.target.value)
                              )
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button className="w-full" size="lg" disabled={product.stock === 0}>
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
            <Button variant="outline" className="w-full" size="lg" asChild>
              <Link href={`/dashboard/customer/design-studio/${product.id}`}>
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
          <TabsTrigger value="related">Related Products</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <p>{product.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Min Order</div>
                    <div className="text-xs text-muted-foreground">
                      {product.minOrderQuantity} units
                    </div>
                  </div>
                </div>

                {product.weight && (
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

                {product.template && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Lead Time</div>
                      <div className="text-xs text-muted-foreground">
                        {product.template.leadTime}
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
                {product.dimensions && (
                  <div className="flex justify-between">
                    <span className="font-medium">Dimensions</span>
                    <span className="text-muted-foreground">
                      {JSON.stringify(product.dimensions)}
                    </span>
                  </div>
                )}

                {product.weight && (
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
                    ${product.basePrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Stock</span>
                  <span className="text-muted-foreground">
                    {product.stock} units
                  </span>
                </div>

                {product.sku && (
                  <div className="flex justify-between">
                    <span className="font-medium">SKU</span>
                    <span className="text-muted-foreground">{product.sku}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="related" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Related Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Related products from the same category will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
