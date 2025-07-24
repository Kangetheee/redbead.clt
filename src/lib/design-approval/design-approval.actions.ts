"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse } from "../shared/types";
import { RejectDesignByTokenDto } from "./dto/design-approval.dto";
import {
  ApproveDesignResponse,
  RejectDesignResponse,
  ResendApprovalEmailResponse,
} from "./types/design-approval.types";
import { DesignApprovalService } from "./design-approval.service";

const designApprovalService = new DesignApprovalService();

/**
 * Approve design via email token
 * GET /v1/design-approvals/approve/{token}
 */
export async function approveDesignByTokenAction(
  token: string
): Promise<ActionResponse<ApproveDesignResponse>> {
  try {
    const res = await designApprovalService.approveDesignByToken(token);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Reject design via email token
 * GET /v1/design-approvals/reject/{token}
 */
export async function rejectDesignByTokenAction(
  token: string,
  data: RejectDesignByTokenDto
): Promise<ActionResponse<RejectDesignResponse>> {
  try {
    const res = await designApprovalService.rejectDesignByToken(token, data);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Resend approval email
 * POST /v1/design-approvals/{id}/resend
 */
export async function resendApprovalEmailAction(
  approvalId: string
): Promise<ActionResponse<ResendApprovalEmailResponse>> {
  try {
    const res = await designApprovalService.resendApprovalEmail(approvalId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
