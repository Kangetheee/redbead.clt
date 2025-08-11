import React from "react";
import { UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { CanvasElement } from "@/lib/design-studio/types/design-studio.types";

interface CanvasSettingsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  designForm: UseFormReturn<any>;
  canvasElements: CanvasElement[];
  onCanvasElementsChange: (elements: CanvasElement[]) => void;
}

export default function CanvasSettings({
  designForm,
  canvasElements,
  onCanvasElementsChange,
}: CanvasSettingsProps) {
  const handleBackgroundColorChange = (color: string) => {
    designForm.setValue("customizations.backgroundColor", color);
    // Force re-render by updating elements array reference
    onCanvasElementsChange([...canvasElements]);
  };

  const handleDimensionChange = (
    dimension: "width" | "height",
    value: number
  ) => {
    designForm.setValue(`customizations.${dimension}`, value);
    // Force re-render by updating elements array reference
    onCanvasElementsChange([...canvasElements]);
  };

  return (
    <div className="border-t pt-4">
      <h3 className="font-medium text-gray-900 mb-3">Canvas Settings</h3>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-600">Background Color</label>
          <div className="flex items-center space-x-2">
            <Input
              type="color"
              value={designForm.getValues("customizations.backgroundColor")}
              onChange={(e) => handleBackgroundColorChange(e.target.value)}
              className="h-8 w-16"
            />
            <Input
              type="text"
              value={designForm.getValues("customizations.backgroundColor")}
              onChange={(e) => handleBackgroundColorChange(e.target.value)}
              className="h-8 flex-1"
              placeholder="#ffffff"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-600">Canvas Width</label>
            <Input
              type="number"
              value={designForm.getValues("customizations.width")}
              onChange={(e) =>
                handleDimensionChange("width", Number(e.target.value))
              }
              className="h-8"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Canvas Height</label>
            <Input
              type="number"
              value={designForm.getValues("customizations.height")}
              onChange={(e) =>
                handleDimensionChange("height", Number(e.target.value))
              }
              className="h-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
