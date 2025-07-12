export enum NotificationChannel {
  EMAIL = "EMAIL",
  SMS = "SMS",
  IN_APP = "IN_APP",
  WHATSAPP = "WHATSAPP",
}

export interface Settings {
  id: string;
  isAiEnabled: boolean;
  allowedAdminNotificationChannels: NotificationChannel[];
  updatedAt: string;
}
