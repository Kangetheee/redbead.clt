/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
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
} from "lucide-react";
import { useState } from "react";

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

  return (
    <div className="space-y-4">
      {/* Main Tools */}
      <Card>
        <CardContent className="p-3">
          <div className="space-y-3">
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
