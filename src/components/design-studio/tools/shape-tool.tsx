/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Square, Circle, Triangle, Plus } from "lucide-react";
import {
  CanvasElement,
  CanvasData,
} from "@/lib/design-studio/types/design-studio.types";
import { ColorPicker } from "./color-picker";

interface ShapeToolProps {
  canvas: CanvasData;
  onCanvasChange: (canvas: CanvasData) => void;
  selectedElementId?: string | null;
  onElementSelect: (elementId: string) => void;
}

export function ShapeTool({
  canvas,
  onCanvasChange,
  selectedElementId,
  onElementSelect,
}: ShapeToolProps) {
  const [shapeType, setShapeType] = useState("rectangle");
  const [fillColor, setFillColor] = useState("#3b82f6");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState([2]);
  const [opacity, setOpacity] = useState([100]);

  const selectedElement = selectedElementId
    ? canvas.elements.find(
        (e) => e.id === selectedElementId && e.type === "shape"
      )
    : null;

  const shapes = [
    { id: "rectangle", name: "Rectangle", icon: Square },
    { id: "circle", name: "Circle", icon: Circle },
    { id: "triangle", name: "Triangle", icon: Triangle },
  ];

  const addShapeElement = (type: string) => {
    const newElement: CanvasElement = {
      id: `shape_${Date.now()}`,
      type: "shape",
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      shapeType: type,
      color: fillColor,
      properties: {
        fillColor,
        strokeColor,
        strokeWidth: strokeWidth[0],
        opacity: opacity[0] / 100,
      },
    };

    const updatedElements = [...canvas.elements, newElement];
    onCanvasChange({ ...canvas, elements: updatedElements });
    onElementSelect(newElement.id);
  };

  const updateSelectedElement = (updates: Partial<CanvasElement>) => {
    if (!selectedElement) return;

    const updatedElements = canvas.elements.map((element) =>
      element.id === selectedElement.id ? { ...element, ...updates } : element
    );

    onCanvasChange({ ...canvas, elements: updatedElements });
  };

  const updateSelectedElementProperties = (properties: Record<string, any>) => {
    if (!selectedElement) return;

    const updatedElements = canvas.elements.map((element) =>
      element.id === selectedElement.id
        ? {
            ...element,
            properties: { ...element.properties, ...properties },
          }
        : element
    );

    onCanvasChange({ ...canvas, elements: updatedElements });
  };

  const handleFillColorChange = (color: string) => {
    setFillColor(color);
    if (selectedElement) {
      updateSelectedElement({ color });
      updateSelectedElementProperties({ fillColor: color });
    }
  };

  const handleStrokeColorChange = (color: string) => {
    setStrokeColor(color);
    if (selectedElement) {
      updateSelectedElementProperties({ strokeColor: color });
    }
  };

  const handleStrokeWidthChange = (width: number[]) => {
    setStrokeWidth(width);
    if (selectedElement) {
      updateSelectedElementProperties({ strokeWidth: width[0] });
    }
  };

  const handleOpacityChange = (newOpacity: number[]) => {
    setOpacity(newOpacity);
    if (selectedElement) {
      updateSelectedElementProperties({ opacity: newOpacity[0] / 100 });
    }
  };

  const handleShapeTypeChange = (type: string) => {
    setShapeType(type);
    if (selectedElement) {
      updateSelectedElement({ shapeType: type });
    }
  };

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Square className="h-5 w-5" />
          Shape Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Shape Selection */}
        <div className="space-y-2">
          <Label>Shape Type</Label>
          <div className="grid grid-cols-3 gap-2">
            {shapes.map((shape) => {
              const Icon = shape.icon;
              return (
                <Button
                  key={shape.id}
                  variant={shapeType === shape.id ? "default" : "outline"}
                  onClick={() => handleShapeTypeChange(shape.id)}
                  className="aspect-square"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
        </div>

        {/* Add Shape Button */}
        <Button onClick={() => addShapeElement(shapeType)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add {shapes.find((s) => s.id === shapeType)?.name}
        </Button>

        {/* Fill Color */}
        <div className="space-y-2">
          <Label>Fill Color</Label>
          <ColorPicker value={fillColor} onChange={handleFillColorChange} />
        </div>

        {/* Stroke Color */}
        <div className="space-y-2">
          <Label>Stroke Color</Label>
          <ColorPicker value={strokeColor} onChange={handleStrokeColorChange} />
        </div>

        {/* Stroke Width */}
        <div className="space-y-2">
          <Label>Stroke Width: {strokeWidth[0]}px</Label>
          <Slider
            value={strokeWidth}
            onValueChange={handleStrokeWidthChange}
            min={0}
            max={20}
            step={1}
            className="w-full"
          />
        </div>

        {/* Opacity */}
        <div className="space-y-2">
          <Label>Opacity: {opacity[0]}%</Label>
          <Slider
            value={opacity}
            onValueChange={handleOpacityChange}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Selected Element Info */}
        {selectedElement && (
          <div className="text-xs text-muted-foreground p-2 bg-accent rounded">
            Editing: {selectedElement.shapeType || "Shape"} Element
          </div>
        )}
      </CardContent>
    </Card>
  );
}
