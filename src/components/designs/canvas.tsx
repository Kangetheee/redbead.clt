"use client";

import React, { useRef, useCallback, useState } from "react";
import { Rnd } from "react-rnd";
import { Image, Palette, ZoomIn, Printer, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDesignContext } from "./design-context";
import { CanvasElement } from "@/lib/design-studio/types/design-studio.types";
import { cn } from "@/lib/utils";

interface CanvasProps {
  className?: string;
}

export default function Canvas({ className }: CanvasProps) {
  const {
    elements,
    selectedElement,
    canvasSettings,
    isPreviewMode,
    selectElement,
    updateElement,
    updateCanvasSettings,
    dispatch,
  } = useDesignContext();

  const canvasRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [canvasScale, setCanvasScale] = useState(1);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const mmToPx = useCallback((mm: number) => {
    return (mm * 96) / 25.4; // 25.4mm = 1 inch
  }, []);

  const canvasWidthPx = mmToPx(canvasSettings.width);
  const canvasHeightPx = mmToPx(canvasSettings.height);

  const handleElementClick = useCallback(
    (element: CanvasElement) => {
      if (!isPreviewMode) {
        selectElement(element);
      }
    },
    [isPreviewMode, selectElement]
  );

  const handleElementUpdate = useCallback(
    (
      elementId: string,
      position: { x: number; y: number },
      size?: { width: number; height: number }
    ) => {
      const updates: Partial<CanvasElement> = {
        x: position.x,
        y: position.y,
      };

      if (size) {
        updates.width = size.width;
        updates.height = size.height;
      }

      updateElement(elementId, updates);
    },
    [updateElement]
  );

  const renderElement = useCallback(
    (element: CanvasElement) => {
      const isSelected = selectedElement?.id === element.id && !isPreviewMode;

      return (
        <Rnd
          key={element.id}
          position={{ x: element.x, y: element.y }}
          size={{
            width: element.width || 100,
            height: element.height || 40,
          }}
          onDragStop={(e, data) => {
            handleElementUpdate(element.id, { x: data.x, y: data.y });
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            handleElementUpdate(element.id, position, {
              width: parseInt(ref.style.width),
              height: parseInt(ref.style.height),
            });
          }}
          disableDragging={isPreviewMode}
          enableResizing={!isPreviewMode}
          bounds="parent"
          className={cn(
            "cursor-pointer transition-all duration-200",
            isSelected && "ring-2 ring-blue-500"
          )}
        >
          <div
            className="w-full h-full relative"
            onClick={() => handleElementClick(element)}
          >
            {/* Text Element */}
            {element.type === "text" && (
              <div
                className="w-full h-full flex items-center justify-center text-center px-2 py-1"
                style={{
                  fontFamily: element.font || "Arial",
                  fontSize: `${element.fontSize || 14}px`,
                  fontWeight: element.fontWeight || "normal",
                  color: element.color || "#000000",
                  backgroundColor:
                    element.properties?.backgroundColor || "transparent",
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  textAlign: (element.properties?.textAlign as any) || "center",
                  lineHeight: element.properties?.lineHeight || "1.4",
                  transform: `rotate(${element.rotation || 0}deg)`,
                }}
              >
                {element.content || "Text"}
              </div>
            )}

            {/* Image Element */}
            {element.type === "image" && (
              <div
                className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center"
                style={{
                  transform: `rotate(${element.rotation || 0}deg)`,
                }}
              >
                {element.mediaId ? (
                  <img
                    src={`http://localhost:3001/v1/uploads/${element.mediaId}/file`}
                    alt="Design element"
                    className="w-full h-full object-contain"
                    onLoad={() => {
                      console.log(
                        "Image loaded successfully:",
                        element.mediaId
                      );
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.error("Failed to load image:", {
                        mediaId: element.mediaId,
                        attemptedSrc: target.src,
                      });
                      target.style.display = "none";

                      // Show fallback content
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector(".image-fallback")) {
                        const fallback = document.createElement("div");
                        fallback.className =
                          "image-fallback flex flex-col items-center justify-center text-gray-400 text-xs h-full w-full";
                        fallback.innerHTML = `
              <svg class="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
              <span>Image failed to load</span>
              <span class="text-xs mt-1 opacity-75">ID: ${element.mediaId}</span>
            `;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Image className="w-6 h-6 mb-1" />
                    <span className="text-xs">No image selected</span>
                  </div>
                )}
              </div>
            )}

            {/* Shape Element */}
            {element.type === "shape" && (
              <div
                className="w-full h-full"
                style={{
                  backgroundColor: element.color || "#0066cc",
                  borderRadius:
                    element.shapeType === "circle"
                      ? "50%"
                      : element.shapeType === "rounded-rectangle"
                        ? "8px"
                        : "0",
                  clipPath:
                    element.shapeType === "triangle"
                      ? "polygon(50% 0%, 0% 100%, 100% 100%)"
                      : "none",
                  transform: `rotate(${element.rotation || 0}deg)`,
                }}
              />
            )}
            {/* Selection indicators */}
            {isSelected && (
              <>
                <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  {element.type}
                </div>

                {/* Resize handles for images */}
                {element.type === "image" && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize" />
                )}
              </>
            )}
          </div>
        </Rnd>
      );
    },
    [selectedElement, isPreviewMode, handleElementClick, handleElementUpdate]
  );

  const togglePreviewMode = () => {
    dispatch({ type: "SET_PREVIEW_MODE", payload: !isPreviewMode });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Canvas Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              updateCanvasSettings({
                zoom: Math.min(3, canvasSettings.zoom + 0.25),
              })
            }
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600">
            {Math.round(canvasSettings.zoom * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Print Preview</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <div
                    className="mx-auto bg-gray-100 rounded-lg overflow-hidden"
                    style={{
                      width: `${canvasWidthPx * 0.5}px`,
                      height: `${canvasHeightPx * 0.5}px`,
                    }}
                  >
                    <div
                      className="w-full h-full relative"
                      style={{
                        backgroundColor: canvasSettings.backgroundColor,
                      }}
                    >
                      {elements
                        .filter((el) => el.properties?.visible !== false)
                        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                        .map((element) => (
                          <div
                            key={element.id}
                            className="absolute"
                            style={{
                              left: `${(element.x / canvasWidthPx) * 100}%`,
                              top: `${(element.y / canvasHeightPx) * 100}%`,
                              transform: `rotate(${element.rotation || 0}deg)`,
                              fontSize:
                                element.type === "text"
                                  ? `${(element.fontSize || 16) * 0.5}px`
                                  : undefined,
                              color: element.color,
                              fontFamily: element.font,
                              fontWeight: element.fontWeight,
                            }}
                          >
                            {element.type === "text" ? (
                              element.content
                            ) : element.type === "image" && element.mediaId ? (
                              <img
                                src={`${process.env.API_URL}${element.url}`}
                                alt="Design element"
                                style={{
                                  width: `${(element.width || 50) * 0.5}px`,
                                  height: `${(element.height || 50) * 0.5}px`,
                                }}
                              />
                            ) : null}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={togglePreviewMode}
            className={isPreviewMode ? "bg-blue-50" : ""}
          >
            <Eye className="w-4 h-4 mr-2" />
            {isPreviewMode ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <Card className="p-8 bg-white">
        <div className="flex justify-center">
          <div
            ref={canvasRef}
            className="relative bg-white border-2 border-dashed border-gray-300 rounded-lg shadow-lg"
            style={{
              width: `${canvasWidthPx * canvasSettings.zoom}px`,
              height: `${canvasHeightPx * canvasSettings.zoom}px`,
              backgroundColor: canvasSettings.backgroundColor,
              backgroundImage: canvasSettings.showGrid
                ? `linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)`
                : "none",
              backgroundSize: canvasSettings.showGrid
                ? `${20 * canvasSettings.zoom}px ${20 * canvasSettings.zoom}px`
                : "auto",
            }}
            onClick={() => !isPreviewMode && selectElement(null)}
          >
            {/* Print Area Label */}
            <div className="absolute top-2 left-2 text-xs text-white font-mono bg-black/50 px-2 py-1 rounded">
              **PRINT AREA = {canvasSettings.width}MM X {canvasSettings.height}
              MM**
            </div>

            {/* Render all elements */}
            {elements
              .filter((element) => element.properties?.visible !== false)
              .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
              .map(renderElement)}

            {/* Empty state */}
            {elements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Palette className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Start designing</p>
                  <p className="text-xs">Add elements from the left panel</p>
                </div>
              </div>
            )}

            {/* Design ID */}
            <div className="absolute left-2 bottom-2 text-xs text-white font-mono bg-black/50 px-2 py-1 rounded">
              ID: DS001
            </div>
            <div className="absolute right-2 bottom-2 text-xs text-white font-mono bg-black/50 px-2 py-1 rounded">
              ID: DS001
            </div>
          </div>
        </div>
      </Card>

      {/* Canvas Info */}
      <div className="text-center text-xs text-gray-500">
        {canvasSettings.width}mm × {canvasSettings.height}mm (
        {Math.round(canvasSettings.zoom * 100)}% zoom)
      </div>
    </div>
  );
}
