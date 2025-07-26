import { Fetcher } from "../api/api.service";
import { PaginatedData } from "../shared/types";
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
  EmailTemplatesListResponse,
  SystemTemplateDefinition,
  EmailPreviewResponse,
  EmailSendResponse,
  DesignApprovalEmailResponse,
  EmailLog,
  EmailLogDetail,
  EmailLogsListResponse,
  EmailAnalytics,
  TemplateUsageStats,
  EmailServiceHealth,
  TestEmailResponse,
  WebhookProcessingResponse,
  EmailResendResponse,
} from "./types/email.types";

export class EmailsService {
  constructor(private fetcher = new Fetcher()) {}

  // Email Sending Methods

  /**
   * Send single email
   * POST /v1/emails/send
   */
  public async sendEmail(values: SendEmailDto): Promise<EmailSendResponse> {
    return this.fetcher.request<EmailSendResponse>("/v1/emails/send", {
      method: "POST",
      data: values,
    });
  }

  /**
   * Send design approval email
   * POST /v1/emails/send-design-approval
   */
  public async sendDesignApprovalEmail(
    values: SendDesignApprovalEmailDto
  ): Promise<DesignApprovalEmailResponse> {
    return this.fetcher.request<DesignApprovalEmailResponse>(
      "/v1/emails/send-design-approval",
      {
        method: "POST",
        data: values,
      }
    );
  }

  /**
   * Resend failed email
   * POST /v1/emails/{id}/resend
   */
  public async resendEmail(emailId: string): Promise<EmailResendResponse> {
    return this.fetcher.request<EmailResendResponse>(
      `/v1/emails/${emailId}/resend`,
      {
        method: "POST",
      }
    );
  }

  // Email Template Methods

  /**
   * Get email templates with pagination
   * GET /v1/emails/templates
   */
  public async getEmailTemplates(
    params?: GetEmailTemplatesDto
  ): Promise<PaginatedData<EmailTemplate>> {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params?.category) {
      queryParams.append("category", params.category);
    }
    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.isActive !== undefined) {
      queryParams.append("isActive", params.isActive.toString());
    }
    if (params?.isSystem !== undefined) {
      queryParams.append("isSystem", params.isSystem.toString());
    }

    const queryString = queryParams.toString();
    const url = `/v1/emails/templates${queryString ? `?${queryString}` : ""}`;

    const apiResponse =
      await this.fetcher.request<EmailTemplatesListResponse>(url);

    return {
      items: apiResponse.items,
      meta: {
        totalItems: apiResponse.meta.totalItems,
        itemsPerPage: apiResponse.meta.itemsPerPage,
        currentPage: apiResponse.meta.currentPage,
        totalPages: apiResponse.meta.totalPages,
      },
    };
  }

  /**
   * Create new email template
   * POST /v1/emails/templates
   */
  public async createEmailTemplate(
    values: CreateEmailTemplateDto
  ): Promise<EmailTemplateDetail> {
    return this.fetcher.request<EmailTemplateDetail>("/v1/emails/templates", {
      method: "POST",
      data: values,
    });
  }

  /**
   * Get system template definitions
   * GET /v1/emails/templates/system
   */
  public async getSystemTemplates(): Promise<SystemTemplateDefinition[]> {
    return this.fetcher.request<SystemTemplateDefinition[]>(
      "/v1/emails/templates/system"
    );
  }

  /**
   * Get template by ID
   * GET /v1/emails/templates/{id}
   */
  public async getEmailTemplate(
    templateId: string
  ): Promise<EmailTemplateDetail> {
    return this.fetcher.request<EmailTemplateDetail>(
      `/v1/emails/templates/${templateId}`
    );
  }

  /**
   * Update email template
   * PATCH /v1/emails/templates/{id}
   */
  public async updateEmailTemplate(
    templateId: string,
    values: UpdateEmailTemplateDto
  ): Promise<EmailTemplateDetail> {
    return this.fetcher.request<EmailTemplateDetail>(
      `/v1/emails/templates/${templateId}`,
      {
        method: "PATCH",
        data: values,
      }
    );
  }

  /**
   * Delete email template
   * DELETE /v1/emails/templates/{id}
   */
  public async deleteEmailTemplate(
    templateId: string
  ): Promise<{ message: string }> {
    return this.fetcher.request<{ message: string }>(
      `/v1/emails/templates/${templateId}`,
      {
        method: "DELETE",
      }
    );
  }

  /**
   * Preview email template
   * POST /v1/emails/templates/preview
   */
  public async previewEmailTemplate(
    values: PreviewEmailTemplateDto
  ): Promise<EmailPreviewResponse> {
    return this.fetcher.request<EmailPreviewResponse>(
      "/v1/emails/templates/preview",
      {
        method: "POST",
        data: values,
      }
    );
  }

  /**
   * Duplicate email template
   * POST /v1/emails/templates/{id}/duplicate
   */
  public async duplicateEmailTemplate(
    templateId: string
  ): Promise<EmailTemplateDetail> {
    return this.fetcher.request<EmailTemplateDetail>(
      `/v1/emails/templates/${templateId}/duplicate`,
      {
        method: "POST",
      }
    );
  }

  // Email Logs and Analytics Methods

  /**
   * Get email logs with filtering
   * GET /v1/emails/logs
   */
  public async getEmailLogs(
    params?: GetEmailLogsDto
  ): Promise<PaginatedData<EmailLog>> {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params?.status) {
      queryParams.append("status", params.status);
    }
    if (params?.recipientEmail) {
      queryParams.append("recipientEmail", params.recipientEmail);
    }
    if (params?.orderId) {
      queryParams.append("orderId", params.orderId);
    }
    if (params?.templateId) {
      queryParams.append("templateId", params.templateId);
    }
    if (params?.dateFrom) {
      queryParams.append("dateFrom", params.dateFrom);
    }
    if (params?.dateTo) {
      queryParams.append("dateTo", params.dateTo);
    }
    if (params?.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }
    if (params?.sortOrder) {
      queryParams.append("sortOrder", params.sortOrder);
    }

    const queryString = queryParams.toString();
    const url = `/v1/emails/logs${queryString ? `?${queryString}` : ""}`;

    const apiResponse = await this.fetcher.request<EmailLogsListResponse>(url);

    return {
      items: apiResponse.items,
      meta: {
        totalItems: apiResponse.meta.totalItems,
        itemsPerPage: apiResponse.meta.itemsPerPage,
        currentPage: apiResponse.meta.currentPage,
        totalPages: apiResponse.meta.totalPages,
      },
    };
  }

  /**
   * Get detailed email log
   * GET /v1/emails/logs/{id}
   */
  public async getEmailLog(logId: string): Promise<EmailLogDetail> {
    return this.fetcher.request<EmailLogDetail>(`/v1/emails/logs/${logId}`);
  }

  /**
   * Get email analytics
   * GET /v1/emails/analytics
   */
  public async getEmailAnalytics(): Promise<EmailAnalytics> {
    return this.fetcher.request<EmailAnalytics>("/v1/emails/analytics");
  }

  /**
   * Get template usage statistics
   * GET /v1/emails/templates/{id}/usage-stats
   */
  public async getTemplateUsageStats(
    templateId: string
  ): Promise<TemplateUsageStats> {
    return this.fetcher.request<TemplateUsageStats>(
      `/v1/emails/templates/${templateId}/usage-stats`
    );
  }

  // Service Health and Testing Methods

  /**
   * Check email service health
   * GET /v1/emails/health
   */
  public async getEmailServiceHealth(): Promise<EmailServiceHealth> {
    return this.fetcher.request<EmailServiceHealth>("/v1/emails/health");
  }

  /**
   * Send test email
   * POST /v1/emails/test
   */
  public async sendTestEmail(
    values: SendTestEmailDto
  ): Promise<TestEmailResponse> {
    return this.fetcher.request<TestEmailResponse>("/v1/emails/test", {
      method: "POST",
      data: values,
    });
  }

  /**
   * Handle email provider webhooks
   * POST /v1/emails/webhooks
   *
   * Note: This endpoint is typically called by email service providers
   * and should not be used directly in client applications
   */
  public async handleEmailWebhook(
    webhookData: EmailWebhookDto
  ): Promise<WebhookProcessingResponse> {
    return this.fetcher.request<WebhookProcessingResponse>(
      "/v1/emails/webhooks",
      {
        method: "POST",
        data: webhookData,
      }
    );
  }
}
