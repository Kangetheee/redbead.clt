/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Eye, Grid3X3 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { ProductResponse } from "@/lib/products/types/products.types";

interface ProductGridProps {
  products: ProductResponse[];
  viewMode?: "grid" | "list";
  loading?: boolean;
}

export function ProductGrid({
  products,
  viewMode = "grid",
  loading = false,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-square bg-muted"></div>
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-20 mb-2"></div>
              <div className="h-9 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Grid3X3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground text-center">
            Try adjusting your filters to see more products.
          </p>
        </CardContent>
      </Card>
    );
  }

  const containerClass =
    viewMode === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      : "space-y-4";

  return (
    <div className={containerClass}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} viewMode={viewMode} />
      ))}
    </div>
  );
}

interface ProductCardProps {
  product: ProductResponse;
  viewMode: "grid" | "list";
}

function ProductCard({ product, viewMode }: ProductCardProps) {
  if (viewMode === "list") {
    return (
      <Card className="flex flex-row overflow-hidden hover:shadow-lg transition-shadow">
        <div className="w-48 h-32 relative bg-muted flex-shrink-0">
          {product.thumbnailImage ? (
            <Image
              src={product.thumbnailImage}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Grid3X3 className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-2">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {product.isFeatured && (
                <Badge variant="secondary">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                ${product.basePrice.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                Min. {product.minOrderQuantity}{" "}
                {product.minOrderQuantity === 1 ? "unit" : "units"}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/customer/products/${product.slug}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/dashboard/customer/design-studio/${product.id}`}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Design
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <div className="aspect-square relative overflow-hidden">
        {product.thumbnailImage ? (
          <Image
            src={product.thumbnailImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="bg-muted flex items-center justify-center h-full">
            <Grid3X3 className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          {product.isFeatured && (
            <Badge className="bg-primary text-primary-foreground">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg truncate">{product.name}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              ${product.basePrice.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              Min. {product.minOrderQuantity}{" "}
              {product.minOrderQuantity === 1 ? "unit" : "units"}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href={`/dashboard/customer/products/${product.slug}`}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Link>
            </Button>
            <Button size="sm" className="flex-1" asChild>
              <Link href={`/dashboard/customer/design-studio/${product.id}`}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Design
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
