"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import {
  CanvasData,
  CanvasLayer,
} from "@/lib/design-studio/types/design-studio.types";
import { cn } from "@/lib/utils";

interface DesignCanvasProps {
  canvas: CanvasData;
  onCanvasChange: (canvas: CanvasData) => void;
  selectedLayerId?: string;
  onLayerSelect: (layerId: string | null) => void;
  zoom: number;
  readonly?: boolean;
}

export function DesignCanvas({
  canvas,
  onCanvasChange,
  selectedLayerId,
  onLayerSelect,
  zoom,
  readonly = false,
}: DesignCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragLayerId, setDragLayerId] = useState<string | null>(null);

  const handleLayerClick = useCallback(
    (layerId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      if (!readonly) {
        onLayerSelect(layerId);
      }
    },
    [onLayerSelect, readonly]
  );

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent) => {
      // If clicking on canvas background, deselect layers
      if (event.target === event.currentTarget) {
        onLayerSelect(null);
      }
    },
    [onLayerSelect]
  );

  const handleMouseDown = useCallback(
    (layerId: string, event: React.MouseEvent) => {
      if (readonly) return;

      event.preventDefault();
      event.stopPropagation();

      setIsDragging(true);
      setDragLayerId(layerId);
      setDragStart({
        x: event.clientX,
        y: event.clientY,
      });

      onLayerSelect(layerId);
    },
    [onLayerSelect, readonly]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging || !dragLayerId || readonly) return;

      const deltaX = (event.clientX - dragStart.x) / zoom;
      const deltaY = (event.clientY - dragStart.y) / zoom;

      const updatedLayers = canvas.layers.map((layer) => {
        if (layer.id === dragLayerId) {
          return {
            ...layer,
            x: Math.max(
              0,
              Math.min(canvas.width - layer.width, layer.x + deltaX)
            ),
            y: Math.max(
              0,
              Math.min(canvas.height - layer.height, layer.y + deltaY)
            ),
          };
        }
        return layer;
      });

      onCanvasChange({
        ...canvas,
        layers: updatedLayers,
      });

      setDragStart({
        x: event.clientX,
        y: event.clientY,
      });
    },
    [isDragging, dragLayerId, dragStart, zoom, canvas, onCanvasChange, readonly]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragLayerId(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const sortedLayers = [...canvas.layers].sort(
    (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
  );

  return (
    <Card className="p-4 bg-gray-50">
      <div className="flex justify-center">
        <div
          ref={canvasRef}
          className={cn(
            "relative bg-white shadow-lg",
            !readonly && "cursor-crosshair"
          )}
          style={{
            width: canvas.width * zoom,
            height: canvas.height * zoom,
            backgroundColor: canvas.backgroundColor || "#ffffff",
          }}
          onClick={handleCanvasClick}
        >
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, #000 1px, transparent 1px),
                linear-gradient(to bottom, #000 1px, transparent 1px)
              `,
              backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            }}
          />

          {/* Render layers */}
          {sortedLayers.map((layer) => (
            <LayerRenderer
              key={layer.id}
              layer={layer}
              zoom={zoom}
              isSelected={selectedLayerId === layer.id}
              onClick={(e) => handleLayerClick(layer.id, e)}
              onMouseDown={(e) => handleMouseDown(layer.id, e)}
              readonly={readonly}
            />
          ))}

          {/* Canvas dimensions overlay */}
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {canvas.width} × {canvas.height}px
          </div>
        </div>
      </div>
    </Card>
  );
}

interface LayerRendererProps {
  layer: CanvasLayer;
  zoom: number;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  readonly?: boolean;
}

function LayerRenderer({
  layer,
  zoom,
  isSelected,
  onClick,
  onMouseDown,
  readonly = false,
}: LayerRendererProps) {
  const layerStyle: React.CSSProperties = {
    position: "absolute",
    left: layer.x * zoom,
    top: layer.y * zoom,
    width: layer.width * zoom,
    height: layer.height * zoom,
    transform: layer.rotation ? `rotate(${layer.rotation}deg)` : undefined,
    opacity: layer.opacity ?? 1,
    visibility: layer.visible !== false ? "visible" : "hidden",
    cursor: !readonly ? "move" : "default",
    zIndex: layer.zIndex || 0,
  };

  const renderLayerContent = () => {
    const props = layer.properties ?? {};

    if (layer.type === "text") {
      const textProps = props as {
        fontSize?: number;
        fontFamily?: string;
        fontWeight?: string;
        color?: string;
        textAlign?: "left" | "center" | "right";
        text?: string;
      };

      return (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            fontSize: (textProps.fontSize || 16) * zoom,
            fontFamily: textProps.fontFamily || "sans-serif",
            fontWeight: textProps.fontWeight || "normal",
            color: textProps.color || "#000000",
            textAlign: textProps.textAlign || "center",
          }}
        >
          {textProps.text || "Text"}
        </div>
      );
    }

    if (layer.type === "image") {
      const imageProps = props as {
        src?: string;
        alt?: string;
      };

      return (
        <img
          src={imageProps.src}
          alt={imageProps.alt || "Layer image"}
          className="w-full h-full object-cover"
          draggable={false}
        />
      );
    }

    if (layer.type === "shape") {
      const shapeProps = props as {
        shapeType?: string;
        fillColor?: string;
        strokeColor?: string;
        strokeWidth?: number;
      };

      const shapeType = shapeProps.shapeType || "rectangle";
      const fillColor = shapeProps.fillColor || "#000000";
      const strokeColor = shapeProps.strokeColor || "transparent";
      const strokeWidth = (shapeProps.strokeWidth || 0) * zoom;

      const commonStyle = {
        backgroundColor: fillColor,
        border:
          strokeWidth > 0 ? `${strokeWidth}px solid ${strokeColor}` : undefined,
      };

      if (shapeType === "circle") {
        return (
          <div className="w-full h-full rounded-full" style={commonStyle} />
        );
      }

      return <div className="w-full h-full" style={commonStyle} />;
    }

    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs">
        {layer.type}
      </div>
    );
  };

  return (
    <div
      style={layerStyle}
      onClick={onClick}
      onMouseDown={onMouseDown}
      className={cn(
        "border-2 border-transparent",
        isSelected && "border-blue-500 border-dashed",
        !readonly && "hover:border-blue-300"
      )}
    >
      {renderLayerContent()}

      {/* Resize handles for selected layer */}
      {isSelected && !readonly && (
        <>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 cursor-nw-resize" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 cursor-ne-resize" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 cursor-sw-resize" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 cursor-se-resize" />
        </>
      )}
    </div>
  );
}
