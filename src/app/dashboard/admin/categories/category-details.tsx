"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Settings,
  Package,
  FolderTree,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCategory } from "@/hooks/use-categories";
import { useCustomizationOptionsByCategory } from "@/hooks/use-customization";
import { formatDate } from "@/lib/utils";

interface CategoryDetailPageProps {
  categoryId: string;
}

export default function CategoryDetailPage({
  categoryId,
}: CategoryDetailPageProps) {
  const router = useRouter();

  const { data: category, isLoading: categoryLoading } =
    useCategory(categoryId);
  const { data: optionsResponse, isLoading: optionsLoading } =
    useCustomizationOptionsByCategory(categoryId);

  const customizationOptions = optionsResponse?.success
    ? optionsResponse.data
    : [];

  if (categoryLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Category not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/admin/categories")}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={category.thumbnailImage} alt={category.name} />
              <AvatarFallback>
                <ImageIcon className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <h1 className="text-3xl font-bold tracking-tight">
              {category.name}
            </h1>
            <Badge variant={category.isActive ? "default" : "secondary"}>
              {category.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Category details and management
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/categories/${category.slug}`)}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View Live
          </Button>
          <Button
            onClick={() =>
              router.push(`/dashboard/admin/categories/${category.id}/edit`)
            }
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Category
          </Button>
        </div>
      </div>

      {/* Banner Image */}
      {category.bannerImage && (
        <Card>
          <CardContent className="p-0">
            <div className="w-full h-48 overflow-hidden rounded-lg">
              <img
                src={category.bannerImage}
                alt={`${category.name} banner`}
                className="w-full h-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <p className="mt-1">{category.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Slug
              </label>
              <p className="font-mono text-sm mt-1">{category.slug}</p>
            </div>
            {category.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Description
                </label>
                <p className="mt-1 text-sm">{category.description}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Sort Order
              </label>
              <p className="mt-1">{category.sortOrder}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hierarchy & Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Parent Category
              </label>
              <div className="mt-1">
                {category.parent ? (
                  <Badge
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/dashboard/admin/categories/${category.parent?.id}`
                      )
                    }
                  >
                    <FolderTree className="mr-1 h-3 w-3" />
                    {category.parent.name}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">Root Category</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Subcategories
              </label>
              <p className="mt-1">{category.children?.length || 0}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Products
              </label>
              <p className="mt-1">{category.productCount || 0}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Customization Options
              </label>
              <p className="mt-1">{customizationOptions.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEO Information */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Information</CardTitle>
          <CardDescription>Search engine optimization settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Meta Title
              </label>
              <p className="mt-1">{category.metaTitle || "Not set"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Meta Description
              </label>
              <p className="mt-1 text-sm">
                {category.metaDescription || "Not set"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Subcategories ({category.children.length})</CardTitle>
            <CardDescription>Direct child categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {category.children.map((child) => (
                <div
                  key={child.id}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() =>
                    router.push(`/dashboard/admin/categories/${child.id}`)
                  }
                >
                  <h4 className="font-medium">{child.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {child.slug}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customization Options */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                Customization Options ({customizationOptions.length})
              </CardTitle>
              <CardDescription>
                Options available for products in this category
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                router.push("/dashboard/admin/customization/options/create")
              }
            >
              <Settings className="mr-2 h-4 w-4" />
              Add Option
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {optionsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : customizationOptions.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No customization options yet
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  router.push("/dashboard/admin/customization/options/create")
                }
              >
                Create First Option
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Option Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Sort Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customizationOptions.map((option) => (
                    <TableRow key={option.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{option.displayName}</p>
                          <p className="text-sm text-muted-foreground">
                            {option.name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{option.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={option.required ? "default" : "secondary"}
                        >
                          {option.required ? "Required" : "Optional"}
                        </Badge>
                      </TableCell>
                      <TableCell>{option.sortOrder}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/dashboard/admin/customization/options/${option.id}`
                            )
                          }
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Products ({category.productCount || 0})</CardTitle>
              <CardDescription>
                Products assigned to this category
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/admin/products")}
            >
              <Package className="mr-2 h-4 w-4" />
              Manage Products
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {category.productCount
                ? `${category.productCount} products in this category`
                : "No products in this category yet"}
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/admin/products")}
            >
              View All Products
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Created
              </label>
              <p className="mt-1 text-sm">{formatDate(category.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Last Updated
              </label>
              <p className="mt-1 text-sm">{formatDate(category.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
