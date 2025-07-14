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
  CanvasLayer,
  CanvasData,
} from "@/lib/design-studio/types/design-studio.types";
import { useUploadAsset, useUserAssets } from "@/hooks/use-design-studio";
import { toast } from "sonner";

interface ImageToolProps {
  canvas: CanvasData;
  onCanvasChange: (canvas: CanvasData) => void;
  selectedLayerId?: string;
  onLayerSelect: (layerId: string) => void;
}

export function ImageTool({
  canvas,
  onCanvasChange,
  selectedLayerId,
  onLayerSelect,
}: ImageToolProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [opacity, setOpacity] = useState([100]);
  const [objectFit, setObjectFit] = useState("cover");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAsset = useUploadAsset();
  const { data: userAssets } = useUserAssets({ type: "image" });

  const selectedLayer = selectedLayerId
    ? canvas.layers.find((l) => l.id === selectedLayerId && l.type === "image")
    : null;

  const addImageLayer = (src: string, alt: string = "Image") => {
    const newLayer: CanvasLayer = {
      id: `image_${Date.now()}`,
      type: "image",
      x: 50,
      y: 50,
      width: 200,
      height: 150,
      opacity: opacity[0] / 100,
      properties: {
        src,
        alt,
        objectFit,
      },
    };

    const updatedLayers = [...canvas.layers, newLayer];
    onCanvasChange({ ...canvas, layers: updatedLayers });
    onLayerSelect(newLayer.id);
  };

  const updateSelectedLayer = (properties: Record<string, any>) => {
    if (!selectedLayer) return;

    const updatedLayers = canvas.layers.map((layer) =>
      layer.id === selectedLayer.id
        ? {
            ...layer,
            ...properties,
            properties: { ...layer.properties, ...properties.properties },
          }
        : layer
    );

    onCanvasChange({ ...canvas, layers: updatedLayers });
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
            addImageLayer(response.data.url, response.data.name);
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

    addImageLayer(imageUrl, "Linked Image");
    setImageUrl("");
  };

  const handleOpacityChange = (newOpacity: number[]) => {
    setOpacity(newOpacity);
    if (selectedLayer) {
      updateSelectedLayer({ opacity: newOpacity[0] / 100 });
    }
  };

  const handleObjectFitChange = (newObjectFit: string) => {
    setObjectFit(newObjectFit);
    if (selectedLayer) {
      updateSelectedLayer({
        properties: { objectFit: newObjectFit },
      });
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
                  onClick={() => addImageLayer(asset.url, asset.name)}
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

        {/* Image Properties (for selected layer) */}
        {selectedLayer && (
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

            <div className="text-xs text-muted-foreground p-2 bg-accent rounded">
              Editing:{" "}
              {(selectedLayer.properties as { alt?: string })?.alt ||
                "Image Layer"}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
