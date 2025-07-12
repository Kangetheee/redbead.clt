"use client";

import { HTMLAttributes, useState } from "react";

import { DownloadIcon, FileIcon, ImageIcon, Paperclip, X } from "lucide-react";
import {
  Control,
  FieldPath,
  FieldValues,
  useController,
} from "react-hook-form";

import { MediaFileType } from "@/lib/uploads/dto/create-upload.dto";
import { MediaTypeEnum } from "@/lib/uploads/enums/uploads.enum";
import { cn } from "@/lib/utils";

import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

import MediaFolders from "../media/media-folders";
import { ScrollArea } from "./scroll-area";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  description?: string;
  required?: boolean;
  className?: HTMLAttributes<HTMLDivElement>["className"];
  disabled?: boolean;
  multiple?: boolean;
  maxFiles?: number;
  onExpand?: () => void;
};

export default function FormAttachmentInput<T extends FieldValues>({
  name,
  control,
  label,
  description,
  required = false,
  className,
  disabled = false,
  multiple = true,
  maxFiles = 5,
  onExpand,
}: Props<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const { field } = useController({ name, control });

  const handleSelect = (files: MediaFileType[]) => {
    if (multiple) {
      const currentFiles = field.value || [];
      const newFiles = [...currentFiles, ...files];

      // Respect maxFiles limit
      if (newFiles.length > maxFiles) {
        field.onChange(newFiles.slice(0, maxFiles));
      } else {
        field.onChange(newFiles);
      }
    } else {
      field.onChange(files[0]);
    }
    onExpand?.();
    setIsOpen(false);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem className={cn(className)}>
          {!!label && (
            <FormLabel className="flex items-center gap-2">
              {label}
              {required && <span className="text-destructive"> *</span>}
            </FormLabel>
          )}

          <FormControl>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  className="size-8 text-foreground dark:text-foreground"
                  disabled={disabled}
                >
                  <Paperclip className="size-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Select Media</DialogTitle>
                </DialogHeader>
                <MediaFolders
                  presentation="modal"
                  onSelect={handleSelect}
                  multiple={multiple}
                />
              </DialogContent>
            </Dialog>
          </FormControl>

          {!!description && <FormDescription>{description}</FormDescription>}

          <FormMessage />
        </FormItem>
      )}
    />
  );
}

type FormAttachmentPreviewProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  // className?: HTMLAttributes<HTMLDivElement>["className"];
  multiple?: boolean;
  onCollapse: () => void;
  isExpanded: boolean;
};

export function FormAttachmentPreview<T extends FieldValues>({
  name,
  control,
  multiple = true,
  onCollapse,
  isExpanded,
}: FormAttachmentPreviewProps<T>) {
  const { field } = useController({ name, control });

  const handleRemove = (id: string) => {
    if (multiple) {
      field.onChange(
        field.value.filter((file: MediaFileType) => file.id !== id)
      );
    } else {
      field.onChange(null);
    }

    // Collapse if no files left
    const remainingFiles = multiple
      ? field.value?.filter((file: MediaFileType) => file.id !== id) || []
      : [];
    if (remainingFiles.length === 0) {
      onCollapse();
    }
  };

  const clearAllAttachments = () => {
    field.onChange(multiple ? [] : null);
    onCollapse();
  };

  const getFileIcon = (type: MediaTypeEnum) => {
    switch (type) {
      case MediaTypeEnum.IMAGE:
        return <ImageIcon className="size-6 text-blue-500" />;
      case MediaTypeEnum.VIDEO:
        return <FileIcon className="size-6 text-purple-500" />;
      case MediaTypeEnum.AUDIO:
        return <FileIcon className="size-6 text-green-500" />;
      case MediaTypeEnum.DOCUMENT:
        return <FileIcon className="size-6 text-red-500" />;
      default:
        return <FileIcon className="size-6 text-amber-500" />;
    }
  };

  const getFileName = (name: string, maxLength = 20) => {
    if (name.length <= maxLength) return name;

    const extension = name.split(".").pop() || "";
    const nameWithoutExt = name.substring(
      0,
      name.length - extension.length - 1
    );

    const truncatedName =
      nameWithoutExt.substring(0, maxLength - extension.length - 3) + "...";
    return `${truncatedName}.${extension}`;
  };

  // Extract file name from the path for download attribute
  const getFileNameFromPath = (path: string) => {
    return path.split("/").pop() || "file";
  };

  const renderSelectedFiles = () => {
    const files = multiple
      ? field.value || []
      : field.value
        ? [field.value]
        : [];

    if (files.length === 0) return null;

    return (
      <div className="border border-border rounded-md p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Attachments ({files.length})</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={clearAllAttachments}
            type="button"
          >
            Clear all
          </Button>
        </div>

        <ScrollArea className="h-24">
          <div className="space-y-2">
            {files.map((file: MediaFileType) => (
              <div
                key={file.id}
                className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
              >
                {file.type === MediaTypeEnum.IMAGE ? (
                  <div className="h-10 w-10 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={file.src}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">
                    {getFileName(file.src)}
                  </p>
                </div>

                {/* Download button for documents */}
                {file.type === MediaTypeEnum.DOCUMENT && (
                  <a
                    href={file.src}
                    download={getFileNameFromPath(file.src)}
                    target="_blank"
                    title={getFileNameFromPath(file.src)}
                    className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                    rel="noopener noreferrer"
                  >
                    <DownloadIcon className="h-3.5 w-3.5" />
                  </a>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemove(file.id)}
                  type="button"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    (isExpanded ||
      (field.value && (multiple ? field.value.length > 0 : true))) &&
    renderSelectedFiles()
  );
}
