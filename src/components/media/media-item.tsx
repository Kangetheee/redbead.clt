"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { format } from "date-fns";
import { AnimatePresence, motion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MediaFileType } from "@/lib/uploads/dto/create-upload.dto";
import { MediaTypeEnum } from "@/lib/uploads/enums/uploads.enum";
import { FolderUpload } from "@/lib/uploads/types/uploads.types";
import { cn, formatFileSize } from "@/lib/utils";

import { PLACEHOLDER_IMAGE } from "@/lib/shared/constants";
import DeleteMediaDialogue from "./delete-media-dialogue";
import { FaMusic } from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";

type Props = {
  data: FolderUpload["media"][number];
  view: "grid" | "list";
  onSelect?: (file: MediaFileType) => void;
  isSelected: boolean;
  index: number;
  totalItems: number;
  folderId: string;
};

export default function MediaItem({
  data: { id, name, src, type, createdAt, size, updatedAt },
  folderId,
  view,
  onSelect,
  isSelected,
  index,
  totalItems,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);


  function selectHandler() {
    if (onSelect) {
      onSelect({ id, src, type });
    }
  }

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
          if (index < totalItems - 1) {
            const nextElement = element.nextElementSibling as HTMLElement;
            nextElement?.focus();
          }
          break;
        case "ArrowLeft":
          if (index > 0) {
            const prevElement = element.previousElementSibling as HTMLElement;
            prevElement?.focus();
          }
          break;
        case "ArrowDown":
          {
            const nextRowElement = element.parentElement?.children[
              index + (view === "grid" ? 4 : 1)
            ] as HTMLElement;
            nextRowElement?.focus();
          }
          break;
        case "ArrowUp":
          {
            const prevRowElement = element.parentElement?.children[
              index - (view === "grid" ? 4 : 1)
            ] as HTMLElement;
            prevRowElement?.focus();
          }
          break;
      }
    };

    element.addEventListener("keydown", handleKeyDown);
    return () => {
      element.removeEventListener("keydown", handleKeyDown);
    };
  }, [index, totalItems, view]);

  return (
    <div className="group relative">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.05 }}
          className={cn(
            "absolute -right-2 -top-2 z-10",
            "group-hover:animate-[show-delete_0.2s_ease-out_forwards]"
          )}
          aria-hidden={true}
          tabIndex={-1}
        >
          <DeleteMediaDialogue folderId={folderId} id={id} name={name} />
        </motion.div>
      </AnimatePresence>

      <style jsx global>{`
        @keyframes show-delete {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      <Card
        className={cn(
          "relative cursor-pointer overflow-hidden transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isSelected && "ring-2 ring-blue-500 ring-offset-2",
          "hover:ring-2 hover:ring-blue-400 hover:ring-offset-1"
        )}
        onClick={selectHandler}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            selectHandler();
          }
        }}
        tabIndex={0}
        role="checkbox"
        aria-checked={isSelected}
        aria-label={`Select ${name}`}
      >
        <CardContent
          className={cn("p-4", view === "list" && "flex items-center gap-4")}
        >
          <div
            className={cn(
              "relative aspect-video w-full overflow-hidden rounded-md border",
              "border-border bg-background",
              "before:absolute before:inset-0",
              "before:bg-[linear-gradient(45deg,theme(colors.gray.200)_25%,transparent_25%,transparent_75%,theme(colors.gray.200)_75%,theme(colors.gray.200)_100%),linear-gradient(45deg,theme(colors.gray.200)_25%,transparent_25%,transparent_75%,theme(colors.gray.200)_75%,theme(colors.gray.200)_100%)]",
              "before:bg-[length:16px_16px] before:bg-[position:0_0,8px_8px]",
              "dark:before:bg-[linear-gradient(45deg,theme(colors.gray.800)_25%,transparent_25%,transparent_75%,theme(colors.gray.800)_75%,theme(colors.gray.800)_100%),linear-gradient(45deg,theme(colors.gray.800)_25%,transparent_25%,transparent_75%,theme(colors.gray.800)_75%,theme(colors.gray.800)_100%)]",
              view === "list" && "w-28"
            )}
          >
            {type === MediaTypeEnum.IMAGE ? (
  <Image
    src={src ?? PLACEHOLDER_IMAGE}
    alt={name}
    fill
    className="object-contain"
  />
) : type === MediaTypeEnum.VIDEO ? (
  <video
    src={src}
    controls
    className="h-full w-full object-contain"
    aria-label={`Video: ${name}`}
  >
    Your browser does not support the video tag.
  </video>
) : type === MediaTypeEnum.AUDIO ? (
  <div className="relative h-full w-full">
    <div className="absolute inset-0 flex items-center justify-center bg-muted">
      <FaMusic className="text-6xl text-muted-foreground" />
    </div>
    <div className="absolute bottom-4 left-4 right-4">
      <audio
        src={src}
        controls
        className="w-full"
        aria-label={`Audio: ${name}`}
      >
        Your browser does not support the audio tag.
      </audio>
    </div>
  </div>
) : type === MediaTypeEnum.DOCUMENT ? (
  <div
    className="flex h-full w-full items-center justify-center bg-muted"
    role="img"
    aria-label={`Document: ${name}`}
  >
    <FaFileAlt className="text-6xl text-muted-foreground" />
  </div>
) : (
  <div
    className="flex h-full w-full items-center justify-center bg-muted"
    role="img"
    aria-label={`${type} file icon`}
  >
    <span className="text-2xl">{type}</span>
  </div>
)}
          </div>

          <div className={cn("space-y-4", view === "list" ? "flex-1" : "mt-4")}>
            <p className="font-medium">{name}</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="text-muted-foreground">
                Size: {formatFileSize(size)}
              </p>
              <p className="text-muted-foreground">
                Created: {format(createdAt, "PPp")}
              </p>
              <p className="text-muted-foreground">
                Last Updated: {format(updatedAt, "PPp")}
              </p>
              <Badge
                variant={
                  type === MediaTypeEnum.IMAGE
                    ? "secondary"
                    : type === MediaTypeEnum.VIDEO
                      ? "outline"
                      : "default"
                }
              >
                {type}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
