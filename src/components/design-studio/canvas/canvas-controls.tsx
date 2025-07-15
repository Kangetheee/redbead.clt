/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Move,
  Hand,
  Square,
  Circle,
  Type,
  Image,
  Save,
  Download,
  Undo,
  Redo,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
} from "lucide-react";
import { useState } from "react";
import type { CanvasLayer } from "@/lib/design-studio/types/design-studio.types";

interface CanvasControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  tool: string;
  onToolChange: (tool: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  // Added missing props
  selectedLayer?: CanvasLayer | null;
  onLayerUpdate?: (layerId: string, updates: Partial<CanvasLayer>) => void;
  onLayerDelete?: (layerId: string) => void;
  onLayerDuplicate?: (layerId: string) => void;
  onLayerReorder?: (
    layerId: string,
    direction: "up" | "down" | "top" | "bottom"
  ) => void;
}

export function CanvasControls({
  zoom,
  onZoomChange,
  tool,
  onToolChange,
  onUndo,
  onRedo,
  onSave,
  onExport,
  canUndo = false,
  canRedo = false,
  selectedLayer,
  onLayerUpdate,
  onLayerDelete,
  onLayerDuplicate,
  onLayerReorder,
}: CanvasControlsProps) {
  const [showZoomSlider, setShowZoomSlider] = useState(false);

  const tools = [
    { id: "select", label: "Select", icon: Move },
    { id: "pan", label: "Pan", icon: Hand },
    { id: "text", label: "Text", icon: Type },
    { id: "image", label: "Image", icon: Image },
    { id: "rectangle", label: "Rectangle", icon: Square },
    { id: "circle", label: "Circle", icon: Circle },
  ];

  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom * 1.2, 5));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom / 1.2, 0.1));
  };

  const handleZoomReset = () => {
    onZoomChange(1);
  };

  const handleLayerPropertyChange = (property: string, value: any) => {
    if (selectedLayer && onLayerUpdate) {
      onLayerUpdate(selectedLayer.id, { [property]: value });
    }
  };

  const handleLayerPropertiesChange = (properties: Record<string, any>) => {
    if (selectedLayer && onLayerUpdate) {
      onLayerUpdate(selectedLayer.id, {
        properties: { ...selectedLayer.properties, ...properties },
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Tools */}
      <Card>
        <CardContent className="p-3">
          <div className="space-y-3">
            <div className="text-sm font-medium">Tools</div>
            {/* Tool Selection */}
            <div className="grid grid-cols-2 gap-2">
              {tools.map((toolItem) => {
                const Icon = toolItem.icon;
                return (
                  <Button
                    key={toolItem.id}
                    variant={tool === toolItem.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => onToolChange(toolItem.id)}
                    className="justify-start"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {toolItem.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Controls */}
      <Card>
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="text-sm font-medium">History</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onUndo}
                disabled={!canUndo}
                className="flex-1"
              >
                <Undo className="h-4 w-4 mr-2" />
                Undo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onRedo}
                disabled={!canRedo}
                className="flex-1"
              >
                <Redo className="h-4 w-4 mr-2" />
                Redo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layer Properties */}
      {selectedLayer && (
        <Card>
          <CardContent className="p-3">
            <div className="space-y-3">
              <div className="text-sm font-medium">Layer Properties</div>

              {/* Layer Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onLayerDuplicate?.(selectedLayer.id)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onLayerDelete?.(selectedLayer.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>

              {/* Layer Order */}
              <div className="space-y-2">
                <Label className="text-xs">Layer Order</Label>
                <div className="grid grid-cols-4 gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onLayerReorder?.(selectedLayer.id, "top")}
                  >
                    <ChevronsUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onLayerReorder?.(selectedLayer.id, "up")}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onLayerReorder?.(selectedLayer.id, "down")}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onLayerReorder?.(selectedLayer.id, "bottom")}
                  >
                    <ChevronsDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Position & Size */}
              <div className="space-y-2">
                <Label className="text-xs">Position & Size</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">X</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedLayer.x)}
                      onChange={(e) =>
                        handleLayerPropertyChange(
                          "x",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Y</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedLayer.y)}
                      onChange={(e) =>
                        handleLayerPropertyChange(
                          "y",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Width
                    </Label>
                    <Input
                      type="number"
                      value={Math.round(selectedLayer.width)}
                      onChange={(e) =>
                        handleLayerPropertyChange(
                          "width",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Height
                    </Label>
                    <Input
                      type="number"
                      value={Math.round(selectedLayer.height)}
                      onChange={(e) =>
                        handleLayerPropertyChange(
                          "height",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Opacity */}
              <div className="space-y-2">
                <Label className="text-xs">
                  Opacity: {Math.round((selectedLayer.opacity ?? 1) * 100)}%
                </Label>
                <Slider
                  value={[(selectedLayer.opacity ?? 1) * 100]}
                  onValueChange={([value]) =>
                    handleLayerPropertyChange("opacity", value / 100)
                  }
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Rotation */}
              <div className="space-y-2">
                <Label className="text-xs">
                  Rotation: {selectedLayer.rotation || 0}°
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={selectedLayer.rotation || 0}
                    onChange={(e) =>
                      handleLayerPropertyChange(
                        "rotation",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="h-8 text-xs flex-1"
                    min={-360}
                    max={360}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleLayerPropertyChange(
                        "rotation",
                        (selectedLayer.rotation || 0) - 90
                      )
                    }
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleLayerPropertyChange(
                        "rotation",
                        (selectedLayer.rotation || 0) + 90
                      )
                    }
                  >
                    <RotateCw className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Visibility & Lock */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleLayerPropertyChange(
                      "visible",
                      !(selectedLayer.visible ?? true)
                    )
                  }
                  className="flex-1"
                >
                  {selectedLayer.visible !== false ? (
                    <>
                      <Eye className="h-4 w-4 mr-1" /> Visible
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" /> Hidden
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Handle locked property in properties object since it's not in the base type
                    const isLocked =
                      (selectedLayer.properties as any)?.locked ?? false;
                    handleLayerPropertiesChange({ locked: !isLocked });
                  }}
                  className="flex-1"
                >
                  {(selectedLayer.properties as any)?.locked ? (
                    <>
                      <Lock className="h-4 w-4 mr-1" /> Locked
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4 mr-1" /> Unlocked
                    </>
                  )}
                </Button>
              </div>

              {/* Type-specific properties */}
              {selectedLayer.type === "text" && (
                <div className="space-y-2">
                  <Separator />
                  <Label className="text-xs">Text Properties</Label>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Text
                    </Label>
                    <Input
                      value={(selectedLayer.properties as any)?.text || ""}
                      onChange={(e) =>
                        handleLayerPropertiesChange({ text: e.target.value })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Font Size
                    </Label>
                    <Input
                      type="number"
                      value={(selectedLayer.properties as any)?.fontSize || 16}
                      onChange={(e) =>
                        handleLayerPropertiesChange({
                          fontSize: parseInt(e.target.value) || 16,
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Color
                    </Label>
                    <Input
                      type="color"
                      value={
                        (selectedLayer.properties as any)?.color || "#000000"
                      }
                      onChange={(e) =>
                        handleLayerPropertiesChange({ color: e.target.value })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}

              {selectedLayer.type === "shape" && (
                <div className="space-y-2">
                  <Separator />
                  <Label className="text-xs">Shape Properties</Label>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Fill Color
                    </Label>
                    <Input
                      type="color"
                      value={
                        (selectedLayer.properties as any)?.fillColor ||
                        "#000000"
                      }
                      onChange={(e) =>
                        handleLayerPropertiesChange({
                          fillColor: e.target.value,
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Stroke Color
                    </Label>
                    <Input
                      type="color"
                      value={
                        (selectedLayer.properties as any)?.strokeColor ||
                        "#000000"
                      }
                      onChange={(e) =>
                        handleLayerPropertiesChange({
                          strokeColor: e.target.value,
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Stroke Width
                    </Label>
                    <Input
                      type="number"
                      value={
                        (selectedLayer.properties as any)?.strokeWidth || 0
                      }
                      onChange={(e) =>
                        handleLayerPropertiesChange({
                          strokeWidth: parseInt(e.target.value) || 0,
                        })
                      }
                      className="h-8 text-xs"
                      min={0}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Zoom Controls */}
      <Card>
        <CardContent className="p-3">
          <div className="space-y-3">
            <div className="text-sm font-medium">Zoom</div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomReset}
                className="min-w-[60px]"
              >
                {Math.round(zoom * 100)}%
              </Button>

              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {/* Zoom Slider */}
            <div className="space-y-2">
              <Slider
                value={[zoom]}
                onValueChange={([value]) => onZoomChange(value)}
                min={0.1}
                max={5}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10%</span>
                <span>500%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="text-sm font-medium">Actions</div>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onSave}
                className="w-full justify-start"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Design
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
