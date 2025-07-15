/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Lock,
  Unlock,
} from "lucide-react";
import {
  CanvasLayer,
  CanvasData,
} from "@/lib/design-studio/types/design-studio.types";
import { cn } from "@/lib/utils";

interface LayerPanelProps {
  canvas: CanvasData;
  onCanvasChange: (canvas: CanvasData) => void;
  selectedLayerId?: string | null; // Fixed: allow null
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

  const updateLayerProperties = (
    layerId: string,
    properties: Record<string, any>
  ) => {
    const layer = canvas.layers.find((l) => l.id === layerId);
    if (!layer) return;

    const updatedLayers = canvas.layers.map((l) =>
      l.id === layerId
        ? { ...l, properties: { ...l.properties, ...properties } }
        : l
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
      zIndex: Math.max(...canvas.layers.map((l) => l.zIndex || 0)) + 1,
    };

    const updatedLayers = [...canvas.layers, newLayer];
    onCanvasChange({ ...canvas, layers: updatedLayers });
    onLayerSelect(newLayer.id);
  };

  const moveLayer = (layerId: string, direction: "up" | "down") => {
    const layer = canvas.layers.find((l) => l.id === layerId);
    if (!layer) return;

    const currentZIndex = layer.zIndex || 0;
    const newZIndex =
      direction === "up" ? currentZIndex + 1 : Math.max(0, currentZIndex - 1);

    updateLayer(layerId, { zIndex: newZIndex });
  };

  const toggleLayerVisibility = (layerId: string) => {
    const layer = canvas.layers.find((l) => l.id === layerId);
    if (!layer) return;

    updateLayer(layerId, { visible: layer.visible !== false ? false : true });
  };

  const toggleLayerLock = (layerId: string) => {
    const layer = canvas.layers.find((l) => l.id === layerId);
    if (!layer) return;

    const isLocked = (layer.properties as any)?.locked ?? false;
    updateLayerProperties(layerId, { locked: !isLocked });
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
        return (
          props?.text?.slice(0, 20) +
            (props?.text && props.text.length > 20 ? "..." : "") || "Text Layer"
        );
      }
      case "image": {
        const props = layer.properties as { alt?: string; name?: string };
        return props?.alt || props?.name || "Image Layer";
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
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          Layers
          <span className="text-sm font-normal text-muted-foreground">
            {canvas.layers.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {sortedLayers.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Square className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No layers yet</p>
              <p className="text-xs">Add content to your design</p>
            </div>
          ) : (
            sortedLayers.map((layer, index) => {
              const Icon = getLayerIcon(layer.type);
              const isSelected = selectedLayerId === layer.id;
              const isVisible = layer.visible !== false;
              const isLocked = (layer.properties as any)?.locked ?? false;

              return (
                <div
                  key={layer.id}
                  className={cn(
                    "flex items-center gap-2 p-2 hover:bg-accent cursor-pointer border-l-2 mx-2 rounded-r transition-colors",
                    isSelected
                      ? "bg-accent border-l-primary"
                      : "border-l-transparent",
                    !isVisible && "opacity-60",
                    isLocked && "bg-muted/50"
                  )}
                  onClick={() => onLayerSelect(layer.id)}
                >
                  {/* Drag Handle */}
                  <GripVertical className="h-4 w-4 text-muted-foreground" />

                  {/* Layer Icon */}
                  <div className="relative">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {isLocked && (
                      <Lock className="h-2 w-2 absolute -top-1 -right-1 text-red-500" />
                    )}
                  </div>

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
                    <div className="text-xs text-muted-foreground">
                      {layer.type} • {Math.round(layer.x)},{Math.round(layer.y)}
                    </div>
                  </div>

                  {/* Layer Controls */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Lock Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLayerLock(layer.id);
                      }}
                    >
                      {isLocked ? (
                        <Lock className="h-3 w-3 text-red-500" />
                      ) : (
                        <Unlock className="h-3 w-3" />
                      )}
                    </Button>

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
                      disabled={index === 0}
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
                      disabled={index === sortedLayers.length - 1}
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
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Delete this layer?")) {
                          deleteLayer(layer.id);
                        }
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

        {/* Layer Statistics */}
        {canvas.layers.length > 0 && (
          <div className="p-3 border-t bg-muted/30">
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Total Layers:</span>
                <span>{canvas.layers.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Visible:</span>
                <span>
                  {canvas.layers.filter((l) => l.visible !== false).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Locked:</span>
                <span>
                  {
                    canvas.layers.filter((l) => (l.properties as any)?.locked)
                      .length
                  }
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
