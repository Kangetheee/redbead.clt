import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AssetsTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assetForm: UseFormReturn<any>;
  uploadedFiles: File[];
  onUploadAsset: (file: File) => void;
  onSetUploadedFiles: (files: File[]) => void;
  isUploadingAsset: boolean;
}

export default function AssetsTab({
  assetForm,
  uploadedFiles,
  onUploadAsset,
  onSetUploadedFiles,
  isUploadingAsset,
}: AssetsTabProps) {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSetUploadedFiles([file]);
    }
  };

  const handleUpload = () => {
    if (uploadedFiles.length > 0) {
      onUploadAsset(uploadedFiles[0]);
    } else {
      toast.error("Please select a file first");
    }
  };

  const isFormValid = !!assetForm.getValues("name") && uploadedFiles.length > 0;

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Upload Assets</h3>

      <Form {...assetForm}>
        <form className="space-y-4">
          <FormField
            control={assetForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asset Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter asset name" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={assetForm.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asset Type</FormLabel>
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
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="logo">Logo</SelectItem>
                    <SelectItem value="background">Background</SelectItem>
                    <SelectItem value="texture">Texture</SelectItem>
                    <SelectItem value="icon">Icon</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <div>
            <label className="text-sm font-medium">Select File</label>
            <input
              type="file"
              accept="image/*"
              className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={handleFileSelect}
            />
            {uploadedFiles.length > 0 && (
              <p className="mt-1 text-sm text-gray-600">
                Selected: {uploadedFiles[0].name}
              </p>
            )}
          </div>

          <FormField
            control={assetForm.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Asset description" />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            type="button"
            className="w-full"
            onClick={handleUpload}
            disabled={!isFormValid || isUploadingAsset}
          >
            {isUploadingAsset ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Asset"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
