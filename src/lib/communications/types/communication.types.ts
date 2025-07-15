/* eslint-disable @typescript-eslint/no-explicit-any */

import { EmailTemplateCategory } from "../dto/email-template.dto";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: EmailTemplateCategory;
  isActive: boolean;
  isSystem?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplateDetail extends EmailTemplate {
  htmlContent: string;
  textContent?: string;
  variables: string[];
  componentName?: string;
  previewProps?: Record<string, any>;
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
  conditions: Record<string, any>;
  escalationSteps: EscalationStep[];
  isActive: boolean;
  executionCount: number;
  lastTriggered?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamAlertDeliveryResult {
  recipient: string;
  channel: "email" | "sms" | "push";
  status: "delivered" | "failed" | "pending";
  sentAt: string;
}

export interface TeamAlertResponse {
  alertId: string;
  message: string;
  priority: "low" | "normal" | "high" | "urgent";
  totalRecipients: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  deliveryResults: TeamAlertDeliveryResult[];
  sentAt: string;
}
