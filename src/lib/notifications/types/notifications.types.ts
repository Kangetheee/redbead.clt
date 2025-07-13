export interface GeneratedNote {
  ruleId: string;
  ruleName: string;
  noteType:
    | "GENERAL"
    | "URGENCY"
    | "TIMELINE"
    | "SHIPPING"
    | "CUSTOMIZATION"
    | "PRODUCTION"
    | "QUALITY";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  title: string;
  content: string;
  isInternal: boolean;
  metadata?: object;
}

export interface GeneratedNotesResponse {
  totalNotesGenerated: number;
  generatedNotes: GeneratedNote[];
  trigger: string;
  generatedAt: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  category:
    | "order_management"
    | "inventory"
    | "production"
    | "quality"
    | "shipping";
  channel: "email" | "sms" | "push" | "webhook";
  subject: string;
  content: string;
  variables: string[];
  recipients: string[];
  conditions?: object;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamAlertDeliveryResult {
  recipient: string;
  channel: string;
  status: "delivered" | "failed" | "pending";
  sentAt: string;
}

export interface TeamAlertResponse {
  alertId: string;
  message: string;
  priority: string;
  totalRecipients: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  deliveryResults: TeamAlertDeliveryResult[];
  sentAt: string;
}

export interface EscalationStep {
  level: number;
  delayMinutes: number;
  recipients: string[];
  message: string;
}

export interface EscalationRule {
  id: string;
  name: string;
  category: "order_management" | "quality" | "inventory" | "shipping";
  conditions: object;
  escalationSteps: EscalationStep[];
  isActive: boolean;
  executionCount: number;
  lastTriggered?: string;
  createdAt: string;
  updatedAt: string;
}
