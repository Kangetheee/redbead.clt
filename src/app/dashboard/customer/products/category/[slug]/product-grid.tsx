"use client";

import { ProductResponse } from "@/lib/products/types/products.types";
import ProductCard from "../../product-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProductGridProps {
  products: ProductResponse[];
  isLoading: boolean;
  viewMode: "grid" | "list";
  pagination: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export default function ProductGrid({
  products,
  isLoading,
  viewMode,
  pagination,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-300 aspect-square rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">
            No products found in this category.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} viewMode={viewMode} />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            disabled={pagination.currentPage === 1}
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
          >
            Previous
          </Button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (page) => (
              <Button
                key={page}
                variant={
                  page === pagination.currentPage ? "default" : "outline"
                }
                onClick={() => pagination.onPageChange(page)}
              >
                {page}
              </Button>
            )
          )}
          <Button
            variant="outline"
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
}
