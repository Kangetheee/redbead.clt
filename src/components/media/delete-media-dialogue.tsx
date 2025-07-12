"use client";

import { useState } from "react";

import { FaTrash } from "react-icons/fa";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import FormButton from "@/components/ui/form-button";
import { useDeleteFile } from "@/hooks/use-uploads";

type Props = {
  id: string;
  name: string;
  folderId: string;
};

export default function DeleteMediaDialogue({ id, name, folderId }: Props) {
  const [open, setOpen] = useState(false);

  const { onDeleteFile, isDeletingFile } = useDeleteFile({
    folderId,
    onSuccess: () => setOpen(false),
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white"
        >
          <FaTrash />
          <span className="sr-only">Delete {name}</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the file.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button disabled={isDeletingFile} variant="outline">
              Cancel
            </Button>
          </AlertDialogCancel>

          <FormButton
            isLoading={isDeletingFile}
            onClick={() => onDeleteFile({ id })}
            variant="destructive"
          >
            Confirm
          </FormButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
