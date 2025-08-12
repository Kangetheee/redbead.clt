/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useEffect, useCallback, useState } from "react";
import fabric from "fabric";
import { UseFormReturn } from "react-hook-form";
import { Palette, Image as ImageIcon } from "lucide-react";
import { FabricObject } from "fabric";
import { CanvasElement } from "@/lib/design-studio/types/design-studio.types";

interface FabricCanvasRendererProps {
  canvasElements: CanvasElement[];
  selectedElement: CanvasElement | null;
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

interface FabricObjectWithData extends FabricObject {
  data?: CanvasElement;
}

declare module "fabric" {
  interface CanvasEvents {
    "key:down": KeyboardEvent; // custom event
  }

  interface FabricObject<
    Props extends fabric.TFabricObjectProps = Partial<fabric.FabricObjectProps>,
    SProps extends fabric.SerializedObjectProps = fabric.SerializedObjectProps,
    EventSpec extends fabric.ObjectEvents = fabric.ObjectEvents,
  > {
    data?: { id?: string; [key: string]: any };
  }
}

// Store canvas instance globally for external access
let globalFabricCanvas: fabric.Canvas | null = null;

export const getFabricCanvas = () => globalFabricCanvas;

export default function FabricCanvasRenderer({
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
}: FabricCanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || isInitialized) return;

    // Configure Fabric.js defaults
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerColor = "#2563eb";
    fabric.Object.prototype.cornerStyle = "circle";
    fabric.Object.prototype.cornerSize = 8;
    fabric.Object.prototype.borderColor = "#2563eb";
    fabric.Object.prototype.borderScaleFactor = 2;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor:
        designForm.getValues("customizations.backgroundColor") || "#ffffff",
      selection: !isPreviewMode,
      interactive: !isPreviewMode,
      preserveObjectStacking: true,
      allowTouchScrolling: false,
      imageSmoothingEnabled: true,
      enableRetinaScaling: true,
    });

    fabricCanvasRef.current = canvas;
    globalFabricCanvas = canvas;
    setIsInitialized(true);

    // Set up event handlers
    setupCanvasEvents(canvas);

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
      globalFabricCanvas = null;
      setIsInitialized(false);
    };
  }, [canvasWidth, canvasHeight, isInitialized]);

  // Setup canvas event handlers
  const setupCanvasEvents = (canvas: fabric.Canvas) => {
    // Object selection events
    canvas.on("selection:created", (e) => {
      const selected = (e.selected || []) as FabricObjectWithData[];
      const activeObject = selected[0];

      if (activeObject?.data) {
        onElementSelect(activeObject.data);
      }
    });

    canvas.on("selection:updated", (e) => {
      const selected = (e.selected || []) as FabricObjectWithData[];
      const activeObject = selected[0];

      if (activeObject?.data) {
        onElementSelect(activeObject.data);
      }
    });

    canvas.on("selection:cleared", () => {
      onElementSelect(null);
    });

    // Object modification events
    canvas.on("object:modified", (e) => {
      const obj = e.target as FabricObjectWithData;

      if (!obj?.data) return;

      const element = obj.data;
      const updates: Partial<CanvasElement> = {
        x: Math.round(obj.left ?? 0),
        y: Math.round(obj.top ?? 0),
        width: Math.round((obj.width ?? 0) * (obj.scaleX ?? 1)),
        height: Math.round((obj.height ?? 0) * (obj.scaleY ?? 1)),
        rotation: Math.round(obj.angle ?? 0),
      };

      // Handle text-specific updates
      if (element.type === "text" && obj.type === "i-text") {
        const textObj = obj as fabric.IText;
        updates.content = textObj.text ?? "";
        updates.fontSize = textObj.fontSize ?? updates.fontSize;
        updates.fontWeight = textObj.fontWeight as string;
        updates.color = textObj.fill as string;
        updates.font = textObj.fontFamily ?? updates.font;
      }

      // Handle shape-specific updates
      if (element.type === "shape") {
        updates.color = obj.fill as string;
      }

      // Reset scale to 1 after updating dimensions
      obj.set({ scaleX: 1, scaleY: 1 });

      onElementUpdate(element.id, updates);
    });

    // Object moving events
    canvas.on("object:moving", (e) => {
      setIsDragging(true);
    });

    canvas.on("object:modified", (e) => {
      const obj = e.target as
        | (fabric.Object & { data?: CanvasElement })
        | undefined;
      if (obj?.data) {
        const element = obj.data;
        onElementUpdate(element.id, {
          x: Math.round(obj.left ?? 0),
          y: Math.round(obj.top ?? 0),
        });
      }
    });

    // Attach listener to the actual canvas DOM element
    canvas.upperCanvasEl.tabIndex = 1000; // Make it focusable
    canvas.upperCanvasEl.focus();

    canvas.upperCanvasEl.addEventListener("keydown", (e: KeyboardEvent) => {
      const activeObject = canvas.getActiveObject() as
        | (fabric.Object & { data?: CanvasElement })
        | null;
      if (!activeObject || !activeObject.data) return;

      const element = activeObject.data;

      switch (e.key) {
        case "Delete":
        case "Backspace":
          e.preventDefault();
          onElementDelete(element.id);
          break;

        case "d":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onElementDuplicate(element.id);
          }
          break;

        case "ArrowLeft":
        case "ArrowRight":
        case "ArrowUp":
        case "ArrowDown":
          e.preventDefault();
          handleArrowKeyMovement(e.key, e.shiftKey, activeObject);
          break;
      }
    });
    // Enable keyboard events
    canvas.wrapperEl.tabIndex = 0;
    canvas.wrapperEl.addEventListener("keydown", (e) => {
      canvas.fire("key:down", e);
    });

    // Listen for the custom event
    canvas.on("key:down", (e) => {
      console.log("Key pressed:", e.key);
    });
  };

  const handleArrowKeyMovement = (
    key: string,
    shiftKey: boolean,
    obj: FabricObjectWithData
  ) => {
    const moveDistance = shiftKey ? 10 : 1;
    const currentLeft = obj.left || 0;
    const currentTop = obj.top || 0;

    let newLeft = currentLeft;
    let newTop = currentTop;

    switch (key) {
      case "ArrowLeft":
        newLeft = Math.max(0, currentLeft - moveDistance);
        break;
      case "ArrowRight":
        newLeft = Math.min(
          canvasWidth - (obj.getScaledWidth() || 0),
          currentLeft + moveDistance
        );
        break;
      case "ArrowUp":
        newTop = Math.max(0, currentTop - moveDistance);
        break;
      case "ArrowDown":
        newTop = Math.min(
          canvasHeight - (obj.getScaledHeight() || 0),
          currentTop + moveDistance
        );
        break;
    }

    obj.set({ left: newLeft, top: newTop });
    fabricCanvasRef.current?.renderAll();

    if (obj.data && typeof obj.data === "object" && "id" in obj.data) {
      const element = obj.data as CanvasElement;
      onElementUpdate(element.id, { x: newLeft, y: newTop });
    }
  };

  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const backgroundColor = designForm.watch("customizations.backgroundColor");

    // ✅ Fabric.js v5 way
    fabricCanvasRef.current.backgroundColor = backgroundColor;
    fabricCanvasRef.current.renderAll();
  }, [designForm, designForm.watch("customizations.backgroundColor")]);

  // Update canvas dimensions
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setDimensions({
        width: canvasWidth,
        height: canvasHeight,
      });
    }
  }, [canvasWidth, canvasHeight]);

  // Update canvas interaction mode
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;

    // Allow/disallow selection of multiple objects
    canvas.selection = !isPreviewMode;

    // For each object on the canvas
    canvas.forEachObject((obj) => {
      obj.selectable = !isPreviewMode; // can click/select
      obj.evented = !isPreviewMode; // can trigger events like drag
      obj.hoverCursor = isPreviewMode ? "default" : "move";
      obj.moveCursor = isPreviewMode ? "default" : "move";
    });

    canvas.renderAll();
  }, [isPreviewMode]);

  // Sync canvas elements with state
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;

    // ✅ Get a snapshot of objects
    const currentObjects = canvas.getObjects();
    const currentElementIds = currentObjects
      .map((obj) => obj.data?.id)
      .filter(Boolean);

    const newElementIds = canvasElements.map((el) => el.id);

    // ✅ Remove objects that are not in newElementIds
    currentObjects.forEach((obj) => {
      const objId = obj.data?.id;
      if (objId && !newElementIds.includes(objId)) {
        canvas.remove(obj);
      }
    });

    // ✅ Add or update elements
    canvasElements.forEach((element) => {
      const existingObject = canvas
        .getObjects()
        .find((obj) => obj.data?.id === element.id);

      if (existingObject) {
        // Update existing object without replacing it
        updateFabricObject(existingObject, element);
      } else {
        // Create new Fabric object for this element
        addElementToCanvas(canvas, element);
      }
    });

    canvas.renderAll();
  }, [canvasElements]);

  // Update existing Fabric object with new element data
  const updateFabricObject = (
    fabricObject: fabric.Object,
    element: CanvasElement
  ) => {
    const updates: any = {
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      angle: element.rotation || 0,
    };

    if (element.type === "text") {
      Object.assign(updates, {
        text: element.content,
        fontSize: element.fontSize,
        fontWeight: element.fontWeight,
        fill: element.color,
        fontFamily: element.font,
      });
    }

    if (element.type === "shape") {
      updates.fill = element.color;
    }

    fabricObject.set(updates);
    fabricObject.data = element;
  };

  // Add element to Fabric canvas
  const addElementToCanvas = (
    canvas: fabric.Canvas,
    element: CanvasElement
  ) => {
    let fabricObject: fabric.Object;

    switch (element.type) {
      case "text":
        fabricObject = new fabric.IText(element.content || "Text", {
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          fontFamily: element.font || "Arial",
          fontSize: element.fontSize || 16,
          fontWeight: element.fontWeight || "normal",
          fill: element.color || "#000000",
          angle: element.rotation || 0,
          editable: !isPreviewMode,
        });
        break;

      case "shape":
        if (element.shapeType === "circle") {
          fabricObject = new fabric.Circle({
            left: element.x,
            top: element.y,
            radius: Math.min(element.width, element.height) / 2,
            fill: element.color || "#0066cc",
            angle: element.rotation || 0,
          });
        } else if (element.shapeType === "triangle") {
          fabricObject = new fabric.Triangle({
            left: element.x,
            top: element.y,
            width: element.width,
            height: element.height,
            fill: element.color || "#0066cc",
            angle: element.rotation || 0,
          });
        } else {
          fabricObject = new fabric.Rect({
            left: element.x,
            top: element.y,
            width: element.width,
            height: element.height,
            fill: element.color || "#0066cc",
            angle: element.rotation || 0,
          });
        }
        break;

      case "image":
        if (element.mediaId) {
          // Load image from URL (Promise-based API)
          fabric.Image.fromURL(`/api/media/${element.mediaId}`, {
            crossOrigin: "anonymous",
          })
            .then((img) => {
              img.set({
                left: element.x,
                top: element.y,
                angle: element.rotation || 0,
              });
              img.scaleToWidth(element.width);
              img.scaleToHeight(element.height);
              (img as any).data = element; // Keep your custom data
              img.selectable = !isPreviewMode;
              img.evented = !isPreviewMode;
              canvas.add(img);
              canvas.renderAll();
            })
            .catch((err) => {
              console.error("Error loading image:", err);
            });

          return; // Early return for async image loading
        } else {
          // Placeholder rectangle for empty image
          fabricObject = new fabric.Rect({
            left: element.x,
            top: element.y,
            width: element.width,
            height: element.height,
            fill: "#f0f0f0",
            stroke: "#cccccc",
            strokeWidth: 2,
            strokeDashArray: [5, 5],
            angle: element.rotation || 0,
          });
        }
        break;
      default:
        return;
    }

    // Store element data in fabric object
    fabricObject.data = element;

    // Set selection properties
    fabricObject.selectable = !isPreviewMode;
    fabricObject.evented = !isPreviewMode;
    fabricObject.hoverCursor = isPreviewMode ? "default" : "move";
    fabricObject.moveCursor = isPreviewMode ? "default" : "move";

    canvas.add(fabricObject);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Focus canvas for keyboard events
    if (canvasRef.current?.parentElement) {
      (canvasRef.current.parentElement as HTMLElement).focus();
    }
  };

  return (
    <div
      className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white"
      style={{
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
      onClick={handleCanvasClick}
      tabIndex={0}
    >
      <canvas ref={canvasRef} />

      {/* Empty State */}
      {canvasElements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 pointer-events-none">
          <div className="text-center">
            <Palette className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Start creating your design</p>
            <p className="text-sm">
              Add text, images, or shapes from the toolbar
            </p>
          </div>
        </div>
      )}

      {/* Drag indicator */}
      {isDragging && (
        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs pointer-events-none">
          Moving...
        </div>
      )}

      {/* Selection indicator */}
      {selectedElement && !isPreviewMode && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs pointer-events-none">
          Selected: {selectedElement.type}
        </div>
      )}
    </div>
  );
}

// Export utility functions for external use
export const fabricCanvasUtils = {
  addText: (text: string = "New Text") => {
    if (!globalFabricCanvas) return;

    const textObject = new fabric.IText(text, {
      left: 100,
      top: 100,
      fontFamily: "Arial",
      fontSize: 20,
      fill: "#000000",
    });

    globalFabricCanvas.add(textObject);
    globalFabricCanvas.setActiveObject(textObject);
    globalFabricCanvas.renderAll();

    return textObject;
  },

  addShape: (type: "rect" | "circle" | "triangle") => {
    if (!globalFabricCanvas) return;

    let shape: fabric.Object;

    switch (type) {
      case "circle":
        shape = new fabric.Circle({
          left: 100,
          top: 100,
          radius: 50,
          fill: "#0066cc",
        });
        break;
      case "triangle":
        shape = new fabric.Triangle({
          left: 100,
          top: 100,
          width: 100,
          height: 100,
          fill: "#0066cc",
        });
        break;
      default:
        shape = new fabric.Rect({
          left: 100,
          top: 100,
          width: 100,
          height: 100,
          fill: "#0066cc",
        });
    }

    globalFabricCanvas.add(shape);
    globalFabricCanvas.setActiveObject(shape);
    globalFabricCanvas.renderAll();

    return shape;
  },

  addImageFromUrl: async (url: string) => {
    if (!globalFabricCanvas) return;

    try {
      const img = await fabric.Image.fromURL(url, {
        crossOrigin: "anonymous",
      });

      img.set({
        left: 100,
        top: 100,
        scaleX: 0.5,
        scaleY: 0.5,
      });

      globalFabricCanvas.add(img);
      globalFabricCanvas.setActiveObject(img);
      globalFabricCanvas.renderAll();
    } catch (err) {
      console.error("Error loading image:", err);
    }
  },
};

export const canvasUtils = {
  exportCanvas: (
    format: "png" | "jpg" | "jpeg" | "svg" | "pdf" = "png",
    quality: number = 1
  ): string | null => {
    if (!globalFabricCanvas) return null;

    const fmt = format.toLowerCase();

    if (fmt === "svg") {
      return globalFabricCanvas.toSVG();
    }

    if (fmt === "jpg" || fmt === "jpeg") {
      return globalFabricCanvas.toDataURL({
        format: "jpeg",
        quality,
        multiplier: 1,
      });
    }

    return globalFabricCanvas.toDataURL({
      format: "png",
      quality,
      multiplier: 1,
    });
  },

  getCanvas: (): fabric.Canvas | null => globalFabricCanvas ?? null,
};
