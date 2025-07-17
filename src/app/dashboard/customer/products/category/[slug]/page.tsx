/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect } from "react";
import { useProducts } from "@/hooks/use-products";
import { GetProductsDto } from "@/lib/products/dto/products.dto";
import ProductGrid from "./product-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";

// FIXED: Updated interface to match Next.js 15 async params
interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [slug, setSlug] = useState<string | null>(null);
  const [filters, setFilters] = useState<GetProductsDto>({
    page: 1,
    limit: 12,
    isActive: true,
  });

  // FIXED: Await the params Promise in useEffect
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
      // Update filters with the resolved slug/categoryId
      setFilters((prev) => ({
        ...prev,
        categoryId: resolvedParams.slug, // Assuming slug is used as categoryId
      }));
    };
    getParams();
  }, [params]);

  const {
    data: productsData,
    isLoading,
    error,
  } = useProducts(
    slug ? filters : { ...filters, categoryId: undefined } // Only call API when slug is resolved
  );

  const handleFilterChange = (key: keyof GetProductsDto, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Show loading state while slug is being resolved
  if (!slug) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-64"></div>
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-300 rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="h-10 bg-gray-300 rounded w-48"></div>
                <div className="h-10 bg-gray-300 rounded w-48"></div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-300 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">
              Failed to load category products.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 capitalize">
          {slug.replace("-", " ")} Products
        </h1>

        {/* Category Info and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter & Sort</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="flex flex-col md:flex-row gap-4">
                <Select
                  onValueChange={(value) => handleFilterChange("sortBy", value)}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="createdAt">Newest</SelectItem>
                    <SelectItem value="popularity">Popularity</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  onValueChange={(value) =>
                    handleFilterChange("sortDirection", value)
                  }
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Low to High</SelectItem>
                    <SelectItem value="desc">High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <ProductGrid
          products={productsData?.items || []}
          isLoading={isLoading}
          viewMode={viewMode}
          pagination={{
            currentPage: productsData?.meta.currentPage || 1,
            totalPages: productsData?.meta.totalPages || 1,
            onPageChange: handlePageChange,
          }}
        />
      </div>
    </div>
  );
}
