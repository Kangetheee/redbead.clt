import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Palette } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CanvasElement } from "@/lib/design-studio/types/design-studio.types";
import { SizeVariant } from "@/lib/design-templates/types/design-template.types";

import ElementsTab from "./elements-tab";
import AssetsTab from "./assets-tab";
import SettingsTab from "./settings-tab";

interface LeftSidebarProps {
  canvasElements: CanvasElement[];
  selectedElement: CanvasElement | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  templatePresets: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  designForm: UseFormReturn<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  artworkForm: UseFormReturn<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assetForm: UseFormReturn<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fonts: any;
  sizeVariants: SizeVariant[] | undefined;
  selectedVariant: SizeVariant | null;
  canvasId: string;
  uploadedFiles: File[];
  onAddText: () => void;
  onAddImage: () => void;
  onAddShape: () => void;
  onSelectElement: (element: CanvasElement | null) => void;
  onDeleteElement: (elementId: string) => void;
  onUploadArtwork: (file: File) => void;
  onUploadAsset: (file: File) => void;
  onSetUploadedFiles: (files: File[]) => void;
  onVariantSelect: (variant: SizeVariant) => void;
  onCanvasElementsChange: (elements: CanvasElement[]) => void;
  onElementUpdate: (elementId: string, updates: Partial<CanvasElement>) => void;
  isUploadingArtwork: boolean;
  isUploadingAsset: boolean;
}

export default function LeftSidebar({
  canvasElements,
  selectedElement,
  templatePresets,
  designForm,
  artworkForm,
  assetForm,
  //   fonts,
  sizeVariants,
  selectedVariant,
  canvasId,
  uploadedFiles,
  onAddText,
  onAddImage,
  onAddShape,
  onSelectElement,
  onDeleteElement,
  onUploadArtwork,
  onUploadAsset,
  onSetUploadedFiles,
  onVariantSelect,
  onCanvasElementsChange,
  onElementUpdate,
  isUploadingArtwork,
  isUploadingAsset,
}: LeftSidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Palette className="w-5 h-5 mr-2" />
          Design Tools
        </h2>
      </div>

      <Tabs defaultValue="elements" className="flex-1">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
          <TabsTrigger value="elements">Elements</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="elements" className="p-4 space-y-4">
          <ElementsTab
            canvasElements={canvasElements}
            selectedElement={selectedElement}
            templatePresets={templatePresets}
            designForm={designForm}
            artworkForm={artworkForm}
            canvasId={canvasId}
            uploadedFiles={uploadedFiles}
            onAddText={onAddText}
            onAddImage={onAddImage}
            onAddShape={onAddShape}
            onSelectElement={onSelectElement}
            onDeleteElement={onDeleteElement}
            onUploadArtwork={onUploadArtwork}
            onSetUploadedFiles={onSetUploadedFiles}
            onCanvasElementsChange={onCanvasElementsChange}
            onElementUpdate={onElementUpdate}
            isUploadingArtwork={isUploadingArtwork}
          />
        </TabsContent>

        <TabsContent value="assets" className="p-4">
          <AssetsTab
            assetForm={assetForm}
            uploadedFiles={uploadedFiles}
            onUploadAsset={onUploadAsset}
            onSetUploadedFiles={onSetUploadedFiles}
            isUploadingAsset={isUploadingAsset}
          />
        </TabsContent>

        <TabsContent value="settings" className="p-4">
          <SettingsTab
            designForm={designForm}
            sizeVariants={sizeVariants}
            selectedVariant={selectedVariant}
            onVariantSelect={onVariantSelect}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
