import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Type,
  Image as ImageIcon,
  Square,
  Upload,
  Loader2,
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

import { CanvasElement } from "@/lib/design-studio/types/design-studio.types";
import LayersList from "./layers-list";
import TemplatePresets from "./templates-presets";

interface ElementsTabProps {
  canvasElements: CanvasElement[];
  selectedElement: CanvasElement | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  templatePresets: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  designForm: UseFormReturn<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  artworkForm: UseFormReturn<any>;
  canvasId: string;
  uploadedFiles: File[];
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
  return (
    <div className="space-y-4">
      {/* Add Elements Toolbar */}
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900">Add Elements</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={onAddText}>
            <Type className="w-4 h-4 mr-2" />
            Text
          </Button>
          <Button variant="outline" size="sm" onClick={onAddImage}>
            <ImageIcon className="w-4 h-4 mr-2" />
            Image
          </Button>
          <Button variant="outline" size="sm" onClick={onAddShape}>
            <Square className="w-4 h-4 mr-2" />
            Shape
          </Button>

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
                        onUploadArtwork(uploadedFiles[0]);
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
    </div>
  );
}
