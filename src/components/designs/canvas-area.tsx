import React from "react";
import { UseFormReturn } from "react-hook-form";

import {
  DesignResponse,
  CanvasElement,
} from "@/lib/design-studio/types/design-studio.types";
import {
  DesignTemplate,
  SizeVariant,
} from "@/lib/design-templates/types/design-template.types";

import CanvasRenderer from "./canvas-renderer";

interface CanvasAreaProps {
  selectedTemplate: DesignTemplate;
  selectedVariant: SizeVariant | null;
  currentDesign: DesignResponse | null;
  canvasElements: CanvasElement[];
  selectedElement: CanvasElement | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  designForm: UseFormReturn<any>;
  isPreviewMode: boolean;
  onElementSelect: (element: CanvasElement | null) => void;
  onElementUpdate: (elementId: string, updates: Partial<CanvasElement>) => void;
}

export default function CanvasArea({
  selectedTemplate,
  selectedVariant,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  currentDesign,
  canvasElements,
  selectedElement,
  designForm,
  isPreviewMode,
  onElementSelect,
  //   onElementUpdate,
}: CanvasAreaProps) {
  return (
    <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-hidden">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Canvas */}
          <CanvasRenderer
            canvasElements={canvasElements}
            selectedElement={selectedElement}
            designForm={designForm}
            isPreviewMode={isPreviewMode}
            onElementSelect={onElementSelect}
          />

          {/* Template Preview */}
          <div className="text-center">
            <img
              src={selectedTemplate.previewImage}
              alt={selectedTemplate.name}
              className="max-w-sm max-h-48 mx-auto rounded-lg shadow-sm mb-4"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
            <p className="text-gray-600 text-lg font-medium">
              {selectedTemplate.name}
            </p>
            {selectedVariant && (
              <p className="text-gray-500 text-sm mt-1">
                Size: {selectedVariant.displayName}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
