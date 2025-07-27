/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, ShoppingCart, Eye, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProductTypeResponse } from "@/lib/products/types/products.types";

interface ProductCardProps {
  product: ProductTypeResponse;
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
  // Use the correct ProductTypeDesignTemplate interface
  const templates = product.designTemplates || [];

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

  // Render View Details button
  const renderViewDetailsButton = (variant: "overlay" | "primary" | "list") => {
    const buttonProps = {
      variant:
        variant === "overlay" ? ("outline" as const) : ("outline" as const),
      size: variant === "list" ? ("sm" as const) : config.buttonSize,
      className: cn(
        variant === "overlay" &&
          "bg-white/90 text-gray-900 hover:bg-white border-0",
        variant === "primary" &&
          "border-green-600 text-green-600 hover:bg-green-50 w-full",
        variant === "list" &&
          "flex-1 text-xs border-green-200 text-green-600 hover:bg-green-50"
      ),
    };

    return (
      <Button {...buttonProps} asChild>
        <Link href={`/products/${product.slug}`}>
          {variant === "overlay" && <Eye className="w-3 h-3 mr-1" />}
          {variant === "list" ? "View" : "View Details"}
        </Link>
      </Button>
    );
  };

  // Render Add to Cart button (placeholder since we don't have size variants)
  const renderAddToCartButton = (variant: "overlay" | "primary" | "list") => {
    if (!showAddToCart || templates.length === 0) return null;

    const buttonProps = {
      variant:
        variant === "overlay" ? ("default" as const) : ("default" as const),
      size: variant === "list" ? ("sm" as const) : config.buttonSize,
      className: cn(
        variant === "overlay" && "bg-green-600 hover:bg-green-700 text-white",
        variant === "primary" &&
          "bg-green-600 hover:bg-green-700 text-white w-full",
        variant === "list" && "flex-1 bg-green-600 hover:bg-green-700 text-xs"
      ),
    };

    // For now, navigate to product page for customization since we don't have size variants
    return (
      <Button {...buttonProps} asChild>
        <Link href={`/products/${product.slug}`}>
          <ShoppingCart className="w-3 h-3 mr-1" />
          {variant === "list" ? "Add" : "Add to Cart"}
        </Link>
      </Button>
    );
  };

  // List layout - optimized for scanning
  if (layout === "list") {
    return (
      <Card
        className={cn(
          "flex flex-row overflow-hidden hover:shadow-md transition-all duration-200 border-gray-200 hover:border-green-200 group",
          className
        )}
      >
        {/* Image */}
        <div className="relative bg-gradient-to-br from-green-50 to-gray-50 flex-shrink-0 w-20 h-20">
          <Image
            src={product.thumbnailImage || "/placeholder-product.jpg"}
            alt={product.name}
            fill
            className="object-cover"
          />

          {/* Featured badge - mini */}
          {product.isFeatured && (
            <Badge className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs p-0 w-4 h-4 flex items-center justify-center">
              <Star className="w-2 h-2" />
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between p-3 min-w-0">
          <div className="space-y-1">
            {/* Header */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-green-600 transition-colors">
                <Link href={`/products/${product.slug}`}>{product.name}</Link>
              </h3>

              {/* Meta info - compact */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {showMaterial && (
                  <>
                    <span className="capitalize">
                      {product.type.toLowerCase()}
                    </span>
                    <span>•</span>
                    <span className="capitalize">
                      {product.material.toLowerCase()}
                    </span>
                  </>
                )}
                {showCategory && product.category && (
                  <>
                    {showMaterial && <span>•</span>}
                    <span className="text-green-600">
                      {product.category.name}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quick info */}
            {templates.length > 0 && (
              <div className="text-xs text-gray-600">
                {templates.length} template{templates.length !== 1 ? "s" : ""}
                {templates[0] && (
                  <span className="text-green-600 font-medium ml-2">
                    from KES {templates[0].basePrice.toLocaleString()}
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
        "group overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-green-200 bg-white",
        className
      )}
    >
      {/* Product Image */}
      <div
        className={cn(
          "relative overflow-hidden bg-gradient-to-br from-green-50 to-gray-50",
          aspectRatioClass
        )}
      >
        <Image
          src={product.thumbnailImage || "/placeholder-product.jpg"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badges overlay */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          {/* Featured Badge */}
          {product.isFeatured && (
            <Badge className="bg-yellow-500 text-white text-xs">
              <Star className="w-2 h-2 mr-1" />
              Featured
            </Badge>
          )}

          {/* Category Badge */}
          {showCategory && product.category && (
            <Badge
              variant="secondary"
              className="bg-white/90 text-gray-700 text-xs ml-auto"
            >
              {product.category.name}
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
        {/* Product Title */}
        <div>
          <h3
            className={cn(
              config.titleClass,
              "text-gray-900 mb-1 line-clamp-2 group-hover:text-green-600 transition-colors"
            )}
          >
            <Link
              href={`/products/${product.slug}`}
              className="hover:underline"
            >
              {product.name}
            </Link>
          </h3>

          {/* Product Type & Material - compact */}
          {showMaterial && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
              <span className="capitalize">{product.type.toLowerCase()}</span>
              <span>•</span>
              <span className="capitalize">
                {product.material.toLowerCase()}
              </span>
            </div>
          )}
        </div>

        {/* Product Description - conditional */}
        {showDescription && size !== "sm" && (
          <p className={cn(config.descClass, "text-gray-600 line-clamp-2")}>
            {truncateText(product.description, config.maxDesc)}
          </p>
        )}

        {/* Templates List - compact */}
        {showTemplateList && templates.length > 0 && (
          <div className="space-y-1">
            {size === "lg" && (
              <p className="text-xs font-medium text-gray-700">
                Templates ({templates.length}):
              </p>
            )}
            <ul className="space-y-1">
              {templates
                .slice(0, size === "sm" ? 1 : maxTemplatesShown)
                .map((template, idx) => (
                  <li
                    key={template.id}
                    className="flex items-center text-xs text-gray-600"
                  >
                    <CheckCircle className="h-2 w-2 text-green-600 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1 flex-1 min-w-0">
                      {template.name}
                    </span>
                    {template.basePrice > 0 && (
                      <span className="font-medium text-green-600 ml-1 text-xs">
                        KES {template.basePrice.toLocaleString()}
                      </span>
                    )}
                  </li>
                ))}
              {templates.length > maxTemplatesShown && size !== "sm" && (
                <li className="text-xs text-gray-500">
                  +{templates.length - maxTemplatesShown} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Primary Action - Mobile only */}
        <div className="pt-2 md:hidden space-y-2">
          {renderAddToCartButton("primary")}

          {/* Secondary action for mobile */}
          {renderViewDetailsButton("primary")}
        </div>

        {/* Desktop primary action - Only show if no templates for add to cart */}
        {(!showAddToCart || templates.length === 0) && (
          <div className="pt-2 hidden md:block">
            {renderViewDetailsButton("primary")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
