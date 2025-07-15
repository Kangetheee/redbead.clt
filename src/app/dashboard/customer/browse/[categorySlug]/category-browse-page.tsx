/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Grid3X3,
  List,
  SlidersHorizontal,
  Search,
  Star,
  ShoppingCart,
  Eye,
  Loader2,
  ArrowUpDown,
  Home,
  X,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useProducts } from "@/hooks/use-products";
import type { GetProductsDto } from "@/lib/products/dto/products.dto";
import type { ProductResponse } from "@/lib/products/types/products.types";

export function CategoryBrowsePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const categorySlug = params.categorySlug as string;

  // Debug logging
  useEffect(() => {
    console.log("CategoryBrowsePage - categorySlug:", categorySlug);
  }, [categorySlug]);

  // UI State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    max: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
  });
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    (searchParams.get("sortDirection") as "asc" | "desc") || "asc"
  );
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(
    searchParams.get("featured") === "true"
  );
  const [currentPage, setCurrentPage] = useState(
    searchParams.get("page") ? Number(searchParams.get("page")) : 1
  );

  // Build products query parameters (we'll get category info from first product)
  const productsParams: GetProductsDto = useMemo(
    () => ({
      page: currentPage,
      limit: 20,
      search: searchQuery || undefined,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      isFeatured: showFeaturedOnly || undefined,
      isActive: true,
      sortBy: sortBy as "price" | "name" | "createdAt" | "popularity",
      sortDirection,
      // We'll filter by category slug on the backend or extract from response
      categorySlug: categorySlug,
    }),
    [
      categorySlug,
      searchQuery,
      priceRange,
      showFeaturedOnly,
      sortBy,
      sortDirection,
      currentPage,
    ]
  );

  // Fetch products - this API endpoint is working!
  const {
    data: productsResponse,
    isLoading: loadingProducts,
    error: productsError,
  } = useProducts(productsParams);

  const products = productsResponse?.items || [];
  const productsCount = productsResponse?.meta?.totalItems || 0;
  const totalPages = productsResponse?.meta?.totalPages || 1;

  // Extract category info from first product (since all products in same category)
  const category = products.length > 0 ? products[0].category : null;

  // Debug logging for products data
  useEffect(() => {
    console.log("Products data:", {
      productsResponse,
      loadingProducts,
      productsError,
      category,
      products: products.length,
    });
  }, [
    productsResponse,
    loadingProducts,
    productsError,
    category,
    products.length,
  ]);

  // Update URL with current filters
  const updateURL = (newParams: Record<string, string | undefined>) => {
    const current = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });

    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`/dashboard/customer/browse/${categorySlug}${query}`, {
      scroll: false,
    });
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    updateURL({
      search: value || undefined,
      page: undefined,
    });
  };

  // Handle price filter
  const handlePriceFilter = (min?: number, max?: number) => {
    setPriceRange({ min, max });
    setCurrentPage(1);
    updateURL({
      minPrice: min?.toString(),
      maxPrice: max?.toString(),
      page: undefined,
    });
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const [field, direction] = value.split("-");
    setSortBy(field);
    setSortDirection(direction as "asc" | "desc");
    setCurrentPage(1);
    updateURL({
      sortBy: field,
      sortDirection: direction,
      page: undefined,
    });
  };

  // Handle featured filter
  const handleFeaturedFilter = (featured: boolean) => {
    setShowFeaturedOnly(featured);
    setCurrentPage(1);
    updateURL({
      featured: featured ? "true" : undefined,
      page: undefined,
    });
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setPriceRange({ min: undefined, max: undefined });
    setShowFeaturedOnly(false);
    setCurrentPage(1);
    router.push(`/dashboard/customer/browse/${categorySlug}`);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL({ page: page.toString() });
  };

  // Loading state
  if (loadingProducts) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span>Loading products...</span>
        </div>
      </div>
    );
  }

  // Error state - only show if we have an actual error AND no products
  if (productsError && products.length === 0) {
    console.error("Products error:", { productsError, categorySlug });

    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Category Not Found</h2>
            <p className="text-muted-foreground mb-4 text-center">
              The category &quot;{categorySlug}&quot; doesn&apos;t exist or has
              no products.
            </p>

            {/* Debug info in development */}
            {process.env.NODE_ENV === "development" && (
              <div className="bg-muted p-4 rounded-lg mb-4 text-sm">
                <p>
                  <strong>Debug Info:</strong>
                </p>
                <p>Category Slug: {categorySlug}</p>
                <p>Products Error: {productsError?.toString()}</p>
                <p>Products Found: {products.length}</p>
                <p>API Response: {productsResponse ? "Success" : "Failed"}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button asChild>
                <Link href="/dashboard/customer/design-studio">
                  Back to Design Studio
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no products but no error, show empty state
  if (products.length === 0 && !loadingProducts) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Grid3X3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Products Found</h2>
            <p className="text-muted-foreground mb-4 text-center">
              No products available in &quot;{categorySlug}&quot; category yet.
            </p>
            <Button asChild>
              <Link href="/dashboard/customer/design-studio">
                Back to Design Studio
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeFiltersCount = [
    searchQuery,
    priceRange.min,
    priceRange.max,
    showFeaturedOnly,
  ].filter(Boolean).length;

  // Use category from products or create a fallback
  const categoryName =
    category?.name ||
    categorySlug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Debug info in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm">
          <p>
            <strong>Debug:</strong> Category: {categoryName} | Products:{" "}
            {products.length} | Slug: {categorySlug}
          </p>
          <p>
            <strong>API Status:</strong>{" "}
            {productsResponse ? "✅ Working" : "❌ Failed"}
          </p>
          <p>
            <strong>Category Data:</strong>{" "}
            {category
              ? `✅ Found (${category.name})`
              : "⚠️ Extracted from slug"}
          </p>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/customer">
                <Home className="h-4 w-4" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/customer/design-studio">Categories</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{categoryName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Category Header */}
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">{categoryName}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse and customize {categoryName.toLowerCase()} products
          </p>
        </div>

        {/* Category Stats */}
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>{productsCount} products available</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search in ${categoryName}...`}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Filters Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Products</SheetTitle>
                <SheetDescription>
                  Narrow down products by your preferences
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                {/* Price Range */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Price Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min price"
                      value={priceRange.min || ""}
                      onChange={(e) =>
                        handlePriceFilter(
                          e.target.value ? Number(e.target.value) : undefined,
                          priceRange.max
                        )
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Max price"
                      value={priceRange.max || ""}
                      onChange={(e) =>
                        handlePriceFilter(
                          priceRange.min,
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </div>
                </div>

                {/* Featured Only */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={showFeaturedOnly}
                    onChange={(e) => handleFeaturedFilter(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="featured" className="text-sm font-medium">
                    Featured products only
                  </label>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Sort */}
          <Select
            value={`${sortBy}-${sortDirection}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-48">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="price-asc">Price Low-High</SelectItem>
              <SelectItem value="price-desc">Price High-Low</SelectItem>
              <SelectItem value="createdAt-desc">Newest First</SelectItem>
              <SelectItem value="popularity-desc">Most Popular</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchQuery}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleSearch("")}
              />
            </Badge>
          )}
          {priceRange.min && (
            <Badge variant="secondary" className="gap-1">
              Min: ${priceRange.min}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handlePriceFilter(undefined, priceRange.max)}
              />
            </Badge>
          )}
          {priceRange.max && (
            <Badge variant="secondary" className="gap-1">
              Max: ${priceRange.max}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handlePriceFilter(priceRange.min, undefined)}
              />
            </Badge>
          )}
          {showFeaturedOnly && (
            <Badge variant="secondary" className="gap-1">
              Featured Only
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFeaturedFilter(false)}
              />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
      )}

      {/* Products Grid/List */}
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
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// Product Card Component (unchanged)
interface ProductCardProps {
  product: ProductResponse;
  viewMode: "grid" | "list";
}

function ProductCard({ product, viewMode }: ProductCardProps) {
  if (viewMode === "list") {
    return (
      <Card className="flex flex-row overflow-hidden hover:shadow-lg transition-shadow">
        <div className="w-48 h-32 relative bg-muted flex-shrink-0 overflow-hidden">
          {product.thumbnailImage ? (
            <img
              src={product.thumbnailImage}
              alt={product.name}
              className="w-full h-full object-cover"
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
          <img
            src={product.thumbnailImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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
