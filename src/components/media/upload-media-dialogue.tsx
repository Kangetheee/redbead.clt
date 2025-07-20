"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FileInput from "@/components/ui/file-input";
import { Form } from "@/components/ui/form";
import FormSelect from "@/components/ui/form-select";
import { useGetUploadFolders } from "@/hooks/use-uploads";
import { tags } from "@/lib/shared/constants";

type Props = {
  folderId?: string;
};

const schema = z.object({
  folder_id: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function UploadMediaDialogue({ folderId }: Props) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { folders } = useGetUploadFolders();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { folder_id: folderId },
  });

  const { control, watch, handleSubmit } = form;
  const watchedFolderId = watch("folder_id");

  function onSubmit(values: FormValues) {
    console.log(values);
  }

  const folderItems = folders?.results || [];

  // Add debug info to help troubleshoot API issues
  const debugApiInfo = () => {
    console.log("API Endpoints Debug:");
    console.log("Current API response structure:", folders);
    console.log("Available folders:", folderItems);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button onClick={debugApiInfo}>
          <Upload className="mr-2 size-4" />
          Upload Files
        </Button>
      </DialogTrigger>

      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-8 py-4"
        >
          <DialogContent className="sm:max-w-screen-lg">
            <DialogHeader>
              <DialogTitle>Upload files</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {!folderId && (
                <FormSelect
                  control={control}
                  name="folder_id"
                  label="Folder"
                  placeholder="Select folder"
                  className="max-w-sm"
                  options={
                    folderItems.map(({ id, name }) => ({
                      label: name,
                      value: id,
                    })) ?? []
                  }
                  required
                />
              )}

              {!!watchedFolderId && (
                <div className="space-y-4">
                  {/* <div className="text-sm text-muted-foreground">
                    <p>If upload is failing, check browser console for API errors.</p>
                    <p>Ensure your API endpoints are correctly set up.</p>
                  </div>
                   */}
                  <FileInput
                    folderId={watchedFolderId}
                    onUploadComplete={() => {
                      queryClient.invalidateQueries({
                        queryKey: [tags.UPLOADS, { folderId: watchedFolderId }],
                      });
                      setOpen(false);
                    }}
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
}
