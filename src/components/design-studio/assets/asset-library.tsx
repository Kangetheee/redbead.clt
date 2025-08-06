/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FolderPlus, Upload as UploadIcon } from "lucide-react";
import { AssetBrowser } from "./asset-browser";
import { UploadAsset } from "./upload-asset";
import { AssetResponse } from "@/lib/design-studio/types/design-studio.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AssetLibraryProps {
  onAssetSelect: (asset: AssetResponse) => void;
  selectedAssetId?: string;
  allowMultiple?: boolean;
}

export function AssetLibrary({
  onAssetSelect,
  selectedAssetId,
  allowMultiple = false,
}: AssetLibraryProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [activeTab, setActiveTab] = useState("browse");

  const handleUploadComplete = (assetId: string) => {
    setShowUpload(false);
    setActiveTab("browse");
    // Optionally refresh the asset browser or show success message
  };

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="browse">Browse Assets</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Dialog open={showUpload} onOpenChange={setShowUpload}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Quick Upload
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload Assets</DialogTitle>
                </DialogHeader>
                <UploadAsset onUploadComplete={handleUploadComplete} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="browse" className="mt-0">
          <AssetBrowser
            onAssetSelect={onAssetSelect}
            selectedAssetId={selectedAssetId}
            allowMultiple={allowMultiple}
          />
        </TabsContent>

        <TabsContent value="upload" className="mt-0">
          <UploadAsset onUploadComplete={handleUploadComplete} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
