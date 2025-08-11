/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Palette, Loader2 } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CanvasElement,
  Font,
} from "@/lib/design-studio/types/design-studio.types";
import { SizeVariant } from "@/lib/design-templates/types/design-template.types";
import {
  CreateDesignDto,
  UploadArtworkDto,
  UploadAssetDto,
} from "@/lib/design-studio/dto/design-studio.dto";

import ElementsTab from "./elements-tab";
import AssetsTab from "./assets-tab";
import SettingsTab from "./settings-tab";

interface LeftSidebarProps {
  canvasElements: CanvasElement[];
  selectedElement: CanvasElement | null;
  templatePresets: any;
  designForm: UseFormReturn<CreateDesignDto>;
  artworkForm: UseFormReturn<UploadArtworkDto>;
  assetForm: UseFormReturn<UploadAssetDto>;
  fonts: Font[] | undefined;
  sizeVariants: SizeVariant[] | undefined;
  selectedVariant: SizeVariant | null;
  canvasId: string;
  uploadedFiles: File[];
  onAddText: () => void;
  onAddImage: () => void;
  onAddShape: () => void;
  onSelectElement: (element: CanvasElement | null) => void;
  onDeleteElement: (elementId: string) => void;
  onDuplicateElement: (elementId: string) => void;
  onUploadArtwork: (file: File) => void;
  onUploadAsset: (file: File, assetData?: Partial<UploadAssetDto>) => void;
  onSetUploadedFiles: (files: File[]) => void;
  onVariantSelect: (variant: SizeVariant) => void;
  onCanvasElementsChange: (elements: CanvasElement[]) => void;
  onElementUpdate: (elementId: string, updates: Partial<CanvasElement>) => void;
  isUploadingArtwork: boolean;
  isUploadingAsset: boolean;
  isLoadingPresets: boolean;
  isLoadingFonts: boolean;
}

export default function LeftSidebar({
  canvasElements,
  selectedElement,
  templatePresets,
  designForm,
  artworkForm,
  assetForm,
  fonts,
  sizeVariants,
  selectedVariant,
  canvasId,
  uploadedFiles,
  onAddText,
  onAddImage,
  onAddShape,
  onSelectElement,
  onDeleteElement,
  onDuplicateElement,
  onUploadArtwork,
  onUploadAsset,
  onSetUploadedFiles,
  onVariantSelect,
  onCanvasElementsChange,
  onElementUpdate,
  isUploadingArtwork,
  isUploadingAsset,
  isLoadingPresets,
  isLoadingFonts,
}: LeftSidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Palette className="w-5 h-5 mr-2" />
          Design Tools
        </h2>
        {(isLoadingPresets || isLoadingFonts) && (
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading resources...
          </div>
        )}
      </div>

      <Tabs defaultValue="elements" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
          <TabsTrigger value="elements">Elements</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="elements" className="p-4 space-y-4 mt-0">
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

          <TabsContent value="assets" className="p-4 mt-0">
            <AssetsTab
              assetForm={assetForm}
              uploadedFiles={uploadedFiles}
              onUploadAsset={onUploadAsset}
              onSetUploadedFiles={onSetUploadedFiles}
              isUploadingAsset={isUploadingAsset}
            />
          </TabsContent>

          <TabsContent value="settings" className="p-4 mt-0">
            <SettingsTab
              designForm={designForm}
              sizeVariants={sizeVariants}
              selectedVariant={selectedVariant}
              canvasElements={canvasElements}
              templatePresets={templatePresets}
              onVariantSelect={onVariantSelect}
              onCanvasElementsChange={onCanvasElementsChange}
              isLoadingPresets={isLoadingPresets}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Quick Stats */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Elements:</span>
            <span className="ml-1 font-medium">{canvasElements.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Selected:</span>
            <span className="ml-1 font-medium">
              {selectedElement ? selectedElement.type : "None"}
            </span>
          </div>
          {selectedVariant && (
            <div className="col-span-2">
              <span className="text-gray-500">Size:</span>
              <span className="ml-1 font-medium">
                {selectedVariant.displayName}
              </span>
            </div>
          )}
          {fonts && (
            <div className="col-span-2">
              <span className="text-gray-500">Fonts:</span>
              <span className="ml-1 font-medium">{fonts.length} available</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
