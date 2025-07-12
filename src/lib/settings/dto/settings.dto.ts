import { z } from "zod";

export enum NotificationChannel {
  EMAIL = "EMAIL",
  SMS = "SMS",
  IN_APP = "IN_APP",
  WHATSAPP = "WHATSAPP",
}

export const updateSettingsSchema = z.object({
  isAiEnabled: z.boolean().optional(),
  allowedAdminNotificationChannels: z
    .array(z.nativeEnum(NotificationChannel))
    .optional(),
});

export type UpdateSettingsDto = z.infer<typeof updateSettingsSchema>;
