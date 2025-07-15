import { z } from "zod";

export const emailStatusEnum = z.enum([
  "PENDING",
  "QUEUED",
  "SENT",
  "DELIVERED",
  "OPENED",
  "CLICKED",
  "BOUNCED",
  "FAILED",
  "SPAM",
]);

export const getEmailLogsSchema = z.object({
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
  status: emailStatusEnum.optional(),
  recipientEmail: z.string().email().optional(),
  orderId: z.string().optional(),
  templateId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.string().default("createdAt").optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
});

export type GetEmailLogsDto = z.infer<typeof getEmailLogsSchema>;
export type EmailStatus = z.infer<typeof emailStatusEnum>;
