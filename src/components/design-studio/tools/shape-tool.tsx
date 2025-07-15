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
  CanvasLayer,
  CanvasData,
} from "@/lib/design-studio/types/design-studio.types";
import { ColorPicker } from "./color-picker";

interface ShapeToolProps {
  canvas: CanvasData;
  onCanvasChange: (canvas: CanvasData) => void;
  selectedLayerId?: string | null;
  onLayerSelect: (layerId: string) => void;
}

export function ShapeTool({
  canvas,
  onCanvasChange,
  selectedLayerId,
  onLayerSelect,
}: ShapeToolProps) {
  const [shapeType, setShapeType] = useState("rectangle");
  const [fillColor, setFillColor] = useState("#3b82f6");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState([2]);
  const [opacity, setOpacity] = useState([100]);

  const selectedLayer = selectedLayerId
    ? canvas.layers.find((l) => l.id === selectedLayerId && l.type === "shape")
    : null;

  const shapes = [
    { id: "rectangle", name: "Rectangle", icon: Square },
    { id: "circle", name: "Circle", icon: Circle },
    { id: "triangle", name: "Triangle", icon: Triangle },
  ];

  const addShapeLayer = (type: string) => {
    const newLayer: CanvasLayer = {
      id: `shape_${Date.now()}`,
      type: "shape",
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      opacity: opacity[0] / 100,
      properties: {
        shapeType: type,
        fillColor,
        strokeColor,
        strokeWidth: strokeWidth[0],
      },
    };

    const updatedLayers = [...canvas.layers, newLayer];
    onCanvasChange({ ...canvas, layers: updatedLayers });
    onLayerSelect(newLayer.id);
  };

  const updateSelectedLayer = (properties: Record<string, any>) => {
    if (!selectedLayer) return;

    const updatedLayers = canvas.layers.map((layer) =>
      layer.id === selectedLayer.id
        ? {
            ...layer,
            ...properties,
            properties: { ...layer.properties, ...properties.properties },
          }
        : layer
    );

    onCanvasChange({ ...canvas, layers: updatedLayers });
  };

  const handleFillColorChange = (color: string) => {
    setFillColor(color);
    if (selectedLayer) {
      updateSelectedLayer({
        properties: { fillColor: color },
      });
    }
  };

  const handleStrokeColorChange = (color: string) => {
    setStrokeColor(color);
    if (selectedLayer) {
      updateSelectedLayer({
        properties: { strokeColor: color },
      });
    }
  };

  const handleStrokeWidthChange = (width: number[]) => {
    setStrokeWidth(width);
    if (selectedLayer) {
      updateSelectedLayer({
        properties: { strokeWidth: width[0] },
      });
    }
  };

  const handleOpacityChange = (newOpacity: number[]) => {
    setOpacity(newOpacity);
    if (selectedLayer) {
      updateSelectedLayer({ opacity: newOpacity[0] / 100 });
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
                  onClick={() => setShapeType(shape.id)}
                  className="aspect-square"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
        </div>

        {/* Add Shape Button */}
        <Button onClick={() => addShapeLayer(shapeType)} className="w-full">
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

        {/* Selected Layer Info */}
        {selectedLayer && (
          <div className="text-xs text-muted-foreground p-2 bg-accent rounded">
            Editing:{" "}
            {(selectedLayer.properties as { shapeType?: string })?.shapeType ||
              "Image Layer"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
