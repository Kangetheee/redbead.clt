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
import {
  EmailTemplate,
  EmailTemplateDetail,
  EscalationRule,
  TeamAlertResponse,
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

  // Email Sending
  public async sendEmail(values: SendEmailDto) {
    return this.fetcher.request<{ message: string }>("/v1/emails/send", {
      method: "POST",
      data: values,
    });
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
