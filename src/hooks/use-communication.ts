/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // or your preferred toast library
import {
  // Email Templates
  getEmailTemplatesAction,
  getEmailTemplateAction,
  createEmailTemplateAction,
  updateEmailTemplateAction,
  deleteEmailTemplateAction,
  previewEmailTemplateAction,
  duplicateEmailTemplateAction,
  getTemplateUsageStatsAction,
  // Email Sending & Logs
  sendEmailAction,
  getEmailLogsAction,
  getEmailLogAction,
  getEmailAnalyticsAction,
  // Escalation Rules
  getEscalationRulesAction,
  createEscalationRuleAction,
  updateEscalationRuleAction,
  // Team Alerts
  sendTeamAlertAction,
} from "@/lib/communications/communications.actions";
import {
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  GetEmailTemplatesDto,
} from "@/lib/communications/dto/email-template.dto";
import { SendEmailDto } from "@/lib/communications/dto/email-send.dto";
import { PreviewEmailTemplateDto } from "@/lib/communications/dto/email-preview.dto";
import { GetEmailLogsDto } from "@/lib/communications/dto/email-logs.dto";
import {
  CreateEscalationRuleDto,
  UpdateEscalationRuleDto,
} from "@/lib/communications/dto/escalation-rule.dto";
import { SendTeamAlertDto } from "@/lib/communications/dto/team-alert.dto";

// Query Keys
export const communicationsKeys = {
  all: ["communications"] as const,

  // Email Templates
  emailTemplates: () => [...communicationsKeys.all, "emailTemplates"] as const,
  emailTemplatesList: (params?: GetEmailTemplatesDto) =>
    [...communicationsKeys.emailTemplates(), "list", params] as const,
  emailTemplate: (id: string) =>
    [...communicationsKeys.emailTemplates(), "detail", id] as const,
  templateUsageStats: (id: string) =>
    [...communicationsKeys.emailTemplates(), "usageStats", id] as const,

  // Email Logs & Analytics
  emailLogs: () => [...communicationsKeys.all, "emailLogs"] as const,
  emailLogsList: (params?: GetEmailLogsDto) =>
    [...communicationsKeys.emailLogs(), "list", params] as const,
  emailLog: (id: string) =>
    [...communicationsKeys.emailLogs(), "detail", id] as const,
  emailAnalytics: () => [...communicationsKeys.all, "emailAnalytics"] as const,

  // Escalation Rules
  escalationRules: () =>
    [...communicationsKeys.all, "escalationRules"] as const,
};

// ============================================================================
// EMAIL TEMPLATES HOOKS
// ============================================================================

export function useEmailTemplates(params?: GetEmailTemplatesDto) {
  return useQuery({
    queryKey: communicationsKeys.emailTemplatesList(params),
    queryFn: async () => {
      const result = await getEmailTemplatesAction(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useEmailTemplate(templateId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: communicationsKeys.emailTemplate(templateId),
    queryFn: async () => {
      const result = await getEmailTemplateAction(templateId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!templateId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useTemplateUsageStats(
  templateId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: communicationsKeys.templateUsageStats(templateId),
    queryFn: async () => {
      const result = await getTemplateUsageStatsAction(templateId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!templateId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateEmailTemplateDto) => {
      const result = await createEmailTemplateAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch email templates list
      queryClient.invalidateQueries({
        queryKey: communicationsKeys.emailTemplates(),
      });
      toast.success("Email template created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      values,
    }: {
      templateId: string;
      values: UpdateEmailTemplateDto;
    }) => {
      const result = await updateEmailTemplateAction(templateId, values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Update the specific template in cache
      queryClient.setQueryData(
        communicationsKeys.emailTemplate(variables.templateId),
        data
      );
      // Invalidate templates list
      queryClient.invalidateQueries({
        queryKey: communicationsKeys.emailTemplates(),
      });
      toast.success("Email template updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });
}

export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const result = await deleteEmailTemplateAction(templateId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (_, templateId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: communicationsKeys.emailTemplate(templateId),
      });
      queryClient.removeQueries({
        queryKey: communicationsKeys.templateUsageStats(templateId),
      });
      // Invalidate templates list
      queryClient.invalidateQueries({
        queryKey: communicationsKeys.emailTemplates(),
      });
      toast.success("Email template deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });
}

export function usePreviewEmailTemplate() {
  return useMutation({
    mutationFn: async (values: PreviewEmailTemplateDto) => {
      const result = await previewEmailTemplateAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onError: (error: Error) => {
      toast.error(`Failed to preview template: ${error.message}`);
    },
  });
}

export function useDuplicateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const result = await duplicateEmailTemplateAction(templateId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate templates list to show the new duplicate
      queryClient.invalidateQueries({
        queryKey: communicationsKeys.emailTemplates(),
      });
      toast.success("Email template duplicated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to duplicate template: ${error.message}`);
    },
  });
}

// ============================================================================
// EMAIL SENDING & LOGS HOOKS
// ============================================================================

export function useSendEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: SendEmailDto) => {
      const result = await sendEmailAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate email logs and analytics
      queryClient.invalidateQueries({
        queryKey: communicationsKeys.emailLogs(),
      });
      queryClient.invalidateQueries({
        queryKey: communicationsKeys.emailAnalytics(),
      });
      toast.success("Email sent successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to send email: ${error.message}`);
    },
  });
}

export function useEmailLogs(params?: GetEmailLogsDto) {
  return useQuery({
    queryKey: communicationsKeys.emailLogsList(params),
    queryFn: async () => {
      const result = await getEmailLogsAction(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useEmailLog(logId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: communicationsKeys.emailLog(logId),
    queryFn: async () => {
      const result = await getEmailLogAction(logId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!logId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useEmailAnalytics() {
  return useQuery({
    queryKey: communicationsKeys.emailAnalytics(),
    queryFn: async () => {
      const result = await getEmailAnalyticsAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
}

// ============================================================================
// ESCALATION RULES HOOKS
// ============================================================================

export function useEscalationRules() {
  return useQuery({
    queryKey: communicationsKeys.escalationRules(),
    queryFn: async () => {
      const result = await getEscalationRulesAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateEscalationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateEscalationRuleDto) => {
      const result = await createEscalationRuleAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: communicationsKeys.escalationRules(),
      });
      toast.success("Escalation rule created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create escalation rule: ${error.message}`);
    },
  });
}

export function useUpdateEscalationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ruleId,
      values,
    }: {
      ruleId: string;
      values: UpdateEscalationRuleDto;
    }) => {
      const result = await updateEscalationRuleAction(ruleId, values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: communicationsKeys.escalationRules(),
      });
      toast.success("Escalation rule updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update escalation rule: ${error.message}`);
    },
  });
}

// ============================================================================
// TEAM ALERTS HOOKS
// ============================================================================

export function useSendTeamAlert() {
  return useMutation({
    mutationFn: async (values: SendTeamAlertDto) => {
      const result = await sendTeamAlertAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success(
        `Team alert sent to ${data.totalRecipients} recipients. ${data.successfulDeliveries} delivered successfully.`
      );
    },
    onError: (error: Error) => {
      toast.error(`Failed to send team alert: ${error.message}`);
    },
  });
}
