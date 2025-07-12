import { z } from "zod";

import { MediaTypeEnum } from "../enums/uploads.enum";

export const mediaFileSchema = z.object({
  id: z.string().min(1, "Required"),
  src: z.string().min(1, "Required"),
  type: z.nativeEnum(MediaTypeEnum),
});

export type MediaFileType = z.infer<typeof mediaFileSchema>;

export const createUploadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.nativeEnum(MediaTypeEnum),
  size: z.number().min(1, "Size is required"),
  folderId: z
    .string({ required_error: "Folder is required" })
    .min(1, "Folder is required"),
  checksum: z
    .string({ required_error: "Checksum is required" })
    .min(1, "Checksum is required"),
});

export type CreateUploadDto = z.infer<typeof createUploadSchema>;
