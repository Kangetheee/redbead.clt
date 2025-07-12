import { getErrorMessage } from "@/lib/get-error-message";
import { ONE_MB, tags } from "@/lib/shared/constants";
import { CreateUploadFolderDto } from "@/lib/uploads/dto/create-upload-folder.dto";
import { createUploadSchema } from "@/lib/uploads/dto/create-upload.dto";
import {
  createUploadAction,
  createUploadFolderAction,
  deleteMediaAction,
  getUploadFolderDetailsAction,
  getUploadFoldersAction,
} from "@/lib/uploads/uploads.actions";
import { computeSHA256 } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import useUpdateSearchParams from "./use-update-search-params";

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

interface UseS3UploadReturn {
  uploadToS3: (
    file: File
  ) => Promise<
    | { id: string; src: string; error: false }
    | { id: null; src: null; error: true }
  >;
  progress: number;
}

// async function uploadFile(
//   folderId: string,
//   file: File,
//   setProgress: Dispatch<SetStateAction<number>>
// ) {
//   try {
//     const { name, type, size } = file;
//     const data = {
//       name,
//       type: type.split("/")[0].toUpperCase(),
//       size,
//       folderId,
//       checksum: await computeSHA256(file),
//     };

//     const parsedData = createUploadSchema.safeParse(data);
//     if (parsedData.success === false)
//       throw new Error(parsedData.error.errors[0].message);
//     const res = await createUploadAction(parsedData.data);
//     if (res.status === "error") throw new Error(res.message);
//     const { id, url, src } = res;

//     try {
//       await axios.put(url, file, {
//         headers: { "Content-Type": file.type },
//         onUploadProgress: (progressEvent) => {
//           const percentCompleted = Math.round(
//             (progressEvent.loaded * 100) / progressEvent.total!
//           );
//           setProgress(percentCompleted);
//         },
//       });
//     } catch (error) {
//       throw new Error(getErrorMessage(error));
//     }
//     return { id: id.toString(), src };
//   } catch (error) {
//     throw new Error(getErrorMessage(error));
//   }
// }

async function uploadFile(
  folderId: string,
  file: File,
  setProgress: Dispatch<SetStateAction<number>>
) {
  try {
    const { name, type, size } = file;

    let fileType;
    if (type.startsWith("image/")) {
      fileType = "IMAGE";
    } else if (type.startsWith("video/")) {
      fileType = "VIDEO";
    } else if (type.startsWith("audio/")) {
      fileType = "AUDIO";
    } else {
      fileType = "DOCUMENT";
    }

    const data = {
      name,
      type: fileType,
      size,
      folderId,
      checksum: await computeSHA256(file),
    };

    const parsedData = createUploadSchema.safeParse(data);
    if (parsedData.success === false)
      throw new Error(parsedData.error.errors[0].message);
    const res = await createUploadAction(parsedData.data);
    if (res.status === "error") throw new Error(res.message);
    const { id, url, src } = res;

    try {
      await axios.put(url, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total!
          );
          setProgress(percentCompleted);
        },
      });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
    return { id: id.toString(), src };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export const useUploadToS3 = (
  folderId: string,
  maxFileSize: number
): UseS3UploadReturn => {
  const [progress, setProgress] = useState(0);

  const uploadToS3 = async (file: File) => {
    try {
      if (file.size > maxFileSize)
        throw new Error(
          `Images cannot be larger than ${maxFileSize / ONE_MB}MB.`
        );
      // Single file upload
      const singleFile = file as File;
      const { id, src } = await uploadFile(folderId, singleFile, setProgress);
      return { id, src, error: false as const };
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
        return { id: null, src: null, error: true as const };
      }
      const description = getErrorMessage(error);
      toast("Internal Server Error", { description });
      return { id: null, src: null, error: true as const };
    }
  };

  return { progress, uploadToS3 };
};
