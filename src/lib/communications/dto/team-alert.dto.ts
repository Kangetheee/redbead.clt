import { z } from "zod";

export const sendTeamAlertSchema = z.object({
  message: z.string().min(1, "Message is required"),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  recipients: z.array(z.string()).min(1, "At least one recipient is required"),
  channel: z.enum(["email", "sms", "push"]).default("email"),
  metadata: z.object({}).passthrough().optional(),
});

export type SendTeamAlertDto = z.infer<typeof sendTeamAlertSchema>;
