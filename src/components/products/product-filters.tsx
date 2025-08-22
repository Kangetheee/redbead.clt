/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, SlidersHorizontal } from "lucide-react";

interface ProductFiltersProps {
  onFilterChange: (filters: ProductFilterState) => void;
  currentFilters: ProductFilterState;
}

export interface ProductFilterState {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isActive?: boolean;
}

export function ProductFilters({
  onFilterChange,
  currentFilters,
}: ProductFiltersProps) {
  const [localFilters, setLocalFilters] =
    useState<ProductFilterState>(currentFilters);

  const handleFilterUpdate = (key: keyof ProductFilterState, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: ProductFilterState = {};
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const activeFiltersCount =
    Object.values(currentFilters).filter(Boolean).length;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-foreground">
            <SlidersHorizontal className="h-4 w-4 text-green-600 dark:text-green-400" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-4">
        {/* Mobile: Single row layout */}
        <div className="flex flex-wrap items-center gap-2 md:hidden">
          {/* Search */}
          <div className="flex-1 min-w-[120px]">
            <Input
              id="search-mobile"
              placeholder="Search..."
              value={localFilters.search || ""}
              onChange={(e) =>
                handleFilterUpdate("search", e.target.value || undefined)
              }
              className="h-8 text-sm border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Price inputs */}
          <div className="flex gap-1">
            <Input
              type="number"
              placeholder="Min"
              value={localFilters.minPrice || ""}
              onChange={(e) =>
                handleFilterUpdate(
                  "minPrice",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="h-8 w-16 text-sm border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
            <Input
              type="number"
              placeholder="Max"
              value={localFilters.maxPrice || ""}
              onChange={(e) =>
                handleFilterUpdate(
                  "maxPrice",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="h-8 w-16 text-sm border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex items-center space-x-1">
            <Checkbox
              id="featured-mobile"
              checked={localFilters.isFeatured || false}
              onCheckedChange={(checked) =>
                handleFilterUpdate("isFeatured", checked || undefined)
              }
            />
            <Label
              htmlFor="featured-mobile"
              className="text-xs text-foreground"
            >
              Featured
            </Label>
          </div>

          <div className="flex items-center space-x-1">
            <Checkbox
              id="active-mobile"
              checked={localFilters.isActive !== false}
              onCheckedChange={(checked) =>
                handleFilterUpdate(
                  "isActive",
                  checked === false ? false : undefined
                )
              }
            />
            <Label htmlFor="active-mobile" className="text-xs text-foreground">
              Available
            </Label>
          </div>
        </div>

        <div className="hidden md:block space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-foreground">
              Search Products
            </Label>
            <Input
              id="search"
              placeholder="Search by name, description..."
              value={localFilters.search || ""}
              onChange={(e) =>
                handleFilterUpdate("search", e.target.value || undefined)
              }
              className="border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <Label className="text-foreground">Price Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label
                  htmlFor="minPrice"
                  className="text-xs text-muted-foreground"
                >
                  Min Price
                </Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="0"
                  value={localFilters.minPrice || ""}
                  onChange={(e) =>
                    handleFilterUpdate(
                      "minPrice",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="maxPrice"
                  className="text-xs text-muted-foreground"
                >
                  Max Price
                </Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="1000"
                  value={localFilters.maxPrice || ""}
                  onChange={(e) =>
                    handleFilterUpdate(
                      "maxPrice",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>

          {/* Featured Products */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={localFilters.isFeatured || false}
              onCheckedChange={(checked) =>
                handleFilterUpdate("isFeatured", checked || undefined)
              }
            />
            <Label
              htmlFor="featured"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
            >
              Featured products only
            </Label>
          </div>

          {/* Active Products */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="active"
              checked={localFilters.isActive !== false}
              onCheckedChange={(checked) =>
                handleFilterUpdate(
                  "isActive",
                  checked === false ? false : undefined
                )
              }
            />
            <Label
              htmlFor="active"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
            >
              Available products only
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
