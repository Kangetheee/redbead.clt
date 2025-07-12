import { z } from "zod";

export const createUploadFolderSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Folder name can only contain letters, numbers, underscores, and hyphens (no spaces)"
    ),
});

export type CreateUploadFolderDto = z.infer<typeof createUploadFolderSchema>;
