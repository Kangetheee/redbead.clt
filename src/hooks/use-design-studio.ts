import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  configureCanvasAction,
  uploadArtworkAction,
  createDesignAction,
  getUserDesignsAction,
  getDesignAction,
  updateDesignAction,
  deleteDesignAction,
  getTemplatePresetsAction,
  exportDesignAction,
  validateDesignAction,
  shareDesignAction,
  getSharedDesignAction,
  getFontsAction,
  uploadAssetAction,
  getUserAssetsAction,
} from "@/lib/design-studio/design-studio.actions";
import {
  ConfigureCanvasDto,
  UploadArtworkDto,
  CreateDesignDto,
  UpdateDesignDto,
  ExportDesignDto,
  DesignValidationDto,
  ShareDesignDto,
  UploadAssetDto,
  GetDesignsDto,
  GetFontsDto,
  GetUserAssetsDto,
} from "@/lib/design-studio/dto/design-studio.dto";

// Query Keys
export const designStudioKeys = {
  all: ["design-studio"] as const,

  // Canvas
  canvas: () => [...designStudioKeys.all, "canvas"] as const,

  // Designs
  designs: () => [...designStudioKeys.all, "designs"] as const,
  designsList: (params?: GetDesignsDto) =>
    [...designStudioKeys.designs(), "list", params] as const,
  design: (id: string) => [...designStudioKeys.designs(), id] as const,
  sharedDesign: (token: string) =>
    [...designStudioKeys.designs(), "shared", token] as const,

  // Templates and Presets
  templatePresets: (templateId: string) =>
    [...designStudioKeys.all, "template-presets", templateId] as const,
  fonts: (params?: GetFontsDto) =>
    [...designStudioKeys.all, "fonts", params] as const,

  // User Assets
  userAssets: (params?: GetUserAssetsDto) =>
    [...designStudioKeys.all, "user-assets", params] as const,
};

/**
 * Configure design canvas
 * POST /v1/design-studio/configure
 */
export function useConfigureCanvas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ConfigureCanvasDto) => configureCanvasAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Canvas configured successfully");
        queryClient.invalidateQueries({ queryKey: designStudioKeys.canvas() });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to configure canvas");
    },
  });
}

/**
 * Upload artwork file
 * POST /v1/design-studio/upload-artwork
 */
export function useUploadArtwork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, values }: { file: File; values: UploadArtworkDto }) =>
      uploadArtworkAction(file, values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Artwork uploaded successfully");
        queryClient.invalidateQueries({ queryKey: designStudioKeys.designs() });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload artwork");
    },
  });
}

/**
 * Create new design
 * POST /v1/design-studio/designs
 */
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

/**
 * Get user designs
 * GET /v1/design-studio/designs
 */
export function useUserDesigns(params?: GetDesignsDto) {
  return useQuery({
    queryKey: designStudioKeys.designsList(params),
    queryFn: () => getUserDesignsAction(params),
    select: (data) => (data.success ? data.data : undefined),
  });
}

/**
 * Get design details
 * GET /v1/design-studio/designs/{id}
 */
export function useDesign(designId: string, enabled = true) {
  return useQuery({
    queryKey: designStudioKeys.design(designId),
    queryFn: () => getDesignAction(designId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!designId,
  });
}

/**
 * Update design
 * PATCH /v1/design-studio/designs/{id}
 */
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

/**
 * Delete design
 * DELETE /v1/design-studio/designs/{id}
 */
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

/**
 * Get template presets
 * GET /v1/design-studio/templates/{templateId}/presets
 */
export function useTemplatePresets(templateId: string, enabled = true) {
  return useQuery({
    queryKey: designStudioKeys.templatePresets(templateId),
    queryFn: () => getTemplatePresetsAction(templateId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!templateId,
  });
}

/**
 * Export design
 * POST /v1/design-studio/designs/{id}/export
 */
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

/**
 * Validate design
 * POST /v1/design-studio/designs/{id}/validate
 */
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

/**
 * Share design
 * POST /v1/design-studio/designs/{id}/share
 */
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

/**
 * View shared design
 * GET /v1/design-studio/shared/{token}
 */
export function useSharedDesign(token: string, enabled = true) {
  return useQuery({
    queryKey: designStudioKeys.sharedDesign(token),
    queryFn: () => getSharedDesignAction(token),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!token,
  });
}

/**
 * Get available fonts
 * GET /v1/design-studio/fonts
 */
export function useFonts(params?: GetFontsDto) {
  return useQuery({
    queryKey: designStudioKeys.fonts(params),
    queryFn: () => getFontsAction(params),
    select: (data) => (data.success ? data.data : undefined),
  });
}

/**
 * Upload asset
 * POST /v1/design-studio/assets
 */
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

/**
 * Get user assets
 * GET /v1/design-studio/assets
 */
export function useUserAssets(params?: GetUserAssetsDto) {
  return useQuery({
    queryKey: designStudioKeys.userAssets(params),
    queryFn: () => getUserAssetsAction(params),
    select: (data) => (data.success ? data.data : undefined),
  });
}
