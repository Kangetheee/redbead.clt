"use client";

import {
  type ChangeEvent,
  type DragEvent,
  forwardRef,
  useReducer,
  useState,
} from "react";

import { toast } from "sonner";
import { v4 as uuidV4 } from "uuid";

import { MAX_FILE_SIZE } from "@/lib/shared/constants";
import { cn, validateFileType } from "@/lib/utils";

import { useUploadToS3 } from "@/hooks/use-uploads";
import { Icons } from "../icons/icons";
import UploadComponents from "./image-upload";

const { ImageUpload, VideoUpload, AudioUpload, DocumentUpload } =
  UploadComponents;

export enum MediaTypeEnum {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  DOCUMENT = "DOCUMENT",
}

interface FileWithUrl {
  id: string;
  key: string;
  name: string;
  src: string;
  size: number;
  type: MediaTypeEnum;
  error?: boolean | undefined;
}

type Action =
  | { type: "ADD_FILES_TO_INPUT"; payload: FileWithUrl[] }
  | { type: "UPDATE_FILE_IN_INPUT"; payload: FileWithUrl[] }
  | { type: "CLEAR_INPUT" }
  | { type: "REMOVE_FILE_FROM_INPUT"; payload: string };

type State = FileWithUrl[];

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  maxFileSize?: number;
  folderId: string;
  allowedTypes?: MediaTypeEnum[];
  onUploadComplete?: (
    files: { id: string; src: string; type: MediaTypeEnum }[]
  ) => void;
}

const FileInput = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      maxFileSize = MAX_FILE_SIZE,
      folderId,
      allowedTypes = [
        MediaTypeEnum.IMAGE,
        MediaTypeEnum.VIDEO,
        MediaTypeEnum.AUDIO,
        MediaTypeEnum.DOCUMENT,
      ],
      onUploadComplete,
      ...props
    },
    ref
  ) => {
    const { uploadFile1, progress } = useUploadToS3(folderId, maxFileSize);
    const [dragActive, setDragActive] = useState<boolean>(false);
    const [input, dispatch] = useReducer((state: State, action: Action) => {
      switch (action.type) {
        case "ADD_FILES_TO_INPUT": {
          // do not allow more than 10 files to be uploaded at once
          if (state.length + action.payload.length > 10) {
            toast.error("Too many files", {
              description:
                "You can only upload a maximum of 10 files at a time.",
            });
            return state;
          }

          return [...state, ...action.payload];
        }

        case "UPDATE_FILE_IN_INPUT": {
          const updatedFiles = state.map((file) => {
            const updatedFile = action.payload.find((f) => f.key === file.key);
            return updatedFile || file;
          });
          return updatedFiles;
        }

        case "REMOVE_FILE_FROM_INPUT": {
          return state.filter((file) => file.id !== action.payload);
        }

        case "CLEAR_INPUT": {
          return [];
        }

        default:
          return state;
      }
    }, []);

    const noInput = input.length === 0;

    // Get file type based on MIME type
    const getFileType = (file: File): MediaTypeEnum => {
      const mimeType = file.type.toLowerCase();

      if (mimeType.startsWith("image/")) return MediaTypeEnum.IMAGE;
      if (mimeType.startsWith("video/")) return MediaTypeEnum.VIDEO;
      if (mimeType.startsWith("audio/")) return MediaTypeEnum.AUDIO;

      // All other file types (including application/*, text/*, etc.) should be DOCUMENT
      return MediaTypeEnum.DOCUMENT;
    };

    // Generate accept string based on allowed types
    const getAcceptString = (): string => {
      const acceptMap = {
        [MediaTypeEnum.IMAGE]:
          "image/jpeg,image/jpg,image/png,image/gif,image/webp",
        [MediaTypeEnum.VIDEO]:
          "video/mp4,video/avi,video/mov,video/wmv,video/webm",
        [MediaTypeEnum.AUDIO]:
          "audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/flac",
        [MediaTypeEnum.DOCUMENT]: ".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx",
      };

      return allowedTypes.map((type) => acceptMap[type]).join(",");
    };

    // Validate if file type is allowed
    const isFileTypeAllowed = (file: File): boolean => {
      const fileType = getFileType(file);
      return allowedTypes.includes(fileType);
    };

    // Get the appropriate upload component
    const renderUploadComponent = (file: FileWithUrl, index: number) => {
      const commonProps = {
        key: index,
        id: file.id,
        src: file.src,
        name: file.name,
        size: file.size,
        error: file.error,
        remove: (id: string) =>
          dispatch({
            type: "REMOVE_FILE_FROM_INPUT",
            payload: id,
          }),
        progress: progress,
      };

      switch (file.type) {
        case MediaTypeEnum.IMAGE:
          return <ImageUpload {...commonProps} />;
        case MediaTypeEnum.VIDEO:
          return <VideoUpload {...commonProps} />;
        case MediaTypeEnum.AUDIO:
          return <AudioUpload {...commonProps} />;
        case MediaTypeEnum.DOCUMENT:
          return <DocumentUpload {...commonProps} />;
        default:
          return <DocumentUpload {...commonProps} />;
      }
    };

    // Get display text for allowed types
    const getTypeDisplayText = (): string => {
      const typeNames = {
        [MediaTypeEnum.IMAGE]: "images",
        [MediaTypeEnum.VIDEO]: "videos",
        [MediaTypeEnum.AUDIO]: "audio files",
        [MediaTypeEnum.DOCUMENT]: "documents",
      };

      const names = allowedTypes.map((type) => typeNames[type]);

      if (names.length === 1) return names[0];
      if (names.length === 2) return names.join(" and ");

      return names.slice(0, -1).join(", ") + ", and " + names[names.length - 1];
    };

    // handle drag events
    const handleDrag = (e: DragEvent<HTMLFormElement | HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const addFilesToState = (files: FileWithUrl[]) => {
      dispatch({ type: "ADD_FILES_TO_INPUT", payload: files });
    };

    const updateFilesInState = (files: FileWithUrl[]) => {
      // Filter out files with errors before calling onUploadComplete
      const successfulFiles = files.filter(
        (file) => !file.error && file.id && file.src
      );
      if (successfulFiles.length > 0) {
        onUploadComplete?.(
          successfulFiles.map(({ id, src, type }) => ({ id, src, type }))
        );
      }
      dispatch({ type: "UPDATE_FILE_IN_INPUT", payload: files });
    };

    // Process files (common logic for both change and drop)
    const processFiles = async (files: File[]) => {
      // Filter valid file types
      const validFiles = files.filter((file) => {
        const isValid = validateFileType(file) && isFileTypeAllowed(file);
        if (!isValid) {
          toast.error(`Invalid file: ${file.name}`, {
            description: `Please upload ${getTypeDisplayText()} only.`,
          });
        }
        return isValid;
      });

      if (validFiles.length === 0) return;

      try {
        // Add placeholder files to show upload progress
        const placeholderFiles: FileWithUrl[] = validFiles.map((file) => ({
          key: uuidV4(),
          id: "",
          name: file.name,
          src: "",
          size: file.size,
          type: getFileType(file),
        }));

        addFilesToState(placeholderFiles);

        // Upload files one by one
        const uploadPromises = validFiles.map(async (file, index) => {
          const placeholderFile = placeholderFiles[index];

          try {
            const result = await uploadFile1(file);

            if (result.error) {
              return {
                ...placeholderFile,
                error: true,
              };
            }

            return {
              ...placeholderFile,
              id: result.id,
              src: result.src,
              error: false,
            };
          } catch (error) {
            console.error(`Error uploading file ${file.name}:`, error);
            return {
              ...placeholderFile,
              error: true,
            };
          }
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        updateFilesInState(uploadedFiles);
      } catch (error) {
        console.error("Error processing files:", error);
        toast.error("Upload failed", {
          description: "An error occurred while uploading files.",
        });
      }
    };

    // triggers when file is selected with click
    const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        const files = Array.from(e.target.files);
        await processFiles(files);
      }
    };

    // triggers when file is dropped
    const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const files = Array.from(e.dataTransfer.files);
        await processFiles(files);
        e.dataTransfer.clearData();
      }
    };

    return (
      <form
        onSubmit={(e) => e.preventDefault()}
        onDragEnter={handleDrag}
        className="flex h-full w-full items-center justify-start"
      >
        <label
          htmlFor="dropzone-file"
          className={cn(
            "group relative flex aspect-video h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 transition dark:border-gray-600",
            { "dark:border-slate-400 dark:bg-slate-800": dragActive },
            { "aspect-auto h-fit": !noInput },
            { "items-start justify-start": !noInput },
            { "dark:hover:border-gray-500 dark:hover:bg-slate-800": noInput }
          )}
        >
          <div
            className={cn(
              "relative flex h-full w-full flex-col items-center justify-center",
              { "items-start": !noInput }
            )}
          >
            {noInput ? (
              <>
                <div
                  className="absolute inset-0 cursor-pointer"
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                />

                <svg
                  aria-hidden="true"
                  className="mb-3 h-10 w-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>

                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  up to 10 {getTypeDisplayText()},{" "}
                  {(maxFileSize / 1000000).toFixed(0)}MB per file
                </p>

                <input
                  {...props}
                  ref={ref}
                  multiple
                  onChange={handleChange}
                  accept={getAcceptString()}
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                />
              </>
            ) : (
              <div className="flex h-full w-full flex-col">
                <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden shadow sm:rounded-lg">
                      <table className="min-w-full divide-y dark:divide-slate-600">
                        <thead className="bg-muted">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                            >
                              Preview
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                            >
                              Name
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                            >
                              Size
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                            >
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs">
                              {/*  */}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="relative divide-y dark:divide-slate-600">
                          {input.map((file, index) =>
                            renderUploadComponent(file, index)
                          )}
                        </tbody>
                      </table>

                      <label
                        htmlFor="dropzone-file-present"
                        className="group relative flex cursor-pointer justify-center border-t border-slate-600 py-4 transition hover:border-gray-500 hover:dark:bg-slate-800"
                      >
                        <Icons.Plus className="size-12 fill-slate-500 stroke-1 transition group-hover:fill-slate-400" />
                        <input
                          {...props}
                          ref={ref}
                          multiple
                          onChange={handleChange}
                          accept={getAcceptString()}
                          type="file"
                          id="dropzone-file-present"
                          className="relative z-20 hidden"
                        />
                        <div
                          className="absolute inset-0"
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </label>
      </form>
    );
  }
);
FileInput.displayName = "FileInput";

export default FileInput;
