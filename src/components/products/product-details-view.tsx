/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  ArrowLeft,
  CheckCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Eye,
  Package,
} from "lucide-react";
import { ProductResponse } from "@/lib/products/types/products.types";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { cn } from "@/lib/utils";

interface ProductDetailsViewProps {
  product: ProductResponse;
  showBreadcrumbs?: boolean;
  showBackButton?: boolean;
  className?: string;
}

export function ProductDetailsView({
  product,
  showBreadcrumbs = true,
  showBackButton = true,
  className,
}: ProductDetailsViewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const images =
    product.images?.length > 0
      ? product.images
      : [product.thumbnailImage].filter(Boolean);
  const currentImage = images[selectedImageIndex] || "/placeholder-product.jpg";

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  // Use the actual design templates without trying to add non-existent properties
  const templates = product.designTemplates || [];

  // Get product metadata for type and material
  const productType = product.metadata?.type || "Product";
  const productMaterial = product.metadata?.material || "Standard";

  // Helper function to get the default variant for a product
  const getDefaultVariant = () => {
    if (!product.variants || product.variants.length === 0) {
      return null;
    }
    return product.variants.find((v) => v.isDefault) || product.variants[0];
  };

  // Helper function to check if product can be added to cart
  const canAddToCart = () => {
    const defaultVariant = getDefaultVariant();
    return product.isActive && defaultVariant && defaultVariant.stock > 0;
  };

  const defaultVariant = getDefaultVariant();

  return (
    <div className="min-h-screen bg-background">
      <div className={cn("container mx-auto px-4 py-8", className)}>
        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/"
                    className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/products"
                    className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    Products
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {product.category && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link
                        href={`/products?category=${product.category.slug}`}
                        className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors"
                      >
                        {product.category.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground font-medium">
                  {product.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {/* Back Button */}
        {showBackButton && (
          <Button
            variant="outline"
            asChild
            className="mb-6 border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950/30"
          >
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
        )}

        {/* Product Header - Mobile Only */}
        <div className="mb-6 lg:hidden space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {product.isFeatured && (
              <Badge className="bg-yellow-500 text-white dark:bg-yellow-600">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            {product.category && (
              <Badge
                variant="outline"
                className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300"
              >
                {product.category.name}
              </Badge>
            )}
            <Badge variant="secondary">{productType}</Badge>
            <Badge variant="secondary">{productMaterial}</Badge>
            {!product.isActive && <Badge variant="destructive">Inactive</Badge>}
            {defaultVariant && defaultVariant.stock === 0 && (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>

          <p className="text-base text-muted-foreground">
            {product.description}
          </p>

          {/* Base Price */}
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              KES {product.basePrice.toLocaleString()}
            </span>
            {product.variants && product.variants.length > 0 && (
              <span className="text-sm text-muted-foreground">
                Base price • {product.variants.length} variant
                {product.variants.length > 1 ? "s" : ""} available
              </span>
            )}
          </div>
        </div>

        {/* Main Product Section - Two Column Layout on Large Screens */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images - Left Column */}
          <div className="space-y-4">
            {/* Main Image */}
            <Card className="overflow-hidden border-border bg-card">
              <div className="aspect-square relative bg-gradient-to-br from-green-50 to-muted dark:from-green-950/20 dark:to-muted">
                <Image
                  src={currentImage}
                  alt={product.name}
                  fill
                  className={cn(
                    "object-cover transition-opacity duration-300",
                    isImageLoading ? "opacity-0" : "opacity-100"
                  )}
                  onLoad={() => setIsImageLoading(false)}
                  priority
                />

                {/* Image Navigation */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background border-green-200 dark:border-green-800"
                      onClick={handlePreviousImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background border-green-200 dark:border-green-800"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                )}

                {/* Loading State */}
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 dark:border-green-400" />
                  </div>
                )}
              </div>
            </Card>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors",
                      selectedImageIndex === index
                        ? "border-green-600 dark:border-green-400"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <img
                      src={image || ""}
                      alt={`${product.name} ${index + 1}`}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information - Right Column */}
          <div className="space-y-6">
            {/* Header - Desktop Only */}
            <div className="hidden lg:block space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                {product.isFeatured && (
                  <Badge className="bg-yellow-500 text-white dark:bg-yellow-600">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {product.category && (
                  <Badge
                    variant="outline"
                    className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300"
                  >
                    {product.category.name}
                  </Badge>
                )}
                <Badge variant="secondary">{productType}</Badge>
                <Badge variant="secondary">{productMaterial}</Badge>
                {!product.isActive && (
                  <Badge variant="destructive">Inactive</Badge>
                )}
                {defaultVariant && defaultVariant.stock === 0 && (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold text-foreground">
                {product.name}
              </h1>

              <p className="text-lg text-muted-foreground">
                {product.description}
              </p>

              {/* Base Price */}
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                  KES {product.basePrice.toLocaleString()}
                </span>
                {product.variants && product.variants.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    Base price • {product.variants.length} variant
                    {product.variants.length > 1 ? "s" : ""} available
                  </span>
                )}
              </div>
            </div>

            <Separator className="hidden lg:block" />

            {/* Product Variants Section */}
            {product.variants && product.variants.length > 0 && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-foreground text-lg">
                    <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Available Variants ({product.variants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {product.variants.slice(0, 3).map((variant) => (
                    <div
                      key={variant.id}
                      className={cn(
                        "flex items-center justify-between p-3 border rounded-lg transition-colors",
                        variant.isDefault
                          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                          : "border-border hover:bg-muted/50"
                      )}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground text-sm">
                            {variant.name}
                          </h4>
                          {variant.isDefault && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">
                            KES {variant.price.toLocaleString()}
                            {variant.price !== product.basePrice && (
                              <span className="text-muted-foreground ml-1">
                                (+
                                {(
                                  variant.price - product.basePrice
                                ).toLocaleString()}
                                )
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Stock:{" "}
                            {variant.stock > 0 ? variant.stock : "Out of stock"}
                          </p>
                        </div>
                      </div>

                      <AddToCartButton
                        productId={product.id}
                        variantId={variant.id}
                        quantity={1}
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                        disabled={!product.isActive || variant.stock === 0}
                        showSuccessState={true}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        {!product.isActive
                          ? "Inactive"
                          : variant.stock === 0
                            ? "Out of Stock"
                            : "Add to Cart"}
                      </AddToCartButton>
                    </div>
                  ))}
                  {product.variants.length > 3 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      +{product.variants.length - 3} more variants available
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Design Templates */}
            {templates.length > 0 && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-foreground text-lg">
                    <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Available Templates ({templates.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {templates.slice(0, 3).map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-950/30 dark:hover:border-green-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {template.thumbnail && (
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-muted">
                            <Image
                              src={template.thumbnail}
                              alt={template.name}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-foreground text-sm">
                            {template.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Starting from{" "}
                            <span className="font-medium text-green-600 dark:text-green-400">
                              KES {template.basePrice.toLocaleString()}
                            </span>
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950/30"
                        asChild
                      >
                        <Link href={`/templates/${template.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                  {templates.length > 3 && (
                    <Button variant="ghost" className="w-full text-sm">
                      View All {templates.length} Templates
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Add to Cart Section - For products without variants */}
            {(!product.variants || product.variants.length === 0) && (
              <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-foreground text-lg">
                    <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Order This Product
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Add this product to your cart and customize during checkout
                  </div>

                  <AddToCartButton
                    productId={product.id}
                    variantId="default"
                    quantity={1}
                    variant="default"
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                    disabled={!product.isActive}
                    showSuccessState={true}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {!product.isActive ? "Product Inactive" : "Add to Cart"}
                  </AddToCartButton>

                  <div className="text-xs text-muted-foreground bg-background p-3 rounded border border-green-200 dark:border-green-800">
                    💡 This product can be customized with your logo, text, and
                    preferred colors during the ordering process.
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product Features */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground text-lg">
                  <Info className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Product Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-sm text-foreground">
                      High-quality {productMaterial.toLowerCase()} material
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-sm text-foreground">
                      Professional {productType.toLowerCase()} design
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-sm text-foreground">
                      Custom printing available
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-sm text-foreground">
                      Bulk ordering options
                    </span>
                  </li>
                  {templates.length > 0 && (
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span className="text-sm text-foreground">
                        {templates.length} design template
                        {templates.length !== 1 ? "s" : ""} available
                      </span>
                    </li>
                  )}
                  {product.variants && product.variants.length > 0 && (
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span className="text-sm text-foreground">
                        {product.variants.length} product variant
                        {product.variants.length !== 1 ? "s" : ""} available
                      </span>
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Additional Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950/30"
                asChild
              >
                <Link href="/contact">Get Quote</Link>
              </Button>

              {/* Order Sample with Add to Cart functionality */}
              {defaultVariant ? (
                <AddToCartButton
                  productId={product.id}
                  variantId={defaultVariant.id}
                  quantity={1}
                  variant="outline"
                  className="flex-1 border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950/30"
                  disabled={!product.isActive || defaultVariant.stock === 0}
                  showSuccessState={true}
                >
                  <Package className="w-4 h-4 mr-2" />
                  {!product.isActive
                    ? "Inactive"
                    : defaultVariant.stock === 0
                      ? "Out of Stock"
                      : "Order Sample"}
                </AddToCartButton>
              ) : (
                <Button
                  variant="outline"
                  className="flex-1 border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950/30"
                  asChild
                >
                  <Link href="/contact">
                    <Package className="w-4 h-4 mr-2" />
                    Order Sample
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information Sections - Full Width */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Description Section */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">{product.description}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">
                      Base Price:
                    </span>
                    <span className="text-muted-foreground">
                      KES {product.basePrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Type:</span>
                    <span className="capitalize text-muted-foreground">
                      {productType.toLowerCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">
                      Material:
                    </span>
                    <span className="capitalize text-muted-foreground">
                      {productMaterial.toLowerCase()}
                    </span>
                  </div>
                  {product.category && (
                    <div className="flex justify-between">
                      <span className="font-medium text-foreground">
                        Category:
                      </span>
                      <span className="text-muted-foreground">
                        {product.category.name}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Status:</span>
                    <span
                      className={cn(
                        "text-sm",
                        product.isActive
                          ? "text-green-600 dark:text-green-400"
                          : "text-destructive"
                      )}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {defaultVariant && (
                    <div className="flex justify-between">
                      <span className="font-medium text-foreground">
                        Stock:
                      </span>
                      <span
                        className={cn(
                          "text-sm",
                          defaultVariant.stock > 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-destructive"
                        )}
                      >
                        {defaultVariant.stock > 0
                          ? `${defaultVariant.stock} available`
                          : "Out of stock"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ordering Information */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">
                Ordering Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/30 dark:border-blue-800">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Custom Design Services
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Need a custom design? Our team can help create the perfect
                    design for your needs.
                  </p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950/30 dark:border-green-800">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                    Bulk Discounts Available
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Contact us for special pricing on large quantity orders.
                  </p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg dark:bg-purple-950/30 dark:border-purple-800">
                  <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                    Fast Turnaround
                  </h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Most orders ship within 3-5 business days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
