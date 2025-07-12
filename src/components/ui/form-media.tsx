import Image from "next/image";
import { useState } from "react";

import { ArrowLeftRight, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  Control,
  FieldPath,
  FieldValues,
  useController,
} from "react-hook-form";

import { MediaFileType } from "@/lib/uploads/dto/create-upload.dto";
import { MediaTypeEnum } from "@/lib/uploads/enums/uploads.enum";

import { MdOutlinePermMedia } from "react-icons/md";
import MediaFolders from "../media/media-folders";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  multiple?: boolean;
};

export default function FormMedia<T extends FieldValues>({
  name,
  control,
  label,
  multiple = false,
}: Props<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const { field } = useController({ name, control });

  const handleSelect = (files: MediaFileType[]) => {
    if (multiple) {
      field.onChange([...field.value, ...files]);
    } else {
      field.onChange(files[0]);
    }
    setIsOpen(false);
  };

  const handleRemove = (id: string) => {
    if (multiple) {
      field.onChange(
        field.value.filter((file: MediaFileType) => file.id !== id)
      );
    } else {
      field.onChange(null);
    }
  };

  const handleSwap = (index1: number, index2: number) => {
    if (multiple) {
      const newFiles = [...field.value];
      [newFiles[index1], newFiles[index2]] = [
        newFiles[index2],
        newFiles[index1],
      ];
      field.onChange(newFiles);
    }
  };

  const renderSelectedFiles = () => {
    const files = multiple ? field.value : field.value ? [field.value] : [];
    return (
      <AnimatePresence>
        {files.map((file: MediaFileType, index: number) => (
          <motion.div
            key={file.id}
            className="relative mb-2 mr-2 h-24 w-24"
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            {file.type === MediaTypeEnum.IMAGE ? (
              <Image
                src={file.src}
                alt="Selected media"
                layout="fill"
                objectFit="cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted-foreground">
                <span>{file.type}</span>
              </div>
            )}
            <button
              onClick={() => handleRemove(file.id)}
              className="absolute right-0 top-0 rounded-full bg-red-500 p-1 text-white"
              aria-label="Remove file"
            >
              <X size={16} />
            </button>
            {multiple && index > 0 && (
              <button
                onClick={() => handleSwap(index, index - 1)}
                className="absolute bottom-0 left-0 rounded-full bg-blue-500 p-1 text-white"
                aria-label="Move left"
              >
                <ArrowLeftRight size={16} />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    );
  };
  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex h-32 flex-col items-center justify-center gap-2 rounded-lg bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <MdOutlinePermMedia className="size-6" />
                    <span className="text-sm font-medium">Select Media</span>
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
              <div className="mt-2 flex flex-wrap">{renderSelectedFiles()}</div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
