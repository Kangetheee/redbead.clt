/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  ChevronDown,
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useProducts, useDeleteProduct } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import type { GetProductsDto } from "@/lib/products/dto/products.dto";
import type { ProductResponse } from "@/lib/products/types/products.types";
import type { CategoryResponse } from "@/lib/categories/types/categories.types";

// Utility function to safely extract arrays from API responses
function extractArrayFromResponse<T>(response: any): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;

  // Check common nested array properties
  const arrayKeys = ["data", "items", "results", "content", "list"];
  for (const key of arrayKeys) {
    if (response[key] && Array.isArray(response[key])) {
      return response[key];
    }
  }

  return [];
}

function ProductTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-12" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-8 w-8 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  // Parse search params with defaults
  const [filters, setFilters] = useState<GetProductsDto>({
    page: parseInt(searchParams.get("page") || "1"),
    limit: parseInt(searchParams.get("limit") || "10"),
    search: searchParams.get("search") || "",
    categoryId: searchParams.get("categoryId") || "",
    sortBy: (searchParams.get("sortBy") as any) || "createdAt",
    sortDirection: (searchParams.get("sortDirection") as any) || "desc",
    isActive: searchParams.get("isActive")
      ? searchParams.get("isActive") === "true"
      : undefined,
    isFeatured: searchParams.get("isFeatured")
      ? searchParams.get("isFeatured") === "true"
      : undefined,
  });

  // Use the hooks
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useProducts(filters);

  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();

  const deleteProductMutation = useDeleteProduct();

  // Safely extract arrays from API responses
  const categories = useMemo(
    () => extractArrayFromResponse<CategoryResponse>(categoriesData),
    [categoriesData]
  );

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        params.set(key, value.toString());
      }
    });

    const newUrl = `/dashboard/admin/products?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  // Handle filter changes
  const updateFilters = (newFilters: Partial<GetProductsDto>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1, // Reset to page 1 unless explicitly setting page
    }));
  };

  // Handle search
  const handleSearch = (search: string) => {
    updateFilters({ search });
  };

  // Handle category filter
  const handleCategoryFilter = (categoryId: string) => {
    updateFilters({ categoryId: categoryId === "all" ? "" : categoryId });
  };

  // Handle sort
  const handleSort = (sortValue: string) => {
    const [sortBy, sortDirection] = sortValue.split("-");
    updateFilters({
      sortBy: sortBy as any,
      sortDirection: sortDirection as any,
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  // Handle delete
  const handleDelete = async (productId: string) => {
    try {
      await deleteProductMutation.mutateAsync(productId);
      setDeleteProductId(null);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Extract pagination data
  const products = productsData?.items || productsData?.items || [];
  const pagination = productsData?.meta ||
    productsData?.meta || {
      totalItems: 0,
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: filters.limit || 10,
    };

  if (productsError) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load products. Please refresh the page.
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/admin/products/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Products</CardTitle>
          <CardDescription>
            View and manage all products in your catalog.
            {!productsLoading && pagination.totalItems > 0 && (
              <span className="ml-2">
                Showing{" "}
                {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{" "}
                {Math.min(
                  pagination.currentPage * pagination.itemsPerPage,
                  pagination.totalItems
                )}{" "}
                of {pagination.totalItems} products
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full pl-8"
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filters.categoryId || "all"}
                onValueChange={handleCategoryFilter}
                disabled={categoriesLoading}
              >
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoriesLoading ? (
                    <div className="p-2">
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                        {!category.isActive && " (Inactive)"}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">
                      No categories found. Please create a category first.
                    </div>
                  )}
                </SelectContent>
              </Select>

              <Select
                value={`${filters.sortBy}-${filters.sortDirection}`}
                onValueChange={handleSort}
              >
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                  <SelectItem value="basePrice-desc">
                    Price: High to Low
                  </SelectItem>
                  <SelectItem value="basePrice-asc">
                    Price: Low to High
                  </SelectItem>
                  <SelectItem value="stock-desc">Stock: High to Low</SelectItem>
                  <SelectItem value="stock-asc">Stock: Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading state */}
          {productsLoading ? (
            <ProductTableSkeleton />
          ) : !products || products.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                {filters.search || filters.categoryId
                  ? "No products found matching your criteria"
                  : "No products found"}
              </p>
              <Link href="/dashboard/admin/products/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Product
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product: ProductResponse) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 relative rounded overflow-hidden bg-muted">
                              <Image
                                src={
                                  product.thumbnailImage ||
                                  "/placeholder.svg?height=40&width=40"
                                }
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="font-medium">
                              <Link
                                href={`/dashboard/admin/products/${product.id}`}
                                className="hover:underline"
                              >
                                {product.name}
                              </Link>
                              {product.isFeatured && (
                                <Badge
                                  variant="secondary"
                                  className="ml-2 text-xs"
                                >
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {product.sku || "—"}
                        </TableCell>
                        <TableCell>{product.category?.name || "—"}</TableCell>
                        <TableCell className="font-medium">
                          ${product.basePrice.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              product.stock <= 10
                                ? "text-destructive font-medium"
                                : ""
                            }
                          >
                            {product.stock}
                          </span>
                          {product.stock <= 10 && product.stock > 0 && (
                            <span className="text-xs text-destructive block">
                              Low stock
                            </span>
                          )}
                          {product.stock === 0 && (
                            <span className="text-xs text-destructive block">
                              Out of stock
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={product.isActive ? "outline" : "secondary"}
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <span className="sr-only">Open menu</span>
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/admin/products/${product.id}`}
                                >
                                  View details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/admin/products/${product.id}/edit`}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit product
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={() => setDeleteProductId(product.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete product
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium">
                      {(pagination.currentPage - 1) * pagination.itemsPerPage +
                        1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        pagination.currentPage * pagination.itemsPerPage,
                        pagination.totalItems
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{pagination.totalItems}</span>{" "}
                    results
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.currentPage <= 1}
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                    >
                      Previous
                    </Button>

                    {/* Page numbers */}
                    {pagination.totalPages <= 7 ? (
                      // Show all pages if 7 or fewer
                      [...Array(pagination.totalPages)].map((_, i) => (
                        <Button
                          key={i + 1}
                          variant={
                            pagination.currentPage === i + 1
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))
                    ) : (
                      // Show abbreviated pagination for more than 7 pages
                      <>
                        <Button
                          variant={
                            pagination.currentPage === 1 ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(1)}
                        >
                          1
                        </Button>
                        {pagination.currentPage > 3 && (
                          <span className="px-2">...</span>
                        )}
                        {[...Array(3)].map((_, i) => {
                          const page = Math.max(
                            2,
                            Math.min(
                              pagination.totalPages - 1,
                              pagination.currentPage - 1 + i
                            )
                          );
                          if (page === 1 || page === pagination.totalPages)
                            return null;
                          return (
                            <Button
                              key={page}
                              variant={
                                pagination.currentPage === page
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          );
                        })}
                        {pagination.currentPage < pagination.totalPages - 2 && (
                          <span className="px-2">...</span>
                        )}
                        <Button
                          variant={
                            pagination.currentPage === pagination.totalPages
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            handlePageChange(pagination.totalPages)
                          }
                        >
                          {pagination.totalPages}
                        </Button>
                      </>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.currentPage >= pagination.totalPages}
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteProductId}
        onOpenChange={() => setDeleteProductId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductId && handleDelete(deleteProductId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Product"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
