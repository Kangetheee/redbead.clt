/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  DollarSign,
  BarChart3,
  AlertCircle,
  Loader2,
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
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useProduct, useDeleteProduct } from "@/hooks/use-products";
import { useCustomizationOptionsByCategory } from "@/hooks/use-customization";
import type { ProductResponse } from "@/lib/products/types/products.types";
import type {
  CustomizationOption,
  CustomizationOptionDetail,
  CustomizationValue,
} from "@/lib/customization/types/options.types";
import { formatDate } from "@/lib/utils";

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

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const { data: product, isLoading, error } = useProduct(productId);

  const { data: customizationData, isLoading: customizationLoading } =
    useCustomizationOptionsByCategory(product?.categoryId || "");

  const deleteProductMutation = useDeleteProduct();

  // Safely extract customization options from API response
  const customizationOptions = useMemo(() => {
    const options =
      extractArrayFromResponse<CustomizationOptionDetail>(customizationData);
    // Type assertion to ensure we have CustomizationOptionDetail with values
    return options as CustomizationOptionDetail[];
  }, [customizationData]);

  const handleDelete = async () => {
    try {
      await deleteProductMutation.mutateAsync(productId);
      router.push("/dashboard/admin/products");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to load product. Please try again.";

    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errorMessage}
            <Link href="/dashboard/admin/products" className="ml-2 underline">
              Return to products
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Product not found
            <Link href="/dashboard/admin/products" className="ml-2 underline">
              Return to products
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard/admin/products">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">
              {product.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={product.isActive ? "outline" : "secondary"}>
              {product.isActive ? "Active" : "Inactive"}
            </Badge>
            {product.isFeatured && <Badge variant="default">Featured</Badge>}
            <span className="text-sm text-muted-foreground">
              SKU: {product.sku || "—"}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/admin/products/${product.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={deleteProductMutation.isPending}
              >
                {deleteProductMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  product &quot;{product.name}&quot; and remove all associated
                  data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Product
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              {product.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className={`relative aspect-square rounded-lg overflow-hidden border ${
                        product.thumbnailImage === image
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {product.thumbnailImage === image && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Thumbnail
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No images uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {/* Customization Options */}
          <Card>
            <CardHeader>
              <CardTitle>Customization Options</CardTitle>
              <CardDescription>
                Available customization options for this product
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customizationLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : customizationOptions.length > 0 ? (
                <div className="space-y-4">
                  {customizationOptions.map(
                    (option: CustomizationOptionDetail) => (
                      <div key={option.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{option.displayName}</h4>
                          <Badge
                            variant={option.required ? "default" : "secondary"}
                          >
                            {option.required ? "Required" : "Optional"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Type: {option.type}
                        </p>
                        {option.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {option.description}
                          </p>
                        )}
                        {option.values && option.values.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">
                              Available Options:
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {option.values
                                .slice(0, 6)
                                .map((value: CustomizationValue) => (
                                  <div
                                    key={value.id}
                                    className="text-sm p-2 bg-muted rounded flex items-center justify-between"
                                  >
                                    <span>{value.displayName}</span>
                                    {value.priceAdjustment > 0 && (
                                      <span className="text-xs text-muted-foreground">
                                        +${value.priceAdjustment.toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              {option.values.length > 6 && (
                                <div className="text-sm p-2 bg-muted rounded text-center text-muted-foreground">
                                  +{option.values.length - 6} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No customization options available for this product.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO Information */}
          {(product.metaTitle || product.metaDescription) && (
            <Card>
              <CardHeader>
                <CardTitle>SEO Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.metaTitle && (
                  <div>
                    <h4 className="font-medium mb-1">Meta Title</h4>
                    <p className="text-sm text-muted-foreground">
                      {product.metaTitle}
                    </p>
                  </div>
                )}
                {product.metaDescription && (
                  <div>
                    <h4 className="font-medium mb-1">Meta Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {product.metaDescription}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Base Price
                    </p>
                    <p className="text-2xl font-bold">
                      ${product.basePrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Stock Level
                    </p>
                    <p
                      className={`text-2xl font-bold ${product.stock <= 10 ? "text-destructive" : ""}`}
                    >
                      {product.stock}
                    </p>
                    {product.stock <= 10 && (
                      <p className="text-xs text-destructive">Low stock</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Category
                    </p>
                    <p className="text-lg font-semibold">
                      {product.category?.name || "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Product ID</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {product.id}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium">Slug</p>
                <p className="text-sm text-muted-foreground">{product.slug}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Min Order</p>
                  <p className="text-sm text-muted-foreground">
                    {product.minOrderQuantity}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Max Order</p>
                  <p className="text-sm text-muted-foreground">
                    {product.maxOrderQuantity || "—"}
                  </p>
                </div>
              </div>
              <Separator />
              {product.weight && (
                <>
                  <div>
                    <p className="text-sm font-medium">Weight</p>
                    <p className="text-sm text-muted-foreground">
                      {product.weight} lbs
                    </p>
                  </div>
                  <Separator />
                </>
              )}
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(product.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(product.updatedAt)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Customizable Areas */}
          {product.customizableAreas &&
            Object.keys(product.customizableAreas).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Customizable Areas</CardTitle>
                  <CardDescription>
                    Areas where customers can add their designs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(product.customizableAreas).map(
                      ([area, config]: [string, any]) => (
                        <div key={area} className="p-3 border rounded-lg">
                          <p className="font-medium capitalize">{area}</p>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                            {config.width && (
                              <span>Width: {config.width}px</span>
                            )}
                            {config.height && (
                              <span>Height: {config.height}px</span>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    </div>
  );
}
