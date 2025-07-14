/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Eye,
  Download,
  Share2,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Smartphone,
  Tablet,
  Monitor,
} from "lucide-react";
import { DesignResponse } from "@/lib/design-studio/types/design-studio.types";
import { DesignCanvas } from "../canvas/design-canvas";
import { cn } from "@/lib/utils";

interface DesignPreviewProps {
  design: DesignResponse;
  showControls?: boolean;
  interactive?: boolean;
  onExport?: (format: string) => void;
  onShare?: () => void;
}

export function DesignPreview({
  design,
  showControls = true,
  interactive = true,
  onExport,
  onShare,
}: DesignPreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const viewModes = [
    { id: "desktop", icon: Monitor, label: "Desktop", width: "100%" },
    { id: "tablet", icon: Tablet, label: "Tablet", width: "768px" },
    { id: "mobile", icon: Smartphone, label: "Mobile", width: "375px" },
  ];

  const exportFormats = [
    { id: "png", label: "PNG", extension: ".png" },
    { id: "jpg", label: "JPG", extension: ".jpg" },
    { id: "pdf", label: "PDF", extension: ".pdf" },
    { id: "svg", label: "SVG", extension: ".svg" },
  ];

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.1));
  };

  const handleRotate = (direction: "left" | "right") => {
    const delta = direction === "left" ? -90 : 90;
    setRotation((prev) => (prev + delta) % 360);
  };

  const toggleFullscreen = () => {
    if (!fullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.();
      setFullscreen(true);
    } else if (fullscreen) {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  const handleExport = (format: string) => {
    onExport?.(format);
  };

  return (
    <div className="w-full">
      {/* Preview Header */}
      {showControls && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview: {design.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{design.status}</Badge>
                <Badge variant="secondary">v{design.version}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap items-center gap-4">
              {/* View Mode Selection */}
              <div className="flex items-center gap-1 border rounded-md p-1">
                {viewModes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <Button
                      key={mode.id}
                      variant={viewMode === mode.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode(mode.id as any)}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">
                        {mode.label}
                      </span>
                    </Button>
                  );
                })}
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <div className="w-24 mx-2">
                  <Slider
                    value={[zoom]}
                    onValueChange={([value]) => setZoom(value)}
                    min={0.1}
                    max={5}
                    step={0.1}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[50px]">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Rotation Controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRotate("left")}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRotate("right")}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                  <Maximize className="h-4 w-4" />
                </Button>

                {onShare && (
                  <Button variant="outline" size="sm" onClick={onShare}>
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Share</span>
                  </Button>
                )}

                {onExport && (
                  <div className="flex items-center gap-1">
                    {exportFormats.map((format) => (
                      <Button
                        key={format.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport(format.id)}
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline ml-2">
                          {format.label}
                        </span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Container */}
      <div
        ref={containerRef}
        className={cn(
          "relative bg-gray-100 rounded-lg overflow-hidden",
          fullscreen && "fixed inset-0 z-50 bg-black"
        )}
        style={{
          maxWidth:
            viewMode !== "desktop"
              ? viewModes.find((m) => m.id === viewMode)?.width
              : "100%",
          margin: viewMode !== "desktop" ? "0 auto" : undefined,
        }}
      >
        <div
          className="flex items-center justify-center min-h-[500px] p-4"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: "transform 0.3s ease",
          }}
        >
          <DesignCanvas
            canvas={design.customizations}
            onCanvasChange={() => {}} // Read-only in preview
            selectedLayerId={undefined}
            onLayerSelect={() => {}} // Read-only in preview
            zoom={zoom}
            readonly={!interactive}
          />
        </div>

        {/* Preview Info Overlay */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white text-xs px-3 py-2 rounded">
          <div>
            {design.customizations.width} × {design.customizations.height}px
          </div>
          <div>Zoom: {Math.round(zoom * 100)}%</div>
          {rotation !== 0 && <div>Rotation: {rotation}°</div>}
        </div>

        {/* Design Metadata */}
        {design.metadata && (
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs px-3 py-2 rounded max-w-xs">
            <div className="font-medium mb-1">Design Info</div>
            {design.estimatedCost && (
              <div>Est. Cost: ${design.estimatedCost.toFixed(2)}</div>
            )}
            <div>Layers: {design.customizations.layers.length}</div>
            <div>
              Updated: {new Date(design.updatedAt).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
