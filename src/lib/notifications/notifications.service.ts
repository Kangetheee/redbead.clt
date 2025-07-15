import { Fetcher } from "../api/api.service";
import {
  GenerateNotesRequestDto,
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
  SendTeamAlertDto,
  CreateEscalationRuleDto,
  UpdateEscalationRuleDto,
  GetTemplatesDto,
  GetEscalationRulesDto,
} from "./dto/notifications.dto";
import {
  GeneratedNotesResponse,
  NotificationTemplate,
  TeamAlertResponse,
  EscalationRule,
} from "./types/notifications.types";

export class NotificationsService {
  constructor(private fetcher = new Fetcher()) {}

  // Notes generation
  public async generateNotes(values: GenerateNotesRequestDto) {
    return this.fetcher.request<GeneratedNotesResponse>(
      "/v1/notifications/generate-notes",
      {
        method: "POST",
        data: values,
      }
    );
  }

  public async generateOrderNotes(orderId: string, trigger: string) {
    const queryParams = new URLSearchParams();
    queryParams.append("trigger", trigger);

    const url = `/v1/notifications/generate-notes/order/${orderId}?${queryParams.toString()}`;

    return this.fetcher.request<GeneratedNotesResponse>(url, {
      method: "POST",
    });
  }

  // Templates
  public async getTemplates(params?: GetTemplatesDto) {
    const queryParams = new URLSearchParams();

    if (params?.category) {
      queryParams.append("category", params.category);
    }
    if (params?.channel) {
      queryParams.append("channel", params.channel);
    }

    const queryString = queryParams.toString();
    const url = `/v1/notifications/templates${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<NotificationTemplate[]>(url);
  }

  public async createTemplate(values: CreateNotificationTemplateDto) {
    return this.fetcher.request<NotificationTemplate>(
      "/v1/notifications/templates",
      {
        method: "POST",
        data: values,
      }
    );
  }

  public async getTemplate(templateId: string) {
    return this.fetcher.request<NotificationTemplate>(
      `/v1/notifications/templates/${templateId}`
    );
  }

  public async updateTemplate(
    templateId: string,
    values: UpdateNotificationTemplateDto
  ) {
    return this.fetcher.request<NotificationTemplate>(
      `/v1/notifications/templates/${templateId}`,
      {
        method: "PUT",
        data: values,
      }
    );
  }

  public async deleteTemplate(templateId: string) {
    return this.fetcher.request<void>(
      `/v1/notifications/templates/${templateId}`,
      {
        method: "DELETE",
      }
    );
  }

  // Team alerts
  public async sendTeamAlert(values: SendTeamAlertDto) {
    return this.fetcher.request<TeamAlertResponse>(
      "/v1/notifications/send-team-alert",
      {
        method: "POST",
        data: values,
      }
    );
  }

  public async sendOrderAlert(orderId: string) {
    return this.fetcher.request<TeamAlertResponse>(
      `/v1/notifications/send-team-alert/order/${orderId}`,
      {
        method: "POST",
      }
    );
  }

  // Escalation rules
  public async getEscalationRules(params?: GetEscalationRulesDto) {
    const queryParams = new URLSearchParams();

    if (params?.category) {
      queryParams.append("category", params.category);
    }

    const queryString = queryParams.toString();
    const url = `/v1/notifications/escalation-rules${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<EscalationRule[]>(url);
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

  public async getEscalationRule(ruleId: string) {
    return this.fetcher.request<EscalationRule>(
      `/v1/notifications/escalation-rules/${ruleId}`
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

  public async deleteEscalationRule(ruleId: string) {
    return this.fetcher.request<void>(
      `/v1/notifications/escalation-rules/${ruleId}`,
      {
        method: "DELETE",
      }
    );
  }

  public async triggerEscalation(ruleId: string) {
    return this.fetcher.request<void>(
      `/v1/notifications/escalation-rules/${ruleId}/trigger`,
      {
        method: "POST",
      }
    );
  }
}
