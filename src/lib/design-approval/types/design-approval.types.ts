/* eslint-disable @typescript-eslint/no-explicit-any */

import { DesignApprovalStatus } from "../enum/design-approval.enum";

export interface DesignSummary {
  productName: string;
  quantity: number;
  material?: string;
  text?: string;
  colors?: string[];
  dimensions?: string;
  printType?: string;
  attachment?: string;
}

export interface OrderDetails {
  orderNumber: string;
  totalAmount: number;
  itemCount: number;
  customer: {
    name: string;
    company?: string;
  };
}

export interface DesignApproval {
  id: string;
  orderId: string;
  orderNumber: string;
  designId: string;
  status: DesignApprovalStatus;
  customerEmail: string;
  previewImages: string[];
  designSummary: DesignSummary;
  requestedAt: string;
  respondedAt?: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  expiresAt: string;
  isExpired: boolean;
  canApprove: boolean;
  canReject: boolean;
  timeRemaining?: string;
  comments?: string;
  requestRevision?: boolean;
  message?: string;
  orderDetails?: OrderDetails;
  metadata?: Record<string, any>;
}

export interface DesignApprovalDetail extends DesignApproval {
  // Additional fields that might be in detailed view
  createdAt: string;
  updatedAt: string;
  emailsSent?: number;
  lastEmailSentAt?: string;
  revisionCount?: number;
  approvalToken?: string; // Only for admin view
}

// Response types for specific actions
export interface ApprovalActionResponse {
  id: string;
  status: DesignApprovalStatus;
  approvedBy?: string;
  rejectedBy?: string;
  respondedAt: string;
  comments?: string;
  rejectionReason?: string;
  requestRevision?: boolean;
  message: string;
}

export interface ApprovalStatusResponse {
  status: DesignApprovalStatus;
  isExpired: boolean;
  expiresAt: string;
  timeRemaining?: string;
  canApprove: boolean;
  canReject: boolean;
  message: string;
}

// Token-based approval (no auth required)
export interface TokenBasedApproval {
  id: string;
  orderId: string;
  orderNumber: string;
  designId: string;
  status: DesignApprovalStatus;
  customerEmail: string;
  previewImages: string[];
  designSummary: DesignSummary;
  requestedAt: string;
  expiresAt: string;
  isExpired: boolean;
  canApprove: boolean;
  canReject: boolean;
  timeRemaining?: string;
}

export interface DesignApprovalFilters {
  status?: DesignApprovalStatus;
  customerId?: string;
  orderId?: string;
  dateFrom?: string;
  dateTo?: string;
  isExpired?: boolean;
}

export interface DesignApprovalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  expired: number;
  averageResponseTime: number; // in hours
  approvalRate: number; // percentage
}
