import { z } from "zod";
import { MediaTypeEnum } from "../enums/uploads.enum";

export const updateUploadSchema = z.object({
  type: z.nativeEnum(MediaTypeEnum).optional(),
  folderId: z.string().uuid().optional(),
  originalName: z.string().optional(),
  mimeType: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type UpdateUploadDto = z.infer<typeof updateUploadSchema>;
