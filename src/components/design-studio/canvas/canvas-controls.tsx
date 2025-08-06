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
import type { CanvasElement } from "@/lib/design-studio/types/design-studio.types";

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
  selectedElement?: CanvasElement | null;
  onElementUpdate?: (
    elementId: string,
    updates: Partial<CanvasElement>
  ) => void;
  onElementDelete?: (elementId: string) => void;
  onElementDuplicate?: (elementId: string) => void;
  onElementReorder?: (
    elementId: string,
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
  selectedElement,
  onElementUpdate,
  onElementDelete,
  onElementDuplicate,
  onElementReorder,
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

  const handleElementPropertyChange = (property: string, value: any) => {
    if (selectedElement && onElementUpdate) {
      onElementUpdate(selectedElement.id, { [property]: value });
    }
  };

  const handleElementPropertiesChange = (properties: Record<string, any>) => {
    if (selectedElement && onElementUpdate) {
      onElementUpdate(selectedElement.id, {
        properties: { ...selectedElement.properties, ...properties },
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

      {/* Element Properties */}
      {selectedElement && (
        <Card>
          <CardContent className="p-3">
            <div className="space-y-3">
              <div className="text-sm font-medium">Element Properties</div>

              {/* Element Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onElementDuplicate?.(selectedElement.id)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onElementDelete?.(selectedElement.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>

              {/* Element Order */}
              <div className="space-y-2">
                <Label className="text-xs">Element Order</Label>
                <div className="grid grid-cols-4 gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onElementReorder?.(selectedElement.id, "top")
                    }
                  >
                    <ChevronsUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onElementReorder?.(selectedElement.id, "up")}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onElementReorder?.(selectedElement.id, "down")
                    }
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onElementReorder?.(selectedElement.id, "bottom")
                    }
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
                      value={Math.round(selectedElement.x)}
                      onChange={(e) =>
                        handleElementPropertyChange(
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
                      value={Math.round(selectedElement.y)}
                      onChange={(e) =>
                        handleElementPropertyChange(
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
                      value={Math.round(selectedElement.width)}
                      onChange={(e) =>
                        handleElementPropertyChange(
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
                      value={Math.round(selectedElement.height)}
                      onChange={(e) =>
                        handleElementPropertyChange(
                          "height",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Rotation */}
              <div className="space-y-2">
                <Label className="text-xs">
                  Rotation: {selectedElement.rotation || 0}°
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={selectedElement.rotation || 0}
                    onChange={(e) =>
                      handleElementPropertyChange(
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
                      handleElementPropertyChange(
                        "rotation",
                        (selectedElement.rotation || 0) - 90
                      )
                    }
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleElementPropertyChange(
                        "rotation",
                        (selectedElement.rotation || 0) + 90
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
                  onClick={() => {
                    const isVisible =
                      (selectedElement.properties as any)?.visible !== false;
                    handleElementPropertiesChange({ visible: !isVisible });
                  }}
                  className="flex-1"
                >
                  {(selectedElement.properties as any)?.visible !== false ? (
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
                    const isLocked =
                      (selectedElement.properties as any)?.locked ?? false;
                    handleElementPropertiesChange({ locked: !isLocked });
                  }}
                  className="flex-1"
                >
                  {(selectedElement.properties as any)?.locked ? (
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
              {selectedElement.type === "text" && (
                <div className="space-y-2">
                  <Separator />
                  <Label className="text-xs">Text Properties</Label>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Text
                    </Label>
                    <Input
                      value={selectedElement.content || ""}
                      onChange={(e) =>
                        handleElementPropertyChange("content", e.target.value)
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
                      value={selectedElement.fontSize || 16}
                      onChange={(e) =>
                        handleElementPropertyChange(
                          "fontSize",
                          parseInt(e.target.value) || 16
                        )
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
                      value={selectedElement.color || "#000000"}
                      onChange={(e) =>
                        handleElementPropertyChange("color", e.target.value)
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}

              {selectedElement.type === "shape" && (
                <div className="space-y-2">
                  <Separator />
                  <Label className="text-xs">Shape Properties</Label>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Fill Color
                    </Label>
                    <Input
                      type="color"
                      value={selectedElement.color || "#000000"}
                      onChange={(e) =>
                        handleElementPropertyChange("color", e.target.value)
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
                        (selectedElement.properties as any)?.strokeColor ||
                        "#000000"
                      }
                      onChange={(e) =>
                        handleElementPropertiesChange({
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
                        (selectedElement.properties as any)?.strokeWidth || 0
                      }
                      onChange={(e) =>
                        handleElementPropertiesChange({
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
