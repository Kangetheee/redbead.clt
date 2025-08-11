/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { getErrorMessage } from "@/lib/get-error-message";
import { ONE_MB, tags } from "@/lib/shared/constants";
import { CreateUploadFolderDto } from "@/lib/uploads/dto/create-upload-folder.dto";
import {
  createUploadFolderAction,
  deleteMediaAction,
  getUploadFolderDetailsAction,
  getUploadFoldersAction,
  uploadFileAction,
  getUploadsAction,
  getUploadAction,
  getFileAction,
  updateUploadAction,
  deleteFolderAction,
} from "@/lib/uploads/uploads.actions";
import { UpdateUploadDto } from "@/lib/uploads/dto/update-upload.dto";
import { MediaTypeEnum } from "@/lib/uploads/enums/uploads.enum";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import useUpdateSearchParams from "./use-update-search-params";

type Props = {
  onSuccess?: () => void;
};

const uploadsQueryKey: QueryKey = [tags.UPLOADS];

/**
 * Hook to get all upload folders
 */
export function useGetUploadFolders() {
  const { getSearchParams } = useUpdateSearchParams();
  const query = getSearchParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: [...uploadsQueryKey, "folders", query],
    queryFn: async () => {
      const res = await getUploadFoldersAction(query);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  return {
    folders: data,
    isGettingFolders: isPending,
    folderError: isError ? error.message : undefined,
  };
}

/**
 * Hook to get all uploads
 */
export function useGetUploads() {
  const { getSearchParams } = useUpdateSearchParams();
  const query = getSearchParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: [...uploadsQueryKey, "list", query],
    queryFn: async () => {
      const res = await getUploadsAction(query);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  return {
    uploads: data,
    isGettingUploads: isPending,
    uploadsError: isError ? error.message : undefined,
  };
}

/**
 * Hook to get folder details with media
 */
export function useGetUploadFolderDetails({ folderId }: { folderId: string }) {
  const { getSearchParams } = useUpdateSearchParams();
  const query = getSearchParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: [...uploadsQueryKey, "folder", folderId, query],
    queryFn: async () => {
      const res = await getUploadFolderDetailsAction(folderId, query);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    enabled: !!folderId,
  });

  return {
    folderDetails: data,
    isGettingFolderDetails: isPending,
    folderDetailsError: isError ? error.message : undefined,
  };
}

/**
 * Hook to get upload details
 */
export function useGetUpload(id: string) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: [...uploadsQueryKey, "detail", id],
    queryFn: async () => {
      const res = await getUploadAction(id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    enabled: !!id,
  });

  return {
    upload: data,
    isGettingUpload: isPending,
    uploadError: isError ? error.message : undefined,
  };
}

/**
 * Hook to get file content
 */
export function useGetFile(id: string) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: [...uploadsQueryKey, "file", id],
    queryFn: async () => {
      const res = await getFileAction(id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    enabled: !!id,
  });

  return {
    file: data,
    isGettingFile: isPending,
    fileError: isError ? error.message : undefined,
  };
}

/**
 * Hook to delete an upload
 */
export function useDeleteFile({
  onSuccess,
  folderId,
}: Props & { folderId?: string } = {}) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const res = await deleteMediaAction(id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...uploadsQueryKey],
      });
      toast.success("File deleted successfully");
      onSuccess?.();
    },
  });

  return {
    onDeleteFile: mutate,
    isDeletingFile: isPending,
  };
}

/**
 * Hook to delete a folder
 */
export function useDeleteFolder({ onSuccess }: Props = {}) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteFolderAction(id);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...uploadsQueryKey, "folders"],
      });
      toast.success("Folder deleted successfully");
      onSuccess?.();
    },
  });

  return {
    onDeleteFolder: mutate,
    isDeletingFolder: isPending,
  };
}

/**
 * Hook to create a folder
 */
export function useCreateUploadFolder({ onSuccess }: Props = {}) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: CreateUploadFolderDto) => {
      const res = await createUploadFolderAction(values);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onError: (error) => toast.error("Error", { description: error.message }),
    onSuccess: () => {
      toast.success("Folder created successfully");
      queryClient.invalidateQueries({
        queryKey: [...uploadsQueryKey, "folders"],
      });
      onSuccess?.();
    },
  });

  return {
    onCreateFolder: mutate,
    isCreatingFolder: isPending,
  };
}

/**
 * Hook to update an upload
 */
export function useUpdateUpload({ onSuccess, id }: Props & { id: string }) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: UpdateUploadDto) => {
      const res = await updateUploadAction(id, values);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onError: (error) => toast.error("Error", { description: error.message }),
    onSuccess: () => {
      toast.success("File updated successfully");
      queryClient.invalidateQueries({ queryKey: [...uploadsQueryKey] });
      onSuccess?.();
    },
  });

  return {
    onUpdateUpload: mutate,
    isUpdatingUpload: isPending,
  };
}

interface UseUploadReturn {
  uploadFile: (
    file: File,
    folderId: string
  ) => Promise<
    | { id: string; src: string; error: false }
    | { id: null; src: null; error: true }
  >;
  progress: number;
}

/**
 * Hook to upload a file
 */
export const useUpload = (
  maxFileSize: number = 10 * ONE_MB
): UseUploadReturn => {
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();

  const uploadFile = async (file: File, folderId: string) => {
    try {
      if (file.size > maxFileSize)
        throw new Error(
          `Files cannot be larger than ${maxFileSize / ONE_MB}MB.`
        );

      // Set progress to 0 at start
      setProgress(0);

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", getFileType(file));
      formData.append("name", file.name);
      formData.append("folderId", folderId);

      // Upload the file
      const response = await uploadFileAction(formData);

      if (!response.success) {
        throw new Error(response.message || "Upload failed");
      }

      // Set progress to 100 when completed
      setProgress(100);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: [...uploadsQueryKey, "folder", folderId],
      });

      return {
        id: response.data.id,
        src: response.data.src,
        error: false as const,
      };
    } catch (error) {
      setProgress(0); // Reset progress on error

      if (error instanceof Error) {
        toast.error(error.message);
        return { id: null, src: null, error: true as const };
      }
      const description = getErrorMessage(error);
      toast("Upload failed", { description });
      return { id: null, src: null, error: true as const };
    }
  };

  return { progress, uploadFile };
};

// Helper function to determine file type
function getFileType(file: File): MediaTypeEnum {
  const type = file.type.toLowerCase();

  if (type.startsWith("image/")) {
    return MediaTypeEnum.IMAGE;
  } else if (type.startsWith("video/")) {
    return MediaTypeEnum.VIDEO;
  } else if (type.startsWith("audio/")) {
    return MediaTypeEnum.AUDIO;
  } else {
    return MediaTypeEnum.DOCUMENT;
  }
}
