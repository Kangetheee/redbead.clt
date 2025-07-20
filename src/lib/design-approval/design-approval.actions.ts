/* eslint-disable @typescript-eslint/no-explicit-any */

"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse } from "../shared/types";
import {
  RequestDesignApprovalDto,
  UpdateDesignApprovalDto,
  ApproveDesignDto,
  RejectDesignDto,
} from "./dto/design-approval.dto";
import {
  DesignApproval,
  DesignApprovalDetail,
  ApprovalActionResponse,
  ApprovalStatusResponse,
  TokenBasedApproval,
  DesignApprovalStats,
} from "./types/design-approval.types";
import { DesignApprovalService } from "./design-approval.service";

const designApprovalService = new DesignApprovalService();

// Admin actions (require authentication)

export async function requestDesignApprovalAction(
  orderId: string,
  data: RequestDesignApprovalDto
): Promise<ActionResponse<DesignApproval>> {
  try {
    const res = await designApprovalService.requestDesignApproval(
      orderId,
      data
    );
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getDesignApprovalStatusAction(
  orderId: string
): Promise<ActionResponse<DesignApprovalDetail>> {
  try {
    const res = await designApprovalService.getDesignApprovalStatus(orderId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateDesignApprovalAction(
  orderId: string,
  data: UpdateDesignApprovalDto
): Promise<ActionResponse<DesignApproval>> {
  try {
    const res = await designApprovalService.updateDesignApproval(orderId, data);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getDesignApprovalStatsAction(): Promise<
  ActionResponse<DesignApprovalStats>
> {
  try {
    const res = await designApprovalService.getDesignApprovalStats();
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Public actions (no authentication required)

export async function getApprovalByTokenAction(
  token: string
): Promise<ActionResponse<TokenBasedApproval>> {
  try {
    const res = await designApprovalService.getApprovalByToken(token);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function approveDesignByTokenAction(
  token: string,
  data: ApproveDesignDto
): Promise<ActionResponse<ApprovalActionResponse>> {
  try {
    const res = await designApprovalService.approveDesignByToken(token, data);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function rejectDesignByTokenAction(
  token: string,
  data: RejectDesignDto
): Promise<ActionResponse<ApprovalActionResponse>> {
  try {
    const res = await designApprovalService.rejectDesignByToken(token, data);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getApprovalStatusByTokenAction(
  token: string
): Promise<ActionResponse<ApprovalStatusResponse>> {
  try {
    const res = await designApprovalService.getApprovalStatusByToken(token);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Email-related actions

export async function sendDesignApprovalEmailAction(data: {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  designSummary: any;
  previewImages: string[];
  expiryDays?: number;
}): Promise<ActionResponse<{ message: string; emailId: string }>> {
  try {
    const res = await designApprovalService.sendDesignApprovalEmail(data);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function resendApprovalEmailAction(
  emailId: string
): Promise<ActionResponse<{ message: string }>> {
  try {
    const res = await designApprovalService.resendApprovalEmail(emailId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
