import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CanvasElement } from "@/lib/design-studio/types/design-studio.types";

interface ElementPropertiesProps {
  selectedElement: CanvasElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fonts: any;
  onElementUpdate: (elementId: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (elementId: string) => void;
  onUploadArtwork: (file: File) => void;
}

export default function ElementProperties({
  selectedElement,
  fonts,
  onElementUpdate,
  onDeleteElement,
  onUploadArtwork,
}: ElementPropertiesProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 capitalize">
        {selectedElement.type} Properties
      </h3>

      {/* Common Properties */}
      <CommonProperties element={selectedElement} onUpdate={onElementUpdate} />

      {/* Type-specific Properties */}
      {selectedElement.type === "text" && (
        <TextProperties
          element={selectedElement}
          fonts={fonts}
          onUpdate={onElementUpdate}
        />
      )}

      {selectedElement.type === "shape" && (
        <ShapeProperties element={selectedElement} onUpdate={onElementUpdate} />
      )}

      {selectedElement.type === "image" && (
        <ImageProperties
          element={selectedElement}
          onUpdate={onElementUpdate}
          onUploadArtwork={onUploadArtwork}
        />
      )}

      {/* Delete Element Button */}
      <div className="border-t pt-4">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDeleteElement(selectedElement.id)}
          className="w-full"
        >
          Delete Element
        </Button>
      </div>
    </div>
  );
}

interface CommonPropertiesProps {
  element: CanvasElement;
  onUpdate: (elementId: string, updates: Partial<CanvasElement>) => void;
}

function CommonProperties({ element, onUpdate }: CommonPropertiesProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-600">X Position</label>
          <Input
            type="number"
            value={element.x}
            onChange={(e) =>
              onUpdate(element.id, { x: Number(e.target.value) })
            }
            className="h-8"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600">Y Position</label>
          <Input
            type="number"
            value={element.y}
            onChange={(e) =>
              onUpdate(element.id, { y: Number(e.target.value) })
            }
            className="h-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-600">Width</label>
          <Input
            type="number"
            value={element.width}
            onChange={(e) =>
              onUpdate(element.id, { width: Number(e.target.value) })
            }
            className="h-8"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600">Height</label>
          <Input
            type="number"
            value={element.height}
            onChange={(e) =>
              onUpdate(element.id, { height: Number(e.target.value) })
            }
            className="h-8"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-600">Rotation (degrees)</label>
        <Input
          type="number"
          value={element.rotation || 0}
          onChange={(e) =>
            onUpdate(element.id, { rotation: Number(e.target.value) })
          }
          className="h-8"
        />
      </div>
    </div>
  );
}

interface TextPropertiesProps {
  element: CanvasElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fonts: any;
  onUpdate: (elementId: string, updates: Partial<CanvasElement>) => void;
}

function TextProperties({ element, fonts, onUpdate }: TextPropertiesProps) {
  return (
    <div className="space-y-3 border-t pt-4">
      <h4 className="font-medium text-gray-900">Text Properties</h4>

      <div>
        <label className="text-xs text-gray-600">Content</label>
        <Textarea
          value={element.content || ""}
          onChange={(e) => onUpdate(element.id, { content: e.target.value })}
          className="h-20"
          placeholder="Enter text content"
        />
      </div>

      <div>
        <label className="text-xs text-gray-600">Font Family</label>
        <Select
          value={element.font}
          onValueChange={(value) => onUpdate(element.id, { font: value })}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any
             */}
            {fonts?.map((font: any) => (
              <SelectItem key={font.id} value={font.family}>
                {font.displayName}
              </SelectItem>
            )) || [
              <SelectItem key="arial" value="Arial">
                Arial
              </SelectItem>,
              <SelectItem key="helvetica" value="Helvetica">
                Helvetica
              </SelectItem>,
              <SelectItem key="times" value="Times New Roman">
                Times New Roman
              </SelectItem>,
            ]}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-600">Font Size</label>
          <Input
            type="number"
            value={element.fontSize || 16}
            onChange={(e) =>
              onUpdate(element.id, { fontSize: Number(e.target.value) })
            }
            className="h-8"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600">Font Weight</label>
          <Select
            value={element.fontWeight}
            onValueChange={(value) =>
              onUpdate(element.id, { fontWeight: value })
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
              <SelectItem value="lighter">Light</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-600">Text Color</label>
        <div className="flex items-center space-x-2">
          <Input
            type="color"
            value={element.color || "#000000"}
            onChange={(e) => onUpdate(element.id, { color: e.target.value })}
            className="h-8 w-16"
          />
          <Input
            type="text"
            value={element.color || "#000000"}
            onChange={(e) => onUpdate(element.id, { color: e.target.value })}
            className="h-8 flex-1"
            placeholder="#000000"
          />
        </div>
      </div>
    </div>
  );
}

interface ShapePropertiesProps {
  element: CanvasElement;
  onUpdate: (elementId: string, updates: Partial<CanvasElement>) => void;
}

function ShapeProperties({ element, onUpdate }: ShapePropertiesProps) {
  return (
    <div className="space-y-3 border-t pt-4">
      <h4 className="font-medium text-gray-900">Shape Properties</h4>

      <div>
        <label className="text-xs text-gray-600">Shape Type</label>
        <Select
          value={element.shapeType}
          onValueChange={(value) => onUpdate(element.id, { shapeType: value })}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rectangle">Rectangle</SelectItem>
            <SelectItem value="circle">Circle</SelectItem>
            <SelectItem value="triangle">Triangle</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xs text-gray-600">Fill Color</label>
        <div className="flex items-center space-x-2">
          <Input
            type="color"
            value={element.color || "#0066cc"}
            onChange={(e) => onUpdate(element.id, { color: e.target.value })}
            className="h-8 w-16"
          />
          <Input
            type="text"
            value={element.color || "#0066cc"}
            onChange={(e) => onUpdate(element.id, { color: e.target.value })}
            className="h-8 flex-1"
            placeholder="#0066cc"
          />
        </div>
      </div>
    </div>
  );
}

interface ImagePropertiesProps {
  element: CanvasElement;
  onUpdate: (elementId: string, updates: Partial<CanvasElement>) => void;
  onUploadArtwork: (file: File) => void;
}

function ImageProperties({
  element,
  onUpdate,
  onUploadArtwork,
}: ImagePropertiesProps) {
  return (
    <div className="space-y-3 border-t pt-4">
      <h4 className="font-medium text-gray-900">Image Properties</h4>

      <div>
        <label className="text-xs text-gray-600">Upload Image File</label>
        <input
          type="file"
          accept="image/*"
          className="mt-1 block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onUploadArtwork(file);
            }
          }}
        />
        <p className="mt-1 text-xs text-gray-500">
          Upload an image file to use in this element
        </p>
      </div>

      <div>
        <label className="text-xs text-gray-600">Media ID</label>
        <Input
          type="text"
          value={element.mediaId || ""}
          onChange={(e) => onUpdate(element.id, { mediaId: e.target.value })}
          className="h-8"
          placeholder="Enter media ID"
        />
      </div>
    </div>
  );
}
