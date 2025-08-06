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
  CanvasElement,
  CanvasData,
} from "@/lib/design-studio/types/design-studio.types";
import { cn } from "@/lib/utils";

interface LayerPanelProps {
  canvas: CanvasData;
  onCanvasChange: (canvas: CanvasData) => void;
  selectedElementId?: string | null;
  onElementSelect: (elementId: string | null) => void;
}

export function LayerPanel({
  canvas,
  onCanvasChange,
  selectedElementId,
  onElementSelect,
}: LayerPanelProps) {
  // Sort elements by rotation (using as zIndex substitute) in reverse order for display
  const sortedElements = [...canvas.elements].sort(
    (a, b) => (b.rotation || 0) - (a.rotation || 0)
  );

  const updateElement = (
    elementId: string,
    updates: Partial<CanvasElement>
  ) => {
    const updatedElements = canvas.elements.map((element) =>
      element.id === elementId ? { ...element, ...updates } : element
    );
    onCanvasChange({ ...canvas, elements: updatedElements });
  };

  const updateElementProperties = (
    elementId: string,
    properties: Record<string, any>
  ) => {
    const element = canvas.elements.find((e) => e.id === elementId);
    if (!element) return;

    const updatedElements = canvas.elements.map((e) =>
      e.id === elementId
        ? { ...e, properties: { ...e.properties, ...properties } }
        : e
    );
    onCanvasChange({ ...canvas, elements: updatedElements });
  };

  const deleteElement = (elementId: string) => {
    const updatedElements = canvas.elements.filter(
      (element) => element.id !== elementId
    );
    onCanvasChange({ ...canvas, elements: updatedElements });

    if (selectedElementId === elementId) {
      onElementSelect(null);
    }
  };

  const duplicateElement = (elementId: string) => {
    const element = canvas.elements.find((e) => e.id === elementId);
    if (!element) return;

    const newElement: CanvasElement = {
      ...element,
      id: `${element.id}_copy_${Date.now()}`,
      x: element.x + 10,
      y: element.y + 10,
      rotation: Math.max(...canvas.elements.map((e) => e.rotation || 0)) + 1,
    };

    const updatedElements = [...canvas.elements, newElement];
    onCanvasChange({ ...canvas, elements: updatedElements });
    onElementSelect(newElement.id);
  };

  const moveElement = (elementId: string, direction: "up" | "down") => {
    const element = canvas.elements.find((e) => e.id === elementId);
    if (!element) return;

    const currentRotation = element.rotation || 0;
    const newRotation =
      direction === "up"
        ? currentRotation + 1
        : Math.max(0, currentRotation - 1);

    updateElement(elementId, { rotation: newRotation });
  };

  const toggleElementVisibility = (elementId: string) => {
    const element = canvas.elements.find((e) => e.id === elementId);
    if (!element) return;

    // Use properties to store visibility since it's not in the base type
    const isVisible = (element.properties as any)?.visible !== false;
    updateElementProperties(elementId, { visible: !isVisible });
  };

  const toggleElementLock = (elementId: string) => {
    const element = canvas.elements.find((e) => e.id === elementId);
    if (!element) return;

    const isLocked = (element.properties as any)?.locked ?? false;
    updateElementProperties(elementId, { locked: !isLocked });
  };

  const getElementIcon = (type: string) => {
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

  const getElementName = (element: CanvasElement): string => {
    switch (element.type) {
      case "text": {
        return (
          element.content?.slice(0, 20) +
            (element.content && element.content.length > 20 ? "..." : "") ||
          "Text Element"
        );
      }
      case "image": {
        const props = element.properties as { alt?: string; name?: string };
        return props?.alt || props?.name || "Image Element";
      }
      case "shape": {
        return `${element.shapeType || "Shape"} Element`;
      }
      default:
        return `${element.type} Element`;
    }
  };

  const isElementVisible = (element: CanvasElement): boolean => {
    return (element.properties as any)?.visible !== false;
  };

  const isElementLocked = (element: CanvasElement): boolean => {
    return (element.properties as any)?.locked ?? false;
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          Elements
          <span className="text-sm font-normal text-muted-foreground">
            {canvas.elements.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {sortedElements.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Square className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No elements yet</p>
              <p className="text-xs">Add content to your design</p>
            </div>
          ) : (
            sortedElements.map((element, index) => {
              const Icon = getElementIcon(element.type);
              const isSelected = selectedElementId === element.id;
              const isVisible = isElementVisible(element);
              const isLocked = isElementLocked(element);

              return (
                <div
                  key={element.id}
                  className={cn(
                    "group flex items-center gap-2 p-2 hover:bg-accent cursor-pointer border-l-2 mx-2 rounded-r transition-colors",
                    isSelected
                      ? "bg-accent border-l-primary"
                      : "border-l-transparent",
                    !isVisible && "opacity-60",
                    isLocked && "bg-muted/50"
                  )}
                  onClick={() => onElementSelect(element.id)}
                >
                  {/* Drag Handle */}
                  <GripVertical className="h-4 w-4 text-muted-foreground" />

                  {/* Element Icon */}
                  <div className="relative">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {isLocked && (
                      <Lock className="h-2 w-2 absolute -top-1 -right-1 text-red-500" />
                    )}
                  </div>

                  {/* Element Name */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        "text-sm truncate",
                        !isVisible && "opacity-50"
                      )}
                    >
                      {getElementName(element)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {element.type} • {Math.round(element.x)},
                      {Math.round(element.y)}
                    </div>
                  </div>

                  {/* Element Controls */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Lock Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleElementLock(element.id);
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
                        toggleElementVisibility(element.id);
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
                        moveElement(element.id, "up");
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
                        moveElement(element.id, "down");
                      }}
                      disabled={index === sortedElements.length - 1}
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
                        duplicateElement(element.id);
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
                        if (window.confirm("Delete this element?")) {
                          deleteElement(element.id);
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

        {/* Element Statistics */}
        {canvas.elements.length > 0 && (
          <div className="p-3 border-t bg-muted/30">
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Total Elements:</span>
                <span>{canvas.elements.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Visible:</span>
                <span>
                  {canvas.elements.filter((e) => isElementVisible(e)).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Locked:</span>
                <span>
                  {canvas.elements.filter((e) => isElementLocked(e)).length}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
