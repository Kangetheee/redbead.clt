/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Triangle,
  Upload,
  Loader2,
  Wand2,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { CanvasElement } from "@/lib/design-studio/types/design-studio.types";
import { fabricCanvasUtils, getFabricCanvas } from "./canvas-renderer";
import LayersList from "./layers-list";
import TemplatePresets from "./templates-presets";

interface ElementsTabProps {
  canvasElements: CanvasElement[];
  selectedElement: CanvasElement | null;
  templatePresets: any;
  designForm: UseFormReturn<any>;
  artworkForm: UseFormReturn<any>;
  canvasId: string;
  uploadedFiles: File[];
  useFabricRenderer?: boolean;
  onAddText: () => void;
  onAddImage: () => void;
  onAddShape: () => void;
  onSelectElement: (element: CanvasElement | null) => void;
  onDeleteElement: (elementId: string) => void;
  onUploadArtwork: (file: File) => void;
  onSetUploadedFiles: (files: File[]) => void;
  onCanvasElementsChange: (elements: CanvasElement[]) => void;
  onElementUpdate: (elementId: string, updates: Partial<CanvasElement>) => void;
  isUploadingArtwork: boolean;
}

export default function ElementsTab({
  canvasElements,
  selectedElement,
  templatePresets,
  designForm,
  artworkForm,
  canvasId,
  uploadedFiles,
  useFabricRenderer = true,
  onAddText,
  onAddImage,
  onAddShape,
  onSelectElement,
  onDeleteElement,
  onUploadArtwork,
  onSetUploadedFiles,
  onCanvasElementsChange,
  onElementUpdate,
  isUploadingArtwork,
}: ElementsTabProps) {
  // Fabric.js specific handlers
  const handleFabricAddText = () => {
    if (useFabricRenderer) {
      const textObject = fabricCanvasUtils.addText("Click to edit");
      if (textObject) {
        // Create corresponding CanvasElement
        const newElement: CanvasElement = {
          id: `text-${Date.now()}`,
          type: "text",
          x: textObject.left || 100,
          y: textObject.top || 100,
          width: textObject.width || 200,
          height: textObject.height || 40,
          content: "Click to edit",
          font: "Arial",
          fontSize: 20,
          fontWeight: "normal",
          color: "#000000",
        };

        // Store element data in fabric object
        textObject.data = newElement;

        // Add to canvas elements array
        onCanvasElementsChange([...canvasElements, newElement]);
        onSelectElement(newElement);
      }
    } else {
      onAddText();
    }
  };

  const handleFabricAddShape = (shapeType: "rect" | "circle" | "triangle") => {
    if (useFabricRenderer) {
      const shapeObject = fabricCanvasUtils.addShape(shapeType);
      if (shapeObject) {
        // Create corresponding CanvasElement
        const newElement: CanvasElement = {
          id: `shape-${Date.now()}`,
          type: "shape",
          x: shapeObject.left || 100,
          y: shapeObject.top || 100,
          width:
            shapeType === "circle"
              ? (shapeObject as any).radius * 2
              : shapeObject.width || 100,
          height:
            shapeType === "circle"
              ? (shapeObject as any).radius * 2
              : shapeObject.height || 100,
          shapeType: shapeType === "rect" ? "rectangle" : shapeType,
          color: "#0066cc",
        };

        // Store element data in fabric object
        shapeObject.data = newElement;

        // Add to canvas elements array
        onCanvasElementsChange([...canvasElements, newElement]);
        onSelectElement(newElement);
      }
    } else {
      onAddShape();
    }
  };

  const handleFabricImageUpload = (file: File) => {
    if (useFabricRenderer) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        fabricCanvasUtils.addImageFromUrl(imageUrl);

        // You might want to upload to your media service here
        onUploadArtwork(file);
      };
      reader.readAsDataURL(file);
    } else {
      onUploadArtwork(file);
    }
  };

  // Advanced Fabric.js tools
  const handleAlignObjects = (
    alignment: "left" | "center" | "right" | "top" | "middle" | "bottom"
  ) => {
    const canvas = getFabricCanvas();
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length < 2) {
      toast.error("Select multiple objects to align");
      return;
    }

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();

    activeObjects.forEach((obj) => {
      switch (alignment) {
        case "left":
          obj.set({ left: 0 });
          break;
        case "center":
          obj.set({ left: (canvasWidth - obj.getScaledWidth()) / 2 });
          break;
        case "right":
          obj.set({ left: canvasWidth - obj.getScaledWidth() });
          break;
        case "top":
          obj.set({ top: 0 });
          break;
        case "middle":
          obj.set({ top: (canvasHeight - obj.getScaledHeight()) / 2 });
          break;
        case "bottom":
          obj.set({ top: canvasHeight - obj.getScaledHeight() });
          break;
      }
    });

    canvas.renderAll();
  };

  const handleGroupObjects = () => {
    const canvas = getFabricCanvas();
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length < 2) {
      toast.error("Select multiple objects to group");
      return;
    }

    const group = new (window as any).fabric.Group(activeObjects, {
      canvas: canvas,
    });

    canvas.discardActiveObject();
    canvas.remove(...activeObjects);
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
  };

  const handleUngroupObjects = () => {
    const canvas = getFabricCanvas();
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== "group") {
      toast.error("Select a group to ungroup");
      return;
    }

    const group = activeObject as any;
    const objects = group.getObjects();

    canvas.discardActiveObject();
    canvas.remove(group);

    objects.forEach((obj: any) => {
      canvas.add(obj);
    });

    canvas.renderAll();
  };

  const handleDuplicateSelection = async () => {
    const canvas = getFabricCanvas();
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject) {
      toast.error("Select an object to duplicate");
      return;
    }

    try {
      const cloned = await activeObject.clone(); // now returns a Promise<FabricObject>

      cloned.set({
        left: (cloned.left ?? 0) + 20,
        top: (cloned.top ?? 0) + 20,
      });

      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
    } catch (err) {
      console.error("Clone failed", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Elements Toolbar */}
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900 flex items-center">
          Add Elements
          {useFabricRenderer && (
            <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
              Enhanced
            </span>
          )}
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFabricAddText}
                >
                  <Type className="w-4 h-4 mr-2" />
                  Text
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {useFabricRenderer
                  ? "Add editable text (double-click to edit)"
                  : "Add text"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="outline" size="sm" onClick={onAddImage}>
            <ImageIcon className="w-4 h-4 mr-2" />
            Image
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFabricAddShape("rect")}
                >
                  <Square className="w-4 h-4 mr-2" />
                  Rect
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add rectangle</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFabricAddShape("circle")}
                >
                  <Circle className="w-4 h-4 mr-2" />
                  Circle
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add circle</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFabricAddShape("triangle")}
                >
                  <Triangle className="w-4 h-4 mr-2" />
                  Triangle
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add triangle</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Upload Artwork Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Artwork</DialogTitle>
              </DialogHeader>
              <Form {...artworkForm}>
                <form className="space-y-4">
                  <FormField
                    control={artworkForm.control}
                    name="canvasId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Canvas ID</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Canvas ID will be auto-filled"
                            readOnly
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div>
                    <label className="text-sm font-medium">
                      Select Artwork File
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf,.svg"
                      className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onSetUploadedFiles([file]);
                        }
                      }}
                    />
                    {uploadedFiles.length > 0 && (
                      <p className="mt-1 text-sm text-gray-600">
                        Selected: {uploadedFiles[0].name}
                      </p>
                    )}
                  </div>

                  <FormField
                    control={artworkForm.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="top-left">Top Left</SelectItem>
                            <SelectItem value="top-right">Top Right</SelectItem>
                            <SelectItem value="bottom-left">
                              Bottom Left
                            </SelectItem>
                            <SelectItem value="bottom-right">
                              Bottom Right
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => {
                      if (uploadedFiles.length > 0) {
                        handleFabricImageUpload(uploadedFiles[0]);
                      } else {
                        toast.error("Please select a file first");
                      }
                    }}
                    disabled={
                      !canvasId ||
                      uploadedFiles.length === 0 ||
                      isUploadingArtwork
                    }
                  >
                    {isUploadingArtwork ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Add to Design"
                    )}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Tools (Fabric.js only) */}
      {useFabricRenderer && (
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900 flex items-center">
            <Wand2 className="w-4 h-4 mr-2" />
            Enhanced Tools
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDuplicateSelection}
                  >
                    Duplicate
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Duplicate selected object (Ctrl+D)
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGroupObjects}
                  >
                    Group
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Group selected objects</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUngroupObjects}
                  >
                    Ungroup
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ungroup selected group</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Select onValueChange={handleAlignObjects}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Align" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Align Left</SelectItem>
                <SelectItem value="center">Align Center</SelectItem>
                <SelectItem value="right">Align Right</SelectItem>
                <SelectItem value="top">Align Top</SelectItem>
                <SelectItem value="middle">Align Middle</SelectItem>
                <SelectItem value="bottom">Align Bottom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Layers List */}
      <LayersList
        canvasElements={canvasElements}
        selectedElement={selectedElement}
        onSelectElement={onSelectElement}
        onDeleteElement={onDeleteElement}
      />

      {/* Template Presets */}
      <TemplatePresets
        templatePresets={templatePresets}
        designForm={designForm}
        selectedElement={selectedElement}
        canvasElements={canvasElements}
        onCanvasElementsChange={onCanvasElementsChange}
        onElementUpdate={onElementUpdate}
      />

      {/* Fabric.js Features Notice */}
      {!useFabricRenderer && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-1">
            Enable Fabric.js for More Features
          </h4>
          <p className="text-xs text-blue-700">
            Switch to Fabric.js renderer for advanced tools like grouping,
            alignment, in-place text editing, and better performance.
          </p>
        </div>
      )}
    </div>
  );
}
