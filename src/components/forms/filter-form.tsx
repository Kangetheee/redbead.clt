/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";

interface FilterOption {
  id: string;
  label: string;
  type: "select" | "checkbox" | "range" | "text";
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  defaultValue?: any;
}

interface FilterFormProps {
  filters: FilterOption[];
  onFiltersChange: (filters: Record<string, any>) => void;
  showClearAll?: boolean;
}

export function FilterForm({
  filters,
  onFiltersChange,
  showClearAll = true,
}: FilterFormProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  const handleFilterChange = (filterId: string, value: any) => {
    const newFilters = { ...activeFilters };

    if (value === null || value === undefined || value === "") {
      delete newFilters[filterId];
    } else {
      newFilters[filterId] = value;
    }

    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    onFiltersChange({});
  };

  const clearFilter = (filterId: string) => {
    handleFilterChange(filterId, null);
  };

  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).length;
  };

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <span className="font-medium">Filters</span>
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary">{getActiveFilterCount()}</Badge>
          )}
        </div>
        {showClearAll && getActiveFilterCount() > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([filterId, value]) => {
            const filter = filters.find((f) => f.id === filterId);
            if (!filter) return null;

            let displayValue = value;
            if (filter.type === "select" && filter.options) {
              const option = filter.options.find((o) => o.value === value);
              displayValue = option?.label || value;
            } else if (filter.type === "range" && Array.isArray(value)) {
              displayValue = `${value[0]} - ${value[1]}`;
            }

            return (
              <Badge
                key={filterId}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {filter.label}: {displayValue}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => clearFilter(filterId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Filter Controls */}
      <div className="space-y-4">
        {filters.map((filter) => (
          <div key={filter.id} className="space-y-2">
            <Label>{filter.label}</Label>

            {filter.type === "select" && (
              <Select
                value={activeFilters[filter.id] || ""}
                onValueChange={(value) => handleFilterChange(filter.id, value)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={`Select ${filter.label.toLowerCase()}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {filter.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {filter.type === "checkbox" && filter.options && (
              <div className="space-y-2">
                {filter.options.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`${filter.id}-${option.value}`}
                      checked={(activeFilters[filter.id] || []).includes(
                        option.value
                      )}
                      onCheckedChange={(checked) => {
                        const currentValues = activeFilters[filter.id] || [];
                        if (checked) {
                          handleFilterChange(filter.id, [
                            ...currentValues,
                            option.value,
                          ]);
                        } else {
                          handleFilterChange(
                            filter.id,
                            currentValues.filter(
                              (v: string) => v !== option.value
                            )
                          );
                        }
                      }}
                    />
                    <Label htmlFor={`${filter.id}-${option.value}`}>
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {filter.type === "range" &&
              filter.min !== undefined &&
              filter.max !== undefined && (
                <div className="space-y-2">
                  <Slider
                    value={activeFilters[filter.id] || [filter.min, filter.max]}
                    onValueChange={(value) =>
                      handleFilterChange(filter.id, value)
                    }
                    min={filter.min}
                    max={filter.max}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{filter.min}</span>
                    <span>{filter.max}</span>
                  </div>
                </div>
              )}

            {filter.type === "text" && (
              <Input
                value={activeFilters[filter.id] || ""}
                onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                placeholder={`Enter ${filter.label.toLowerCase()}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
