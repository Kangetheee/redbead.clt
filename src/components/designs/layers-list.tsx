import React from "react";
import { Layers } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CanvasElement } from "@/lib/design-studio/types/design-studio.types";

interface LayersListProps {
  canvasElements: CanvasElement[];
  selectedElement: CanvasElement | null;
  onSelectElement: (element: CanvasElement | null) => void;
  onDeleteElement: (elementId: string) => void;
}

export default function LayersList({
  canvasElements,
  selectedElement,
  onSelectElement,
  onDeleteElement,
}: LayersListProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium text-gray-900 flex items-center">
        <Layers className="w-4 h-4 mr-2" />
        Layers ({canvasElements.length})
      </h3>

      <div className="space-y-1">
        {canvasElements.map((element) => (
          <div
            key={element.id}
            className={`p-2 rounded border cursor-pointer transition-colors ${
              selectedElement?.id === element.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => onSelectElement(element)}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium capitalize">
                {element.type}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteElement(element.id);
                }}
                className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
              >
                ×
              </Button>
            </div>
            {element.content && (
              <p className="text-xs text-gray-600 truncate">
                {element.content}
              </p>
            )}
          </div>
        ))}

        {canvasElements.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            <p className="text-sm">No elements yet</p>
            <p className="text-xs">Add elements to start designing</p>
          </div>
        )}
      </div>
    </div>
  );
}
