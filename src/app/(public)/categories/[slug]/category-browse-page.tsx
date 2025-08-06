/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Grid,
  List,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductTypesByCategory } from "@/hooks/use-products";
import { useCategoryBySlug } from "@/hooks/use-categories"; // You'll need this hook
import { CategoryDetail } from "@/lib/categories/types/categories.types";
import { ProductTypeResponse } from "@/lib/products/types/products.types";

interface CategoryBrowsePageProps {
  slug: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function CategoryBrowsePage({
  slug,
  searchParams,
}: CategoryBrowsePageProps) {
  // Fetch category data
  const {
    data: category,
    isLoading: categoryLoading,
    error: categoryError,
  } = useCategoryBySlug(slug);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState({
    type: "",
    material: "",
    isFeatured: false,
    priceRange: { min: 0, max: 1000 },
  });

  // Get products for this category (only if category is loaded)
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useProductTypesByCategory({
    categoryId: category?.id || "",
    search: searchTerm || undefined,
    type: filters.type || undefined,
    material: filters.material || undefined,
    isFeatured: filters.isFeatured || undefined,
    sortBy: sortBy as "name" | "createdAt" | "sortOrder",
    sortDirection: sortDirection as "asc" | "desc",
  });

  // Get unique filter options from products
  const filterOptions = useMemo(() => {
    if (!productsData?.items) return { types: [], materials: [] };

    const types = [
      ...new Set(productsData.items.map((p) => p.type).filter(Boolean)),
    ];
    const materials = [
      ...new Set(productsData.items.map((p) => p.material).filter(Boolean)),
    ];

    return { types, materials };
  }, [productsData?.items]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Loading state */}
      {categoryLoading && (
        <div className="space-y-6">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      )}

      {/* Error state */}
      {categoryError && (
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The category you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
          <Link href="/categories">
            <Button>Browse All Categories</Button>
          </Link>
        </div>
      )}

      {/* Main content - only render if category exists */}
      {category && (
        <>
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/categories" className="hover:text-foreground">
              Categories
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{category.name}</span>
          </nav>

          {/* Category Header */}
          <div className="mb-8">
            {category.bannerImage && (
              <div className="relative h-48 md:h-64 mb-6 rounded-lg overflow-hidden">
                <Image
                  src={category.bannerImage}
                  alt={category.name}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-black/40 flex items-end">
                  <div className="p-6 text-white">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                      {category.name}
                    </h1>
                    {category.description && (
                      <p className="text-lg opacity-90 max-w-2xl">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!category.bannerImage && (
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-lg text-muted-foreground max-w-2xl">
                    {category.description}
                  </p>
                )}
              </div>
            )}

            {/* Category Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{category.productCount} products available</span>
              {category.children.length > 0 && (
                <span>{category.children.length} subcategories</span>
              )}
            </div>
          </div>

          {/* Subcategories */}
          {category.children.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Subcategories</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {category.children.map((child) => (
                  <Link key={child.id} href={`/categories/${child.slug}`}>
                    <Card className="hover:shadow-md transition-shadow p-3 text-center">
                      <p className="font-medium text-sm">{child.name}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Filters and Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Sort */}
              <Select
                value={`${sortBy}-${sortDirection}`}
                onValueChange={(value) => {
                  const [sort, direction] = value.split("-");
                  setSortBy(sort);
                  setSortDirection(direction as "asc" | "desc");
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                  <SelectItem value="sortOrder-asc">Default Order</SelectItem>
                </SelectContent>
              </Select>

              {/* Mobile Filters */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <FiltersContent
                    filterOptions={filterOptions}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                  />
                </SheetContent>
              </Sheet>

              {/* View Mode Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
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

          <div className="flex gap-6">
            {/* Desktop Filters Sidebar */}
            <div className="hidden md:block w-64 flex-shrink-0">
              <Card className="p-4 sticky top-4">
                <h3 className="font-semibold mb-4">Filters</h3>
                <FiltersContent
                  filterOptions={filterOptions}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </Card>
            </div>

            {/* Products Grid/List */}
            <div className="flex-1">
              {productsLoading && <ProductsGridSkeleton />}

              {productsError && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Failed to load products. Please try again.
                  </p>
                </div>
              )}

              {productsData && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {productsData.items.length} of{" "}
                      {productsData.meta.totalItems} products
                    </p>
                  </div>

                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {productsData.items.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {productsData.items.map((product) => (
                        <ProductListItem key={product.id} product={product} />
                      ))}
                    </div>
                  )}

                  {productsData.items.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        No products found matching your criteria.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FiltersContent({
  filterOptions,
  filters,
  onFilterChange,
}: {
  filterOptions: { types: string[]; materials: string[] };
  filters: any;
  onFilterChange: (key: string, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Product Type Filter */}
      {filterOptions.types.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Product Type</h4>
          <Select
            value={filters.type}
            onValueChange={(value) => onFilterChange("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any type</SelectItem>
              {filterOptions.types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Material Filter */}
      {filterOptions.materials.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Material</h4>
          <Select
            value={filters.material}
            onValueChange={(value) => onFilterChange("material", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any material" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any material</SelectItem>
              {filterOptions.materials.map((material) => (
                <SelectItem key={material} value={material}>
                  {material}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Featured Filter */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="featured"
          checked={filters.isFeatured}
          onCheckedChange={(checked) => onFilterChange("isFeatured", checked)}
        />
        <label htmlFor="featured" className="text-sm font-medium">
          Featured products only
        </label>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: ProductTypeResponse }) {
  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group hover:shadow-lg transition-shadow duration-200 h-full">
        <CardHeader className="p-0">
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            {product.thumbnailImage ? (
              <Image
                src={product.thumbnailImage}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                <span className="text-2xl text-gray-400">
                  {product.name.charAt(0)}
                </span>
              </div>
            )}
            {product.isFeatured && (
              <Badge variant="default" className="absolute top-2 left-2">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Starting at</p>
              <p className="font-semibold">
                $
                {product.designTemplates?.[0]?.basePrice?.toFixed(2) ||
                  "Custom"}
              </p>
            </div>
            <Button size="sm" className="ml-2">
              Customize
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ProductListItem({ product }: { product: ProductTypeResponse }) {
  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
              {product.thumbnailImage ? (
                <Image
                  src={product.thumbnailImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                  <span className="text-lg text-gray-400">
                    {product.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{product.type}</Badge>
                    {product.material && (
                      <Badge variant="outline">{product.material}</Badge>
                    )}
                    {product.isFeatured && (
                      <Badge variant="default">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Starting at</p>
                  <p className="font-semibold">
                    $
                    {product.designTemplates?.[0]?.basePrice?.toFixed(2) ||
                      "Custom"}
                  </p>
                  <Button size="sm" className="mt-2">
                    Customize
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="h-full">
          <CardHeader className="p-0">
            <Skeleton className="aspect-square rounded-t-lg" />
          </CardHeader>
          <CardContent className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-3" />
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
