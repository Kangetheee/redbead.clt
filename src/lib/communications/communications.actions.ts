"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse, PaginatedData } from "../shared/types";
import {
  SendEmailDto,
  SendDesignApprovalEmailDto,
  GetEmailTemplatesDto,
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  PreviewEmailTemplateDto,
  GetEmailLogsDto,
  SendTestEmailDto,
  EmailWebhookDto,
} from "./dto/emails.dto";
import {
  EmailTemplate,
  EmailTemplateDetail,
  SystemTemplateDefinition,
  EmailPreviewResponse,
  EmailSendResponse,
  DesignApprovalEmailResponse,
  EmailLog,
  EmailLogDetail,
  EmailAnalytics,
  TemplateUsageStats,
  EmailServiceHealth,
  TestEmailResponse,
  WebhookProcessingResponse,
  EmailResendResponse,
} from "./types/email.types";
import { EmailsService } from "./communications.service";

const emailsService = new EmailsService();

// Email Sending Actions

/**
 * Send single email
 * POST /v1/emails/send
 */
export async function sendEmailAction(
  values: SendEmailDto
): Promise<ActionResponse<EmailSendResponse>> {
  try {
    const res = await emailsService.sendEmail(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Send design approval email
 * POST /v1/emails/send-design-approval
 */
export async function sendDesignApprovalEmailAction(
  values: SendDesignApprovalEmailDto
): Promise<ActionResponse<DesignApprovalEmailResponse>> {
  try {
    const res = await emailsService.sendDesignApprovalEmail(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Resend failed email
 * POST /v1/emails/{id}/resend
 */
export async function resendEmailAction(
  emailId: string
): Promise<ActionResponse<EmailResendResponse>> {
  try {
    const res = await emailsService.resendEmail(emailId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Email Template Actions

/**
 * Get email templates with pagination
 * GET /v1/emails/templates
 */
export async function getEmailTemplatesAction(
  params?: GetEmailTemplatesDto
): Promise<ActionResponse<PaginatedData<EmailTemplate>>> {
  try {
    const res = await emailsService.getEmailTemplates(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Create new email template
 * POST /v1/emails/templates
 */
export async function createEmailTemplateAction(
  values: CreateEmailTemplateDto
): Promise<ActionResponse<EmailTemplateDetail>> {
  try {
    const res = await emailsService.createEmailTemplate(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get system template definitions
 * GET /v1/emails/templates/system
 */
export async function getSystemTemplatesAction(): Promise<
  ActionResponse<SystemTemplateDefinition[]>
> {
  try {
    const res = await emailsService.getSystemTemplates();
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get template by ID
 * GET /v1/emails/templates/{id}
 */
export async function getEmailTemplateAction(
  templateId: string
): Promise<ActionResponse<EmailTemplateDetail>> {
  try {
    const res = await emailsService.getEmailTemplate(templateId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Update email template
 * PATCH /v1/emails/templates/{id}
 */
export async function updateEmailTemplateAction(
  templateId: string,
  values: UpdateEmailTemplateDto
): Promise<ActionResponse<EmailTemplateDetail>> {
  try {
    const res = await emailsService.updateEmailTemplate(templateId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Delete email template
 * DELETE /v1/emails/templates/{id}
 */
export async function deleteEmailTemplateAction(
  templateId: string
): Promise<ActionResponse<{ message: string }>> {
  try {
    const res = await emailsService.deleteEmailTemplate(templateId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Preview email template
 * POST /v1/emails/templates/preview
 */
export async function previewEmailTemplateAction(
  values: PreviewEmailTemplateDto
): Promise<ActionResponse<EmailPreviewResponse>> {
  try {
    const res = await emailsService.previewEmailTemplate(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Duplicate email template
 * POST /v1/emails/templates/{id}/duplicate
 */
export async function duplicateEmailTemplateAction(
  templateId: string
): Promise<ActionResponse<EmailTemplateDetail>> {
  try {
    const res = await emailsService.duplicateEmailTemplate(templateId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Email Logs and Analytics Actions

/**
 * Get email logs with filtering
 * GET /v1/emails/logs
 */
export async function getEmailLogsAction(
  params?: GetEmailLogsDto
): Promise<ActionResponse<PaginatedData<EmailLog>>> {
  try {
    const res = await emailsService.getEmailLogs(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get detailed email log
 * GET /v1/emails/logs/{id}
 */
export async function getEmailLogAction(
  logId: string
): Promise<ActionResponse<EmailLogDetail>> {
  try {
    const res = await emailsService.getEmailLog(logId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get email analytics
 * GET /v1/emails/analytics
 */
export async function getEmailAnalyticsAction(): Promise<
  ActionResponse<EmailAnalytics>
> {
  try {
    const res = await emailsService.getEmailAnalytics();
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get template usage statistics
 * GET /v1/emails/templates/{id}/usage-stats
 */
export async function getTemplateUsageStatsAction(
  templateId: string
): Promise<ActionResponse<TemplateUsageStats>> {
  try {
    const res = await emailsService.getTemplateUsageStats(templateId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Service Health and Testing Actions

/**
 * Check email service health
 * GET /v1/emails/health
 */
export async function getEmailServiceHealthAction(): Promise<
  ActionResponse<EmailServiceHealth>
> {
  try {
    const res = await emailsService.getEmailServiceHealth();
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Send test email
 * POST /v1/emails/test
 */
export async function sendTestEmailAction(
  values: SendTestEmailDto
): Promise<ActionResponse<TestEmailResponse>> {
  try {
    const res = await emailsService.sendTestEmail(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Handle email provider webhooks
 * POST /v1/emails/webhooks
 *
 * Note: This is typically used for webhook processing and should not be called directly from client code
 */
export async function handleEmailWebhookAction(
  webhookData: EmailWebhookDto
): Promise<ActionResponse<WebhookProcessingResponse>> {
  try {
    const res = await emailsService.handleEmailWebhook(webhookData);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
