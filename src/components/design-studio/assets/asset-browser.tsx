/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Download,
  Plus,
  Heart,
  Folder,
  Image,
  FileText,
  Music,
  Video,
} from "lucide-react";
import { useUserAssets } from "@/hooks/use-design-studio";
import { UploadAssetResponse } from "@/lib/design-studio/types/design-studio.types";
import { cn } from "@/lib/utils";

interface AssetBrowserProps {
  onAssetSelect: (asset: UploadAssetResponse) => void;
  selectedAssetId?: string;
  allowMultiple?: boolean;
  assetTypes?: string[];
}

export function AssetBrowser({
  onAssetSelect,
  selectedAssetId,
  allowMultiple = false,
  assetTypes = ["image", "logo", "background", "texture", "icon"],
}: AssetBrowserProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  const { data: assets = [] } = useUserAssets({
    type: selectedType === "all" ? undefined : selectedType,
  });

  const filteredAssets = assets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedType === "all" || asset.type === selectedType)
  );

  const handleAssetClick = (asset: UploadAssetResponse) => {
    if (allowMultiple) {
      setSelectedAssets((prev) =>
        prev.includes(asset.id)
          ? prev.filter((id) => id !== asset.id)
          : [...prev, asset.id]
      );
    } else {
      onAssetSelect(asset);
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "image":
      case "logo":
      case "background":
      case "texture":
      case "icon":
        return Image;
      case "video":
        return Video;
      case "audio":
        return Music;
      default:
        return FileText;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Folder className="h-5 w-5" />
          Asset Browser
        </CardTitle>

        {/* Search and Filters */}
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>

          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedType} onValueChange={setSelectedType}>
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="image">Images</TabsTrigger>
            <TabsTrigger value="logo">Logos</TabsTrigger>
            <TabsTrigger value="background">Backgrounds</TabsTrigger>
            <TabsTrigger value="texture">Textures</TabsTrigger>
            <TabsTrigger value="icon">Icons</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedType} className="mt-4">
            {filteredAssets.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No assets found</p>
                <p className="text-sm">
                  Try uploading some assets or adjusting your search
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredAssets.map((asset) => {
                  const isSelected = allowMultiple
                    ? selectedAssets.includes(asset.id)
                    : selectedAssetId === asset.id;

                  return (
                    <div
                      key={asset.id}
                      onClick={() => handleAssetClick(asset)}
                      className={cn(
                        "relative group cursor-pointer rounded-lg border-2 overflow-hidden transition-all",
                        isSelected
                          ? "border-primary shadow-md"
                          : "border-transparent hover:border-primary/50"
                      )}
                    >
                      <div className="aspect-square bg-gray-100 flex items-center justify-center">
                        {asset.type === "image" ||
                        asset.type === "logo" ||
                        asset.type === "background" ? (
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            {(() => {
                              const Icon = getAssetIcon(asset.type);
                              return <Icon className="h-8 w-8" />;
                            })()}
                            <span className="text-xs">
                              {asset.type.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />

                      {/* Info */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 transform translate-y-full group-hover:translate-y-0 transition-transform">
                        <div className="text-xs font-medium truncate">
                          {asset.name}
                        </div>
                        <div className="text-xs opacity-75">
                          {formatFileSize(asset.size)}
                        </div>
                      </div>

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Plus className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAssets.map((asset) => {
                  const isSelected = allowMultiple
                    ? selectedAssets.includes(asset.id)
                    : selectedAssetId === asset.id;
                  const Icon = getAssetIcon(asset.type);

                  return (
                    <div
                      key={asset.id}
                      onClick={() => handleAssetClick(asset)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-accent"
                      )}
                    >
                      <div className="w-12 h-12 rounded flex-shrink-0 bg-gray-100 flex items-center justify-center overflow-hidden">
                        {asset.type === "image" ||
                        asset.type === "logo" ||
                        asset.type === "background" ? (
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Icon className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{asset.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {asset.type} • {formatFileSize(asset.size)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{asset.type}</Badge>
                        {isSelected && (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Plus className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons for Multiple Selection */}
        {allowMultiple && selectedAssets.length > 0 && (
          <div className="mt-4 flex justify-between items-center p-3 bg-accent rounded-lg">
            <span className="text-sm">
              {selectedAssets.length} asset
              {selectedAssets.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAssets([])}
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  // Handle multiple asset selection
                  const selectedAssetObjects = assets.filter((asset) =>
                    selectedAssets.includes(asset.id)
                  );
                  selectedAssetObjects.forEach(onAssetSelect);
                }}
              >
                Add Selected
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
