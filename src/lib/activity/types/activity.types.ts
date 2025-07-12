export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string | null;
  action: string;
  actionType: string;
  resource: string;
  resourceId: string | null;
  ipAddress: string | null;
  device: string | null;
  readableDescription: string;
}
