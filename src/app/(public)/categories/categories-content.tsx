"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Grid,
  List,
  ChevronRight,
  Package,
  ArrowRight,
  FolderOpen,
} from "lucide-react";
import { useCategories } from "@/hooks/use-categories";
import { CategoryWithRelations } from "@/lib/categories/types/categories.types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoriesContentProps {
  searchQuery?: string;
  viewMode: "grid" | "list";
}

export default function CategoriesContent({
  searchQuery = "",
  viewMode = "grid",
}: CategoriesContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchQuery);
  const [currentViewMode, setCurrentViewMode] = useState<"grid" | "list">(
    viewMode
  );

  // Fetch categories
  const {
    data: categoriesResponse,
    isLoading,
    error,
  } = useCategories({
    search: search || undefined,
    isActive: true,
  });

  const categories = categoriesResponse?.items ? categoriesResponse.items : [];

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`/categories?${params.toString()}`);
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setCurrentViewMode(mode);
    const params = new URLSearchParams(searchParams);
    params.set("view", mode);
    router.push(`/categories?${params.toString()}`);
  };

  // Organize categories into parent and children structure
  const { parentCategories, childCategories } = categories.reduce(
    (acc, category) => {
      if (!category.parentId) {
        acc.parentCategories.push(category);
      } else {
        acc.childCategories.push(category);
      }
      return acc;
    },
    {
      parentCategories: [] as CategoryWithRelations[],
      childCategories: [] as CategoryWithRelations[],
    }
  );

  if (error) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Failed to load categories
        </h3>
        <p className="text-muted-foreground mb-4">
          We&apos;re having trouble loading the categories. Please try again.
        </p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={currentViewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => handleViewModeChange("grid")}
          >
            <Grid className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={currentViewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => handleViewModeChange("list")}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Stats */}
      {!isLoading && categories.length > 0 && (
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{categories.length} total categories</span>
          <span>{parentCategories.length} main categories</span>
          <span>{childCategories.length} subcategories</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div
          className={cn(
            currentViewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          )}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <CategoryCardSkeleton key={i} viewMode={currentViewMode} />
          ))}
        </div>
      )}

      {/* Content */}
      {!isLoading && categories.length > 0 && (
        <>
          {currentViewMode === "grid" && (
            <CategoriesGrid categories={categories} />
          )}

          {currentViewMode === "list" && (
            <CategoriesList categories={categories} />
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && categories.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No categories found</h3>
          <p className="text-muted-foreground">
            {search
              ? "Try adjusting your search terms."
              : "No categories are available at the moment."}
          </p>
        </div>
      )}
    </div>
  );
}

function CategoriesGrid({
  categories,
}: {
  categories: CategoryWithRelations[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}

function CategoriesList({
  categories,
}: {
  categories: CategoryWithRelations[];
}) {
  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <CategoryListItem key={category.id} category={category} />
      ))}
    </div>
  );
}

function CategoryCard({ category }: { category: CategoryWithRelations }) {
  return (
    <Card className="group hover:shadow-md transition-shadow h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
              {category.name}
            </CardTitle>
            {category.parent && (
              <p className="text-sm text-muted-foreground mt-1">
                in {category.parent.name}
              </p>
            )}
          </div>
          <Badge variant="secondary" className="flex-shrink-0">
            {category.productCount}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {category.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
            {category.description}
          </p>
        )}

        {category.children.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <FolderOpen className="h-3 w-3" />
              Subcategories:
            </p>
            <div className="flex flex-wrap gap-1">
              {category.children.slice(0, 3).map((child) => (
                <Badge key={child.id} variant="outline" className="text-xs">
                  {child.name}
                </Badge>
              ))}
              {category.children.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{category.children.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <Link href={`/categories/${category.slug}`} className="mt-auto">
          <Button className="w-full group">
            Browse Category
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function CategoryListItem({ category }: { category: CategoryWithRelations }) {
  return (
    <Card className="group hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-1 h-12 bg-primary rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={`/categories/${category.slug}`}
                  className="font-medium hover:text-primary transition-colors line-clamp-1"
                >
                  {category.name}
                </Link>
                {category.parent && (
                  <span className="text-sm text-muted-foreground">
                    in {category.parent.name}
                  </span>
                )}
              </div>

              {category.description && (
                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                  {category.description}
                </p>
              )}

              {category.children.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {category.children.slice(0, 4).map((child) => (
                    <Badge key={child.id} variant="outline" className="text-xs">
                      {child.name}
                    </Badge>
                  ))}
                  {category.children.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{category.children.length - 4} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Badge variant="secondary" className="text-xs">
              {category.productCount} products
            </Badge>
            <Link href={`/categories/${category.slug}`}>
              <Button variant="ghost" size="sm" className="group">
                Browse
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryCardSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-1 h-12" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-1">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-16 w-full mb-4" />
        <div className="space-y-2 mb-4">
          <Skeleton className="h-3 w-20" />
          <div className="flex gap-1">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}
