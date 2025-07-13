/* eslint-disable @typescript-eslint/no-explicit-any */

"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse, PaginatedData } from "../shared/types";
import { GetEmailLogsDto } from "./dto/email-log.dto";
import { EmailLog, EmailLogDetail } from "./types/email-logs.types";
import { EmailLogsService } from "./email-logs.service";

const emailLogsService = new EmailLogsService();

export async function getEmailLogsAction(
  params?: GetEmailLogsDto
): Promise<ActionResponse<PaginatedData<EmailLog>>> {
  try {
    const res = await emailLogsService.findAll(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getEmailLogAction(
  logId: string
): Promise<ActionResponse<EmailLogDetail>> {
  try {
    const res = await emailLogsService.findById(logId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function resendEmailAction(
  emailId: string
): Promise<ActionResponse<{ message: string }>> {
  try {
    const res = await emailLogsService.resendEmail(emailId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getEmailAnalyticsAction(): Promise<ActionResponse<any>> {
  try {
    const res = await emailLogsService.getAnalytics();
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
