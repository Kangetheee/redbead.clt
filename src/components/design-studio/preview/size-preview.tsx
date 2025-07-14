/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ruler, Maximize2, Minimize2 } from "lucide-react";
import { DesignResponse } from "@/lib/design-studio/types/design-studio.types";
import { DesignCanvas } from "../canvas/design-canvas";

interface SizePreviewProps {
  design: DesignResponse;
  availableSizes?: Array<{
    id: string;
    name: string;
    width: number;
    height: number;
    unit: string;
    category: string;
  }>;
}

export function SizePreview({ design, availableSizes = [] }: SizePreviewProps) {
  const [selectedSize, setSelectedSize] = useState(
    availableSizes[0]?.id || "original"
  );
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonSize, setComparisonSize] = useState(
    availableSizes[1]?.id || ""
  );

  // Default size options if none provided
  const defaultSizes = [
    {
      id: "business-card",
      name: "Business Card",
      width: 89,
      height: 51,
      unit: "mm",
      category: "Cards",
    },
    {
      id: "postcard",
      name: "Postcard",
      width: 148,
      height: 105,
      unit: "mm",
      category: "Cards",
    },
    {
      id: "flyer-a4",
      name: "Flyer A4",
      width: 210,
      height: 297,
      unit: "mm",
      category: "Flyers",
    },
    {
      id: "banner-web",
      name: "Web Banner",
      width: 728,
      height: 90,
      unit: "px",
      category: "Digital",
    },
    {
      id: "poster-a3",
      name: "Poster A3",
      width: 297,
      height: 420,
      unit: "mm",
      category: "Posters",
    },
    {
      id: "social-square",
      name: "Social Media Square",
      width: 1080,
      height: 1080,
      unit: "px",
      category: "Social",
    },
    {
      id: "social-story",
      name: "Social Media Story",
      width: 1080,
      height: 1920,
      unit: "px",
      category: "Social",
    },
  ];

  const sizeOptions = availableSizes.length > 0 ? availableSizes : defaultSizes;
  const originalSize = {
    id: "original",
    name: "Original Size",
    width: design.customizations.width,
    height: design.customizations.height,
    unit: "px",
    category: "Original",
  };

  const allSizes = [originalSize, ...sizeOptions];

  const getSelectedSizeData = (sizeId: string) => {
    return allSizes.find((size) => size.id === sizeId) || originalSize;
  };

  const calculateScale = (targetSize: typeof originalSize) => {
    const originalWidth = design.customizations.width;
    const originalHeight = design.customizations.height;

    // Convert units if necessary (simplified conversion)
    let targetWidth = targetSize.width;
    let targetHeight = targetSize.height;

    if (targetSize.unit === "mm" && originalSize.unit === "px") {
      // Rough conversion: 1mm ≈ 3.78px at 96 DPI
      targetWidth *= 3.78;
      targetHeight *= 3.78;
    }

    const scaleX = targetWidth / originalWidth;
    const scaleY = targetHeight / originalHeight;

    return Math.min(scaleX, scaleY); // Maintain aspect ratio
  };

  const selectedSizeData = getSelectedSizeData(selectedSize);
  const comparisonSizeData = comparisonSize
    ? getSelectedSizeData(comparisonSize)
    : null;

  const groupedSizes = allSizes.reduce(
    (groups, size) => {
      const category = size.category || "Other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(size);
      return groups;
    },
    {} as Record<string, typeof allSizes>
  );

  return (
    <div className="w-full space-y-6">
      {/* Size Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Size Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Size</label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(groupedSizes).map(([category, sizes]) => (
                    <div key={category}>
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                        {category}
                      </div>
                      {sizes.map((size) => (
                        <SelectItem key={size.id} value={size.id}>
                          {size.name} ({size.width} × {size.height} {size.unit})
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={comparisonMode ? "default" : "outline"}
                size="sm"
                onClick={() => setComparisonMode(!comparisonMode)}
              >
                Compare Sizes
              </Button>

              {comparisonMode && (
                <Select
                  value={comparisonSize}
                  onValueChange={setComparisonSize}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select size to compare" />
                  </SelectTrigger>
                  <SelectContent>
                    {allSizes
                      .filter((size) => size.id !== selectedSize)
                      .map((size) => (
                        <SelectItem key={size.id} value={size.id}>
                          {size.name} ({size.width} × {size.height} {size.unit})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Size Info */}
            <div className="ml-auto">
              <Badge variant="outline">
                Scale: {Math.round(calculateScale(selectedSizeData) * 100)}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Size Preview</span>
            <div className="text-sm font-normal text-muted-foreground">
              {selectedSizeData.name}: {selectedSizeData.width} ×{" "}
              {selectedSizeData.height} {selectedSizeData.unit}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-8 rounded-lg min-h-[500px]">
            {comparisonMode && comparisonSizeData ? (
              /* Comparison View */
              <div className="flex items-center justify-center gap-8 h-full">
                <div className="text-center">
                  <div className="mb-2">
                    <Badge variant="default">{selectedSizeData.name}</Badge>
                  </div>
                  <div className="bg-white shadow-lg rounded p-4">
                    <DesignCanvas
                      canvas={design.customizations}
                      onCanvasChange={() => {}}
                      selectedLayerId={undefined}
                      onLayerSelect={() => {}}
                      zoom={calculateScale(selectedSizeData) * 0.5}
                      readonly
                    />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {selectedSizeData.width} × {selectedSizeData.height}{" "}
                    {selectedSizeData.unit}
                  </div>
                </div>

                <div className="text-center">
                  <div className="mb-2">
                    <Badge variant="outline">{comparisonSizeData.name}</Badge>
                  </div>
                  <div className="bg-white shadow-lg rounded p-4">
                    <DesignCanvas
                      canvas={design.customizations}
                      onCanvasChange={() => {}}
                      selectedLayerId={undefined}
                      onLayerSelect={() => {}}
                      zoom={calculateScale(comparisonSizeData) * 0.5}
                      readonly
                    />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {comparisonSizeData.width} × {comparisonSizeData.height}{" "}
                    {comparisonSizeData.unit}
                  </div>
                </div>
              </div>
            ) : (
              /* Single Size View */
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="bg-white shadow-lg rounded p-4 mb-4">
                    <DesignCanvas
                      canvas={design.customizations}
                      onCanvasChange={() => {}}
                      selectedLayerId={undefined}
                      onLayerSelect={() => {}}
                      zoom={calculateScale(selectedSizeData)}
                      readonly
                    />
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>
                      Target Size: {selectedSizeData.width} ×{" "}
                      {selectedSizeData.height} {selectedSizeData.unit}
                    </div>
                    <div>
                      Scale Factor:{" "}
                      {Math.round(calculateScale(selectedSizeData) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Size Information */}
      <Card>
        <CardHeader>
          <CardTitle>Size Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Original Design</div>
              <div className="text-2xl font-bold">
                {design.customizations.width} × {design.customizations.height}
              </div>
              <div className="text-sm text-muted-foreground">pixels</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Selected Size</div>
              <div className="text-2xl font-bold">
                {selectedSizeData.width} × {selectedSizeData.height}
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedSizeData.unit}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Scale Factor</div>
              <div className="text-2xl font-bold">
                {Math.round(calculateScale(selectedSizeData) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {calculateScale(selectedSizeData) > 1
                  ? "Upscaled"
                  : "Downscaled"}
              </div>
            </div>
          </div>

          {/* Quality Warning */}
          {calculateScale(selectedSizeData) > 2 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <Maximize2 className="h-4 w-4" />
                <span className="text-sm font-medium">Quality Warning</span>
              </div>
              <div className="text-sm text-yellow-700 mt-1">
                The design is being scaled up significantly. Consider using a
                higher resolution original or vector graphics for better
                quality.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
