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
export type GetEmailLogsDto = z.infer<typeof getEmailLogsSchema>;

export const getEmailLogsSchema = z.object({
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
  status: emailStatusEnum.optional(),
  recipientEmail: z.string().email().optional(),
  orderId: z.string().optional(),
  templateId: z.string().optional(),
  dateFrom: z.string().optional(), // ISO string
  dateTo: z.string().optional(), // ISO string
  sortBy: z.string().default("createdAt").optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
});

export type EmailStatus = z.infer<typeof emailStatusEnum>;
