/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCallback } from "react";
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
  canvas: () => [...designStudioKeys.all, "canvas"] as const,
  designs: () => [...designStudioKeys.all, "designs"] as const,
  designsList: (params?: GetDesignsDto) =>
    [...designStudioKeys.designs(), "list", params] as const,
  design: (id: string) =>
    [...designStudioKeys.designs(), "detail", id] as const,
  sharedDesign: (token: string) =>
    [...designStudioKeys.designs(), "shared", token] as const,
  templatePresets: (templateId: string) =>
    [...designStudioKeys.all, "template-presets", templateId] as const,
  fonts: (params?: GetFontsDto) =>
    [...designStudioKeys.all, "fonts", params] as const,
  assets: () => [...designStudioKeys.all, "assets"] as const,
  userAssets: (params?: GetUserAssetsDto) =>
    [...designStudioKeys.assets(), "list", params] as const,
};

// Query Hooks

/**
 * Get user designs with filtering
 * Uses GET /v1/design-studio/designs
 */
export function useUserDesigns(params?: GetDesignsDto) {
  return useQuery({
    queryKey: designStudioKeys.designsList(params),
    queryFn: async () => {
      const result = await getUserDesignsAction(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get design details
 * Uses GET /v1/design-studio/designs/{id}
 */
export function useDesign(designId: string, enabled = true) {
  return useQuery({
    queryKey: designStudioKeys.design(designId),
    queryFn: async () => {
      const result = await getDesignAction(designId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!designId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 (design not found)
      if (error?.status === 404) return false;
      return failureCount < 3;
    },
  });
}

/**
 * Get template presets
 * Uses GET /v1/design-studio/templates/{templateId}/presets
 */
export function useTemplatePresets(templateId: string, enabled = true) {
  return useQuery({
    queryKey: designStudioKeys.templatePresets(templateId),
    queryFn: async () => {
      const result = await getTemplatePresetsAction(templateId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!templateId,
    staleTime: 15 * 60 * 1000, // 15 minutes - presets don't change often
  });
}

/**
 * View shared design
 * Uses GET /v1/design-studio/shared/{token}
 */
export function useSharedDesign(token: string, enabled = true) {
  return useQuery({
    queryKey: designStudioKeys.sharedDesign(token),
    queryFn: async () => {
      const result = await getSharedDesignAction(token);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!token,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 (invalid token or expired)
      if (error?.status === 404) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Get available fonts
 * Uses GET /v1/design-studio/fonts
 */
export function useFonts(params?: GetFontsDto) {
  return useQuery({
    queryKey: designStudioKeys.fonts(params),
    queryFn: async () => {
      const result = await getFontsAction(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - fonts rarely change
  });
}

/**
 * Get user assets
 * Uses GET /v1/design-studio/assets
 */
export function useUserAssets(params?: GetUserAssetsDto) {
  return useQuery({
    queryKey: designStudioKeys.userAssets(params),
    queryFn: async () => {
      const result = await getUserAssetsAction(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutation Hooks

/**
 * Configure design canvas
 * Uses POST /v1/design-studio/configure
 */
export function useConfigureCanvas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ConfigureCanvasDto) => {
      const result = await configureCanvasAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success("Canvas configured successfully");
      queryClient.invalidateQueries({ queryKey: designStudioKeys.canvas() });

      toast.info(
        `Canvas ready: ${data.canvasSettings.width}x${data.canvasSettings.height}px`,
        {
          duration: 4000,
        }
      );
    },
    onError: (error: Error) => {
      if (error.message.includes("404")) {
        toast.error("Template or size variant not found", {
          description: "Please check your selection and try again.",
          duration: 6000,
        });
      } else {
        toast.error(`Failed to configure canvas: ${error.message}`);
      }
    },
  });
}

/**
 * Upload artwork file
 * Uses POST /v1/design-studio/upload-artwork
 */
export function useUploadArtwork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      values,
    }: {
      file: File;
      values: UploadArtworkDto;
    }) => {
      const result = await uploadArtworkAction(file, values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success("Artwork uploaded successfully");
      queryClient.invalidateQueries({ queryKey: designStudioKeys.designs() });

      if (!data.validation.isValid && data.validation.warnings.length > 0) {
        toast.warning("Artwork uploaded with warnings", {
          description: data.validation.warnings[0],
          duration: 8000,
        });
      } else {
        toast.info(
          `Artwork processed: ${data.validation.dpi} DPI, ${data.validation.colors} colors`,
          {
            duration: 6000,
          }
        );
      }
    },
    onError: (error: Error) => {
      if (error.message.includes("file size")) {
        toast.error("File too large", {
          description: "Please reduce the file size and try again.",
          duration: 6000,
        });
      } else if (error.message.includes("format")) {
        toast.error("Invalid file format", {
          description: "Please use JPG, PNG, PDF, or SVG files.",
          duration: 6000,
        });
      } else {
        toast.error(`Failed to upload artwork: ${error.message}`);
      }
    },
  });
}

/**
 * Create new design
 * Uses POST /v1/design-studio/designs
 */
export function useCreateDesign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateDesignDto) => {
      const result = await createDesignAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success("Design created successfully");

      // Invalidate designs list
      queryClient.invalidateQueries({ queryKey: designStudioKeys.designs() });

      // Set the created design in cache
      queryClient.setQueryData(designStudioKeys.design(data.id), data);

      toast.info(
        `Design "${data.name}" created with ${data.customizations.elements.length} elements`,
        {
          duration: 6000,
        }
      );
    },
    onError: (error: Error) => {
      toast.error(`Failed to create design: ${error.message}`);
    },
  });
}

/**
 * Update design
 * Uses PATCH /v1/design-studio/designs/{id}
 */
export function useUpdateDesign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      designId,
      values,
    }: {
      designId: string;
      values: UpdateDesignDto;
    }) => {
      const result = await updateDesignAction(designId, values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Design updated successfully");

      // Update specific design cache
      queryClient.setQueryData(
        designStudioKeys.design(variables.designId),
        data
      );

      // Invalidate designs list
      queryClient.invalidateQueries({ queryKey: designStudioKeys.designs() });
    },
    onError: (error: Error) => {
      if (error.message.includes("404")) {
        toast.error("Design not found", {
          description: "The design may have been deleted.",
          duration: 6000,
        });
      } else {
        toast.error(`Failed to update design: ${error.message}`);
      }
    },
  });
}

/**
 * Delete design
 * Uses DELETE /v1/design-studio/designs/{id}
 */
export function useDeleteDesign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (designId: string) => {
      const result = await deleteDesignAction(designId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return designId;
    },
    onSuccess: (designId) => {
      toast.success("Design deleted successfully");

      // Remove from cache
      queryClient.removeQueries({
        queryKey: designStudioKeys.design(designId),
      });

      // Invalidate designs list
      queryClient.invalidateQueries({ queryKey: designStudioKeys.designs() });
    },
    onError: (error: Error) => {
      if (error.message.includes("404")) {
        toast.error("Design not found", {
          description: "The design may have already been deleted.",
          duration: 6000,
        });
      } else {
        toast.error(`Failed to delete design: ${error.message}`);
      }
    },
  });
}

/**
 * Export design
 * Uses POST /v1/design-studio/designs/{id}/export
 */
export function useExportDesign() {
  return useMutation({
    mutationFn: async ({
      designId,
      values,
    }: {
      designId: string;
      values: ExportDesignDto;
    }) => {
      const result = await exportDesignAction(designId, values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success("Design exported successfully");

      // Trigger download
      const link = document.createElement("a");
      link.href = data.url;
      link.download = "";
      link.click();

      toast.info(
        `Exported as ${data.format.toUpperCase()} (${(data.fileSize / 1024 / 1024).toFixed(1)}MB)`,
        {
          duration: 6000,
        }
      );
    },
    onError: (error: Error) => {
      if (error.message.includes("404")) {
        toast.error("Design not found", {
          description: "The design may have been deleted.",
          duration: 6000,
        });
      } else {
        toast.error(`Failed to export design: ${error.message}`);
      }
    },
  });
}

/**
 * Validate design
 * Uses POST /v1/design-studio/designs/{id}/validate
 */
export function useValidateDesign() {
  return useMutation({
    mutationFn: async ({
      designId,
      values,
    }: {
      designId: string;
      values: DesignValidationDto;
    }) => {
      const result = await validateDesignAction(designId, values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      if (data.isValid) {
        toast.success(`Design validation passed (Score: ${data.score}/100)`);
      } else {
        toast.warning(
          `Design validation found ${data.errors.length} error(s)`,
          {
            description: data.errors[0] || "Please review and fix the issues.",
            duration: 8000,
          }
        );
      }

      if (data.warnings.length > 0) {
        toast.info(`${data.warnings.length} warning(s) found`, {
          description: data.warnings[0],
          duration: 6000,
        });
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to validate design: ${error.message}`);
    },
  });
}

/**
 * Share design
 * Uses POST /v1/design-studio/designs/{id}/share
 */
export function useShareDesign() {
  return useMutation({
    mutationFn: async ({
      designId,
      values,
    }: {
      designId: string;
      values: ShareDesignDto;
    }) => {
      const result = await shareDesignAction(designId, values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success("Design shared successfully");

      // Copy share URL to clipboard
      navigator.clipboard.writeText(data.url);
      toast.info("Share URL copied to clipboard", {
        description: `Expires: ${new Date(data.expiresAt).toLocaleDateString()}`,
        duration: 8000,
      });
    },
    onError: (error: Error) => {
      if (error.message.includes("404")) {
        toast.error("Design not found", {
          description: "The design may have been deleted.",
          duration: 6000,
        });
      } else {
        toast.error(`Failed to share design: ${error.message}`);
      }
    },
  });
}

/**
 * Upload asset
 * Uses POST /v1/design-studio/assets
 */
export function useUploadAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      assetData,
    }: {
      file: File;
      assetData: UploadAssetDto;
    }) => {
      const result = await uploadAssetAction(file, assetData);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success("Asset uploaded successfully");

      // Invalidate user assets
      queryClient.invalidateQueries({ queryKey: designStudioKeys.assets() });

      toast.info(
        `"${data.name}" uploaded (${(data.size / 1024 / 1024).toFixed(1)}MB)`,
        {
          duration: 6000,
        }
      );
    },
    onError: (error: Error) => {
      if (error.message.includes("file size")) {
        toast.error("File too large", {
          description: "Please reduce the file size and try again.",
          duration: 6000,
        });
      } else if (error.message.includes("format")) {
        toast.error("Invalid file format", {
          description: "Please check the allowed file types.",
          duration: 6000,
        });
      } else {
        toast.error(`Failed to upload asset: ${error.message}`);
      }
    },
  });
}

// Utility Hooks

/**
 * Get designs by template
 */
export function useDesignsByTemplate(templateId: string) {
  return useUserDesigns({ templateId });
}

/**
 * Get designs by status
 */
export function useDesignsByStatus(status: "DRAFT" | "COMPLETED" | "ARCHIVED") {
  return useUserDesigns({ status });
}

/**
 * Get template designs only
 */
export function useTemplateDesigns() {
  return useUserDesigns({ isTemplate: true });
}

/**
 * Get assets by type
 */
export function useAssetsByType(type: string) {
  return useUserAssets({ type });
}

/**
 * Get premium fonts
 */
export function usePremiumFonts() {
  return useFonts({ premium: true });
}

/**
 * Search fonts
 */
export function useSearchFonts(search?: string, category?: string) {
  const params = search
    ? { search, category }
    : category
      ? { category }
      : undefined;
  return useFonts(params);
}

/**
 * Manual refetch hook for designs
 */
export function useRefetchDesigns() {
  const queryClient = useQueryClient();

  return useCallback(
    (params?: GetDesignsDto) => {
      queryClient.invalidateQueries({
        queryKey: params
          ? designStudioKeys.designsList(params)
          : designStudioKeys.designs(),
      });
    },
    [queryClient]
  );
}

/**
 * Manual refetch hook for assets
 */
export function useRefetchAssets() {
  const queryClient = useQueryClient();

  return useCallback(
    (params?: GetUserAssetsDto) => {
      queryClient.invalidateQueries({
        queryKey: designStudioKeys.userAssets(params),
      });
    },
    [queryClient]
  );
}

/**
 * Get design from cache without triggering network request
 */
export function useDesignFromCache(designId: string) {
  const queryClient = useQueryClient();
  return queryClient.getQueryData(designStudioKeys.design(designId));
}

/**
 * Prefetch design data
 */
export function usePrefetchDesign() {
  const queryClient = useQueryClient();

  return useCallback(
    (designId: string) => {
      queryClient.prefetchQuery({
        queryKey: designStudioKeys.design(designId),
        queryFn: async () => {
          const result = await getDesignAction(designId);
          if (!result.success) {
            throw new Error(result.error);
          }
          return result.data;
        },
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );
}

/**
 * Auto-save design hook for real-time collaboration
 */
export function useAutoSaveDesign(designId: string, enabled = false) {
  const updateDesign = useUpdateDesign();

  return useCallback(
    (values: UpdateDesignDto) => {
      if (!enabled) return;

      // Debounced auto-save (implement debouncing as needed)
      updateDesign.mutate({ designId, values });
    },
    [designId, enabled, updateDesign]
  );
}
