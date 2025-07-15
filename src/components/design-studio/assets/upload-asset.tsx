/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import { Upload, X, File, Image, CheckCircle, AlertCircle } from "lucide-react";
import { useUploadAsset } from "@/hooks/use-design-studio";
import { UploadAssetDto } from "@/lib/design-studio/dto/design-studio.dto";
import { toast } from "sonner";

interface UploadAssetProps {
  onUploadComplete?: (assetId: string) => void;
  allowedTypes?: string[];
  maxFileSize?: number; // in MB
}

export function UploadAsset({
  onUploadComplete,
  allowedTypes = ["image", "logo", "background", "texture", "icon"],
  maxFileSize = 10,
}: UploadAssetProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadData, setUploadData] = useState<Partial<UploadAssetDto>>({
    type: "image",
    name: "",
    description: "",
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAsset = useUploadAsset();

  const assetTypes = [
    { value: "image", label: "Image" },
    { value: "logo", label: "Logo" },
    { value: "background", label: "Background" },
    { value: "texture", label: "Texture" },
    { value: "icon", label: "Icon" },
  ];

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(files).forEach((file) => {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        invalidFiles.push(`${file.name} (too large)`);
        return;
      }

      // Check file type
      const isValidType =
        file.type.startsWith("image/") ||
        file.type.startsWith("video/") ||
        file.type.startsWith("audio/") ||
        file.type === "application/pdf";

      if (!isValidType) {
        invalidFiles.push(`${file.name} (unsupported type)`);
        return;
      }

      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      toast.error(`Invalid files: ${invalidFiles.join(", ")}`);
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);

    // Auto-fill name if only one file
    if (validFiles.length === 1 && !uploadData.name) {
      setUploadData((prev) => ({
        ...prev,
        name: validFiles[0].name.split(".")[0],
      }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    if (!uploadData.name || !uploadData.type) {
      toast.error("Please fill in all required fields");
      return;
    }

    for (const file of selectedFiles) {
      try {
        await uploadAsset.mutateAsync({
          file,
          assetData: {
            name: uploadData.name || file.name,
            type: uploadData.type as any,
            description: uploadData.description,
          },
        });

        onUploadComplete?.(file.name);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }

    // Reset form
    setSelectedFiles([]);
    setUploadData({
      type: "image",
      name: "",
      description: "",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Assets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">Drop files here</p>
          <p className="text-sm text-muted-foreground mb-4">
            Or click to browse files (max {maxFileSize}MB each)
          </p>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Files</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 bg-accent rounded"
                >
                  <File className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {file.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Asset Details */}
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="asset-name">Asset Name *</Label>
            <Input
              id="asset-name"
              value={uploadData.name || ""}
              onChange={(e) =>
                setUploadData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter asset name..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="asset-type">Asset Type *</Label>
            <Select
              value={uploadData.type}
              onValueChange={(value) =>
                setUploadData((prev) => ({ ...prev, type: value as any }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select asset type" />
              </SelectTrigger>
              <SelectContent>
                {assetTypes
                  .filter((type) => allowedTypes.includes(type.value))
                  .map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asset-description">Description</Label>
            <Textarea
              id="asset-description"
              value={uploadData.description || ""}
              onChange={(e) =>
                setUploadData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter asset description..."
              rows={2}
            />
          </div>
        </div>

        {/* Upload Progress */}
        {uploadAsset.isPending && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm">Uploading...</span>
            </div>
            <Progress value={50} className="w-full" />
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={
            selectedFiles.length === 0 ||
            uploadAsset.isPending ||
            !uploadData.name ||
            !uploadData.type
          }
          className="w-full"
        >
          {uploadAsset.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload {selectedFiles.length} File
              {selectedFiles.length !== 1 ? "s" : ""}
            </>
          )}
        </Button>

        {/* Upload Tips */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Supported formats: Images, Videos, Audio, PDF</p>
          <p>• Maximum file size: {maxFileSize}MB per file</p>
          <p>• Multiple files can be uploaded at once</p>
        </div>
      </CardContent>
    </Card>
  );
}
