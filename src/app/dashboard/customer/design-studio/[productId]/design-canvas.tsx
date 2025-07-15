"use client";

import { useState, useRef, useCallback } from "react";
import { CanvasControls } from "@/components/design-studio/canvas/canvas-controls";
import { DesignCanvas } from "@/components/design-studio/canvas/design-canvas";
import type {
  CanvasData,
  CanvasLayer,
} from "@/lib/design-studio/types/design-studio.types";

interface DesignCanvasProps {
  canvas: CanvasData;
  onCanvasChange: (canvas: CanvasData) => void;
  selectedLayerId?: string | null;
  onLayerSelect: (layerId: string | null) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  tool: string;
  onToolChange: (tool: string) => void;
}

export default function DesignCanvasComponent({
  canvas,
  onCanvasChange,
  selectedLayerId,
  onLayerSelect,
  zoom,
  setZoom,
  tool,
  onToolChange,
}: DesignCanvasProps) {
  const [history, setHistory] = useState<CanvasData[]>([canvas]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomChange = useCallback(
    (newZoom: number) => {
      // Limit zoom between 10% and 500%
      const clampedZoom = Math.max(0.1, Math.min(5, newZoom));
      setZoom(clampedZoom);
    },
    [setZoom]
  );

  const addToHistory = useCallback(
    (newCanvas: CanvasData) => {
      // Create a deep copy to avoid mutation
      const canvasCopy: CanvasData = {
        ...newCanvas,
        layers: newCanvas.layers.map((layer) => ({ ...layer })),
        metadata: { ...newCanvas.metadata },
      };

      // Remove future history when adding new state
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(canvasCopy);

      // Limit history size to prevent memory issues
      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
        setHistoryIndex(newHistory.length - 1);
      }

      setHistory(newHistory);
      onCanvasChange(canvasCopy);
    },
    [history, historyIndex, onCanvasChange]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousCanvas = history[newIndex];
      onCanvasChange(previousCanvas);

      // Clear selection if the selected layer no longer exists
      if (
        selectedLayerId &&
        !previousCanvas.layers.find((l) => l.id === selectedLayerId)
      ) {
        onLayerSelect(null);
      }
    }
  }, [historyIndex, history, onCanvasChange, selectedLayerId, onLayerSelect]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextCanvas = history[newIndex];
      onCanvasChange(nextCanvas);
    }
  }, [historyIndex, history, onCanvasChange]);

  const handleSave = useCallback(() => {
    // This will be handled by the parent component
    console.log("Save triggered from canvas controls");
  }, []);

  const handleExport = useCallback(() => {
    // This will be handled by the parent component
    console.log("Export triggered from canvas controls");
  }, []);

  // Layer manipulation functions
  const handleLayerUpdate = useCallback(
    (layerId: string, updates: Partial<CanvasLayer>) => {
      const newCanvas: CanvasData = {
        ...canvas,
        layers: canvas.layers.map((layer) =>
          layer.id === layerId ? { ...layer, ...updates } : layer
        ),
      };
      addToHistory(newCanvas);
    },
    [canvas, addToHistory]
  );

  const handleLayerDelete = useCallback(
    (layerId: string) => {
      const newCanvas: CanvasData = {
        ...canvas,
        layers: canvas.layers.filter((layer) => layer.id !== layerId),
      };
      addToHistory(newCanvas);

      if (selectedLayerId === layerId) {
        onLayerSelect(null);
      }
    },
    [canvas, addToHistory, selectedLayerId, onLayerSelect]
  );

  const handleLayerDuplicate = useCallback(
    (layerId: string) => {
      const originalLayer = canvas.layers.find((layer) => layer.id === layerId);
      if (!originalLayer) return;

      const duplicatedLayer: CanvasLayer = {
        ...originalLayer,
        id: `${originalLayer.id}-copy-${Date.now()}`,
        x: originalLayer.x + 20, // Offset the copy
        y: originalLayer.y + 20,
        zIndex: Math.max(...canvas.layers.map((l) => l.zIndex || 0)) + 1,
      };

      const newCanvas: CanvasData = {
        ...canvas,
        layers: [...canvas.layers, duplicatedLayer],
      };
      addToHistory(newCanvas);
      onLayerSelect(duplicatedLayer.id);
    },
    [canvas, addToHistory, onLayerSelect]
  );

  const handleLayerReorder = useCallback(
    (layerId: string, direction: "up" | "down" | "top" | "bottom") => {
      const layerIndex = canvas.layers.findIndex((l) => l.id === layerId);
      if (layerIndex === -1) return;

      const newLayers = [...canvas.layers];
      const [layer] = newLayers.splice(layerIndex, 1);

      let newIndex: number;
      switch (direction) {
        case "top":
          newIndex = newLayers.length;
          break;
        case "bottom":
          newIndex = 0;
          break;
        case "up":
          newIndex = Math.min(layerIndex + 1, newLayers.length);
          break;
        case "down":
          newIndex = Math.max(layerIndex - 1, 0);
          break;
      }

      newLayers.splice(newIndex, 0, {
        ...layer,
        zIndex:
          direction === "top"
            ? newLayers.length + 1
            : direction === "bottom"
              ? 0
              : layer.zIndex,
      });

      const newCanvas: CanvasData = {
        ...canvas,
        layers: newLayers,
      };
      addToHistory(newCanvas);
    },
    [canvas, addToHistory]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Design Canvas</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Zoom: {Math.round(zoom * 100)}%
          </div>
          <div className="text-sm text-muted-foreground">
            Layers: {canvas.layers.length}
          </div>
          <div className="text-sm text-muted-foreground">
            Size: {canvas.width} × {canvas.height}px
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-muted/50 rounded-lg border flex items-center justify-center p-4"
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        }}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <DesignCanvas
            canvas={canvas}
            onCanvasChange={addToHistory}
            selectedLayerId={selectedLayerId}
            onLayerSelect={onLayerSelect}
            zoom={zoom}
            readonly={false}
            onLayerUpdate={handleLayerUpdate}
            onLayerDelete={handleLayerDelete}
            onLayerDuplicate={handleLayerDuplicate}
            onLayerReorder={handleLayerReorder}
          />
        </div>
      </div>

      <div className="mt-4">
        <CanvasControls
          zoom={zoom}
          onZoomChange={handleZoomChange}
          tool={tool}
          onToolChange={onToolChange}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={handleSave}
          onExport={handleExport}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          selectedLayer={
            selectedLayerId
              ? canvas.layers.find((l) => l.id === selectedLayerId)
              : null
          }
          onLayerUpdate={handleLayerUpdate}
          onLayerDelete={handleLayerDelete}
          onLayerDuplicate={handleLayerDuplicate}
          onLayerReorder={handleLayerReorder}
        />
      </div>
    </div>
  );
}
