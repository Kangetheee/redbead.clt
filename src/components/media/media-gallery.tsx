"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiList,
  FiSearch,
  FiSettings,
  FiUploadCloud,
} from "react-icons/fi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useUpdateSearchParams from "@/hooks/use-update-search-params";
import { MediaFileType } from "@/lib/uploads/dto/create-upload.dto";
import { cn } from "@/lib/utils";

import { useGetUploadFolderDetails } from "@/hooks/use-uploads";
import MediaItem from "./media-item";
import UploadMediaDialogue from "./upload-media-dialogue";

const EmptyState = ({ id }: { id: string }) => (
  <div className="flex h-[400px] w-full flex-col items-center justify-center space-y-6 rounded-lg border border-dashed border-muted-foreground/25 bg-muted/50 p-8">
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="rounded-full bg-primary/10 p-6">
        <FiUploadCloud className="h-12 w-12 text-primary" />
      </div>
      <div className="text-center">
        <h3 className="text-xl font-medium">Upload your first files...</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Click the button below to upload your first files to this folder.
        </p>
      </div>
    </div>
    <UploadMediaDialogue folderId={id} />
  </div>
);

type Props = {
  folderId: string;
  onSelect?: (files: MediaFileType[]) => void;
  multiple?: boolean;
};

export default function MediaGallery({
  folderId,
  onSelect,
  multiple = false,
}: Props) {
  const nextSearchParams = useSearchParams();
  const { setSearchParams } = useUpdateSearchParams();
  const initialSearchValue = nextSearchParams.get("s") || "";
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedFiles, setSelectedFiles] = useState<MediaFileType[]>([]);
  const [searchInputValue, setSearchInputValue] = useState(initialSearchValue);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle search with debounce
  const handleSearchChange = (value: string) => {
    setSearchInputValue(value);

    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout
    searchTimeoutRef.current = setTimeout(() => {
      setSearchParams({ s: value });
    }, 500); // 500ms debounce delay
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const { folderDetails, folderDetailsError, isGettingFolderDetails } =
    useGetUploadFolderDetails({ folderId });

  if (isGettingFolderDetails) return <div>Loading...</div>;
  if (!!folderDetailsError) return <div>Error: {folderDetailsError}</div>;
  if (!folderDetails) return <div>No data</div>;

  if (folderDetails.results.media.length === 0)
    return <EmptyState id={folderId} />;

  function handleSelect(file: MediaFileType) {
    setSelectedFiles((prev) => {
      if (multiple) {
        const isAlreadySelected = prev.some((f) => f.id === file.id);
        if (isAlreadySelected) {
          return prev.filter((f) => f.id !== file.id);
        } else {
          return [...prev, file];
        }
      } else {
        return [file];
      }
    });

    if (onSelect && !multiple) {
      onSelect([file]);
    }
  }

  function handleConfirmSelection() {
    if (onSelect) {
      onSelect(selectedFiles);
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col items-start justify-between gap-4 bg-background p-4 sm:flex-row sm:items-center w-full">
        <div className="relative flex w-full items-center gap-2 sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Search"
              value={searchInputValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pr-8"
            />
            <FiSearch className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          {searchInputValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchInputValue("");
                setSearchParams({ s: "" });
              }}
              className="h-8 px-2 text-xs"
            >
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setView("grid")}
            className={
              view === "grid" ? "bg-primary text-primary-foreground" : ""
            }
          >
            <FiGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setView("list")}
            className={
              view === "list" ? "bg-primary text-primary-foreground" : ""
            }
          >
            <FiList className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <FiSettings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "p-4",
          view === "grid"
            ? "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            : "space-y-4"
        )}
      >
        {folderDetails.results.media.map((item, index) => (
          <MediaItem
            key={item.id}
            folderId={folderId}
            view={view}
            data={item}
            onSelect={handleSelect}
            isSelected={selectedFiles.some((f) => f.id === item.id)}
            index={index}
            totalItems={folderDetails.results.media.length}
          />
        ))}
      </div>

      {onSelect && multiple && (
        <div className="flex justify-end">
          <Button onClick={handleConfirmSelection}>
            Select ({selectedFiles.length})
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Select
            value={String(folderDetails.meta.pageSize)}
            onValueChange={(value) => setSearchParams({ pageSize: value })}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="52">52</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Entries per page
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setSearchParams({
                pageIndex: (folderDetails.meta.pageIndex - 1).toString(),
              })
            }
            disabled={folderDetails.meta.pageIndex === 0}
          >
            <FiChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {folderDetails.meta.pageIndex + 1} of{" "}
            {folderDetails.meta.pageCount}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setSearchParams({
                pageIndex: (folderDetails.meta.pageIndex + 1).toString(),
              })
            }
            disabled={
              folderDetails.meta.pageIndex === folderDetails.meta.pageCount - 1
            }
          >
            <FiChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
