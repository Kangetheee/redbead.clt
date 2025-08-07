import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Palette, Image as ImageIcon } from "lucide-react";

import { CanvasElement } from "@/lib/design-studio/types/design-studio.types";

interface CanvasRendererProps {
  canvasElements: CanvasElement[];
  selectedElement: CanvasElement | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  designForm: UseFormReturn<any>;
  isPreviewMode: boolean;
  onElementSelect: (element: CanvasElement | null) => void;
}

export default function CanvasRenderer({
  canvasElements,
  selectedElement,
  designForm,
  isPreviewMode,
  onElementSelect,
}: CanvasRendererProps) {
  const backgroundColor = designForm.getValues(
    "customizations.backgroundColor"
  );
  const canvasWidth = designForm.getValues("customizations.width");
  const canvasHeight = designForm.getValues("customizations.height");

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative bg-white overflow-hidden"
      style={{
        backgroundColor,
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        maxWidth: "800px",
        maxHeight: "600px",
      }}
    >
      {/* Render Canvas Elements */}
      {canvasElements.map((element) => (
        <CanvasElementRenderer
          key={element.id}
          element={element}
          isSelected={selectedElement?.id === element.id}
          isPreviewMode={isPreviewMode}
          onClick={() => onElementSelect(element)}
        />
      ))}

      {/* Empty State */}
      {canvasElements.length === 0 && (
        <div className="text-center text-gray-500">
          <Palette className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Start creating your design</p>
          <p className="text-sm">
            Add text, images, or shapes from the toolbar
          </p>
        </div>
      )}
    </div>
  );
}

interface CanvasElementRendererProps {
  element: CanvasElement;
  isSelected: boolean;
  isPreviewMode: boolean;
  onClick: () => void;
}

function CanvasElementRenderer({
  element,
  isSelected,
  isPreviewMode,
  onClick,
}: CanvasElementRendererProps) {
  return (
    <div
      className={`absolute cursor-pointer border-2 transition-colors ${
        isSelected && !isPreviewMode
          ? "border-blue-500"
          : isPreviewMode
            ? "border-transparent"
            : "border-transparent hover:border-gray-300"
      }`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: element.rotation
          ? `rotate(${element.rotation}deg)`
          : undefined,
        pointerEvents: isPreviewMode ? "none" : "auto",
      }}
      onClick={onClick}
    >
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
              onError={(e) => {
                // Fallback to placeholder on error
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
    </div>
  );
}
