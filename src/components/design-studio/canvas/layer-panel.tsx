/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Eye,
  EyeOff,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Type,
  Image,
  Square,
  Circle,
  GripVertical,
} from "lucide-react";
import {
  CanvasLayer,
  CanvasData,
} from "@/lib/design-studio/types/design-studio.types";
import { cn } from "@/lib/utils";

interface LayerPanelProps {
  canvas: CanvasData;
  onCanvasChange: (canvas: CanvasData) => void;
  selectedLayerId?: string;
  onLayerSelect: (layerId: string | null) => void;
}

export function LayerPanel({
  canvas,
  onCanvasChange,
  selectedLayerId,
  onLayerSelect,
}: LayerPanelProps) {
  const sortedLayers = [...canvas.layers].sort(
    (a, b) => (b.zIndex || 0) - (a.zIndex || 0)
  );

  const updateLayer = (layerId: string, updates: Partial<CanvasLayer>) => {
    const updatedLayers = canvas.layers.map((layer) =>
      layer.id === layerId ? { ...layer, ...updates } : layer
    );
    onCanvasChange({ ...canvas, layers: updatedLayers });
  };

  const deleteLayer = (layerId: string) => {
    const updatedLayers = canvas.layers.filter((layer) => layer.id !== layerId);
    onCanvasChange({ ...canvas, layers: updatedLayers });

    if (selectedLayerId === layerId) {
      onLayerSelect(null);
    }
  };

  const duplicateLayer = (layerId: string) => {
    const layer = canvas.layers.find((l) => l.id === layerId);
    if (!layer) return;

    const newLayer: CanvasLayer = {
      ...layer,
      id: `${layer.id}_copy_${Date.now()}`,
      x: layer.x + 10,
      y: layer.y + 10,
    };

    const updatedLayers = [...canvas.layers, newLayer];
    onCanvasChange({ ...canvas, layers: updatedLayers });
  };

  const moveLayer = (layerId: string, direction: "up" | "down") => {
    const layer = canvas.layers.find((l) => l.id === layerId);
    if (!layer) return;

    const currentZIndex = layer.zIndex || 0;
    const newZIndex =
      direction === "up" ? currentZIndex + 1 : currentZIndex - 1;

    updateLayer(layerId, { zIndex: newZIndex });
  };

  const toggleLayerVisibility = (layerId: string) => {
    const layer = canvas.layers.find((l) => l.id === layerId);
    if (!layer) return;

    updateLayer(layerId, { visible: layer.visible !== false ? false : true });
  };

  const getLayerIcon = (type: string) => {
    switch (type) {
      case "text":
        return Type;
      case "image":
        return Image;
      case "shape":
        return Square;
      case "circle":
        return Circle;
      default:
        return Square;
    }
  };

  const getLayerName = (layer: CanvasLayer): string => {
    switch (layer.type) {
      case "text": {
        const props = layer.properties as { text?: string };
        return props?.text || "Text Layer";
      }
      case "image": {
        const props = layer.properties as { alt?: string };
        return props?.alt || "Image Layer";
      }
      case "shape": {
        const props = layer.properties as { shapeType?: string };
        return `${props?.shapeType || "Shape"} Layer`;
      }
      default:
        return `${layer.type} Layer`;
    }
  };

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="text-lg">Layers</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {sortedLayers.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No layers yet. Add some content to your design.
            </div>
          ) : (
            sortedLayers.map((layer) => {
              const Icon = getLayerIcon(layer.type);
              const isSelected = selectedLayerId === layer.id;
              const isVisible = layer.visible !== false;

              return (
                <div
                  key={layer.id}
                  className={cn(
                    "flex items-center gap-2 p-2 hover:bg-accent cursor-pointer border-l-2",
                    isSelected
                      ? "bg-accent border-l-primary"
                      : "border-l-transparent"
                  )}
                  onClick={() => onLayerSelect(layer.id)}
                >
                  {/* Drag Handle */}
                  <GripVertical className="h-4 w-4 text-muted-foreground" />

                  {/* Layer Icon */}
                  <Icon className="h-4 w-4 text-muted-foreground" />

                  {/* Layer Name */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        "text-sm truncate",
                        !isVisible && "opacity-50"
                      )}
                    >
                      {getLayerName(layer)}
                    </div>
                  </div>

                  {/* Layer Controls */}
                  <div className="flex items-center gap-1">
                    {/* Visibility Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLayerVisibility(layer.id);
                      }}
                    >
                      {isVisible ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                    </Button>

                    {/* Move Up */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayer(layer.id, "up");
                      }}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>

                    {/* Move Down */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayer(layer.id, "down");
                      }}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>

                    {/* Duplicate */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateLayer(layer.id);
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLayer(layer.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
