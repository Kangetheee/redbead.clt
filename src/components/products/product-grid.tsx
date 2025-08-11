"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grid3X3, List, LayoutGrid, Grid2X2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductResponse } from "@/lib/products/types/products.types";
import { ProductCard } from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridProps {
  products: ProductResponse[];
  loading?: boolean;
  viewMode?: "grid" | "list";
  allowViewToggle?: boolean;
  gridCols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    "2xl"?: number;
  };
  cardSize?: "sm" | "md" | "lg";
  showAddToCart?: boolean;
  showTemplateList?: boolean;
  showDescription?: boolean;
  showCategory?: boolean;
  showMaterial?: boolean;
  className?: string;
  emptyState?: {
    title?: string;
    description?: string;
    action?: React.ReactNode;
  };
}

export function ProductGrid({
  products,
  loading = false,
  viewMode: initialViewMode = "grid",
  allowViewToggle = false,
  gridCols = { sm: 2, md: 3, lg: 5, xl: 5, "2xl": 5 },
  cardSize = "sm",
  showAddToCart = true,
  showTemplateList = true,
  showDescription = true,
  showCategory = true,
  showMaterial = true,
  className,
  emptyState,
}: ProductGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">(initialViewMode);
  const [gridDensity, setGridDensity] = useState<"comfortable" | "compact">(
    "comfortable"
  );

  // Generate grid classes with better responsive breakpoints
  const getGridClasses = () => {
    const density = gridDensity === "compact" ? 1 : 0;
    const classes = ["grid"];

    // Responsive gap based on density
    if (gridDensity === "compact") {
      classes.push("gap-2 md:gap-3");
    } else {
      classes.push("gap-4 md:gap-4");
    }

    // Enhanced responsive columns
    if (gridCols.sm) classes.push(`grid-cols-${gridCols.sm + density}`);
    if (gridCols.md) classes.push(`md:grid-cols-${gridCols.md + density}`);
    if (gridCols.lg) classes.push(`lg:grid-cols-${gridCols.lg + density}`);
    if (gridCols.xl) classes.push(`xl:grid-cols-${gridCols.xl + density}`);
    if (gridCols["2xl"])
      classes.push(`2xl:grid-cols-${gridCols["2xl"] + density}`);

    return classes.join(" ");
  };

  const containerClasses = viewMode === "grid" ? getGridClasses() : "space-y-3";

  // Determine card size based on density and view mode
  const getCardSize = () => {
    if (viewMode === "list") return "sm";
    if (gridDensity === "compact") {
      return "sm";
    }
    return cardSize === "lg" ? "md" : "sm";
  };

  // Loading state with themed skeleton
  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {allowViewToggle && (
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Loading products...
            </div>
            <div className="flex gap-2">
              <div className="flex border border-border rounded-lg p-1 bg-background">
                <Skeleton className="h-8 w-8 bg-muted" />
                <Skeleton className="h-8 w-8 ml-1 bg-muted" />
              </div>
              <div className="flex border border-border rounded-lg p-1 bg-background">
                <Skeleton className="h-8 w-8 bg-muted" />
                <Skeleton className="h-8 w-8 ml-1 bg-muted" />
              </div>
            </div>
          </div>
        )}

        <div className={viewMode === "grid" ? getGridClasses() : "space-y-3"}>
          {Array.from({ length: gridCols.xl || 4 * 2 }).map((_, i) => (
            <Card key={i} className="animate-pulse border-border bg-card">
              {viewMode === "grid" ? (
                <>
                  <Skeleton className="aspect-square rounded-t-lg bg-muted" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-muted" />
                    <Skeleton className="h-3 w-full bg-muted" />
                    <Skeleton className="h-3 w-2/3 bg-muted" />
                    <Skeleton className="h-8 w-full bg-muted" />
                  </div>
                </>
              ) : (
                <div className="flex">
                  <Skeleton className="w-24 h-24 rounded-l-lg bg-muted" />
                  <div className="flex-1 p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-muted" />
                    <Skeleton className="h-3 w-full bg-muted" />
                    <Skeleton className="h-3 w-2/3 bg-muted" />
                    <Skeleton className="h-6 w-20 bg-muted" />
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Empty state with Red Bead theming
  if (products.length === 0) {
    const defaultEmptyState = {
      title: "No products found",
      description:
        "Try adjusting your filters to discover our amazing custom products.",
    };

    const finalEmptyState = { ...defaultEmptyState, ...emptyState };

    return (
      <div className={cn("space-y-4", className)}>
        {allowViewToggle && (
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              0 products found
            </div>
            <div className="flex gap-2">
              <div className="flex border border-border rounded-lg p-1 bg-background">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={
                    viewMode === "grid"
                      ? "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                      : ""
                  }
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={
                    viewMode === "list"
                      ? "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                      : ""
                  }
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
              <Grid3X3 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              {finalEmptyState.title}
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              {finalEmptyState.description}
            </p>
            {finalEmptyState.action}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Enhanced View Toggle with Density Control */}
      {allowViewToggle && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {products.length} product{products.length !== 1 ? "s" : ""} found
          </div>

          <div className="flex gap-2">
            {/* View Mode Toggle */}
            <div className="flex border border-border rounded-lg p-1 bg-background">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                title="Grid view"
                className={cn(
                  "transition-colors",
                  viewMode === "grid"
                    ? "bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
                    : "hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/30 dark:hover:text-green-400"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                title="List view"
                className={cn(
                  "transition-colors",
                  viewMode === "list"
                    ? "bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
                    : "hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/30 dark:hover:text-green-400"
                )}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Grid Density Toggle (only for grid view) */}
            {viewMode === "grid" && (
              <div className="flex border border-border rounded-lg p-1 bg-background">
                <Button
                  variant={gridDensity === "comfortable" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setGridDensity("comfortable")}
                  title="Comfortable spacing"
                  className={cn(
                    "transition-colors",
                    gridDensity === "comfortable"
                      ? "bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
                      : "hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/30 dark:hover:text-green-400"
                  )}
                >
                  <Grid2X2 className="h-4 w-4" />
                </Button>
                <Button
                  variant={gridDensity === "compact" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setGridDensity("compact")}
                  title="Compact spacing (more products)"
                  className={cn(
                    "transition-colors",
                    gridDensity === "compact"
                      ? "bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
                      : "hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/30 dark:hover:text-green-400"
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products */}
      <div className={containerClasses}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            layout={viewMode}
            size={getCardSize()}
            showAddToCart={showAddToCart}
            showTemplateList={showTemplateList}
            showDescription={showDescription}
            showCategory={showCategory}
            showMaterial={showMaterial}
            className={cn(
              "transition-all duration-200",
              viewMode === "grid" &&
                gridDensity === "compact" &&
                "hover:scale-[1.02]"
            )}
          />
        ))}
      </div>

      {/* Grid Info Footer */}
      {products.length > 0 && (
        <div className="flex justify-center pt-4">
          <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
            Showing {products.length} products
            {viewMode === "grid" && (
              <span className="ml-2">
                • {gridDensity === "compact" ? "Compact" : "Comfortable"} view
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
