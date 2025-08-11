/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";

import {
  DesignResponse,
  CanvasElement,
} from "@/lib/design-studio/types/design-studio.types";
import {
  DesignTemplate,
  SizeVariant,
} from "@/lib/design-templates/types/design-template.types";
import { CreateDesignDto } from "@/lib/design-studio/dto/design-studio.dto";

import CanvasRenderer from "./canvas-renderer";

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

  // Get canvas dimensions from form or default values
  const canvasWidth = designForm.watch("customizations.width") || 800;
  const canvasHeight = designForm.watch("customizations.height") || 600;

  // Calculate optimal scale to fit canvas in container
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const container = canvasContainerRef.current;
    const containerWidth = container.clientWidth - 64; // Account for padding
    const containerHeight = container.clientHeight - 64;

    const scaleX = containerWidth / canvasWidth;
    const scaleY = containerHeight / canvasHeight;
    const optimalScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%

    setCanvasScale(optimalScale);

    // Center the canvas
    const scaledWidth = canvasWidth * optimalScale;
    const scaledHeight = canvasHeight * optimalScale;
    setCanvasOffset({
      x: (containerWidth - scaledWidth) / 2,
      y: (containerHeight - scaledHeight) / 2,
    });
  }, [canvasWidth, canvasHeight]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElement) return;

      // Delete element with Delete or Backspace
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        onElementDelete(selectedElement.id);
      }

      // Duplicate element with Ctrl/Cmd + D
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        onElementDuplicate(selectedElement.id);
      }

      // Move element with arrow keys
      if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        const moveDistance = e.shiftKey ? 10 : 1;
        const updates: Partial<CanvasElement> = {};

        switch (e.key) {
          case "ArrowLeft":
            updates.x = Math.max(0, selectedElement.x - moveDistance);
            break;
          case "ArrowRight":
            updates.x = Math.min(
              canvasWidth - selectedElement.width,
              selectedElement.x + moveDistance
            );
            break;
          case "ArrowUp":
            updates.y = Math.max(0, selectedElement.y - moveDistance);
            break;
          case "ArrowDown":
            updates.y = Math.min(
              canvasHeight - selectedElement.height,
              selectedElement.y + moveDistance
            );
            break;
        }

        if (Object.keys(updates).length > 0) {
          onElementUpdate(selectedElement.id, updates);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedElement,
    onElementDelete,
    onElementDuplicate,
    onElementUpdate,
    canvasWidth,
    canvasHeight,
  ]);

  return (
    <div className="flex-1 bg-gray-100 flex flex-col overflow-hidden">
      {/* Canvas Container */}
      <div
        ref={canvasContainerRef}
        className="flex-1 flex items-center justify-center p-8"
      >
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Canvas */}
          <div
            className="relative"
            style={{
              width: canvasWidth * canvasScale,
              height: canvasHeight * canvasScale,
              transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
            }}
          >
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
            <span>Scale: {Math.round(canvasScale * 100)}%</span>
            {canvasElements.length > 0 && (
              <span>Elements: {canvasElements.length}</span>
            )}
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

      {/* Keyboard Shortcuts Help */}
      {selectedElement && !isPreviewMode && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 text-xs text-gray-600 max-w-xs">
          <div className="font-medium mb-2">Keyboard Shortcuts:</div>
          <div className="space-y-1">
            <div>Arrow keys: Move element</div>
            <div>Shift + Arrow: Move 10px</div>
            <div>Ctrl/Cmd + D: Duplicate</div>
            <div>Delete/Backspace: Delete</div>
          </div>
        </div>
      )}
    </div>
  );
}
