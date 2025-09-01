import { z } from "zod";

import { LegalTypeEnum } from "../types/legal.types";

export const createLegalDtoSchema = z.object({
  type: z.nativeEnum(LegalTypeEnum),
  content: z.string(),
});

export type CreateLegalDto = z.infer<typeof createLegalDtoSchema>;
