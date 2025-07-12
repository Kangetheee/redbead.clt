import { Dispatch, SetStateAction } from "react";

import { MediaFileType } from "@/lib/uploads/dto/create-upload.dto";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import MediaGallery from "./media-gallery";

type Props = {
  id: string;
  name: string;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  onSelect?: (files: MediaFileType[]) => void;
  multiple?: boolean;
};

export default function MediaGalleryDialog({
  id,
  name,
  isOpen,
  setIsOpen,
  onSelect,
  multiple = false,
}: Props) {
  const handleSelect = (files: MediaFileType[]) => {
    if (onSelect) {
      onSelect(files);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-screen-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>{name}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <MediaGallery
            folderId={id}
            onSelect={handleSelect}
            multiple={multiple}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
