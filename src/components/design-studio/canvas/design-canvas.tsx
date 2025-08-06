/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import {
  CanvasData,
  CanvasElement,
} from "@/lib/design-studio/types/design-studio.types";
import { cn } from "@/lib/utils";

interface DesignCanvasProps {
  canvas: CanvasData;
  onCanvasChange: (canvas: CanvasData) => void;
  selectedElementId?: string | null;
  onElementSelect: (elementId: string | null) => void;
  zoom: number;
  readonly?: boolean;
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

export function DesignCanvas({
  canvas,
  onCanvasChange,
  selectedElementId,
  onElementSelect,
  zoom,
  readonly = false,
  onElementUpdate,
  onElementDelete,
  onElementDuplicate,
  onElementReorder,
}: DesignCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragElementId, setDragElementId] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  const handleElementClick = useCallback(
    (elementId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      if (!readonly) {
        onElementSelect(elementId);
      }
    },
    [onElementSelect, readonly]
  );

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        onElementSelect(null);
      }
    },
    [onElementSelect]
  );

  const handleMouseDown = useCallback(
    (elementId: string, event: React.MouseEvent) => {
      if (readonly) return;

      event.preventDefault();
      event.stopPropagation();

      const target = event.target as HTMLElement;
      const isResizeHandle = target.classList.contains("resize-handle");

      if (isResizeHandle) {
        setIsResizing(true);
        setResizeHandle(target.dataset.handle || null);
      } else {
        setIsDragging(true);
      }

      setDragElementId(elementId);
      setDragStart({
        x: event.clientX,
        y: event.clientY,
      });

      onElementSelect(elementId);
    },
    [onElementSelect, readonly]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if ((!isDragging && !isResizing) || !dragElementId || readonly) return;

      const deltaX = (event.clientX - dragStart.x) / zoom;
      const deltaY = (event.clientY - dragStart.y) / zoom;

      const element = canvas.elements.find((e) => e.id === dragElementId);
      if (!element) return;

      if (isDragging) {
        const newX = Math.max(
          0,
          Math.min(canvas.width - element.width, element.x + deltaX)
        );
        const newY = Math.max(
          0,
          Math.min(canvas.height - element.height, element.y + deltaY)
        );

        if (onElementUpdate) {
          onElementUpdate(dragElementId, { x: newX, y: newY });
        } else {
          const updatedElements = canvas.elements.map((e) => {
            if (e.id === dragElementId) {
              return { ...e, x: newX, y: newY };
            }
            return e;
          });

          onCanvasChange({
            ...canvas,
            elements: updatedElements,
          });
        }
      } else if (isResizing && resizeHandle) {
        // Handle resizing
        let newWidth = element.width;
        let newHeight = element.height;
        let newX = element.x;
        let newY = element.y;

        switch (resizeHandle) {
          case "nw":
            newWidth = Math.max(10, element.width - deltaX);
            newHeight = Math.max(10, element.height - deltaY);
            newX = element.x + deltaX;
            newY = element.y + deltaY;
            break;
          case "ne":
            newWidth = Math.max(10, element.width + deltaX);
            newHeight = Math.max(10, element.height - deltaY);
            newY = element.y + deltaY;
            break;
          case "sw":
            newWidth = Math.max(10, element.width - deltaX);
            newHeight = Math.max(10, element.height + deltaY);
            newX = element.x + deltaX;
            break;
          case "se":
            newWidth = Math.max(10, element.width + deltaX);
            newHeight = Math.max(10, element.height + deltaY);
            break;
        }

        if (onElementUpdate) {
          onElementUpdate(dragElementId, {
            width: newWidth,
            height: newHeight,
            x: newX,
            y: newY,
          });
        }
      }

      setDragStart({
        x: event.clientX,
        y: event.clientY,
      });
    },
    [
      isDragging,
      isResizing,
      dragElementId,
      resizeHandle,
      dragStart,
      zoom,
      canvas,
      onCanvasChange,
      onElementUpdate,
      readonly,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setDragElementId(null);
    setResizeHandle(null);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Sort elements by zIndex for proper rendering order
  const sortedElements = [...canvas.elements].sort(
    (a, b) => (a.rotation || 0) - (b.rotation || 0) // Using rotation as zIndex substitute since it's not in the type
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

          {/* Render elements */}
          {sortedElements.map((element) => (
            <ElementRenderer
              key={element.id}
              element={element}
              zoom={zoom}
              isSelected={selectedElementId === element.id}
              onClick={(e) => handleElementClick(element.id, e)}
              onMouseDown={(e) => handleMouseDown(element.id, e)}
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

interface ElementRendererProps {
  element: CanvasElement;
  zoom: number;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  readonly?: boolean;
}

function ElementRenderer({
  element,
  zoom,
  isSelected,
  onClick,
  onMouseDown,
  readonly = false,
}: ElementRendererProps) {
  const elementStyle: React.CSSProperties = {
    position: "absolute",
    left: element.x * zoom,
    top: element.y * zoom,
    width: element.width * zoom,
    height: element.height * zoom,
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    cursor: !readonly ? "move" : "default",
  };

  const renderElementContent = () => {
    if (element.type === "text") {
      return (
        <div
          className="w-full h-full flex items-center justify-center p-2"
          style={{
            fontSize: (element.fontSize || 16) * zoom,
            fontFamily: element.font || "sans-serif",
            fontWeight: element.fontWeight || "normal",
            color: element.color || "#000000",
            lineHeight: 1.2,
            overflow: "hidden",
            textAlign: (element.properties as any)?.textAlign || "center",
          }}
        >
          {element.content || "Text"}
        </div>
      );
    }

    if (element.type === "image") {
      return (
        <img
          src={element.mediaId}
          alt="Element image"
          className="w-full h-full object-cover"
          draggable={false}
        />
      );
    }

    if (element.type === "shape") {
      const shapeType = element.shapeType || "rectangle";
      const fillColor = element.color || "#000000";
      const strokeColor =
        (element.properties as any)?.strokeColor || "transparent";
      const strokeWidth =
        ((element.properties as any)?.strokeWidth || 0) * zoom;

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
        {element.type}
      </div>
    );
  };

  return (
    <div
      style={elementStyle}
      onClick={onClick}
      onMouseDown={onMouseDown}
      className={cn(
        "border-2 border-transparent",
        isSelected && "border-blue-500 border-dashed",
        !readonly && "hover:border-blue-300"
      )}
    >
      {renderElementContent()}

      {/* Resize handles for selected element */}
      {isSelected && !readonly && (
        <>
          <div
            className="resize-handle absolute -top-1 -left-1 w-2 h-2 bg-blue-500 cursor-nw-resize"
            data-handle="nw"
          />
          <div
            className="resize-handle absolute -top-1 -right-1 w-2 h-2 bg-blue-500 cursor-ne-resize"
            data-handle="ne"
          />
          <div
            className="resize-handle absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 cursor-sw-resize"
            data-handle="sw"
          />
          <div
            className="resize-handle absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 cursor-se-resize"
            data-handle="se"
          />
        </>
      )}
    </div>
  );
}
