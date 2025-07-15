/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createCanvasAction,
  saveCanvasAction,
  getCanvasConfigAction,
  createDesignAction,
  getUserDesignsAction,
  getDesignAction,
  updateDesignAction,
  deleteDesignAction,
  saveDesignAction,
  createDesignVersionAction,
  getDesignVersionsAction,
  uploadDesignAssetAction,
  getDesignAssetsAction,
  removeDesignAssetAction,
  exportDesignAction,
  getDesignPresetsAction,
  validateDesignAction,
  shareDesignAction,
  getSharedDesignAction,
  getDesignTemplatesAction,
  getTemplateCustomizationAction,
  useDesignTemplateAction,
  getFontsAction,
  uploadAssetAction,
  getUserAssetsAction,
} from "@/lib/design-studio/design-studio.actions";
import {
  CreateCanvasDto,
  SaveCanvasDto,
  CreateDesignDto,
  UpdateDesignDto,
  SaveDesignDto,
  VersionDesignDto,
  UploadDesignAssetDto,
  ExportDesignDto,
  DesignValidationDto,
  ShareDesignDto,
  UploadAssetDto,
  GetDesignsDto,
  GetPresetsDto,
  GetFontsDto,
} from "@/lib/design-studio/dto/design-studio.dto";

// Query Keys
export const designStudioKeys = {
  all: ["design-studio"] as const,

  // Canvas
  canvas: () => [...designStudioKeys.all, "canvas"] as const,
  canvasConfig: (productId: string, sizePresetId?: string) =>
    [...designStudioKeys.canvas(), "config", productId, sizePresetId] as const,

  // Designs
  designs: () => [...designStudioKeys.all, "designs"] as const,
  designsList: (params?: GetDesignsDto) =>
    [...designStudioKeys.designs(), "list", params] as const,
  design: (id: string) => [...designStudioKeys.designs(), id] as const,
  designVersions: (id: string) =>
    [...designStudioKeys.design(id), "versions"] as const,
  designAssets: (id: string) =>
    [...designStudioKeys.design(id), "assets"] as const,
  sharedDesign: (token: string) =>
    [...designStudioKeys.designs(), "shared", token] as const,

  // Presets and Resources
  presets: (productId: string, params?: GetPresetsDto) =>
    [...designStudioKeys.all, "presets", productId, params] as const,
  fonts: (params?: GetFontsDto) =>
    [...designStudioKeys.all, "fonts", params] as const,

  // Templates
  templates: (params?: {
    featured?: boolean;
    categoryId?: string;
    productId?: string;
  }) => [...designStudioKeys.all, "templates", params] as const,
  templateCustomization: (templateId: string, params: any) =>
    [
      ...designStudioKeys.all,
      "template-customization",
      templateId,
      params,
    ] as const,

  // User Assets
  userAssets: (params?: { type?: string; folderId?: string }) =>
    [...designStudioKeys.all, "user-assets", params] as const,
};

// Canvas Queries and Mutations
export function useCanvasConfig(
  productId: string,
  sizePresetId?: string,
  enabled = true
) {
  return useQuery({
    queryKey: designStudioKeys.canvasConfig(productId, sizePresetId),
    queryFn: () => getCanvasConfigAction(productId, sizePresetId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!productId,
  });
}

export function useCreateCanvas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateCanvasDto) => createCanvasAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Canvas created successfully");
        queryClient.invalidateQueries({ queryKey: designStudioKeys.canvas() });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create canvas");
    },
  });
}

export function useSaveCanvas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: SaveCanvasDto) => saveCanvasAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Canvas saved successfully");
        queryClient.invalidateQueries({ queryKey: designStudioKeys.designs() });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save canvas");
    },
  });
}

// Design Queries and Mutations
export function useUserDesigns(params?: GetDesignsDto) {
  return useQuery({
    queryKey: designStudioKeys.designsList(params),
    queryFn: () => getUserDesignsAction(params),
    select: (data) => (data.success ? data.data : undefined),
  });
}

export function useDesign(designId: string, enabled = true) {
  return useQuery({
    queryKey: designStudioKeys.design(designId),
    queryFn: () => getDesignAction(designId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!designId,
  });
}

export function useDesignVersions(designId: string, enabled = true) {
  return useQuery({
    queryKey: designStudioKeys.designVersions(designId),
    queryFn: () => getDesignVersionsAction(designId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!designId,
  });
}

export function useDesignAssets(designId: string, enabled = true) {
  return useQuery({
    queryKey: designStudioKeys.designAssets(designId),
    queryFn: () => getDesignAssetsAction(designId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!designId,
  });
}

export function useSharedDesign(token: string, enabled = true) {
  return useQuery({
    queryKey: designStudioKeys.sharedDesign(token),
    queryFn: () => getSharedDesignAction(token),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!token,
  });
}

export function useCreateDesign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateDesignDto) => createDesignAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Design created successfully");
        queryClient.invalidateQueries({ queryKey: designStudioKeys.designs() });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create design");
    },
  });
}

export function useUpdateDesign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      designId,
      values,
    }: {
      designId: string;
      values: UpdateDesignDto;
    }) => updateDesignAction(designId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Design updated successfully");
        queryClient.invalidateQueries({ queryKey: designStudioKeys.designs() });
        queryClient.invalidateQueries({
          queryKey: designStudioKeys.design(variables.designId),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update design");
    },
  });
}

export function useDeleteDesign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (designId: string) => deleteDesignAction(designId),
    onSuccess: (data, designId) => {
      if (data.success) {
        toast.success("Design deleted successfully");
        queryClient.invalidateQueries({ queryKey: designStudioKeys.designs() });
        queryClient.removeQueries({
          queryKey: designStudioKeys.design(designId),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete design");
    },
  });
}

export function useSaveDesign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      designId,
      values,
    }: {
      designId: string;
      values: SaveDesignDto;
    }) => saveDesignAction(designId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Design saved successfully");
        queryClient.invalidateQueries({
          queryKey: designStudioKeys.design(variables.designId),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save design");
    },
  });
}

export function useCreateDesignVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      designId,
      values,
    }: {
      designId: string;
      values: VersionDesignDto;
    }) => createDesignVersionAction(designId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Design version created successfully");
        queryClient.invalidateQueries({
          queryKey: designStudioKeys.designVersions(variables.designId),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create design version");
    },
  });
}

// Asset Mutations
export function useUploadDesignAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      designId,
      file,
      assetData,
    }: {
      designId: string;
      file: File;
      assetData: UploadDesignAssetDto;
    }) => uploadDesignAssetAction(designId, file, assetData),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Asset uploaded successfully");
        queryClient.invalidateQueries({
          queryKey: designStudioKeys.designAssets(variables.designId),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload asset");
    },
  });
}

export function useRemoveDesignAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      designId,
      assetId,
    }: {
      designId: string;
      assetId: string;
    }) => removeDesignAssetAction(designId, assetId),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Asset removed successfully");
        queryClient.invalidateQueries({
          queryKey: designStudioKeys.designAssets(variables.designId),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove asset");
    },
  });
}

// Export and Validation
export function useExportDesign() {
  return useMutation({
    mutationFn: ({
      designId,
      values,
    }: {
      designId: string;
      values: ExportDesignDto;
    }) => exportDesignAction(designId, values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Design exported successfully");
        // Trigger download
        const link = document.createElement("a");
        link.href = data.data.url;
        link.download = "";
        link.click();
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export design");
    },
  });
}

export function useValidateDesign() {
  return useMutation({
    mutationFn: ({
      designId,
      values,
    }: {
      designId: string;
      values: DesignValidationDto;
    }) => validateDesignAction(designId, values),
    onSuccess: (data) => {
      if (data.success) {
        if (data.data.isValid) {
          toast.success("Design validation passed");
        } else {
          toast.warning("Design validation found issues");
        }
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to validate design");
    },
  });
}

export function useShareDesign() {
  return useMutation({
    mutationFn: ({
      designId,
      values,
    }: {
      designId: string;
      values: ShareDesignDto;
    }) => shareDesignAction(designId, values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Design shared successfully");
        // Copy share URL to clipboard
        navigator.clipboard.writeText(data.data.url);
        toast.info("Share URL copied to clipboard");
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to share design");
    },
  });
}

// Presets and Resources Queries
export function useDesignPresets(
  productId: string,
  params?: GetPresetsDto,
  enabled = true
) {
  return useQuery({
    queryKey: designStudioKeys.presets(productId, params),
    queryFn: () => getDesignPresetsAction(productId, params),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!productId,
  });
}

export function useFonts(params?: GetFontsDto) {
  return useQuery({
    queryKey: designStudioKeys.fonts(params),
    queryFn: () => getFontsAction(params),
    select: (data) => (data.success ? data.data : undefined),
  });
}

// Templates
export function useDesignTemplates(params?: {
  featured?: boolean;
  categoryId?: string;
  productId?: string;
}) {
  return useQuery({
    queryKey: designStudioKeys.templates(params),
    queryFn: () => getDesignTemplatesAction(params),
    select: (data) => (data.success ? data.data : undefined),
  });
}

export function useTemplateCustomization(
  templateId: string,
  params: {
    templateId: string;
    customizations?: object;
    productVariant?: string;
  },
  enabled = true
) {
  return useQuery({
    queryKey: designStudioKeys.templateCustomization(templateId, params),
    queryFn: () => getTemplateCustomizationAction(templateId, params),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!templateId,
  });
}

export function useUseDesignTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => useDesignTemplateAction(templateId),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Template applied successfully");
        queryClient.invalidateQueries({ queryKey: designStudioKeys.designs() });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to apply template");
    },
  });
}

// User Assets
export function useUserAssets(params?: { type?: string; folderId?: string }) {
  return useQuery({
    queryKey: designStudioKeys.userAssets(params),
    queryFn: () => getUserAssetsAction(params),
    select: (data) => (data.success ? data.data : undefined),
  });
}

export function useUploadAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      assetData,
    }: {
      file: File;
      assetData: UploadAssetDto;
    }) => uploadAssetAction(file, assetData),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Asset uploaded successfully");
        queryClient.invalidateQueries({
          queryKey: designStudioKeys.userAssets(),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload asset");
    },
  });
}
