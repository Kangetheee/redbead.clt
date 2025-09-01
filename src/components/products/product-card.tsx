/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, ShoppingCart, Eye, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn, formatAmount } from "@/lib/utils";
import { ProductResponse } from "@/lib/products/types/products.types";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

interface ProductCardProps {
  product: ProductResponse;
  layout?: "grid" | "list";
  size?: "sm" | "md" | "lg";
  showAddToCart?: boolean;
  showTemplateList?: boolean;
  showDescription?: boolean;
  showCategory?: boolean;
  showMaterial?: boolean;
  className?: string;
  imageAspectRatio?: "square" | "portrait" | "landscape";
  maxTemplatesShown?: number;
}

export function ProductCard({
  product,
  layout = "grid",
  size = "md",
  showAddToCart = true,
  showTemplateList = true,
  showDescription = true,
  showCategory = true,
  showMaterial = true,
  className,
  imageAspectRatio = "square",
  maxTemplatesShown = 2,
}: ProductCardProps) {
  // Use the correct ProductDesignTemplate interface
  const templates = product.designTemplates || [];

  // Get product metadata for type and material
  const productType = product.metadata?.type || "Product";
  const productMaterial = product.metadata?.material || "Standard";

  // Size configurations - optimized for better density
  const sizeConfig = {
    sm: {
      imageClass: "aspect-square",
      titleClass: "text-sm font-medium",
      descClass: "text-xs",
      spacing: "p-2 space-y-2",
      buttonSize: "sm" as const,
      maxDesc: 60,
    },
    md: {
      imageClass: "aspect-square",
      titleClass: "text-sm font-semibold",
      descClass: "text-xs",
      spacing: "p-3 space-y-2",
      buttonSize: "sm" as const,
      maxDesc: 80,
    },
    lg: {
      imageClass: "aspect-square",
      titleClass: "text-base font-semibold",
      descClass: "text-sm",
      spacing: "p-4 space-y-3",
      buttonSize: "sm" as const,
      maxDesc: 120,
    },
  };

  const config = sizeConfig[size];

  // Aspect ratio classes
  const aspectRatioClass = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
  }[imageAspectRatio];

  // Truncate description based on size
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  // Check if product can be added to cart
  const canAddToCart = () => {
    // Product must be active
    if (!product.isActive) return false;

    // Check if product has variants and at least one is in stock
    if (product.variants && product.variants.length > 0) {
      return product.variants.some((variant) => variant.stock > 0);
    }

    // If no variants, assume product is available
    return true;
  };

  // Get default variant for add to cart
  const getDefaultVariant = () => {
    if (!product.variants || product.variants.length === 0) {
      // Return null - we'll handle this case differently
      return null;
    }

    // Find default variant or use first available variant
    return (
      product.variants.find((v) => v.isDefault) ||
      product.variants.find((v) => v.stock > 0) ||
      product.variants[0]
    );
  };

  // Check if product needs customization (has templates or complex variants)
  const needsCustomization = () => {
    return (
      templates.length > 0 || (product.variants && product.variants.length > 1)
    );
  };

  // Render View Details button
  const renderViewDetailsButton = (variant: "overlay" | "primary" | "list") => {
    const buttonProps = {
      variant:
        variant === "overlay" ? ("outline" as const) : ("outline" as const),
      size: variant === "list" ? ("sm" as const) : config.buttonSize,
      className: cn(
        variant === "overlay" &&
          "bg-background/90 text-foreground hover:bg-background border-0",
        variant === "primary" &&
          "border-green-600 text-green-600 hover:bg-green-50 w-full dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950/30",
        variant === "list" &&
          "flex-1 text-xs border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/30"
      ),
    };

    return (
      <Button {...buttonProps} asChild>
        <Link href={`/products/${product.id}`}>
          {variant === "overlay" && <Eye className="w-3 h-3 mr-1" />}
          {variant === "list" ? "View" : "View Details"}
        </Link>
      </Button>
    );
  };

  const renderAddToCartButton = (variant: "overlay" | "primary" | "list") => {
    if (!showAddToCart) return null;

    const isAvailable = canAddToCart();
    const defaultVariant = getDefaultVariant();
    const requiresCustomization = needsCustomization();

    const buttonProps = {
      variant:
        variant === "overlay" ? ("default" as const) : ("default" as const),
      size: variant === "list" ? ("sm" as const) : config.buttonSize,
      className: cn(
        variant === "overlay" &&
          "bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700",
        variant === "primary" &&
          "bg-green-600 hover:bg-green-700 text-white w-full dark:bg-green-600 dark:hover:bg-green-700",
        variant === "list" &&
          "flex-1 bg-green-600 hover:bg-green-700 text-xs dark:bg-green-600 dark:hover:bg-green-700"
      ),
    };

    // If product is not available, show disabled state
    if (!isAvailable) {
      return (
        <Button {...buttonProps} disabled>
          <ShoppingCart className="w-3 h-3 mr-1" />
          {variant === "list" ? "N/A" : "Not Available"}
        </Button>
      );
    }

    // If product requires customization (multiple variants, templates, etc.),
    // redirect to product page for detailed selection
    if (requiresCustomization) {
      return (
        <Button {...buttonProps} asChild>
          <Link href={`/products/${product.id}`}>
            <Plus className="w-3 h-3 mr-1" />
            {variant === "list" ? "Select" : "Customize & Add"}
          </Link>
        </Button>
      );
    }

    // For simple products with a single variant or no variants, use AddToCartButton directly
    if (defaultVariant) {
      return (
        <AddToCartButton
          productId={product.id}
          variantId={defaultVariant.id}
          quantity={1}
          variant={variant === "overlay" ? "default" : "default"}
          size={variant === "list" ? "sm" : config.buttonSize}
          className={cn(
            variant === "overlay" &&
              "bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700",
            variant === "primary" &&
              "bg-green-600 hover:bg-green-700 text-white w-full dark:bg-green-600 dark:hover:bg-green-700",
            variant === "list" &&
              "flex-1 bg-green-600 hover:bg-green-700 text-xs dark:bg-green-600 dark:hover:bg-green-700"
          )}
          disabled={!isAvailable || defaultVariant.stock === 0}
          showSuccessState={true}
        >
          <ShoppingCart className="w-3 h-3 mr-1" />
          {defaultVariant.stock === 0
            ? variant === "list"
              ? "OOS"
              : "Out of Stock"
            : variant === "list"
              ? "Add"
              : "Add to Cart"}
        </AddToCartButton>
      );
    }

    // For products without variants, create a simple add to cart with product ID
    return (
      <AddToCartButton
        productId={product.id}
        variantId="default"
        quantity={1}
        variant={variant === "overlay" ? "default" : "default"}
        size={variant === "list" ? "sm" : config.buttonSize}
        className={cn(
          variant === "overlay" &&
            "bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700",
          variant === "primary" &&
            "bg-green-600 hover:bg-green-700 text-white w-full dark:bg-green-600 dark:hover:bg-green-700",
          variant === "list" &&
            "flex-1 bg-green-600 hover:bg-green-700 text-xs dark:bg-green-600 dark:hover:bg-green-700"
        )}
        disabled={!isAvailable}
        showSuccessState={true}
      >
        <ShoppingCart className="w-3 h-3 mr-1" />
        {variant === "list" ? "Add" : "Add to Cart"}
      </AddToCartButton>
    );
  };

  // List layout - optimized for scanning
  if (layout === "list") {
    return (
      <Card
        className={cn(
          "flex flex-row overflow-hidden hover:shadow-md transition-all duration-200 border-border hover:border-green-200 dark:hover:border-green-800 group bg-card",
          className
        )}
      >
        {/* Image */}
        <div className="relative bg-gradient-to-br from-green-50 to-muted dark:from-green-950/20 dark:to-muted flex-shrink-0 w-20 h-20">
          <Image
            src={product.thumbnailImage?.src || "/placeholder-product.jpg"}
            alt={product.name}
            fill
            className="object-cover"
          />

          {/* Featured badge - mini */}
          {product.isFeatured && (
            <Badge className="absolute -top-1 -right-1 bg-yellow-500 text-white dark:bg-yellow-600 text-xs p-0 w-4 h-4 flex items-center justify-center">
              <Star className="w-2 h-2" />
            </Badge>
          )}

          {/* Inactive status */}
          {!product.isActive && (
            <Badge className="absolute top-1 left-1 bg-destructive text-destructive-foreground text-xs">
              Inactive
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between p-3 min-w-0">
          <div className="space-y-1">
            {/* Header */}
            <div>
              <h3 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                <Link href={`/products/${product.id}`}>{product.name}</Link>
              </h3>

              {/* Meta info - compact */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {showMaterial && (
                  <>
                    <span className="capitalize">
                      {productType.toLowerCase()}
                    </span>
                    <span>•</span>
                    <span className="capitalize">
                      {productMaterial.toLowerCase()}
                    </span>
                  </>
                )}
                {showCategory && product.category && (
                  <>
                    {showMaterial && <span>•</span>}
                    <span className="text-green-600 dark:text-green-400">
                      {product.category.name}
                    </span>
                  </>
                )}
              </div>

              {/* Price */}
              <div className="text-sm font-medium text-primary">
                {formatAmount(product.basePrice)}
              </div>
            </div>

            {/* Quick info */}
            {templates.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {templates.length} template{templates.length !== 1 ? "s" : ""}
                {templates[0] && (
                  <span className="text-green-600 dark:text-green-400 font-medium ml-2">
                    from +{formatAmount(templates[0].basePrice)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions - compact */}
          <div className="flex gap-1 mt-2">
            {renderViewDetailsButton("list")}
            {renderAddToCartButton("list")}
          </div>
        </div>
      </Card>
    );
  }

  // Grid layout - optimized for different densities
  return (
    <Card
      className={cn(
        "group overflow-hidden hover:shadow-lg transition-all duration-300 border-border hover:border-green-200 dark:hover:border-green-800 bg-card",
        !product.isActive && "opacity-75",
        className
      )}
    >
      {/* Product Image */}
      <div
        className={cn(
          "relative overflow-hidden bg-gradient-to-br from-green-50 to-muted dark:from-green-950/20 dark:to-muted",
          aspectRatioClass
        )}
      >
        <Image
          src={product.thumbnailImage?.src || "/placeholder-product.jpg"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badges overlay */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          {/* Featured Badge */}
          {product.isFeatured && (
            <Badge className="bg-yellow-500 text-white dark:bg-yellow-600 text-xs">
              <Star className="w-2 h-2 mr-1" />
              Featured
            </Badge>
          )}

          {/* Category Badge */}
          {showCategory && product.category && (
            <Badge
              variant="secondary"
              className="bg-background/90 text-foreground dark:bg-background/95 text-xs ml-auto"
            >
              {product.category.name}
            </Badge>
          )}
        </div>

        {/* Status badges */}
        <div className="absolute bottom-2 left-2">
          {!product.isActive && (
            <Badge variant="destructive" className="text-xs">
              Inactive
            </Badge>
          )}
        </div>

        {/* Quick actions overlay - appears on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex gap-2">
            {renderViewDetailsButton("overlay")}
            {renderAddToCartButton("overlay")}
          </div>
        </div>
      </div>

      {/* Product Content */}
      <CardContent className={config.spacing}>
        {/* Product Title and Price */}
        <div>
          <h3
            className={cn(
              config.titleClass,
              "text-foreground mb-1 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors"
            )}
          >
            <Link href={`/products/${product.id}`} className="hover:underline">
              {product.name}
            </Link>
          </h3>

          {/* Price */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-lg font-bold text-primary">
              {formatAmount(product.basePrice)}
            </span>
            {product.variants && product.variants.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {product.variants.length} variant
                {product.variants.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Product Type & Material - compact */}
          {showMaterial && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <span className="capitalize">{productType.toLowerCase()}</span>
              <span>•</span>
              <span className="capitalize">
                {productMaterial.toLowerCase()}
              </span>
            </div>
          )}
        </div>

        {/* Product Description - conditional */}
        {showDescription && size !== "sm" && (
          <p
            className={cn(
              config.descClass,
              "text-muted-foreground line-clamp-2"
            )}
          >
            {truncateText(product.description, config.maxDesc)}
          </p>
        )}

        {/* Templates List - compact */}
        {showTemplateList && templates.length > 0 && (
          <div className="space-y-1">
            {size === "lg" && (
              <p className="text-xs font-medium text-foreground">
                Templates ({templates.length}):
              </p>
            )}
            <ul className="space-y-1">
              {templates
                .slice(0, size === "sm" ? 1 : maxTemplatesShown)
                .map((template, idx) => (
                  <li
                    key={template.id}
                    className="flex items-center text-xs text-muted-foreground"
                  >
                    <CheckCircle className="h-2 w-2 text-green-600 dark:text-green-400 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1 flex-1 min-w-0">
                      {template.name}
                    </span>
                    {template.basePrice > 0 && (
                      <span className="font-medium text-green-600 dark:text-green-400 ml-1 text-xs">
                        +{formatAmount(template.basePrice)}
                      </span>
                    )}
                  </li>
                ))}
              {templates.length > maxTemplatesShown && size !== "sm" && (
                <li className="text-xs text-muted-foreground">
                  +{templates.length - maxTemplatesShown} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Variants Info */}
        {product.variants && product.variants.length > 0 && size !== "sm" && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-foreground">
              Variants ({product.variants.length}):
            </p>
            <div className="flex flex-wrap gap-1">
              {product.variants.slice(0, 2).map((variant) => (
                <Badge
                  key={variant.id}
                  variant="outline"
                  className="text-xs py-0 px-2"
                >
                  {variant.name}
                  {variant.price !== product.basePrice && (
                    <span className="ml-1 text-primary">
                      +{(variant.price - product.basePrice).toLocaleString()}
                    </span>
                  )}
                </Badge>
              ))}
              {product.variants.length > 2 && (
                <span className="text-xs text-muted-foreground self-center">
                  +{product.variants.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="pt-2 space-y-2">
          {/* Add to Cart Button - now always shows when enabled */}
          {renderAddToCartButton("primary")}

          {/* View Details Button - secondary action */}
          {renderViewDetailsButton("primary")}
        </div>
      </CardContent>
    </Card>
  );
}
