"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse, PaginatedData } from "../shared/types";
import {
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  GetEmailTemplatesDto,
} from "./dto/email-template.dto";
import {
  EmailTemplate,
  EmailTemplateDetail,
  EscalationRule,
  TeamAlertResponse,
} from "./types/communication.types";
import { CommunicationsService } from "./communications.service";
import { SendEmailDto } from "./dto/email-send.dto";
import {
  CreateEscalationRuleDto,
  UpdateEscalationRuleDto,
} from "./dto/escalation-rule.dto";
import { SendTeamAlertDto } from "./dto/team-alert.dto";

const communicationsService = new CommunicationsService();

// Email Templates
export async function getEmailTemplatesAction(
  params?: GetEmailTemplatesDto
): Promise<ActionResponse<PaginatedData<EmailTemplate>>> {
  try {
    const res = await communicationsService.getEmailTemplates(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getEmailTemplateAction(
  templateId: string
): Promise<ActionResponse<EmailTemplateDetail>> {
  try {
    const res = await communicationsService.getEmailTemplate(templateId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function createEmailTemplateAction(
  values: CreateEmailTemplateDto
): Promise<ActionResponse<EmailTemplateDetail>> {
  try {
    const res = await communicationsService.createEmailTemplate(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateEmailTemplateAction(
  templateId: string,
  values: UpdateEmailTemplateDto
): Promise<ActionResponse<EmailTemplateDetail>> {
  try {
    const res = await communicationsService.updateEmailTemplate(
      templateId,
      values
    );
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteEmailTemplateAction(
  templateId: string
): Promise<ActionResponse<{ message: string }>> {
  try {
    const res = await communicationsService.deleteEmailTemplate(templateId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Email Sending
export async function sendEmailAction(
  values: SendEmailDto
): Promise<ActionResponse<{ message: string }>> {
  try {
    const res = await communicationsService.sendEmail(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Escalation Rules
export async function getEscalationRulesAction(): Promise<
  ActionResponse<EscalationRule[]>
> {
  try {
    const res = await communicationsService.getEscalationRules();
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function createEscalationRuleAction(
  values: CreateEscalationRuleDto
): Promise<ActionResponse<EscalationRule>> {
  try {
    const res = await communicationsService.createEscalationRule(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateEscalationRuleAction(
  ruleId: string,
  values: UpdateEscalationRuleDto
): Promise<ActionResponse<EscalationRule>> {
  try {
    const res = await communicationsService.updateEscalationRule(
      ruleId,
      values
    );
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Team Alerts
export async function sendTeamAlertAction(
  values: SendTeamAlertDto
): Promise<ActionResponse<TeamAlertResponse>> {
  try {
    const res = await communicationsService.sendTeamAlert(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
