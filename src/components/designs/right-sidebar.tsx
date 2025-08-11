import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Square } from "lucide-react";

import {
  DesignResponse,
  CanvasElement,
} from "@/lib/design-studio/types/design-studio.types";
import {
  DesignTemplate,
  SizeVariant,
} from "@/lib/design-templates/types/design-template.types";

import ElementProperties from "./element-properties";
import CanvasSettings from "./canvas-settings";
import ProductInformation from "./product-information";
import DesignInformation from "./design-information";

interface RightSidebarProps {
  selectedElement: CanvasElement | null;
  selectedTemplate: DesignTemplate;
  selectedVariant: SizeVariant | null;
  currentDesign: DesignResponse | null;
  canvasElements: CanvasElement[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  designForm: UseFormReturn<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fonts: any;
  onElementUpdate: (elementId: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (elementId: string) => void;
  onUploadArtwork: (file: File) => void;
  onCanvasElementsChange: (elements: CanvasElement[]) => void;
}

export default function RightSidebar({
  selectedElement,
  selectedTemplate,
  selectedVariant,
  currentDesign,
  canvasElements,
  designForm,
  fonts,
  onElementUpdate,
  onDeleteElement,
  onUploadArtwork,
  onCanvasElementsChange,
}: RightSidebarProps) {
  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
      </div>

      <div className="p-4 space-y-6">
        {selectedElement ? (
          <ElementProperties
            selectedElement={selectedElement}
            fonts={fonts}
            onElementUpdate={onElementUpdate}
            onDeleteElement={onDeleteElement}
            onUploadArtwork={onUploadArtwork}
          />
        ) : (
          <div className="text-center text-gray-500">
            <div className="mb-4">
              <Square className="w-12 h-12 mx-auto text-gray-300" />
            </div>
            <p className="text-sm">Select an element to edit its properties</p>
            <p className="text-xs text-gray-400 mt-2">
              Click on any element in the canvas to start editing
            </p>
          </div>
        )}

        <CanvasSettings
          designForm={designForm}
          canvasElements={canvasElements}
          onCanvasElementsChange={onCanvasElementsChange}
        />

        {selectedVariant && (
          <ProductInformation
            selectedTemplate={selectedTemplate}
            selectedVariant={selectedVariant}
          />
        )}

        {currentDesign && <DesignInformation currentDesign={currentDesign} />}
      </div>
    </div>
  );
}
