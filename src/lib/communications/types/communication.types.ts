/* eslint-disable @typescript-eslint/no-explicit-any */

// import { EmailStatus } from "@/lib/email-logs/dto/email-log.dto";
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

export interface EmailPreviewResponse {
  htmlContent: string;
  textContent?: string;
  subject: string;
  deviceType: "desktop" | "mobile" | "tablet";
  previewUrl?: string;
}

// export interface EmailLog {
//   id: string;
//   templateId: string;
//   templateName: string;
//   recipientEmail: string;
//   recipientName?: string;
//   subject: string;
//   status: EmailStatus;
//   orderId?: string;
//   sentAt?: string;
//   deliveredAt?: string;
//   openedAt?: string;
//   clickedAt?: string;
//   bounceReason?: string;
//   errorMessage?: string;
//   metadata?: Record<string, any>;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface EmailLogDetail extends EmailLog {
//   htmlContent: string;
//   textContent?: string;
//   variables: Record<string, any>;
//   headers?: Record<string, any>;
//   tags?: string[];
//   trackOpens: boolean;
//   trackClicks: boolean;
//   deliveryAttempts: number;
//   lastDeliveryAttempt?: string;
//   clickEvents?: Array<{
//     url: string;
//     clickedAt: string;
//     userAgent?: string;
//     ipAddress?: string;
//   }>;
//   openEvents?: Array<{
//     openedAt: string;
//     userAgent?: string;
//     ipAddress?: string;
//   }>;
// }

export interface EmailAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalFailed: number;
  deliveryRate: number; // percentage
  openRate: number; // percentage
  clickRate: number; // percentage
  bounceRate: number; // percentage
  period: {
    from: string;
    to: string;
  };
  dailyStats: Array<{
    date: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    failed: number;
  }>;
  topTemplates: Array<{
    templateId: string;
    templateName: string;
    sent: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
  }>;
}

export interface TemplateUsageStats {
  templateId: string;
  templateName: string;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalFailed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  lastUsed?: string;
  createdAt: string;
  monthlyStats: Array<{
    month: string; // YYYY-MM format
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  }>;
  recentEmails: Array<{
    id: string;
    recipientEmail: string;
    // status: EmailStatus;
    sentAt: string;
  }>;
}
