/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { Palette, Image as ImageIcon } from "lucide-react";

import { CanvasElement } from "@/lib/design-studio/types/design-studio.types";

interface CanvasRendererProps {
  canvasElements: CanvasElement[];
  selectedElement: CanvasElement | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  designForm: UseFormReturn<any>;
  isPreviewMode: boolean;
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
  onElementSelect: (element: CanvasElement | null) => void;
  onElementUpdate: (elementId: string, updates: Partial<CanvasElement>) => void;
  onElementDuplicate: (elementId: string) => void;
  onElementDelete: (elementId: string) => void;
}

interface DragState {
  isDragging: boolean;
  elementId: string | null;
  startX: number;
  startY: number;
  initialElementX: number;
  initialElementY: number;
}

export default function CanvasRenderer({
  canvasElements,
  selectedElement,
  designForm,
  isPreviewMode,
  canvasWidth,
  canvasHeight,
  scale,
  onElementSelect,
  onElementUpdate,
  onElementDuplicate,
  onElementDelete,
}: CanvasRendererProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    elementId: null,
    startX: 0,
    startY: 0,
    initialElementX: 0,
    initialElementY: 0,
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  const backgroundColor = designForm.getValues(
    "customizations.backgroundColor"
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, element: CanvasElement) => {
      if (isPreviewMode) return;

      e.preventDefault();
      e.stopPropagation();

      // Select the element
      onElementSelect(element);

      // Start dragging
      setDragState({
        isDragging: true,
        elementId: element.id,
        startX: e.clientX,
        startY: e.clientY,
        initialElementX: element.x,
        initialElementY: element.y,
      });
    },
    [isPreviewMode, onElementSelect]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging || !dragState.elementId || isPreviewMode)
        return;

      const deltaX = (e.clientX - dragState.startX) / scale;
      const deltaY = (e.clientY - dragState.startY) / scale;

      const newX = Math.max(0, dragState.initialElementX + deltaX);
      const newY = Math.max(0, dragState.initialElementY + deltaY);

      // Get canvas bounds to constrain movement
      const canvas = canvasRef.current;
      if (canvas) {
        const element = canvasElements.find(
          (el) => el.id === dragState.elementId
        );

        if (element) {
          const maxX = canvasWidth - element.width;
          const maxY = canvasHeight - element.height;

          const constrainedX = Math.min(Math.max(0, newX), maxX);
          const constrainedY = Math.min(Math.max(0, newY), maxY);

          onElementUpdate(dragState.elementId, {
            x: constrainedX,
            y: constrainedY,
          });
        }
      }
    },
    [
      dragState,
      isPreviewMode,
      onElementUpdate,
      canvasElements,
      canvasWidth,
      canvasHeight,
      scale,
    ]
  );

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging) {
      setDragState({
        isDragging: false,
        elementId: null,
        startX: 0,
        startY: 0,
        initialElementX: 0,
        initialElementY: 0,
      });
    }
  }, [dragState.isDragging]);

  // Attach global mouse events for dragging
  React.useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Deselect element when clicking on empty canvas
    if (e.target === e.currentTarget) {
      onElementSelect(null);
    }
  };

  return (
    <div
      ref={canvasRef}
      className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative bg-white overflow-hidden"
      style={{
        backgroundColor,
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
      onClick={handleCanvasClick}
    >
      {/* Render Canvas Elements */}
      {canvasElements.map((element) => (
        <CanvasElementRenderer
          key={element.id}
          element={element}
          isSelected={selectedElement?.id === element.id}
          isPreviewMode={isPreviewMode}
          isDragging={
            dragState.isDragging && dragState.elementId === element.id
          }
          onMouseDown={(e) => handleMouseDown(e, element)}
        />
      ))}

      {/* Empty State */}
      {canvasElements.length === 0 && (
        <div className="text-center text-gray-500 pointer-events-none">
          <Palette className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Start creating your design</p>
          <p className="text-sm">
            Add text, images, or shapes from the toolbar
          </p>
        </div>
      )}

      {/* Drag indicator */}
      {dragState.isDragging && (
        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs pointer-events-none">
          Dragging...
        </div>
      )}
    </div>
  );
}

interface CanvasElementRendererProps {
  element: CanvasElement;
  isSelected: boolean;
  isPreviewMode: boolean;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

function CanvasElementRenderer({
  element,
  isSelected,
  isPreviewMode,
  isDragging,
  onMouseDown,
}: CanvasElementRendererProps) {
  const getCursor = () => {
    if (isPreviewMode) return "default";
    if (isDragging) return "grabbing";
    return "grab";
  };

  return (
    <div
      className={`absolute border-2 transition-all duration-150 ${
        isSelected && !isPreviewMode
          ? "border-blue-500 shadow-lg"
          : isPreviewMode
            ? "border-transparent"
            : "border-transparent hover:border-blue-300 hover:shadow-md"
      } ${isDragging ? "z-50" : "z-10"}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: element.rotation
          ? `rotate(${element.rotation}deg)`
          : undefined,
        cursor: getCursor(),
        pointerEvents: isPreviewMode ? "none" : "auto",
      }}
      onMouseDown={onMouseDown}
    >
      {/* Element Content */}
      {element.type === "text" && (
        <div
          style={{
            fontFamily: element.font,
            fontSize: element.fontSize,
            fontWeight: element.fontWeight,
            color: element.color,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: isPreviewMode ? "none" : "auto",
            pointerEvents: isPreviewMode ? "none" : "auto",
          }}
        >
          {element.content}
        </div>
      )}

      {element.type === "shape" && (
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: element.color,
            borderRadius: element.shapeType === "circle" ? "50%" : "0",
          }}
        />
      )}

      {element.type === "image" && (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          {element.mediaId ? (
            <img
              src={`/api/media/${element.mediaId}`}
              alt="Uploaded content"
              className="w-full h-full object-contain"
              draggable={false}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-gray-400" />
          )}
        </div>
      )}

      {/* Selection Handles */}
      {isSelected && !isPreviewMode && (
        <>
          {/* Corner handles for resizing (you can implement resize functionality later) */}
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize" />
        </>
      )}
    </div>
  );
}
