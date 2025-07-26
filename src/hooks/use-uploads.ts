import { getErrorMessage } from "@/lib/get-error-message";
import { ONE_MB, tags } from "@/lib/shared/constants";
import { CreateUploadFolderDto } from "@/lib/uploads/dto/create-upload-folder.dto";
import {
  createUploadFolderAction,
  deleteMediaAction,
  getUploadFolderDetailsAction,
  getUploadFoldersAction,
  uploadFileAction,
} from "@/lib/uploads/uploads.actions";
import { computeSHA256 } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import useUpdateSearchParams from "./use-update-search-params";
import { MediaTypeEnum } from "@/lib/uploads/enums/uploads.enum";

type Props = {
  onSuccess?: () => void;
};

const uploadsQueryKey: QueryKey = [tags.UPLOADS];

export function useGetUploadFolders() {
  const { getSearchParams } = useUpdateSearchParams();
  const query = getSearchParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: [...uploadsQueryKey, query],
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

export function useGetUploadFolderDetails({ folderId }: { folderId: string }) {
  const { getSearchParams } = useUpdateSearchParams();
  const query = getSearchParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: [...uploadsQueryKey, folderId, query],
    queryFn: async () => {
      const res = await getUploadFolderDetailsAction(folderId, query);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  return {
    folderDetails: data,
    isGettingFolderDetails: isPending,
    folderDetailsError: isError ? error.message : undefined,
  };
}

export function useDeleteFile({
  onSuccess,
  folderId,
}: Props & { folderId?: string } = {}) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const res = await deleteMediaAction(id);
      if (!res.success) throw new Error(res.message);
      return res.message;
    },
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...uploadsQueryKey, ...(folderId ? [folderId] : [])],
      });
      toast.success("Success", { description: "Operation successful" });
      onSuccess?.();
    },
  });

  return {
    onDeleteFile: mutate,
    isDeletingFile: isPending,
  };
}

export function useCreateUploadFolder({ onSuccess }: Props = {}) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: CreateUploadFolderDto) => {
      const res = await createUploadFolderAction(values);
      if (!res.success) throw new Error(res.message);
    },
    onError: (error) => toast.error("Error", { description: error.message }),
    onSuccess: () => {
      toast.success("Successful");
      queryClient.invalidateQueries({ queryKey: uploadsQueryKey });
      onSuccess?.();
    },
  });

  return {
    onCreateFolder: mutate,
    isCreatingFolder: isPending,
  };
}

interface UseUploadReturn {
  uploadFile1: (
    file: File
  ) => Promise<
    | { id: string; src: string; error: false }
    | { id: null; src: null; error: true }
  >;
  progress: number;
}

async function uploadFile(folderId: string, file: File) {
  try {
    const { name, type, size } = file;

    let fileType: MediaTypeEnum;
    if (type.startsWith("image/")) {
      fileType = MediaTypeEnum.IMAGE;
    } else if (type.startsWith("video/")) {
      fileType = MediaTypeEnum.VIDEO;
    } else if (type.startsWith("audio/")) {
      fileType = MediaTypeEnum.AUDIO;
    } else {
      fileType = MediaTypeEnum.DOCUMENT;
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);
    formData.append("type", fileType);
    formData.append("size", size.toString());
    formData.append("folderId", folderId);
    formData.append("checksum", await computeSHA256(file));

    // Use the authenticated action instead of direct axios call
    const response = await uploadFileAction(formData);

    if (response.status !== "success") {
      throw new Error(response.message || "Upload failed");
    }

    const { id, src } = response;
    return { id: id.toString(), src };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export const useUploadToS3 = (
  folderId: string,
  maxFileSize: number
): UseUploadReturn => {
  const [progress, setProgress] = useState(0);

  const uploadFile1 = async (file: File) => {
    try {
      if (file.size > maxFileSize)
        throw new Error(
          `Files cannot be larger than ${maxFileSize / ONE_MB}MB.`
        );

      // Set progress to 0 at start and 100 at end since we can't track real progress with server actions
      setProgress(0);

      // Single file upload
      const singleFile = file as File;
      const { id, src } = await uploadFile(folderId, singleFile);

      // Set progress to 100 when completed
      setProgress(100);

      return { id, src, error: false as const };
    } catch (error) {
      setProgress(0); // Reset progress on error

      if (error instanceof Error) {
        toast.error(error.message);
        return { id: null, src: null, error: true as const };
      }
      const description = getErrorMessage(error);
      toast("Internal Server Error", { description });
      return { id: null, src: null, error: true as const };
    }
  };

  return { progress, uploadFile1 };
};
