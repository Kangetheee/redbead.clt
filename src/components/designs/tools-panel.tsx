"use client";

import React, { useState, useCallback } from "react";
import {
  Type,
  Image,
  Shapes,
  Upload,
  Layers,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDesignContext } from "./design-context";
import { useUploadArtwork } from "@/hooks/use-design-studio";
import { CanvasElement } from "@/lib/design-studio/types/design-studio.types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Default color palette
const defaultColorPalette = [
  // Popular colors
  ["#ef4444", "#f97316", "#fcd34d", "#84cc16", "#22c55e", "#06b6d4"],
  // Standard colors
  ["#000000", "#333333", "#555555", "#777777", "#999999", "#bbbbbb"],
  // Additional colors
  ["#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#ffffff", "#f2f2f2"],
];

interface ToolsPanelProps {
  colorPresets?: Array<{
    id: string;
    name: string;
    hexCode: string;
    category?: string;
  }>;
  fontPresets?: Array<{
    id: string;
    family: string;
    displayName: string;
    category: string;
    isPremium: boolean;
  }>;
  fonts?: Array<{ id: string; family: string; displayName: string }>;
  templateInfo?: {
    name: string;
    category: { name: string };
    product: { name: string };
    basePrice: number;
  };
  sizeVariantInfo?: {
    displayName: string;
    dimensions: { width: number; height: number; unit: string; dpi?: number };
    price: number;
  };
  priceCalculation?: {
    totalPrice: number;
    breakdown?: Array<{ item: string; price: number }>;
  };
}

export default function ToolsPanel({
  colorPresets = [],
  fontPresets = [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fonts = [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  templateInfo,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sizeVariantInfo,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  priceCalculation,
}: ToolsPanelProps) {
  const {
    elements,
    selectedElement,
    canvasSettings,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    updateCanvasSettings,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useDesignContext();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#ef4444");
  const [uploadProgress, setUploadProgress] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadArtwork = useUploadArtwork();

  // Use default palette if no presets provided
  const colorPalette =
    colorPresets.length > 0
      ? colorPresets.reduce((acc, color, index) => {
          const rowIndex = Math.floor(index / 6);
          if (!acc[rowIndex]) acc[rowIndex] = [];
          acc[rowIndex].push(color.hexCode);
          return acc;
        }, [] as string[][])
      : defaultColorPalette;

  // Tool functions
  const addTextElement = useCallback(() => {
    const defaultFont = fontPresets[0]?.family || "Arial";

    const newElement: CanvasElement = {
      id: `text-${Date.now()}`,
      type: "text",
      x: 50,
      y: 30,
      width: 150,
      height: 30,
      content: "Your Text Here",
      font: defaultFont,
      fontSize: 16,
      fontWeight: "normal",
      color: selectedColor,
      properties: {
        textAlign: "center",
        lineHeight: "1.4",
      },
    };

    addElement(newElement);
  }, [addElement, fontPresets, selectedColor]);

  const addImageElement = useCallback(() => {
    const newElement: CanvasElement = {
      id: `image-${Date.now()}`,
      type: "image",
      x: 80,
      y: 50,
      width: 80,
      height: 60,
      mediaId: "",
    };

    addElement(newElement);
  }, [addElement]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addShapeElement = useCallback(
    (shapeType: string = "rectangle") => {
      const newElement: CanvasElement = {
        id: `shape-${Date.now()}`,
        type: "shape",
        x: 120,
        y: 40,
        width: 60,
        height: shapeType === "circle" ? 60 : 40,
        shapeType,
        color: selectedColor,
      };

      addElement(newElement);
    },
    [addElement, selectedColor]
  );

  const handleFileUpload = useCallback(
    (file: File) => {
      setSelectedFile(file);
      setUploadProgress(0);

      uploadArtwork.mutate(
        {
          file,
          values: { canvasId: "current-canvas", position: "center" },
        },
        {
          onSuccess: (response) => {
            console.log("Upload success, creating element:", response);

            const newElement: CanvasElement = {
              id: `uploaded-${Date.now()}`,
              type: "image",
              x: 50,
              y: 50,
              width: 80,
              height: 60,
              mediaId: response.mediaId,
              url: response.url, // ✓ Add this line - use the URL from response
            };

            console.log("Adding new element:", newElement);
            addElement(newElement);
            toast.success("Image uploaded and added to design");
            setSelectedFile(null);
          },
          onError: (error) => {
            console.error("Upload failed:", error);
            toast.error(`Failed to upload: ${error.message}`);
            setSelectedFile(null);
          },
        }
      );
    },
    [uploadArtwork, addElement]
  );

  const duplicateElement = useCallback(() => {
    if (!selectedElement) return;

    const newElement: CanvasElement = {
      ...selectedElement,
      id: `${selectedElement.type}-${Date.now()}`,
      x: selectedElement.x + 10,
      y: selectedElement.y + 10,
    };

    addElement(newElement);
  }, [selectedElement, addElement]);

  // Sort elements by zIndex for proper layer display
  const sortedElements = [...elements].sort(
    (a, b) => (b.zIndex || 0) - (a.zIndex || 0)
  );

  const toggleElementVisibility = (id: string) => {
    updateElement(id, {
      properties: {
        ...elements.find((el) => el.id === id)?.properties,
        visible: !elements.find((el) => el.id === id)?.properties?.visible,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Quick Actions Card */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Tools</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={addTextElement}
            className="flex flex-col h-16 p-2 bg-transparent"
          >
            <Type className="w-5 h-5 mb-1" />
            <span className="text-xs">Text</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={addImageElement}
            className="flex flex-col h-16 p-2 bg-transparent"
          >
            <Upload className="w-5 h-5 mb-1" />
            <span className="text-xs">Image</span>
          </Button>
        </div>
      </Card>

      {/* Base Color Card */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Base Color</h3>
        <Button
          variant="outline"
          className="w-full mb-3 bg-transparent"
          onClick={() => setShowColorPicker(!showColorPicker)}
        >
          <div
            className="w-4 h-4 rounded mr-2 border border-gray-300"
            style={{ backgroundColor: canvasSettings.backgroundColor }}
          />
          <span className="text-sm">Change Color</span>
        </Button>

        {showColorPicker && (
          <div className="space-y-3">
            {colorPalette.map((row, rowIndex) => (
              <div key={rowIndex}>
                <div className="grid grid-cols-6 gap-1">
                  {row.map((color, index) => (
                    <button
                      key={`${rowIndex}-${index}`}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setSelectedColor(color);
                        updateCanvasSettings({ backgroundColor: color });
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Custom Color */}
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">Custom</p>
              <input
                type="color"
                value={canvasSettings.backgroundColor}
                onChange={(e) => {
                  setSelectedColor(e.target.value);
                  updateCanvasSettings({ backgroundColor: e.target.value });
                }}
                className="w-full h-8 rounded border border-gray-300"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Layers Card */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Layers</h3>
          <span className="text-xs text-gray-500">{elements.length}</span>
        </div>

        <div className="space-y-1 max-h-48 overflow-y-auto">
          {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
          {sortedElements.map((element, index) => (
            <div
              key={element.id}
              className={cn(
                "p-2 rounded cursor-pointer text-sm border",
                selectedElement?.id === element.id
                  ? "bg-blue-100 border-blue-300"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              )}
              onClick={() => selectElement(element)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {element.type === "text" ? (
                    <Type className="w-3 h-3" />
                  ) : element.type === "image" ? (
                    <Image className="w-3 h-3" />
                  ) : (
                    <Shapes className="w-3 h-3" />
                  )}
                  <span className="truncate">
                    {element.type === "text" ? element.content : element.type}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleElementVisibility(element.id);
                    }}
                  >
                    {element.properties?.visible !== false ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {elements.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <Layers className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No elements yet</p>
              <p className="text-xs">Add elements to start designing</p>
            </div>
          )}
        </div>
      </Card>

      {/* Upload Section */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Upload Assets</h3>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Drop files here or click to upload
          </p>
          <input
            type="file"
            accept="image/*,.svg,.pdf"
            className="hidden"
            id="file-upload"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileUpload(file);
              }
            }}
          />
          <label htmlFor="file-upload">
            <Button variant="outline" size="sm" asChild>
              <span>Choose File</span>
            </Button>
          </label>
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Actions</h3>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
              title="Undo"
              className="flex-1"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={!canRedo}
              title="Redo"
              className="flex-1"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={duplicateElement}
            disabled={!selectedElement}
            title="Duplicate"
            className="w-full"
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>
        </div>
      </Card>
    </div>
  );
}
