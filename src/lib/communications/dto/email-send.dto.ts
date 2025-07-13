import { z } from "zod";

export const sendEmailSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  recipientEmail: z.string().email("Invalid email address"),
  recipientName: z.string().optional(),
  variables: z.object({}).passthrough(),
  orderId: z.string().optional(),
  priority: z.enum(["high", "normal", "low"]).optional(),
  headers: z.object({}).passthrough().optional(),
  tags: z.array(z.string()).optional(),
  trackOpens: z.boolean().default(true),
  trackClicks: z.boolean().default(true),
});

export type SendEmailDto = z.infer<typeof sendEmailSchema>;
