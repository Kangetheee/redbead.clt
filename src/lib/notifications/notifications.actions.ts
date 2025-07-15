"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse } from "../shared/types";
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
import { NotificationsService } from "./notifications.service";

const notificationsService = new NotificationsService();

// Notes Actions
export async function generateNotesAction(
  values: GenerateNotesRequestDto
): Promise<ActionResponse<GeneratedNotesResponse>> {
  try {
    const res = await notificationsService.generateNotes(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function generateOrderNotesAction(
  orderId: string,
  trigger: string
): Promise<ActionResponse<GeneratedNotesResponse>> {
  try {
    const res = await notificationsService.generateOrderNotes(orderId, trigger);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Template Actions
export async function getNotificationTemplatesAction(
  params?: GetTemplatesDto
): Promise<ActionResponse<NotificationTemplate[]>> {
  try {
    const res = await notificationsService.getTemplates(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function createNotificationTemplateAction(
  values: CreateNotificationTemplateDto
): Promise<ActionResponse<NotificationTemplate>> {
  try {
    const res = await notificationsService.createTemplate(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getNotificationTemplateAction(
  templateId: string
): Promise<ActionResponse<NotificationTemplate>> {
  try {
    const res = await notificationsService.getTemplate(templateId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateNotificationTemplateAction(
  templateId: string,
  values: UpdateNotificationTemplateDto
): Promise<ActionResponse<NotificationTemplate>> {
  try {
    const res = await notificationsService.updateTemplate(templateId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteNotificationTemplateAction(
  templateId: string
): Promise<ActionResponse<void>> {
  try {
    await notificationsService.deleteTemplate(templateId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Team Alert Actions
export async function sendTeamAlertAction(
  values: SendTeamAlertDto
): Promise<ActionResponse<TeamAlertResponse>> {
  try {
    const res = await notificationsService.sendTeamAlert(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function sendOrderAlertAction(
  orderId: string
): Promise<ActionResponse<TeamAlertResponse>> {
  try {
    const res = await notificationsService.sendOrderAlert(orderId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Escalation Rule Actions
export async function getEscalationRulesAction(
  params?: GetEscalationRulesDto
): Promise<ActionResponse<EscalationRule[]>> {
  try {
    const res = await notificationsService.getEscalationRules(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function createEscalationRuleAction(
  values: CreateEscalationRuleDto
): Promise<ActionResponse<EscalationRule>> {
  try {
    const res = await notificationsService.createEscalationRule(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getEscalationRuleAction(
  ruleId: string
): Promise<ActionResponse<EscalationRule>> {
  try {
    const res = await notificationsService.getEscalationRule(ruleId);
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
    const res = await notificationsService.updateEscalationRule(ruleId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteEscalationRuleAction(
  ruleId: string
): Promise<ActionResponse<void>> {
  try {
    await notificationsService.deleteEscalationRule(ruleId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function triggerEscalationAction(
  ruleId: string
): Promise<ActionResponse<void>> {
  try {
    await notificationsService.triggerEscalation(ruleId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
