import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmailTemplatesAction,
  getEmailTemplateAction,
  createEmailTemplateAction,
  updateEmailTemplateAction,
  deleteEmailTemplateAction,
  sendEmailAction,
  getEscalationRulesAction,
  createEscalationRuleAction,
  updateEscalationRuleAction,
  sendTeamAlertAction,
} from "@/lib/communications/communications.actions";
import {
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  GetEmailTemplatesDto,
} from "@/lib/communications/dto/email-template.dto";
import { SendEmailDto } from "@/lib/communications/dto/email-send.dto";
import {
  CreateEscalationRuleDto,
  UpdateEscalationRuleDto,
  SendTeamAlertDto,
} from "@/lib/notifications/dto/notifications.dto";

// Email Templates
export const useEmailTemplates = (params?: GetEmailTemplatesDto) => {
  return useQuery({
    queryKey: ["email-templates", params],
    queryFn: () => getEmailTemplatesAction(params),
  });
};

export const useEmailTemplate = (templateId: string) => {
  return useQuery({
    queryKey: ["email-templates", templateId],
    queryFn: () => getEmailTemplateAction(templateId),
    enabled: !!templateId,
  });
};

export const useCreateEmailTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmailTemplateDto) =>
      createEmailTemplateAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
  });
};

export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      data,
    }: {
      templateId: string;
      data: UpdateEmailTemplateDto;
    }) => updateEmailTemplateAction(templateId, data),
    onSuccess: (_, { templateId }) => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      queryClient.invalidateQueries({
        queryKey: ["email-templates", templateId],
      });
    },
  });
};

export const useDeleteEmailTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => deleteEmailTemplateAction(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
  });
};

// Email Sending
export const useSendEmail = () => {
  return useMutation({
    mutationFn: (data: SendEmailDto) => sendEmailAction(data),
  });
};

// Escalation Rules
export const useEscalationRules = () => {
  return useQuery({
    queryKey: ["escalation-rules"],
    queryFn: () => getEscalationRulesAction(),
  });
};

export const useCreateEscalationRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEscalationRuleDto) =>
      createEscalationRuleAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escalation-rules"] });
    },
  });
};

export const useUpdateEscalationRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ruleId,
      data,
    }: {
      ruleId: string;
      data: UpdateEscalationRuleDto;
    }) => updateEscalationRuleAction(ruleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escalation-rules"] });
    },
  });
};

// Team Alerts
export const useSendTeamAlert = () => {
  return useMutation({
    mutationFn: (data: SendTeamAlertDto) => sendTeamAlertAction(data),
  });
};
