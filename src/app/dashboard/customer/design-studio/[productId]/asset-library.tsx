/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  X,
  Search,
  Upload,
  Loader2,
  Image,
  FileText,
  Shapes,
  Plus,
} from "lucide-react";
import { useUserAssets, useUploadAsset } from "@/hooks/use-design-studio";
import { toast } from "sonner";
import type { UploadAssetDto } from "@/lib/design-studio/dto/design-studio.dto";
import type { UploadAssetResponse } from "@/lib/design-studio/types/design-studio.types";

interface AssetLibraryProps {
  onClose: () => void;
  onAssetSelect: (asset: any) => void;
}

// Define proper asset response structure
interface UserAssetsResponse {
  assets: UploadAssetResponse[];
  totalCount?: number;
  hasMore?: boolean;
}

// Type guard for user assets response
const isUserAssetsResponse = (data: any): data is UserAssetsResponse => {
  return (
    data &&
    typeof data === "object" &&
    "assets" in data &&
    Array.isArray(data.assets)
  );
};

// Helper function to get assets from response
const getAssetsFromResponse = (response: any): UploadAssetResponse[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (isUserAssetsResponse(response)) return response.assets;
  return [];
};

export default function AssetLibraryComponent({
  onClose,
  onAssetSelect,
}: AssetLibraryProps) {
  const [activeTab, setActiveTab] = useState("images");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);

  // Fetch user assets based on type with proper type handling
  const { data: imagesResponse, isLoading: imagesLoading } = useUserAssets({
    type: "image",
  });
  const { data: iconsResponse, isLoading: iconsLoading } = useUserAssets({
    type: "icon",
  });
  const { data: backgroundsResponse, isLoading: backgroundsLoading } =
    useUserAssets({
      type: "background",
    });

  // Extract assets from responses safely
  const imagesData = getAssetsFromResponse(imagesResponse);
  const iconsData = getAssetsFromResponse(iconsResponse);
  const backgroundsData = getAssetsFromResponse(backgroundsResponse);

  // Upload asset mutation
  const uploadAsset = useUploadAsset();

  const handleFileUpload = async (file: File, type: UploadAssetDto["type"]) => {
    setUploadingFile(file);
    try {
      const uploadData: UploadAssetDto = {
        name: file.name.split(".")[0], // Remove extension
        type: type,
        description: `Uploaded ${type}`,
        tags: [type, "user-upload"],
      };

      await uploadAsset.mutateAsync({
        file,
        assetData: uploadData,
      });
      toast.success("Asset uploaded successfully");
    } catch (error) {
      console.error("Failed to upload asset:", error);
      toast.error("Failed to upload asset");
    } finally {
      setUploadingFile(null);
    }
  };

  const handleAssetClick = (asset: UploadAssetResponse) => {
    onAssetSelect({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      url: asset.url,
      width: 200, // Default width
      height: 200, // Default height
      mimeType: asset.mimeType,
      size: asset.size,
      data: {
        ...asset,
        originalUrl: asset.url,
        uploadedAt: asset.createdAt,
      },
    });
  };

  const renderAssetGrid = (
    assets: UploadAssetResponse[],
    loading: boolean,
    type: string,
    uploadType: UploadAssetDto["type"]
  ) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading {type}...</span>
        </div>
      );
    }

    if (!assets || assets.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mb-4">
            {type === "images" && (
              <Image className="h-12 w-12 text-muted-foreground mx-auto" />
            )}
            {type === "icons" && (
              <Shapes className="h-12 w-12 text-muted-foreground mx-auto" />
            )}
            {type === "backgrounds" && (
              <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
            )}
          </div>
          <h3 className="text-lg font-semibold mb-2">No {type} found</h3>
          <p className="text-muted-foreground mb-4">
            Upload your first {type.slice(0, -1)} to get started
          </p>
          <Button
            variant="outline"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = getAcceptType(uploadType);
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleFileUpload(file, uploadType);
              };
              input.click();
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload {type.slice(0, -1)}
          </Button>
        </div>
      );
    }

    const filteredAssets = assets.filter((asset: UploadAssetResponse) =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredAssets.map((asset: UploadAssetResponse) => (
          <Card
            key={asset.id}
            className="cursor-pointer hover:shadow-md transition-shadow group"
            onClick={() => handleAssetClick(asset)}
          >
            <CardContent className="p-3">
              <div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                {asset.url &&
                (asset.type === "image" ||
                  asset.type === "background" ||
                  asset.type === "icon") ? (
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="text-muted-foreground">
                    {type === "images" && <Image className="h-8 w-8" />}
                    {type === "icons" && <Shapes className="h-8 w-8" />}
                    {type === "backgrounds" && <FileText className="h-8 w-8" />}
                  </div>
                )}
              </div>
              <p className="text-sm font-medium truncate">{asset.name}</p>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{asset.type}</span>
                <span>
                  {asset.size
                    ? `${(asset.size / 1024).toFixed(1)}KB`
                    : "Unknown"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {asset.mimeType}
              </div>
              {/* Overlay for hover effect */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <Plus className="h-6 w-6 text-white" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const getAcceptType = (type: UploadAssetDto["type"]) => {
    switch (type) {
      case "image":
        return "image/*";
      case "icon":
        return ".svg,.png,.jpg,.jpeg";
      case "background":
        return "image/*";
      case "logo":
        return ".svg,.png,.jpg,.jpeg";
      case "texture":
        return "image/*";
      default:
        return "*";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Asset Library</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 border-b">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets by name..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleFileUpload(file, "image");
              };
              input.click();
            }}
            disabled={uploadAsset.isPending}
          >
            {uploadingFile && uploadAsset.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Upload Image
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".svg,.png,.jpg,.jpeg";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleFileUpload(file, "icon");
              };
              input.click();
            }}
            disabled={uploadAsset.isPending}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Icon
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleFileUpload(file, "background");
              };
              input.click();
            }}
            disabled={uploadAsset.isPending}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Background
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="w-full rounded-none">
            <TabsTrigger value="images" className="flex-1">
              Images ({imagesData.length})
            </TabsTrigger>
            <TabsTrigger value="icons" className="flex-1">
              Icons ({iconsData.length})
            </TabsTrigger>
            <TabsTrigger value="backgrounds" className="flex-1">
              Backgrounds ({backgroundsData.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="p-4 mt-0">
            {renderAssetGrid(imagesData, imagesLoading, "images", "image")}
          </TabsContent>

          <TabsContent value="icons" className="p-4 mt-0">
            {renderAssetGrid(iconsData, iconsLoading, "icons", "icon")}
          </TabsContent>

          <TabsContent value="backgrounds" className="p-4 mt-0">
            {renderAssetGrid(
              backgroundsData,
              backgroundsLoading,
              "backgrounds",
              "background"
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Asset Library Statistics */}
      <div className="border-t p-3 bg-muted/30">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>
            Total Assets:{" "}
            {imagesData.length + iconsData.length + backgroundsData.length}
          </span>
          <span>
            {uploadAsset.isPending ? (
              <div className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Uploading...
              </div>
            ) : (
              "Ready"
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
