/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useProducts } from "@/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductResponse } from "@/lib/products/types/products.types";

export default function TopProducts() {
  const {
    data: productsData,
    isLoading,
    error,
  } = useProducts({
    limit: 5,
    isActive: true,
  });

  if (isLoading) {
    return <ProductsSkeleton />;
  }

  if (error) {
    console.error("Products error:", error);
    return (
      <div className="text-center py-4 text-red-500">
        Failed to load products. Please try again.
      </div>
    );
  }

  // Handle case where data is undefined or doesn't have expected structure
  if (!productsData) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No product data available
      </div>
    );
  }

  // Extract products from PaginatedData structure
  const products = productsData.items || [];

  if (products.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No products found
      </div>
    );
  }

  // Use products directly from API
  const topProducts = products;

  return (
    <div className="space-y-4">
      {topProducts.map((product) => (
        <Link key={product.id} href={`/admin/products/${product.id}`}>
          <div className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
              {product.thumbnailImage || product.images?.[0] ? (
                <Image
                  src={product.thumbnailImage || product.images?.[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized // Bypass Next.js image optimization for external URLs
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg?height=48&width=48";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  No Image
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium truncate">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    SKU: {product.sku || "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Stock: {product.stock}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${product.basePrice.toFixed(2)}</p>
                  {product.isFeatured && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
          <Skeleton className="h-12 w-12 rounded-md" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
