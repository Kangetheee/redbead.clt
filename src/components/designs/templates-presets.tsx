import React from "react";
import { UseFormReturn } from "react-hook-form";

import { CanvasElement } from "@/lib/design-studio/types/design-studio.types";

interface TemplatePresetsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  templatePresets: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  designForm: UseFormReturn<any>;
  selectedElement: CanvasElement | null;
  canvasElements: CanvasElement[];
  onCanvasElementsChange: (elements: CanvasElement[]) => void;
  onElementUpdate: (elementId: string, updates: Partial<CanvasElement>) => void;
}

export default function TemplatePresets({
  templatePresets,
  designForm,
  selectedElement,
  canvasElements,
  onCanvasElementsChange,
  onElementUpdate,
}: TemplatePresetsProps) {
  const handleColorSelect = (color: string) => {
    designForm.setValue("customizations.backgroundColor", color);
    onCanvasElementsChange([...canvasElements]);
  };

  const handleFontSelect = (font: string) => {
    if (selectedElement?.type === "text") {
      onElementUpdate(selectedElement.id, { font });
    }
  };

  if (!templatePresets) {
    return (
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900">Template Presets</h3>
        <div className="text-center text-gray-500 py-4">
          <p className="text-sm">No presets available</p>
          <p className="text-xs">
            This template doesn&apos;t include color or font presets
          </p>
        </div>
      </div>
    );
  }

  // Extract colors and fonts from templatePresets
  const colors = templatePresets.colors || [];
  const fonts = templatePresets.fonts || [];

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-gray-900">Template Presets</h3>

      {/* Color Presets */}
      {colors.length > 0 && (
        <div>
          <h4 className="text-sm text-gray-600 mb-2">Colors</h4>
          <div className="flex flex-wrap gap-2">
            {colors.map((color: string, index: number) => (
              <button
                key={index}
                className="w-8 h-8 rounded border border-gray-300 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Font Presets */}
      {fonts.length > 0 && (
        <div>
          <h4 className="text-sm text-gray-600 mb-2">Fonts</h4>
          <div className="space-y-1">
            {fonts.slice(0, 5).map((font: string, index: number) => (
              <button
                key={index}
                className={`block w-full text-left p-2 text-sm border border-gray-200 rounded transition-colors ${
                  selectedElement?.type === "text"
                    ? "hover:border-gray-300 cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
                style={{ fontFamily: font }}
                onClick={() => handleFontSelect(font)}
                disabled={selectedElement?.type !== "text"}
              >
                {font}
              </button>
            ))}
          </div>
          {selectedElement?.type !== "text" && (
            <p className="text-xs text-gray-500 mt-1">
              Select a text element to apply fonts
            </p>
          )}
        </div>
      )}

      {/* No Presets Message */}
      {colors.length === 0 && fonts.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          <p className="text-sm">No presets available</p>
          <p className="text-xs">
            This template doesn&apos;t include color or font presets
          </p>
        </div>
      )}
    </div>
  );
}
