/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductResponse } from "@/lib/products/types/products.types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Heart, Eye } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: ProductResponse;
  viewMode?: "grid" | "list";
  featured?: boolean;
}

export default function ProductCard({
  product,
  viewMode = "grid",
  featured = false,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
  };

  const isOutOfStock = product.stock === 0;

  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
        <div className="flex">
          <div className="relative w-48 h-48 flex-shrink-0">
            <Link href={`/dashboard/customer/products/${product.slug}`}>
              {!imageError &&
              (product.thumbnailImage || product.images?.[0]) ? (
                <img
                  src={product.thumbnailImage || product.images[0]}
                  alt={product.name}
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </Link>

            {/* Overlay Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.isFeatured && (
                <Badge variant="secondary">Featured</Badge>
              )}
              {isOutOfStock && (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>

            {/* Wishlist Button */}
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              onClick={handleWishlist}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  isWishlisted && "fill-current text-red-500"
                )}
              />
            </Button>
          </div>

          <CardContent className="flex-1 p-6">
            <div className="flex justify-between items-start h-full">
              <div className="flex-1">
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {product.description}
                </p>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < 4
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">(4.0)</span>
                </div>

                {product.category && (
                  <Badge variant="outline" className="mb-4">
                    {product.category.name}
                  </Badge>
                )}
              </div>

              <div className="text-right ml-6">
                <div className="text-2xl font-bold text-gray-900 mb-4">
                  {formatCurrency(product.basePrice)}
                </div>

                <div className="space-y-2">
                  <Link href={`/products/${product.slug}`}>
                    <Button variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>

                  <Button className="w-full" disabled={isOutOfStock}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  Stock: {product.stock}
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group overflow-hidden hover:shadow-lg transition-all duration-200",
        featured && "ring-2 ring-yellow-400"
      )}
    >
      <div className="relative aspect-square">
        <Link href={`/dashboard/customer/products/${product.slug}`}>
          {!imageError && (product.thumbnailImage || product.images?.[0]) ? (
            <img
              src={product.thumbnailImage || product.images[0]}
              alt={product.name}
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
        </Link>

        {/* Overlay Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFeatured && <Badge variant="secondary">Featured</Badge>}
          {featured && (
            <Badge className="bg-yellow-400 text-yellow-900">⭐ Featured</Badge>
          )}
          {isOutOfStock && <Badge variant="destructive">Out of Stock</Badge>}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleWishlist}
        >
          <Heart
            className={cn(
              "h-4 w-4",
              isWishlisted && "fill-current text-red-500"
            )}
          />
        </Button>

        {/* Quick View Button */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/dashboard/customer/products/${product.slug}`}>
            <Button
              variant="outline"
              size="icon"
              className="bg-white/80 hover:bg-white"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <CardContent className="p-4">
        <Link href={`/dashboard/customer/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">(4.0)</span>
        </div>

        {product.category && (
          <Badge variant="outline" className="text-xs mb-3">
            {product.category.name}
          </Badge>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(product.basePrice)}
          </span>
          <span className="text-xs text-gray-500">Stock: {product.stock}</span>
        </div>

        <Button className="w-full" size="sm" disabled={isOutOfStock}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardContent>
    </Card>
  );
}
