/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Image, Upload, Plus, Link } from "lucide-react";
import {
  CanvasElement,
  CanvasData,
} from "@/lib/design-studio/types/design-studio.types";
import { useUploadAsset, useUserAssets } from "@/hooks/use-design-studio";
import { toast } from "sonner";

interface ImageToolProps {
  canvas: CanvasData;
  onCanvasChange: (canvas: CanvasData) => void;
  selectedElementId?: string | null;
  onElementSelect: (elementId: string) => void;
}

export function ImageTool({
  canvas,
  onCanvasChange,
  selectedElementId,
  onElementSelect,
}: ImageToolProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [opacity, setOpacity] = useState([100]);
  const [objectFit, setObjectFit] = useState("cover");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAsset = useUploadAsset();
  const { data: userAssets } = useUserAssets({ type: "image" });

  const selectedElement = selectedElementId
    ? canvas.elements.find(
        (e) => e.id === selectedElementId && e.type === "image"
      )
    : null;

  const addImageElement = (src: string, alt: string = "Image") => {
    const newElement: CanvasElement = {
      id: `image_${Date.now()}`,
      type: "image",
      x: 50,
      y: 50,
      width: 200,
      height: 150,
      mediaId: src, // Using mediaId for image source
      properties: {
        src,
        alt,
        objectFit,
        opacity: opacity[0] / 100,
      },
    };

    const updatedElements = [...canvas.elements, newElement];
    onCanvasChange({ ...canvas, elements: updatedElements });
    onElementSelect(newElement.id);
  };

  const updateSelectedElement = (updates: Partial<CanvasElement>) => {
    if (!selectedElement) return;

    const updatedElements = canvas.elements.map((element) =>
      element.id === selectedElement.id ? { ...element, ...updates } : element
    );

    onCanvasChange({ ...canvas, elements: updatedElements });
  };

  const updateSelectedElementProperties = (properties: Record<string, any>) => {
    if (!selectedElement) return;

    const updatedElements = canvas.elements.map((element) =>
      element.id === selectedElement.id
        ? {
            ...element,
            properties: { ...element.properties, ...properties },
          }
        : element
    );

    onCanvasChange({ ...canvas, elements: updatedElements });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    uploadAsset.mutate(
      {
        file,
        assetData: {
          name: file.name,
          type: "image",
          description: `Uploaded image: ${file.name}`,
        },
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            addImageElement(response.data.url, response.data.name);
            toast.success("Image uploaded and added to canvas");
          }
        },
      }
    );
  };

  const handleUrlAdd = () => {
    if (!imageUrl.trim()) {
      toast.error("Please enter a valid image URL");
      return;
    }

    addImageElement(imageUrl, "Linked Image");
    setImageUrl("");
  };

  const handleOpacityChange = (newOpacity: number[]) => {
    setOpacity(newOpacity);
    if (selectedElement) {
      updateSelectedElementProperties({ opacity: newOpacity[0] / 100 });
    }
  };

  const handleObjectFitChange = (newObjectFit: string) => {
    setObjectFit(newObjectFit);
    if (selectedElement) {
      updateSelectedElementProperties({ objectFit: newObjectFit });
    }
  };

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Image Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Image */}
        <div className="space-y-2">
          <Label>Upload Image</Label>
          <div className="space-y-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
              disabled={uploadAsset.isPending}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploadAsset.isPending ? "Uploading..." : "Choose File"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Add Image by URL */}
        <div className="space-y-2">
          <Label htmlFor="image-url">Image URL</Label>
          <div className="flex gap-2">
            <Input
              id="image-url"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <Button onClick={handleUrlAdd} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* User Assets Library */}
        {userAssets && userAssets.length > 0 && (
          <div className="space-y-2">
            <Label>Your Images</Label>
            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {userAssets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => addImageElement(asset.url, asset.name)}
                  className="relative aspect-square rounded overflow-hidden border hover:border-primary transition-colors"
                >
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Image Properties (for selected element) */}
        {selectedElement && (
          <>
            <div className="space-y-2">
              <Label>Opacity: {opacity[0]}%</Label>
              <Slider
                value={opacity}
                onValueChange={handleOpacityChange}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Object Fit</Label>
              <Select value={objectFit} onValueChange={handleObjectFitChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">Cover</SelectItem>
                  <SelectItem value="contain">Contain</SelectItem>
                  <SelectItem value="fill">Fill</SelectItem>
                  <SelectItem value="scale-down">Scale Down</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Image Source</Label>
              <Input
                type="text"
                value={selectedElement.mediaId || ""}
                onChange={(e) =>
                  updateSelectedElement({ mediaId: e.target.value })
                }
                placeholder="Enter image URL or media ID"
              />
            </div>

            <div className="text-xs text-muted-foreground p-2 bg-accent rounded">
              Editing:{" "}
              {(selectedElement.properties as any)?.alt || "Image Element"}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
