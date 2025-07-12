"use client";

import Image from "next/image";
import { forwardRef } from "react";

import { X, Video, Music, FileText, File } from "lucide-react";

import { cn } from "@/lib/utils";

import { Icons } from "../icons/icons";
import { Button } from "./button";
import { Progress } from "./progress";
import { Skeleton } from "./skeleton";

interface UploadProps extends React.HTMLAttributes<HTMLTableRowElement> {
  id: string;
  name: string;
  size: number;
  src: string;
  progress: number;
  remove: (id: string) => void;
  error?: boolean | undefined;
}

const ImageUpload = forwardRef<HTMLTableRowElement, UploadProps>(
  (
    { id, src, error, name, size, className, progress, remove, ...props },
    ref
  ) => (
    <tr ref={ref} {...props} className={cn("", className)}>
      <td className="whitespace-nowrap px-6 py-4 text-sm dark:text-slate-400">
        <div className="relative flex h-12 w-20">
          {!!error && (
            <div className="flex w-full items-center justify-center">
              <Icons.Redx className="size-6" />
            </div>
          )}
          {!error && !!src && (
            <Image
              id={id}
              src={src}
              fill
              alt={name}
              style={{ objectFit: "contain" }}
            />
          )}
          {!error && !src && <Skeleton className="h-full w-full" />}
        </div>
      </td>
      <td className="truncate whitespace-normal px-6 py-4 text-sm font-medium dark:text-slate-400">
        <div className="">
          <p
            className={cn("dark:text-slate-300", {
              "dark:text-red-500": error,
            })}
          >
            {name}
          </p>
        </div>
      </td>
      <td
        className={cn(
          "whitespace-nowrap px-6 py-4 text-sm dark:text-slate-400",
          {
            "dark:text-red-500": error,
          }
        )}
      >
        {(size / 1000).toFixed(0)} KB
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm dark:text-slate-400">
        <Progress
          className={cn("h-2 w-full")}
          value={progress}
          isError={error}
        />
      </td>

      <td className="whitespace-nowrap px-6 py-4 text-sm dark:text-slate-400">
        {src && (
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={() => remove(id)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </td>
    </tr>
  )
);

ImageUpload.displayName = "ImageUpload";

// Video Upload Component
const VideoUpload = forwardRef<HTMLTableRowElement, UploadProps>(
  (
    { id, src, error, name, size, className, progress, remove, ...props },
    ref
  ) => (
    <tr ref={ref} {...props} className={cn("", className)}>
      <td className="whitespace-nowrap px-6 py-4 text-sm dark:text-slate-400">
        <div className="relative flex h-12 w-20">
          {!!error && (
            <div className="flex w-full items-center justify-center">
              <Icons.Redx className="size-6" />
            </div>
          )}
          {!error && !!src && (
            <video
              id={id}
              src={src}
              className="h-full w-full object-contain"
              controls={false}
              muted
              preload="metadata"
            />
          )}
          {!error && !src && (
            <div className="flex h-full w-full items-center justify-center">
              <Video className="h-8 w-8 text-slate-400" />
            </div>
          )}
        </div>
      </td>
      <td className="truncate whitespace-normal px-6 py-4 text-sm font-medium dark:text-slate-400">
        <div className="">
          <p
            className={cn("dark:text-slate-300", {
              "dark:text-red-500": error,
            })}
          >
            {name}
          </p>
        </div>
      </td>
      <td
        className={cn(
          "whitespace-nowrap px-6 py-4 text-sm dark:text-slate-400",
          {
            "dark:text-red-500": error,
          }
        )}
      >
        {(size / 1000).toFixed(0)} KB
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm dark:text-slate-400">
        <Progress
          className={cn("h-2 w-full")}
          value={progress}
          isError={error}
        />
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm dark:text-slate-400">
        {src && (
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={() => remove(id)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </td>
    </tr>
  )
);

VideoUpload.displayName = "VideoUpload";

// Audio Upload Component
const AudioUpload = forwardRef<HTMLTableRowElement, UploadProps>(
  (
    { id, src, error, name, size, className, progress, remove, ...props },
    ref
  ) => (
    <tr ref={ref} {...props} className={cn("", className)}>
      <td className="whitespace-nowrap px-6 py-4 text-sm dark:text-slate-400">
        <div className="relative flex h-12 w-20">
          {!!error && (
            <div className="flex w-full items-center justify-center">
              <Icons.Redx className="size-6" />
            </div>
          )}
          {!error && !!src && (
            <div className="flex h-full w-full items-center justify-center">
              <audio
                id={id}
                src={src}
                controls
                className="h-8 w-full"
                preload="metadata"
              />
            </div>
          )}
          {!error && !src && (
            <div className="flex h-full w-full items-center justify-center">
              <Music className="h-8 w-8 text-slate-400" />
            </div>
          )}
        </div>
      </td>
      <td className="truncate whitespace-normal px-6 py-4 text-sm font-medium dark:text-slate-400">
        <div className="">
          <p
            className={cn("dark:text-slate-300", {
              "dark:text-red-500": error,
            })}
          >
            {name}
          </p>
        </div>
      </td>
      <td
        className={cn(
          "whitespace-nowrap px-6 py-4 text-sm dark:text-slate-400",
          {
            "dark:text-red-500": error,
          }
        )}
      >
        {(size / 1000).toFixed(0)} KB
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm dark:text-slate-400">
        <Progress
          className={cn("h-2 w-full")}
          value={progress}
          isError={error}
        />
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm dark:text-slate-400">
        {src && (
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={() => remove(id)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </td>
    </tr>
  )
);

AudioUpload.displayName = "AudioUpload";

// Document Upload Component
const DocumentUpload = forwardRef<HTMLTableRowElement, UploadProps>(
  (
    { id, /*src*/ error, name, size, className, progress, remove, ...props },
    ref
  ) => {
    const getDocumentIcon = (fileName: string) => {
      const extension = fileName.split(".").pop()?.toLowerCase();
      switch (extension) {
        case "pdf":
          return <FileText className="h-8 w-8 text-red-500" />;
        case "doc":
        case "docx":
          return <FileText className="h-8 w-8 text-blue-500" />;
        case "xls":
        case "xlsx":
          return <FileText className="h-8 w-8 text-green-500" />;
        case "ppt":
        case "pptx":
          return <FileText className="h-8 w-8 text-orange-500" />;
        case "txt":
          return <FileText className="h-8 w-8 text-slate-500" />;
        default:
          return <File className="h-8 w-8 text-slate-400" />;
      }
    };

    return (
      <tr ref={ref} {...props} className={cn("", className)}>
        <td className="whitespace-nowrap px-6 py-4 text-sm dark:text-slate-400">
          <div className="relative flex h-12 w-20">
            {!!error && (
              <div className="flex w-full items-center justify-center">
                <Icons.Redx className="size-6" />
              </div>
            )}
            {!error && (
              <div className="flex h-full w-full items-center justify-center">
                {getDocumentIcon(name)}
              </div>
            )}
          </div>
        </td>
        <td className="truncate whitespace-normal px-6 py-4 text-sm font-medium dark:text-slate-400">
          <div className="">
            <p
              className={cn("dark:text-slate-300", {
                "dark:text-red-500": error,
              })}
            >
              {name}
            </p>
          </div>
        </td>
        <td
          className={cn(
            "whitespace-nowrap px-6 py-4 text-sm dark:text-slate-400",
            {
              "dark:text-red-500": error,
            }
          )}
        >
          {(size / 1000).toFixed(0)} KB
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-sm dark:text-slate-400">
          <Progress
            className={cn("h-2 w-full")}
            value={progress}
            isError={error}
          />
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-sm dark:text-slate-400">
          {progress === 100 && (
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-8 w-8"
              onClick={() => remove(id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </td>
      </tr>
    );
  }
);

DocumentUpload.displayName = "DocumentUpload";

export default { ImageUpload, VideoUpload, AudioUpload, DocumentUpload };
