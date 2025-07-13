/* eslint-disable @typescript-eslint/no-explicit-any */

import { EmailStatus } from "../dto/email-log.dto";

export interface EmailLog {
  id: string;
  status: EmailStatus;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  templateId?: string;
  orderId?: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface EmailLogDetail extends EmailLog {
  htmlContent?: string;
  textContent?: string;
  variables?: Record<string, any>;
  headers?: Record<string, any>;
  tags?: string[];
  trackingData?: {
    opens: number;
    clicks: number;
    lastOpened?: string;
    lastClicked?: string;
    userAgent?: string;
    ipAddress?: string;
  };
  template?: {
    id: string;
    name: string;
    category: string;
  };
  order?: {
    id: string;
    orderNumber: string;
    status: string;
  };
}

export interface EmailAnalytics {
  totalEmails: number;
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
  timeSeriesData: Array<{
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
    totalSent: number;
    openRate: number;
    clickRate: number;
  }>;
}

export interface EmailLogFilters {
  status?: EmailStatus;
  recipientEmail?: string;
  orderId?: string;
  templateId?: string;
  dateFrom?: string;
  dateTo?: string;
}
