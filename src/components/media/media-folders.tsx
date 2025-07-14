"use client";

import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";

import { format } from "date-fns";
import { Folder } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaFileType } from "@/lib/uploads/dto/create-upload.dto";

import { useGetUploadFolders } from "@/hooks/use-uploads";
import CreateFolderSheet from "./create-folder-sheet";
import MediaGalleryDialog from "./media-gallery-dialog";
import UploadMediaDialogue from "./upload-media-dialogue";

type Props = {
  presentation?: "modal" | "page";
  onSelect?: (files: MediaFileType[]) => void;
  multiple?: boolean;
};

export default function MediaFolders({
  presentation = "page",
  onSelect,
  multiple = false,
}: Props) {
  const router = useRouter();
  const [openGalleryId, setOpenGalleryId] = useState<string | null>(null);

  const { folders, isGettingFolders, folderError } = useGetUploadFolders();

  if (isGettingFolders) return <div>Loading...</div>;
  if (!!folderError) return <div>Error: {folderError}</div>;
  if (!folders) return <div>No data</div>;

  const handleFolderClick = (id: string) => {
    if (presentation === "modal") {
      setOpenGalleryId(id);
    } else {
      router.push(`/media/${id}`);
    }
  };

  // const handleSelect = (files: { id: string; src: string }[]) => {
  //   console.log({ files });
  // };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-4">
        <CreateFolderSheet />
        <UploadMediaDialogue />
      </div>

      <div className="flex flex-wrap gap-6">
        {folders.items.map(({ id, name, fileCount, createdAt, updatedAt }) => (
          <Fragment key={id}>
            <MediaGalleryDialog
              id={id}
              name={name}
              isOpen={openGalleryId === id}
              setIsOpen={(isOpen) => setOpenGalleryId(isOpen ? id : null)}
              onSelect={onSelect}
              multiple={multiple}
            />

            <Card
              key={id}
              className="w-full max-w-sm cursor-pointer transition-colors hover:bg-accent"
              onClick={() => handleFolderClick(id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  {name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Files:</dt>
                    <dd>{fileCount}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">
                      Created:
                    </dt>
                    <dd>{format(createdAt, "PPp")}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">
                      Last updated:
                    </dt>
                    <dd>{format(updatedAt, "PPp")}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
