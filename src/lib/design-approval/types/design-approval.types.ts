/* eslint-disable @typescript-eslint/no-explicit-any */

import { DesignApprovalStatus } from "../dto/design-approval.dto";

/**
 * Design approval object structure from API responses
 */
export interface DesignApprovalInfo {
  id: string;
  status: DesignApprovalStatus;
  approvedBy?: string;
  rejectionReason?: string;
}

/**
 * Response from approve design endpoint
 * GET /v1/design-approvals/approve/{token}
 */
export interface ApproveDesignResponse {
  success: boolean;
  message: string;
  orderNumber: string;
  designApproval: DesignApprovalInfo;
}

/**
 * Response from reject design endpoint
 * GET /v1/design-approvals/reject/{token}
 */
export interface RejectDesignResponse {
  success: boolean;
  message: string;
  orderNumber: string;
  designApproval: DesignApprovalInfo;
}

/**
 * Response from resend approval email endpoint
 * POST /v1/design-approvals/{id}/resend
 */
export interface ResendApprovalEmailResponse {
  success: boolean;
  message: string;
  emailSentAt: string;
  remindersSent: number;
}

/**
 * Error response structure for invalid/expired tokens
 */
export interface DesignApprovalErrorResponse {
  success: false;
  message: string;
  error: string;
}

// Type guards for runtime type checking
export const isApproveDesignResponse = (
  obj: any
): obj is ApproveDesignResponse => {
  return (
    obj &&
    typeof obj.success === "boolean" &&
    typeof obj.message === "string" &&
    typeof obj.orderNumber === "string" &&
    obj.designApproval &&
    typeof obj.designApproval.id === "string"
  );
};

export const isRejectDesignResponse = (
  obj: any
): obj is RejectDesignResponse => {
  return (
    obj &&
    typeof obj.success === "boolean" &&
    typeof obj.message === "string" &&
    typeof obj.orderNumber === "string" &&
    obj.designApproval &&
    typeof obj.designApproval.id === "string"
  );
};

export const isResendApprovalEmailResponse = (
  obj: any
): obj is ResendApprovalEmailResponse => {
  return (
    obj &&
    typeof obj.success === "boolean" &&
    typeof obj.message === "string" &&
    typeof obj.emailSentAt === "string" &&
    typeof obj.remindersSent === "number"
  );
};
