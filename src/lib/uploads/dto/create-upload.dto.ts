import { z } from "zod";

import { MediaTypeEnum } from "../enums/uploads.enum";

export const mediaFileSchema = z.object({
  id: z.string().min(1, "Required"),
  src: z.string().min(1, "Required"),
  type: z.nativeEnum(MediaTypeEnum),
});

export type MediaFileType = z.infer<typeof mediaFileSchema>;

// For multipart/form-data uploads (direct file upload)
export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: "File is required" }),
  type: z.nativeEnum(MediaTypeEnum),
  name: z.string().optional(),
  folderId: z.string().uuid({ message: "Valid folder ID is required" }),
});

export type FileUploadDto = z.infer<typeof fileUploadSchema>;

// For JSON uploads (metadata only)
export const createUploadSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  type: z.nativeEnum(MediaTypeEnum),
  folderId: z.string().uuid({ message: "Valid folder ID is required" }),
  originalName: z.string().optional(),
  mimeType: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type CreateUploadDto = z.infer<typeof createUploadSchema>;
