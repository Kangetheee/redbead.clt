import { z } from "zod";
import { emailStatusEnum } from "./email-log.dto";

export const updateEmailStatusSchema = z.object({
  status: emailStatusEnum,
  statusReason: z.string().optional(),
  metadata: z.object({}).passthrough().optional(),
});

export type UpdateEmailStatusDto = z.infer<typeof updateEmailStatusSchema>;
