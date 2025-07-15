"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse } from "../shared/types";
import { ApproveDesignDto, RejectDesignDto } from "./dto/design-approval.dto";
import { DesignApproval, ApprovalStatus } from "./types/design-approval.types";
import { DesignApprovalService } from "./design-approval.service";

const designApprovalService = new DesignApprovalService();

export async function getApprovalDetailsAction(
  token: string
): Promise<ActionResponse<DesignApproval>> {
  try {
    const res = await designApprovalService.getApprovalDetails(token);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function approveDesignAction(
  token: string,
  values: ApproveDesignDto
): Promise<ActionResponse<DesignApproval>> {
  try {
    const res = await designApprovalService.approveDesign(token, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function rejectDesignAction(
  token: string,
  values: RejectDesignDto
): Promise<ActionResponse<DesignApproval>> {
  try {
    const res = await designApprovalService.rejectDesign(token, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getApprovalStatusAction(
  token: string
): Promise<ActionResponse<ApprovalStatus>> {
  try {
    const res = await designApprovalService.getApprovalStatus(token);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
