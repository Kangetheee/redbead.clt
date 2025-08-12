/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Settings, Eye, Grid, ZoomIn, ZoomOut } from "lucide-react";

import {
  DesignResponse,
  CanvasElement,
} from "@/lib/design-studio/types/design-studio.types";
import {
  DesignTemplate,
  SizeVariant,
} from "@/lib/design-templates/types/design-template.types";
import { CreateDesignDto } from "@/lib/design-studio/dto/design-studio.dto";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import CanvasRenderer, { canvasUtils } from "./canvas-renderer";
import FabricCanvasRenderer, {
  getFabricCanvas,
  fabricCanvasUtils,
} from "./canvas-renderer";

interface CanvasAreaProps {
  selectedTemplate: DesignTemplate;
  selectedVariant: SizeVariant | null;
  currentDesign: DesignResponse | null;
  canvasElements: CanvasElement[];
  selectedElement: CanvasElement | null;
  designForm: UseFormReturn<CreateDesignDto>;
  isPreviewMode: boolean;
  canvasId: string;
  onElementSelect: (element: CanvasElement | null) => void;
  onElementUpdate: (elementId: string, updates: Partial<CanvasElement>) => void;
  onElementDuplicate: (elementId: string) => void;
  onElementDelete: (elementId: string) => void;
}

export default function CanvasArea({
  selectedTemplate,
  selectedVariant,
  currentDesign,
  canvasElements,
  selectedElement,
  designForm,
  isPreviewMode,
  canvasId,
  onElementSelect,
  onElementUpdate,
  onElementDuplicate,
  onElementDelete,
}: CanvasAreaProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [useFabricRenderer, setUseFabricRenderer] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(100);

  // Get canvas dimensions from form or default values
  const canvasWidth = designForm.watch("customizations.width") || 800;
  const canvasHeight = designForm.watch("customizations.height") || 600;

  // Calculate optimal scale to fit canvas in container
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const container = canvasContainerRef.current;
    const containerWidth = container.clientWidth - 64; // Account for padding
    const containerHeight = container.clientHeight - 120; // Account for controls

    const scaleX = containerWidth / canvasWidth;
    const scaleY = containerHeight / canvasHeight;
    const optimalScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%

    setCanvasScale(optimalScale);
    setZoom(Math.round(optimalScale * 100));

    // Center the canvas
    const scaledWidth = canvasWidth * optimalScale;
    const scaledHeight = canvasHeight * optimalScale;
    setCanvasOffset({
      x: (containerWidth - scaledWidth) / 2,
      y: (containerHeight - scaledHeight) / 2,
    });
  }, [canvasWidth, canvasHeight]);

  // Zoom controls
  const handleZoomIn = () => {
    const newScale = Math.min(canvasScale * 1.2, 3);
    setCanvasScale(newScale);
    setZoom(Math.round(newScale * 100));

    if (useFabricRenderer) {
      const fabricCanvas = getFabricCanvas();
      fabricCanvas?.setZoom(newScale);
    }
  };

  const handleZoomOut = () => {
    const newScale = Math.max(canvasScale / 1.2, 0.1);
    setCanvasScale(newScale);
    setZoom(Math.round(newScale * 100));

    if (useFabricRenderer) {
      const fabricCanvas = getFabricCanvas();
      fabricCanvas?.setZoom(newScale);
    }
  };

  const handleZoomReset = () => {
    setCanvasScale(1);
    setZoom(100);

    const fc = getFabricCanvas();
    if (fc) {
      fc.setZoom(1);
      fc.viewportTransform = [1, 0, 0, 1, 0, 0];
      fc.renderAll();
    }
  };

  const handleFitToScreen = () => {
    if (!canvasContainerRef.current) return;

    const container = canvasContainerRef.current;
    const containerWidth = container.clientWidth - 64;
    const containerHeight = container.clientHeight - 120;

    const scaleX = containerWidth / canvasWidth;
    const scaleY = containerHeight / canvasHeight;
    const optimalScale = Math.min(scaleX, scaleY);

    setCanvasScale(optimalScale);
    setZoom(Math.round(optimalScale * 100));

    if (useFabricRenderer) {
      const fabricCanvas = getFabricCanvas();
      fabricCanvas?.setZoom(optimalScale);
    }
  };

  // Toggle grid
  const handleToggleGrid = () => {
    setShowGrid(!showGrid);
    // Grid implementation would go here for Fabric.js
  };

  // Export current view
  const handleExportView = () => {
    if (useFabricRenderer) {
      const dataURL = canvasUtils.exportCanvas("png", 1);
      if (dataURL) {
        const link = document.createElement("a");
        link.download = `${currentDesign?.name || "design"}-view.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  return (
    <div className="flex-1 bg-gray-100 flex flex-col overflow-hidden">
      {/* Canvas Controls */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Renderer Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={useFabricRenderer ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseFabricRenderer(!useFabricRenderer)}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    {useFabricRenderer ? "Fabric.js" : "Legacy"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {useFabricRenderer
                    ? "Switch to legacy canvas renderer"
                    : "Switch to Fabric.js renderer (recommended)"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Grid Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showGrid ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleGrid}
                    disabled={!useFabricRenderer}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle grid</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleZoomOut}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom out</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <span className="text-sm text-gray-600 min-w-[4rem] text-center">
              {zoom}%
            </span>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleZoomIn}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom in</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button variant="outline" size="sm" onClick={handleZoomReset}>
              Reset
            </Button>

            <Button variant="outline" size="sm" onClick={handleFitToScreen}>
              Fit
            </Button>

            {useFabricRenderer && (
              <Button variant="outline" size="sm" onClick={handleExportView}>
                <Eye className="w-4 h-4 mr-1" />
                Export View
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div
        ref={canvasContainerRef}
        className="flex-1 flex items-center justify-center p-8 overflow-auto"
      >
        <div
          className="bg-white rounded-lg shadow-lg overflow-hidden relative"
          style={{
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
          }}
        >
          {/* Canvas */}
          <div className="relative">
            {useFabricRenderer ? (
              <FabricCanvasRenderer
                canvasElements={canvasElements}
                selectedElement={selectedElement}
                designForm={designForm}
                isPreviewMode={isPreviewMode}
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                scale={canvasScale}
                onElementSelect={onElementSelect}
                onElementUpdate={onElementUpdate}
                onElementDuplicate={onElementDuplicate}
                onElementDelete={onElementDelete}
              />
            ) : (
              <CanvasRenderer
                canvasElements={canvasElements}
                selectedElement={selectedElement}
                designForm={designForm}
                isPreviewMode={isPreviewMode}
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                scale={canvasScale}
                onElementSelect={onElementSelect}
                onElementUpdate={onElementUpdate}
                onElementDuplicate={onElementDuplicate}
                onElementDelete={onElementDelete}
              />
            )}

            {/* Canvas Overlay for Additional Info */}
            {!isPreviewMode && (
              <div className="absolute top-2 left-2 flex flex-col space-y-2">
                {/* Renderer Badge */}
                <div
                  className={`px-2 py-1 text-xs rounded ${
                    useFabricRenderer
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {useFabricRenderer ? "Fabric.js" : "Legacy"}
                </div>

                {/* Grid Badge */}
                {showGrid && useFabricRenderer && (
                  <div className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    Grid On
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Canvas Info Footer */}
      <div className="bg-white border-t border-gray-200 px-8 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-6">
            <span>
              Canvas: {canvasWidth} × {canvasHeight}px
            </span>
            {selectedVariant && (
              <span>Size: {selectedVariant.displayName}</span>
            )}
            <span>Scale: {zoom}%</span>
            {canvasElements.length > 0 && (
              <span>Elements: {canvasElements.length}</span>
            )}
            <span
              className={`px-2 py-1 text-xs rounded ${
                useFabricRenderer
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {useFabricRenderer ? "Enhanced" : "Basic"}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {selectedElement && (
              <span className="text-blue-600">
                Selected: {selectedElement.type} ({selectedElement.x},{" "}
                {selectedElement.y})
              </span>
            )}
            {currentDesign && (
              <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                {currentDesign.status}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Template Preview (if no design loaded) */}
      {!currentDesign && (selectedTemplate as any).previewImage && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <img
            src={(selectedTemplate as any).previewImage}
            alt={selectedTemplate.name}
            className="w-full h-auto rounded-md mb-2"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
          <p className="text-sm font-medium text-gray-900">
            {selectedTemplate.name}
          </p>
          <p className="text-xs text-gray-500">
            {selectedTemplate.category.name}
          </p>
        </div>
      )}

      {/* Fabric.js Keyboard Shortcuts Help */}
      {selectedElement && !isPreviewMode && useFabricRenderer && (
        <div className="absolute top-20 right-4 bg-white rounded-lg shadow-lg p-3 text-xs text-gray-600 max-w-xs">
          <div className="font-medium mb-2">Fabric.js Controls:</div>
          <div className="space-y-1">
            <div>• Click & Drag: Move objects</div>
            <div>• Corner Handles: Resize & rotate</div>
            <div>• Double Click Text: Edit content</div>
            <div>• Arrow Keys: Fine positioning</div>
            <div>• Shift + Arrow: Move 10px</div>
            <div>• Ctrl/Cmd + D: Duplicate</div>
            <div>• Delete/Backspace: Delete</div>
          </div>
        </div>
      )}

      {/* Performance Notice */}
      {!useFabricRenderer && canvasElements.length > 20 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-lg text-sm">
          ⚡ Consider enabling Fabric.js renderer for better performance with{" "}
          {canvasElements.length} elements
        </div>
      )}
    </div>
  );
}
