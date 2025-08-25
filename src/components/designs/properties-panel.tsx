"use client";

import React from "react";
import {
  Square,
  Type,
  Image as ImageIcon,
  FileImage,
  Info,
  DollarSign,
  Trash2,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useDesignContext } from "./design-context";
import { CanvasElement } from "@/lib/design-studio/types/design-studio.types";
import { formatCurrency } from "@/lib/utils";

interface PropertiesPanelProps {
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
  colorPresets?: Array<{ id: string; name: string; hexCode: string }>;
  fontPresets?: Array<{
    id: string;
    family: string;
    displayName: string;
    isPremium: boolean;
    weights?: number[];
  }>;
  fonts?: Array<{ id: string; family: string; displayName: string }>;
}

export default function PropertiesPanel({
  templateInfo,
  sizeVariantInfo,
  priceCalculation,
  colorPresets = [],
  fontPresets = [],
  fonts = [],
}: PropertiesPanelProps) {
  const {
    selectedElement,
    updateElement,
    deleteElement,
    canvasSettings,
    updateCanvasSettings,
  } = useDesignContext();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleElementPropertyChange = (property: string, value: any) => {
    if (!selectedElement) return;

    const updates: Partial<CanvasElement> = {};

    if (property.includes(".")) {
      const [parent, child] = property.split(".");
      updates[parent as keyof CanvasElement] = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(selectedElement[parent as keyof CanvasElement] as any),
        [child]: value,
      };
    } else {
      updates[property as keyof CanvasElement] = value;
    }

    updateElement(selectedElement.id, updates);
  };

  const availableFonts = [
    ...fontPresets.map((f) => ({
      value: f.family,
      label: `${f.displayName}${f.isPremium ? " (Premium)" : ""}`,
      isPremium: f.isPremium,
    })),
    ...fonts.map((f) => ({
      value: f.family,
      label: f.displayName,
      isPremium: false,
    })),
    // Fallback system fonts
    { value: "Arial", label: "Arial", isPremium: false },
    { value: "Helvetica", label: "Helvetica", isPremium: false },
    { value: "Times New Roman", label: "Times New Roman", isPremium: false },
    { value: "Georgia", label: "Georgia", isPremium: false },
  ];

  return (
    <div className="w-80 bg-background border-l border-border overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Properties</h2>
      </div>

      <div className="p-4 space-y-6">
        {selectedElement ? (
          <div className="space-y-4">
            {/* Element Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                  {selectedElement.type === "text" && (
                    <Type className="w-4 h-4 text-primary" />
                  )}
                  {selectedElement.type === "image" && (
                    <ImageIcon className="w-4 h-4 text-primary" />
                  )}
                  {selectedElement.type === "logo" && (
                    <FileImage className="w-4 h-4 text-primary" />
                  )}
                  {selectedElement.type === "shape" && (
                    <Square className="w-4 h-4 text-primary" />
                  )}
                </div>
                <h3 className="font-medium text-foreground capitalize">
                  {selectedElement.type} Element
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteElement(selectedElement.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Common Properties */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                Position & Size
              </Label>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    X Position
                  </Label>
                  <Input
                    type="number"
                    value={selectedElement.x}
                    onChange={(e) =>
                      handleElementPropertyChange("x", Number(e.target.value))
                    }
                    className="h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Y Position
                  </Label>
                  <Input
                    type="number"
                    value={selectedElement.y}
                    onChange={(e) =>
                      handleElementPropertyChange("y", Number(e.target.value))
                    }
                    className="h-8 mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Width</Label>
                  <Input
                    type="number"
                    value={selectedElement.width || 0}
                    onChange={(e) =>
                      handleElementPropertyChange(
                        "width",
                        Number(e.target.value)
                      )
                    }
                    className="h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Height
                  </Label>
                  <Input
                    type="number"
                    value={selectedElement.height || 0}
                    onChange={(e) =>
                      handleElementPropertyChange(
                        "height",
                        Number(e.target.value)
                      )
                    }
                    className="h-8 mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">
                  Rotation (°)
                </Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Slider
                    value={[selectedElement.rotation || 0]}
                    onValueChange={([value]) =>
                      handleElementPropertyChange("rotation", value)
                    }
                    min={-180}
                    max={180}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground min-w-[40px]">
                    {selectedElement.rotation || 0}°
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Text-specific Properties */}
            {selectedElement.type === "text" && (
              <div className="space-y-4">
                <Label className="text-sm font-medium text-foreground">
                  Text Properties
                </Label>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Content
                  </Label>
                  <Textarea
                    value={selectedElement.content || ""}
                    onChange={(e) =>
                      handleElementPropertyChange("content", e.target.value)
                    }
                    className="h-20 mt-1"
                    placeholder="Enter text content"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Font Family
                  </Label>
                  <Select
                    value={selectedElement.font || "Arial"}
                    onValueChange={(value) =>
                      handleElementPropertyChange("font", value)
                    }
                  >
                    <SelectTrigger className="h-8 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFonts.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{font.label}</span>
                            {font.isPremium && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                Pro
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Font Size
                    </Label>
                    <Input
                      type="number"
                      value={selectedElement.fontSize || 14}
                      onChange={(e) =>
                        handleElementPropertyChange(
                          "fontSize",
                          Number(e.target.value)
                        )
                      }
                      className="h-8 mt-1"
                      min={6}
                      max={72}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Font Weight
                    </Label>
                    <Select
                      value={selectedElement.fontWeight || "normal"}
                      onValueChange={(value) =>
                        handleElementPropertyChange("fontWeight", value)
                      }
                    >
                      <SelectTrigger className="h-8 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="lighter">Light</SelectItem>
                        <SelectItem value="100">100 - Thin</SelectItem>
                        <SelectItem value="300">300 - Light</SelectItem>
                        <SelectItem value="400">400 - Normal</SelectItem>
                        <SelectItem value="500">500 - Medium</SelectItem>
                        <SelectItem value="600">600 - Semi Bold</SelectItem>
                        <SelectItem value="700">700 - Bold</SelectItem>
                        <SelectItem value="900">900 - Black</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Text Style Buttons */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Text Style
                  </Label>
                  <div className="flex space-x-1">
                    <Button
                      variant={
                        selectedElement.fontWeight === "bold"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        handleElementPropertyChange(
                          "fontWeight",
                          selectedElement.fontWeight === "bold"
                            ? "normal"
                            : "bold"
                        )
                      }
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={
                        selectedElement.properties?.fontStyle === "italic"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        handleElementPropertyChange(
                          "properties.fontStyle",
                          selectedElement.properties?.fontStyle === "italic"
                            ? "normal"
                            : "italic"
                        )
                      }
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={
                        selectedElement.properties?.textDecoration ===
                        "underline"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        handleElementPropertyChange(
                          "properties.textDecoration",
                          selectedElement.properties?.textDecoration ===
                            "underline"
                            ? "none"
                            : "underline"
                        )
                      }
                    >
                      <Underline className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Text Alignment */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Text Alignment
                  </Label>
                  <div className="flex space-x-1">
                    <Button
                      variant={
                        selectedElement.properties?.textAlign === "center"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        handleElementPropertyChange(
                          "properties.textAlign",
                          "center"
                        )
                      }
                    >
                      <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={
                        selectedElement.properties?.textAlign === "right"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        handleElementPropertyChange(
                          "properties.textAlign",
                          "right"
                        )
                      }
                    >
                      <AlignRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Text Color
                  </Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      type="color"
                      value={selectedElement.color || "#000000"}
                      onChange={(e) =>
                        handleElementPropertyChange("color", e.target.value)
                      }
                      className="h-8 w-16"
                    />
                    <Input
                      type="text"
                      value={selectedElement.color || "#000000"}
                      onChange={(e) =>
                        handleElementPropertyChange("color", e.target.value)
                      }
                      className="h-8 flex-1"
                      placeholder="#000000"
                    />
                  </div>

                  {/* Color Presets */}
                  {colorPresets.length > 0 && (
                    <div className="mt-2">
                      <Label className="text-xs text-muted-foreground mb-1">
                        Quick Colors:
                      </Label>
                      <div className="grid grid-cols-8 gap-1 mt-1">
                        {colorPresets.map((color) => (
                          <button
                            key={color.id}
                            onClick={() =>
                              handleElementPropertyChange(
                                "color",
                                color.hexCode
                              )
                            }
                            className="w-6 h-6 rounded border border-border hover:border-primary transition-colors"
                            style={{ backgroundColor: color.hexCode }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Line Height */}
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Line Height
                  </Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Slider
                      value={[
                        parseFloat(
                          selectedElement.properties?.lineHeight || "1.4"
                        ),
                      ]}
                      onValueChange={([value]) =>
                        handleElementPropertyChange(
                          "properties.lineHeight",
                          value.toString()
                        )
                      }
                      min={0.8}
                      max={3}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground min-w-[30px]">
                      {selectedElement.properties?.lineHeight || "1.4"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Shape-specific Properties */}
            {selectedElement.type === "shape" && (
              <div className="space-y-4">
                <Label className="text-sm font-medium text-foreground">
                  Shape Properties
                </Label>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Shape Type
                  </Label>
                  <Select
                    value={selectedElement.shapeType || "rectangle"}
                    onValueChange={(value) =>
                      handleElementPropertyChange("shapeType", value)
                    }
                  >
                    <SelectTrigger className="h-8 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rectangle">Rectangle</SelectItem>
                      <SelectItem value="circle">Circle</SelectItem>
                      <SelectItem value="triangle">Triangle</SelectItem>
                      <SelectItem value="rounded-rectangle">
                        Rounded Rectangle
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Fill Color
                  </Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      type="color"
                      value={selectedElement.color || "#0066cc"}
                      onChange={(e) =>
                        handleElementPropertyChange("color", e.target.value)
                      }
                      className="h-8 w-16"
                    />
                    <Input
                      type="text"
                      value={selectedElement.color || "#0066cc"}
                      onChange={(e) =>
                        handleElementPropertyChange("color", e.target.value)
                      }
                      className="h-8 flex-1"
                      placeholder="#0066cc"
                    />
                  </div>

                  {/* Color Presets */}
                  {colorPresets.length > 0 && (
                    <div className="mt-2">
                      <div className="grid grid-cols-8 gap-1">
                        {colorPresets.map((color) => (
                          <button
                            key={color.id}
                            onClick={() =>
                              handleElementPropertyChange(
                                "color",
                                color.hexCode
                              )
                            }
                            className="w-6 h-6 rounded border border-border hover:border-primary transition-colors"
                            style={{ backgroundColor: color.hexCode }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Border Properties */}
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Border Width
                  </Label>
                  <Input
                    type="number"
                    value={selectedElement.properties?.borderWidth || 0}
                    onChange={(e) =>
                      handleElementPropertyChange(
                        "properties.borderWidth",
                        Number(e.target.value)
                      )
                    }
                    className="h-8 mt-1"
                    min={0}
                    max={10}
                  />
                </div>

                {selectedElement.properties?.borderWidth > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Border Color
                    </Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        type="color"
                        value={
                          selectedElement.properties?.borderColor || "#000000"
                        }
                        onChange={(e) =>
                          handleElementPropertyChange(
                            "properties.borderColor",
                            e.target.value
                          )
                        }
                        className="h-8 w-16"
                      />
                      <Input
                        type="text"
                        value={
                          selectedElement.properties?.borderColor || "#000000"
                        }
                        onChange={(e) =>
                          handleElementPropertyChange(
                            "properties.borderColor",
                            e.target.value
                          )
                        }
                        className="h-8 flex-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Image/Logo-specific Properties */}
            {(selectedElement.type === "image" ||
              selectedElement.type === "logo") && (
              <div className="space-y-4">
                <Label className="text-sm font-medium text-foreground">
                  {selectedElement.type === "logo" ? "Logo" : "Image"}{" "}
                  Properties
                </Label>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Upload New File
                  </Label>
                  <input
                    type="file"
                    accept="image/*,.svg"
                    className="mt-1 block w-full text-xs text-muted-foreground file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Handle file upload here
                        console.log("Upload file:", file.name);
                      }
                    }}
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Media ID
                  </Label>
                  <Input
                    type="text"
                    value={selectedElement.mediaId || ""}
                    onChange={(e) =>
                      handleElementPropertyChange("mediaId", e.target.value)
                    }
                    className="h-8 mt-1"
                    placeholder="Enter media ID or upload file"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Object Fit
                  </Label>
                  <Select
                    value={selectedElement.properties?.objectFit || "contain"}
                    onValueChange={(value) =>
                      handleElementPropertyChange("properties.objectFit", value)
                    }
                  >
                    <SelectTrigger className="h-8 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contain">Contain</SelectItem>
                      <SelectItem value="cover">Cover</SelectItem>
                      <SelectItem value="fill">Fill</SelectItem>
                      <SelectItem value="scale-down">Scale Down</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Opacity
                  </Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Slider
                      value={[selectedElement.properties?.opacity || 1]}
                      onValueChange={([value]) =>
                        handleElementPropertyChange("properties.opacity", value)
                      }
                      min={0}
                      max={1}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground min-w-[40px]">
                      {Math.round(
                        (selectedElement.properties?.opacity || 1) * 100
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* No Element Selected State */
          <div className="text-center text-muted-foreground">
            <div className="mb-4">
              <Square className="w-12 h-12 mx-auto text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium mb-2">No Element Selected</p>
            <p className="text-xs">
              Click on any element in the canvas to edit its properties
            </p>
          </div>
        )}

        <Separator />

        {/* Canvas Properties */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-foreground">
            Canvas Properties
          </Label>

          <div>
            <Label className="text-xs text-muted-foreground">
              Background Color
            </Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input
                type="color"
                value={canvasSettings.backgroundColor}
                onChange={(e) =>
                  updateCanvasSettings({ backgroundColor: e.target.value })
                }
                className="h-8 w-16"
              />
              <Input
                type="text"
                value={canvasSettings.backgroundColor}
                onChange={(e) =>
                  updateCanvasSettings({ backgroundColor: e.target.value })
                }
                className="h-8 flex-1"
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">
                Width (mm)
              </Label>
              <Input
                type="number"
                value={canvasSettings.width}
                onChange={(e) =>
                  updateCanvasSettings({ width: Number(e.target.value) })
                }
                className="h-8 mt-1"
                min={10}
                max={1000}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Height (mm)
              </Label>
              <Input
                type="number"
                value={canvasSettings.height}
                onChange={(e) =>
                  updateCanvasSettings({ height: Number(e.target.value) })
                }
                className="h-8 mt-1"
                min={10}
                max={1000}
              />
            </div>
          </div>
        </div>

        {/* Template Information */}
        {templateInfo && (
          <div className="space-y-4">
            <Separator />
            <Label className="text-sm font-medium flex items-center text-foreground">
              <Info className="w-4 h-4 mr-2" />
              Product Information
            </Label>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Template:</span>
                <span className="font-medium text-foreground">
                  {templateInfo.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium text-foreground">
                  {templateInfo.category.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product:</span>
                <span className="font-medium text-foreground">
                  {templateInfo.product.name}
                </span>
              </div>

              {sizeVariantInfo && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium text-foreground">
                      {sizeVariantInfo.displayName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dimensions:</span>
                    <span className="font-medium text-foreground">
                      {sizeVariantInfo.dimensions.width} ×{" "}
                      {sizeVariantInfo.dimensions.height}{" "}
                      {sizeVariantInfo.dimensions.unit}
                      {sizeVariantInfo.dimensions.dpi &&
                        ` @ ${sizeVariantInfo.dimensions.dpi} DPI`}
                    </span>
                  </div>
                </>
              )}

              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Price:</span>
                <span className="font-medium text-foreground">
                  ${templateInfo.basePrice.toFixed(2)}
                </span>
              </div>

              {sizeVariantInfo && sizeVariantInfo.price > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Size Adjustment:
                  </span>
                  <span className="font-medium text-foreground">
                    +${sizeVariantInfo.price.toFixed(2)}
                  </span>
                </div>
              )}

              {priceCalculation && (
                <div className="flex justify-between border-t border-border pt-2 mt-2">
                  <span className="text-muted-foreground font-medium flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Total Price:
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(priceCalculation.totalPrice)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
