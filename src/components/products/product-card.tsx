/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, ShoppingCart, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProductTypeResponse } from "@/lib/products/types/products.types";
import { ViewDetailsButton } from "./view-details";
import { QuickAddToCartButton } from "@/components/cart/quick-add-to-cart-button";

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
  maxTemplatesShown = 2, // Reduced for compact view
}: ProductCardProps) {
  const templates =
    product.designTemplates?.map((template) => ({
      id: template.id,
      name: template.name,
      basePrice: template.basePrice,
      sizeVariants: [], // Will be populated from actual template data when needed
    })) || [];

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
            <ViewDetailsButton
              productSlug={product.slug}
              variant="outline"
              size="sm"
              className="flex-1 text-xs border-green-200 text-green-600 hover:bg-green-50"
              showIcon={false}
            >
              View
            </ViewDetailsButton>
            {showAddToCart && templates.length > 0 && (
              <QuickAddToCartButton
                templates={templates}
                variant="default"
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
                showIcon={false}
              >
                Add
              </QuickAddToCartButton>
            )}
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
            <ViewDetailsButton
              productSlug={product.slug}
              variant="outline"
              size="sm"
              className="bg-white/90 text-gray-900 hover:bg-white border-0"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </ViewDetailsButton>
            {showAddToCart && templates.length > 0 && (
              <QuickAddToCartButton
                templates={templates}
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                Add
              </QuickAddToCartButton>
            )}
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

        {/* Primary Action - only show if no overlay actions */}
        <div className="pt-2 md:hidden">
          {" "}
          {/* Only show on mobile where hover doesn't work */}
          {showAddToCart && templates.length > 0 ? (
            <QuickAddToCartButton
              templates={templates}
              fullWidth={true}
              variant="default"
              size={config.buttonSize}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              Add to Cart
            </QuickAddToCartButton>
          ) : (
            <ViewDetailsButton
              productSlug={product.slug}
              variant="outline"
              size={config.buttonSize}
              fullWidth={true}
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              View Details
            </ViewDetailsButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
