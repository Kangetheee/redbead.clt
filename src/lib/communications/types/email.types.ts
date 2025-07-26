/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  EmailTemplateCategory,
  EmailStatus,
  EmailPriority,
  DeviceType,
} from "../dto/emails.dto";

// Base email template interface
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

// Detailed email template interface
export interface EmailTemplateDetail extends EmailTemplate {
  htmlContent: string;
  textContent?: string;
  variables: string[];
  componentName?: string;
  previewProps?: Record<string, any>;
}

// Email templates list response
export interface EmailTemplatesListResponse {
  items: EmailTemplate[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
}

// System template definition
export interface SystemTemplateDefinition {
  id: string;
  name: string;
  category: EmailTemplateCategory;
  description: string;
  requiredVariables: string[];
  optionalVariables: string[];
  componentName?: string;
  defaultSubject: string;
  isCustomizable: boolean;
}

// Email preview response
export interface EmailPreviewResponse {
  htmlContent: string;
  textContent?: string;
  subject: string;
  deviceType: DeviceType;
  previewUrl?: string;
  renderedVariables: Record<string, any>;
}

// Email sending response
export interface EmailSendResponse {
  messageId: string;
  status: "queued" | "sent" | "failed";
  message: string;
  queuedAt?: string;
  sentAt?: string;
  estimatedDelivery?: string;
}

// Design approval email response
export interface DesignApprovalEmailResponse {
  messageId: string;
  approvalToken: string;
  expiresAt: string;
  previewUrl: string;
  status: "sent" | "failed";
  message: string;
}

// Email log interface
export interface EmailLog {
  id: string;
  messageId: string;
  templateId: string;
  templateName: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  status: EmailStatus;
  priority?: EmailPriority;
  orderId?: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  bounceReason?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  trackOpens: boolean;
  trackClicks: boolean;
  createdAt: string;
  updatedAt: string;
}

// Detailed email log interface
export interface EmailLogDetail extends EmailLog {
  htmlContent: string;
  textContent?: string;
  variables: Record<string, any>;
  headers?: Record<string, any>;
  deliveryAttempts: number;
  lastDeliveryAttempt?: string;
  providerResponse?: Record<string, any>;
  clickEvents?: Array<{
    url: string;
    clickedAt: string;
    userAgent?: string;
    ipAddress?: string;
    location?: string;
  }>;
  openEvents?: Array<{
    openedAt: string;
    userAgent?: string;
    ipAddress?: string;
    location?: string;
  }>;
  bounceDetails?: {
    bounceType: "hard" | "soft";
    bounceSubType: string;
    diagnosticCode?: string;
  };
}

// Email logs list response
export interface EmailLogsListResponse {
  items: EmailLog[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
}

// Email analytics interface
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
  spamRate: number; // percentage
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
    spam: number;
  }>;
  topTemplates: Array<{
    templateId: string;
    templateName: string;
    category: EmailTemplateCategory;
    sent: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
  }>;
  deviceStats: Array<{
    deviceType: DeviceType;
    opens: number;
    clicks: number;
    percentage: number;
  }>;
  geographicStats: Array<{
    country: string;
    opens: number;
    clicks: number;
    percentage: number;
  }>;
}

// Template usage statistics
export interface TemplateUsageStats {
  templateId: string;
  templateName: string;
  category: EmailTemplateCategory;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalFailed: number;
  totalSpam: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  spamRate: number;
  averageOpenTime?: number; // minutes
  averageClickTime?: number; // minutes
  lastUsed?: string;
  createdAt: string;
  monthlyStats: Array<{
    month: string; // YYYY-MM format
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    failed: number;
  }>;
  recentEmails: Array<{
    id: string;
    messageId: string;
    recipientEmail: string;
    status: EmailStatus;
    sentAt: string;
    deliveredAt?: string;
    openedAt?: string;
  }>;
  topRecipientDomains: Array<{
    domain: string;
    count: number;
    deliveryRate: number;
    openRate: number;
  }>;
}

// Email service health status
export interface EmailServiceHealth {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  services: {
    emailProvider: {
      status: "up" | "down" | "degraded";
      responseTime?: number;
      lastCheck: string;
      errorMessage?: string;
    };
    database: {
      status: "up" | "down" | "degraded";
      responseTime?: number;
      lastCheck: string;
      errorMessage?: string;
    };
    queue: {
      status: "up" | "down" | "degraded";
      pendingJobs: number;
      lastCheck: string;
      errorMessage?: string;
    };
  };
  metrics: {
    totalEmailsSentToday: number;
    averageDeliveryTime: number; // minutes
    errorRate: number; // percentage
    queueDepth: number;
  };
}

// Test email response
export interface TestEmailResponse {
  success: boolean;
  messageId?: string;
  message: string;
  testEmail: string;
  previewUrl?: string;
  sentAt?: string;
  errorDetails?: string;
}

// Webhook processing response
export interface WebhookProcessingResponse {
  success: boolean;
  message: string;
  eventType: string;
  messageId: string;
  processedAt: string;
  updatedEmailLog?: boolean;
  triggerNotifications?: boolean;
}

// Email resend response
export interface EmailResendResponse {
  success: boolean;
  newMessageId?: string;
  originalMessageId: string;
  message: string;
  resentAt?: string;
  errorDetails?: string;
}

// Type guards for runtime type checking
export const isEmailTemplate = (obj: any): obj is EmailTemplate => {
  return obj && typeof obj.id === "string" && typeof obj.name === "string";
};

export const isEmailLog = (obj: any): obj is EmailLog => {
  return obj && typeof obj.id === "string" && typeof obj.messageId === "string";
};

export const isEmailAnalytics = (obj: any): obj is EmailAnalytics => {
  return (
    obj &&
    typeof obj.totalSent === "number" &&
    typeof obj.deliveryRate === "number"
  );
};

export const isTemplateUsageStats = (obj: any): obj is TemplateUsageStats => {
  return (
    obj &&
    typeof obj.templateId === "string" &&
    typeof obj.totalSent === "number"
  );
};

// Utility types
export type EmailFilterStatus = EmailStatus | "all";
export type EmailSortField =
  | "createdAt"
  | "sentAt"
  | "deliveredAt"
  | "openedAt"
  | "subject"
  | "recipientEmail";
export type TemplateSortField =
  | "name"
  | "category"
  | "createdAt"
  | "updatedAt"
  | "isActive";
