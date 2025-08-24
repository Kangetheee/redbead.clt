"use client";

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
  exportGuestDesignAction,
  createOrderFromDesignAction,
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
  GuestExportDesignDto,
  CreateOrderDto,
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
    staleTime: 15 * 60 * 1000,
  });
}

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
    staleTime: 30 * 60 * 1000,
  });
}

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
    staleTime: 10 * 60 * 1000,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 (invalid token or expired)
      if (error?.status === 404) return false;
      return failureCount < 2;
    },
  });
}

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
    staleTime: 5 * 60 * 1000,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 (design not found)
      if (error?.status === 404) return false;
      return failureCount < 3;
    },
  });
}

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

export function useExportGuestDesign() {
  return useMutation({
    mutationFn: async (values: GuestExportDesignDto) => {
      const result = await exportGuestDesignAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success("Design exported successfully");

      if (data.url.startsWith("data:")) {
        const byteString = atob(data.url.split(",")[1]);
        const mimeString = data.url.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `design_export.${data.format.toLowerCase()}`;
        link.click();

        // Clean up
        URL.revokeObjectURL(url);
      } else {
        // Handle regular URLs
        const link = document.createElement("a");
        link.href = data.url;
        link.download = "";
        link.click();
      }

      toast.info(
        `Exported as ${data.format.toUpperCase()} (${(data.fileSize / 1024 / 1024).toFixed(1)}MB)`,
        { duration: 6000 }
      );
    },
    onError: (error: Error) => {
      if (error.message.includes("404")) {
        toast.error("Product not found", {
          description: "The selected product may not be available.",
          duration: 6000,
        });
      } else {
        toast.error(`Failed to export design: ${error.message}`);
      }
    },
  });
}

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
        { duration: 4000 }
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
          { duration: 6000 }
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

      queryClient.invalidateQueries({ queryKey: designStudioKeys.designs() });

      queryClient.setQueryData(designStudioKeys.design(data.id), data);

      toast.info(
        `Design "${data.name}" created with ${data.customizations.elements.length} elements`,
        { duration: 6000 }
      );
    },
    onError: (error: Error) => {
      if (error.message.includes("Authentication")) {
        toast.error("Please sign in to save designs", {
          description: "You need to be authenticated to save designs.",
          duration: 6000,
        });
      } else {
        toast.error(`Failed to create design: ${error.message}`);
      }
    },
  });
}

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
      } else if (error.message.includes("permission")) {
        toast.error("Access denied", {
          description: "You don't have permission to modify this design.",
          duration: 6000,
        });
      } else {
        toast.error(`Failed to update design: ${error.message}`);
      }
    },
  });
}

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
      } else if (error.message.includes("permission")) {
        toast.error("Access denied", {
          description: "You don't have permission to delete this design.",
          duration: 6000,
        });
      } else {
        toast.error(`Failed to delete design: ${error.message}`);
      }
    },
  });
}

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
        { duration: 6000 }
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
            description:
              data.errors[0]?.message || "Please review and fix the issues.",
            duration: 8000,
          }
        );
      }

      if (data.warnings.length > 0) {
        toast.info(`${data.warnings.length} warning(s) found`, {
          description: data.warnings[0]?.message,
          duration: 6000,
        });
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to validate design: ${error.message}`);
    },
  });
}

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
        description: data.expiresAt
          ? `Expires: ${new Date(data.expiresAt).toLocaleDateString()}`
          : "No expiration date",
        duration: 8000,
      });
    },
    onError: (error: Error) => {
      if (error.message.includes("404")) {
        toast.error("Design not found", {
          description: "The design may have been deleted.",
          duration: 6000,
        });
      } else if (error.message.includes("permission")) {
        toast.error("Access denied", {
          description: "You don't have permission to share this design.",
          duration: 6000,
        });
      } else {
        toast.error(`Failed to share design: ${error.message}`);
      }
    },
  });
}

export function useCreateOrderFromDesign() {
  return useMutation({
    mutationFn: async ({
      designId,
      values,
    }: {
      designId: string;
      values: CreateOrderDto;
    }) => {
      const result = await createOrderFromDesignAction(designId, values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success("Order created successfully");
      toast.info(`Order ID: ${data.orderId}`, {
        description: "Redirecting to order details...",
        duration: 6000,
      });
    },
    onError: (error: Error) => {
      if (error.message.includes("404")) {
        toast.error("Design not found", {
          description: "The design may have been deleted.",
          duration: 6000,
        });
      } else if (error.message.includes("Authentication")) {
        toast.error("Please sign in to create orders", {
          description: "Customer authentication is required for orders.",
          duration: 6000,
        });
      } else if (error.message.includes("address")) {
        toast.error("Invalid shipping address", {
          description: "Please check your shipping address details.",
          duration: 6000,
        });
      } else {
        toast.error(`Failed to create order: ${error.message}`);
      }
    },
  });
}

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
        { duration: 6000 }
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
      } else if (error.message.includes("Authentication")) {
        toast.error("Please sign in to upload assets", {
          description: "You need to be authenticated to upload assets.",
          duration: 6000,
        });
      } else {
        toast.error(`Failed to upload asset: ${error.message}`);
      }
    },
  });
}
