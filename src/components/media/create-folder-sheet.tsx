"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Folder } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FormButton from "@/components/ui/form-button";
import FormInput from "@/components/ui/form-input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCreateUploadFolder } from "@/hooks/use-uploads";
import {
  CreateUploadFolderDto,
  createUploadFolderSchema,
} from "@/lib/uploads/dto/create-upload-folder.dto";

export default function CreateFolderSheet() {
  const [open, setOpen] = useState(false);

  const form = useForm<CreateUploadFolderDto>({
    resolver: zodResolver(createUploadFolderSchema),
    defaultValues: { name: "" },
  });

  const { control, reset, handleSubmit } = form;

  const { isCreatingFolder, onCreateFolder } = useCreateUploadFolder({
    onSuccess: () => {
      setOpen(false);
      reset();
    },
  });

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <div className="flex justify-end">
        <SheetTrigger asChild>
          <Button variant="outline">
            <Folder className="mr-2 size-4" /> New Folder
          </Button>
        </SheetTrigger>
      </div>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create New Folder</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={handleSubmit((values) => onCreateFolder(values))}
            noValidate
            className="space-y-8 py-4"
          >
            <div className="space-y-6">
              <FormInput
                control={control}
                name="name"
                label="Folder Name"
                placeholder="Enter folder name"
                required
              />
            </div>

            <FormButton className="w-full" isLoading={isCreatingFolder}>
              Create Folder
            </FormButton>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
