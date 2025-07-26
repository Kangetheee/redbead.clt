/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  TreePine,
} from "lucide-react";
import { useCategories, useCategoriesTree } from "@/hooks/use-categories";
import {
  CategoryTreeResponse,
  CategoryWithRelations,
} from "@/lib/categories/types/categories.types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoriesContentProps {
  searchQuery?: string;
  viewMode: "grid" | "tree";
}

export default function CategoriesContent({
  searchQuery = "",
  viewMode = "grid",
}: CategoriesContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchQuery);
  const [currentViewMode, setCurrentViewMode] = useState<"grid" | "tree">(
    viewMode
  );

  // Fetch categories based on view mode
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useCategories();

  const {
    data: treeData,
    isLoading: isLoadingTree,
    error: treeError,
  } = useCategoriesTree();

  const isLoading =
    currentViewMode === "grid" ? isLoadingCategories : isLoadingTree;
  const error = currentViewMode === "grid" ? categoriesError : treeError;

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

  const handleViewModeChange = (mode: "grid" | "tree") => {
    setCurrentViewMode(mode);
    const params = new URLSearchParams(searchParams);
    params.set("view", mode);
    router.push(`/categories?${params.toString()}`);
  };

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
            variant={currentViewMode === "tree" ? "default" : "outline"}
            size="sm"
            onClick={() => handleViewModeChange("tree")}
          >
            <TreePine className="h-4 w-4 mr-2" />
            Tree
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Content */}
      {!isLoading && (
        <>
          {currentViewMode === "grid" && categoriesData && (
            <CategoriesGrid categories={categoriesData.items} />
          )}

          {currentViewMode === "tree" && treeData && (
            <CategoriesTree categories={treeData} />
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading &&
        ((currentViewMode === "grid" && categoriesData?.items.length === 0) ||
          (currentViewMode === "tree" && treeData?.length === 0)) && (
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

function CategoriesTree({
  categories,
}: {
  categories: CategoryTreeResponse[];
}) {
  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <TreeCategoryCard key={category.id} category={category} level={0} />
      ))}
    </div>
  );
}

function CategoryCard({ category }: { category: CategoryWithRelations }) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {category.name}
            </CardTitle>
            {category.parent && (
              <p className="text-sm text-muted-foreground mt-1">
                in {category.parent.name}
              </p>
            )}
          </div>
          <Badge variant="secondary">{category.productCount} products</Badge>
        </div>
      </CardHeader>

      <CardContent>
        {category.thumbnailImage && (
          <div className="relative h-32 mb-4 rounded-md overflow-hidden bg-muted">
            <Image
              src={category.thumbnailImage}
              alt={category.name}
              fill
              className="object-cover"
            />
          </div>
        )}

        {category.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {category.description}
          </p>
        )}

        {category.children.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
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

        <Link href={`/categories/${category.slug}`} className="block">
          <Button className="w-full group">
            Browse Category
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function TreeCategoryCard({
  category,
  level,
}: {
  category: CategoryTreeResponse;
  level: number;
}) {
  return (
    <div className={cn("space-y-2", level > 0 && "ml-6")}>
      <Card className="group hover:shadow-sm transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-1 h-8 rounded-full",
                  level === 0 ? "bg-primary" : "bg-muted-foreground"
                )}
              />
              <div>
                <Link
                  href={`/categories/${category.slug}`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {category.name}
                </Link>
                {category.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {category.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {category.productCount} products
              </Badge>
              <Link href={`/categories/${category.slug}`}>
                <Button variant="ghost" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {category.children.length > 0 && (
        <div className="space-y-2">
          {category.children.map((child) => (
            <TreeCategoryCard
              key={child.id}
              category={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryCardSkeleton() {
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
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}
