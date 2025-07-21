import { Fetcher } from "../api/api.service";
import { PaginatedData } from "../shared/types";
import { SendEmailDto } from "./dto/email-send.dto";
import {
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  GetEmailTemplatesDto,
} from "./dto/email-template.dto";
import {
  CreateEscalationRuleDto,
  UpdateEscalationRuleDto,
} from "./dto/escalation-rule.dto";
import { SendTeamAlertDto } from "./dto/team-alert.dto";
import { PreviewEmailTemplateDto } from "./dto/email-preview.dto";
import { GetEmailLogsDto } from "./dto/email-logs.dto";
import {
  EmailTemplate,
  EmailTemplateDetail,
  EscalationRule,
  TeamAlertResponse,
} from "./types/communication.types";
import {
  EmailPreviewResponse,
  EmailLog,
  EmailLogDetail,
  EmailAnalytics,
  TemplateUsageStats,
} from "./types/communication.types";

export class CommunicationsService {
  constructor(private fetcher = new Fetcher()) {}

  // Email Templates
  public async getEmailTemplates(params?: GetEmailTemplatesDto) {
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

    return this.fetcher.request<PaginatedData<EmailTemplate>>(url);
  }

  public async getEmailTemplate(templateId: string) {
    return this.fetcher.request<EmailTemplateDetail>(
      `/v1/emails/templates/${templateId}`
    );
  }

  public async createEmailTemplate(values: CreateEmailTemplateDto) {
    return this.fetcher.request<EmailTemplateDetail>("/v1/emails/templates", {
      method: "POST",
      data: values,
    });
  }

  public async updateEmailTemplate(
    templateId: string,
    values: UpdateEmailTemplateDto
  ) {
    return this.fetcher.request<EmailTemplateDetail>(
      `/v1/emails/templates/${templateId}`,
      {
        method: "PATCH",
        data: values,
      }
    );
  }

  public async deleteEmailTemplate(templateId: string) {
    return this.fetcher.request<{ message: string }>(
      `/v1/emails/templates/${templateId}`,
      {
        method: "DELETE",
      }
    );
  }

  // NEW: Preview Email Template
  public async previewEmailTemplate(values: PreviewEmailTemplateDto) {
    return this.fetcher.request<EmailPreviewResponse>(
      "/v1/emails/templates/preview",
      {
        method: "POST",
        data: values,
      }
    );
  }

  // NEW: Duplicate Email Template
  public async duplicateEmailTemplate(templateId: string) {
    return this.fetcher.request<EmailTemplateDetail>(
      `/v1/emails/templates/${templateId}/duplicate`,
      {
        method: "POST",
      }
    );
  }

  // NEW: Get Template Usage Stats
  public async getTemplateUsageStats(templateId: string) {
    return this.fetcher.request<TemplateUsageStats>(
      `/v1/emails/templates/${templateId}/usage-stats`
    );
  }

  // Email Sending
  public async sendEmail(values: SendEmailDto) {
    return this.fetcher.request<{ message: string }>("/v1/emails/send", {
      method: "POST",
      data: values,
    });
  }

  // NEW: Email Logs
  public async getEmailLogs(params?: GetEmailLogsDto) {
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

    return this.fetcher.request<PaginatedData<EmailLog>>(url);
  }

  // NEW: Get Email Log Detail
  public async getEmailLog(logId: string) {
    return this.fetcher.request<EmailLogDetail>(`/v1/emails/logs/${logId}`);
  }

  // NEW: Get Email Analytics
  public async getEmailAnalytics() {
    return this.fetcher.request<EmailAnalytics>("/v1/emails/analytics");
  }

  // Escalation Rules
  public async getEscalationRules() {
    return this.fetcher.request<EscalationRule[]>(
      "/v1/notifications/escalation-rules"
    );
  }

  public async createEscalationRule(values: CreateEscalationRuleDto) {
    return this.fetcher.request<EscalationRule>(
      "/v1/notifications/escalation-rules",
      {
        method: "POST",
        data: values,
      }
    );
  }

  public async updateEscalationRule(
    ruleId: string,
    values: UpdateEscalationRuleDto
  ) {
    return this.fetcher.request<EscalationRule>(
      `/v1/notifications/escalation-rules/${ruleId}`,
      {
        method: "PUT",
        data: values,
      }
    );
  }

  // Team Alerts
  public async sendTeamAlert(values: SendTeamAlertDto) {
    return this.fetcher.request<TeamAlertResponse>(
      "/v1/notifications/send-team-alert",
      {
        method: "POST",
        data: values,
      }
    );
  }
}
