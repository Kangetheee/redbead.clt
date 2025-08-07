/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Star, ShoppingCart, AlertCircle } from "lucide-react";
import { useFeaturedProductTypes } from "@/hooks/use-products";
import { ProductTypeResponse } from "@/lib/products/types/products.types";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { ViewDetailsButton } from "@/components/products/view-details";
import { QuickAddToCartButton } from "@/components/cart/quick-add-to-cart-button";
import { ProductGrid } from "./product-grid";

interface FeaturedProductsSectionProps {
  limit?: number;
  className?: string;
  showAddToCart?: boolean;
}

export function FeaturedProductsSection({
  limit = 8,
  className,
  showAddToCart = true,
}: FeaturedProductsSectionProps) {
  const {
    data: featuredProducts,
    isLoading,
    error,
    isError,
  } = useFeaturedProductTypes(limit);

  // Debug logging
  useEffect(() => {
    console.log("Featured Products Debug:", {
      data: featuredProducts,
      isLoading,
      error,
      isError,
      limit,
    });
  }, [featuredProducts, isLoading, error, isError, limit]);

  if (isLoading) {
    return (
      <div className={cn("space-y-8", className)}>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular custom products for your business needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: limit }).map((_, index) => (
            <Card key={index} className="overflow-hidden bg-card border-border">
              <div className="aspect-square relative">
                <Skeleton className="w-full h-full bg-muted" />
              </div>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4 bg-muted" />
                <Skeleton className="h-4 w-full bg-muted" />
                <Skeleton className="h-4 w-2/3 bg-muted" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full bg-muted" />
                  <Skeleton className="h-3 w-full bg-muted" />
                  <Skeleton className="h-3 w-2/3 bg-muted" />
                </div>
                <Skeleton className="h-10 w-full bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || isError) {
    return (
      <div className={cn("text-center py-12", className)}>
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Featured Products
        </h2>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">
            Unable to load featured products. Please try again later.
          </p>
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground mb-2 hover:text-foreground">
              Debug Info (Click to expand)
            </summary>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto text-muted-foreground">
              {JSON.stringify(
                {
                  error: error?.message || "Unknown error",
                  isError,
                  endpoint: `/v1/product/featured?limit=${limit}`,
                  timestamp: new Date().toISOString(),
                },
                null,
                2
              )}
            </pre>
          </details>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!featuredProducts?.length) {
    return (
      <div className={cn("text-center py-12", className)}>
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Featured Products
        </h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto dark:bg-yellow-900/20 dark:border-yellow-800/30">
          <p className="text-yellow-700 dark:text-yellow-300">
            No featured products available at the moment.
          </p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
            Data received: {JSON.stringify(featuredProducts)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", className)}>
      {/* Section Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Featured Products
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover our most popular custom products for your business needs
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredProducts.map((product: ProductTypeResponse) => (
          <Card
            key={product.id}
            className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border bg-card shadow-md hover:shadow-lg dark:hover:shadow-2xl"
          >
            {/* Product Image */}
            <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
              <Image
                src={product.thumbnailImage || "/placeholder-product.jpg"}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Featured Badge */}
              {product.isFeatured && (
                <Badge className="absolute top-3 left-3 bg-yellow-500 text-white dark:bg-yellow-600">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}

              {/* Category Badge */}
              {product.category && (
                <Badge
                  variant="secondary"
                  className="absolute top-3 right-3 bg-background/90 text-foreground dark:bg-background/95"
                >
                  {product.category.name}
                </Badge>
              )}
            </div>

            {/* Product Content */}
            <CardContent className="p-4 space-y-3">
              {/* Product Title */}
              <div>
                <h3 className="font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                  <Link href={`/products/${product.slug}`}>{product.name}</Link>
                </h3>

                {/* Product Type & Material */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="capitalize">{product.type}</span>
                  <span>•</span>
                  <span className="capitalize">{product.material}</span>
                </div>
              </div>

              {/* Product Description */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>

              {/* Features/Benefits */}
              {product.designTemplates &&
                product.designTemplates.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-foreground">
                      Available Templates:
                    </p>
                    <ul className="space-y-1">
                      {product.designTemplates
                        .slice(0, 3)
                        .map((template: any, idx: number) => (
                          <li
                            key={template.id}
                            className="flex items-center text-xs text-muted-foreground"
                          >
                            <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400 mr-2 flex-shrink-0" />
                            <span className="line-clamp-1">
                              {template.name}
                            </span>
                            {template.basePrice > 0 && (
                              <span className="ml-auto font-medium text-green-600 dark:text-green-400">
                                From KES {template.basePrice.toLocaleString()}
                              </span>
                            )}
                          </li>
                        ))}
                      {product.designTemplates.length > 3 && (
                        <li className="text-xs text-muted-foreground ml-5">
                          +{product.designTemplates.length - 3} more templates
                        </li>
                      )}
                    </ul>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                {/* Primary Action Button */}
                {showAddToCart &&
                product.designTemplates &&
                product.designTemplates.length > 0 ? (
                  <QuickAddToCartButton
                    templates={product.designTemplates.map((template: any) => ({
                      id: template.id,
                      name: template.name,
                      basePrice: template.basePrice,
                      sizeVariants: template.sizeVariants || [],
                    }))}
                    fullWidth={true}
                    variant="default"
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </QuickAddToCartButton>
                ) : (
                  <ViewDetailsButton
                    productSlug={product.slug}
                    variant="default"
                    size="sm"
                    fullWidth={true}
                  >
                    View Details
                  </ViewDetailsButton>
                )}

                {/* Secondary Action Button */}
                <ViewDetailsButton
                  productSlug={product.slug}
                  variant="ghost"
                  size="sm"
                  fullWidth={true}
                  showIcon={false}
                  className="hover:bg-muted/50"
                >
                  View Full Details →
                </ViewDetailsButton>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View All Button */}
      {featuredProducts.length >= limit && (
        <div className="text-center">
          <Button asChild variant="outline" size="lg" className="px-8">
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
