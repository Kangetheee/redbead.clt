"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, AlertCircle, ShoppingCart, Heart } from "lucide-react";
import { useFeaturedProducts } from "@/hooks/use-products";
import { ProductResponse } from "@/lib/products/types/products.types";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import Image from "next/image";
import Link from "next/link";
import { cn, formatCurrency } from "@/lib/utils";
import { useState } from "react";
import SearchBar from "../layouts/dashboard/search-bar";

interface FeaturedProductsSectionProps {
  limit?: number;
  className?: string;
}

export function FeaturedProductsSection({
  limit = 8,
  className,
}: FeaturedProductsSectionProps) {
  const {
    data: featuredProducts,
    isLoading,
    error,
    isError,
  } = useFeaturedProducts(limit);

  // State for wishlisted products
  const [wishlistedProducts, setWishlistedProducts] = useState<string[]>([]);

  // Toggle wishlist status
  const toggleWishlist = (productId: string) => {
    setWishlistedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            {error
              ? `Error: ${error.message}`
              : "Unable to load featured products. Please try again later."}
          </p>
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
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Our Products
        </h2>
        <div className="flex justify-center mb-4">
          <div className="w-full max-w-xl">
            <SearchBar />
          </div>
        </div>
      </div>
    );
  }

  // Helper function to get the default variant for a product
  const getDefaultVariant = (product: ProductResponse) => {
    if (!product.variants || product.variants.length === 0) {
      return null;
    }
    return product.variants.find((v) => v.isDefault) || product.variants[0];
  };

  // Helper function to validate and format image URL
  const getValidImageUrl = (
    imageUrl?: string | null,
    fallback = "/placeholder-product.jpg"
  ) => {
    if (!imageUrl) return fallback;

    if (imageUrl.startsWith("/") && !imageUrl.startsWith("//")) {
      if (imageUrl.includes("/images/")) {
        const pathParts = imageUrl.split("/images/");
        return `/images/${pathParts[pathParts.length - 1]}`;
      }
      return imageUrl;
    }
    return imageUrl;
  };

  // Helper function to generate random rating for demo purposes
  const generateRating = (productId: string) => {
    // Use product ID to generate a consistent rating between 3.5 and 5
    const hash = productId.split("").reduce((a, b) => {
      return a + b.charCodeAt(0);
    }, 0);
    return ((hash % 15) + 35) / 10; // Range from 3.5 to 5.0
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Section Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Our Products
        </h2>
        <div className="flex text-center mb-4 ">
          <SearchBar />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {featuredProducts.map((product: ProductResponse) => {
          const defaultVariant = getDefaultVariant(product);
          const rating = generateRating(product.id);
          const isWishlisted = wishlistedProducts.includes(product.id);
          const imageUrl = product.thumbnailImage
            ? getValidImageUrl(product.thumbnailImage)
            : product.images && product.images.length > 0
              ? getValidImageUrl(product.images[0])
              : "/placeholder-product.jpg";

          return (
            <Card
              key={product.id}
              className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border bg-card shadow-md relative"
            >
              {/* Wishlist Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleWishlist(product.id);
                }}
                aria-label={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
                className="absolute top-3 right-3 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-full transition-all duration-200 hover:bg-background"
              >
                <Heart
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isWishlisted
                      ? "fill-red-500 text-red-500"
                      : "text-muted-foreground hover:text-red-500"
                  )}
                />
              </button>

              {/* Product Image */}
              <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
                <div className="relative w-full h-full">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder-product.jpg";
                    }}
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="font-medium text-white mb-1 text-lg">
                        {product.name}
                      </h3>
                      <p className="text-white/80 text-sm line-clamp-2 mb-3">
                        {product.description}
                      </p>
                      <Link
                        href={`/products/${product.id}`}
                        className="text-white underline text-sm hover:text-green-300 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Featured Badge */}
                {product.isFeatured && (
                  <Badge className="absolute top-3 left-3 bg-yellow-500 text-white dark:bg-yellow-600 z-10">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}

                {/* Quick Add Button - Only visible on hover */}
                {defaultVariant &&
                  product.isActive &&
                  defaultVariant.stock > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <AddToCartButton
                        productId={product.id}
                        variantId={defaultVariant?.id || product.id}
                        quantity={1}
                        variant="default"
                        size="sm"
                        className="w-full bg-white text-black hover:bg-green-200 transition-colors"
                        showSuccessState={true}
                      >
                        <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                        Quick Add
                      </AddToCartButton>
                    </div>
                  )}
              </div>

              {/* Product Content */}
              <CardContent className="p-4 space-y-3">
                {/* Product Title and Price */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                      <Link href={`/products/${product.id}`}>
                        {product.name}
                      </Link>
                    </h3>

                    {/* Rating Stars */}
                    <div className="flex items-center mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "h-3.5 w-3.5",
                            star <= Math.floor(rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : star - 0.5 <= rating
                                ? "fill-yellow-400/50 text-yellow-400"
                                : "text-muted stroke-muted-foreground/30 fill-none"
                          )}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({Math.floor(Math.random() * 150) + 10})
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(product.basePrice)}
                  </span>
                </div>

                {/* Category */}
                {product.category && (
                  <div className="text-xs text-muted-foreground">
                    {product.category.name}
                  </div>
                )}

                {/* Stock Status */}
                {defaultVariant && (
                  <div className="text-xs">
                    {defaultVariant.stock > 10 ? (
                      <span className="text-green-600 dark:text-green-400">
                        In Stock
                      </span>
                    ) : defaultVariant.stock > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400">
                        Low Stock ({defaultVariant.stock} left)
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">
                        Out of Stock
                      </span>
                    )}
                  </div>
                )}

                {/* View Product Button */}
                <Link
                  href={`/products/${product.id}`}
                  className={cn(
                    "mt-2 block text-center py-2 px-4 rounded-md border border-border transition-colors",
                    "hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  )}
                >
                  View Product
                </Link>
              </CardContent>
            </Card>
          );
        })}
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
