"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  generateNotesAction,
  generateOrderNotesAction,
  getNotificationTemplatesAction,
  createNotificationTemplateAction,
  getNotificationTemplateAction,
  updateNotificationTemplateAction,
  deleteNotificationTemplateAction,
  sendTeamAlertAction,
  sendOrderAlertAction,
  getEscalationRulesAction,
  createEscalationRuleAction,
  getEscalationRuleAction,
  updateEscalationRuleAction,
  deleteEscalationRuleAction,
  triggerEscalationAction,
} from "@/lib/notifications/notifications.actions";
import {
  GenerateNotesRequestDto,
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
  SendTeamAlertDto,
  CreateEscalationRuleDto,
  UpdateEscalationRuleDto,
  GetTemplatesDto,
  GetEscalationRulesDto,
} from "@/lib/notifications/dto/notifications.dto";

// Query Keys
export const notificationsKeys = {
  all: ["notifications"] as const,

  // Templates
  templates: () => [...notificationsKeys.all, "templates"] as const,
  templatesList: (params?: GetTemplatesDto) =>
    [...notificationsKeys.templates(), "list", params] as const,
  template: (id: string) => [...notificationsKeys.templates(), id] as const,

  // Escalation Rules
  escalationRules: () =>
    [...notificationsKeys.all, "escalation-rules"] as const,
  escalationRulesList: (params?: GetEscalationRulesDto) =>
    [...notificationsKeys.escalationRules(), "list", params] as const,
  escalationRule: (id: string) =>
    [...notificationsKeys.escalationRules(), id] as const,
};

// Template Queries
export function useNotificationTemplates(params?: GetTemplatesDto) {
  return useQuery({
    queryKey: notificationsKeys.templatesList(params),
    queryFn: () => getNotificationTemplatesAction(params),
    select: (data) => (data.success ? data.data : undefined),
  });
}

export function useNotificationTemplate(templateId: string, enabled = true) {
  return useQuery({
    queryKey: notificationsKeys.template(templateId),
    queryFn: () => getNotificationTemplateAction(templateId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!templateId,
  });
}

// Escalation Rules Queries
export function useEscalationRules(params?: GetEscalationRulesDto) {
  return useQuery({
    queryKey: notificationsKeys.escalationRulesList(params),
    queryFn: () => getEscalationRulesAction(params),
    select: (data) => (data.success ? data.data : undefined),
  });
}

export function useEscalationRule(ruleId: string, enabled = true) {
  return useQuery({
    queryKey: notificationsKeys.escalationRule(ruleId),
    queryFn: () => getEscalationRuleAction(ruleId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!ruleId,
  });
}

// Notes Generation Mutations
export function useGenerateNotes() {
  return useMutation({
    mutationFn: (values: GenerateNotesRequestDto) =>
      generateNotesAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(
          `Generated ${data.data.totalNotesGenerated} notes successfully`
        );
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate notes");
    },
  });
}

export function useGenerateOrderNotes() {
  return useMutation({
    mutationFn: ({ orderId, trigger }: { orderId: string; trigger: string }) =>
      generateOrderNotesAction(orderId, trigger),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(
          `Generated ${data.data.totalNotesGenerated} order notes successfully`
        );
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate order notes");
    },
  });
}

// Template Mutations
export function useCreateNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateNotificationTemplateDto) =>
      createNotificationTemplateAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Notification template created successfully");
        queryClient.invalidateQueries({
          queryKey: notificationsKeys.templates(),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create notification template");
    },
  });
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      values,
    }: {
      templateId: string;
      values: UpdateNotificationTemplateDto;
    }) => updateNotificationTemplateAction(templateId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Notification template updated successfully");
        queryClient.invalidateQueries({
          queryKey: notificationsKeys.templates(),
        });
        queryClient.invalidateQueries({
          queryKey: notificationsKeys.template(variables.templateId),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update notification template");
    },
  });
}

export function useDeleteNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) =>
      deleteNotificationTemplateAction(templateId),
    onSuccess: (data, templateId) => {
      if (data.success) {
        toast.success("Notification template deleted successfully");
        queryClient.invalidateQueries({
          queryKey: notificationsKeys.templates(),
        });
        queryClient.removeQueries({
          queryKey: notificationsKeys.template(templateId),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete notification template");
    },
  });
}

// Team Alert Mutations
export function useSendTeamAlert() {
  return useMutation({
    mutationFn: (values: SendTeamAlertDto) => sendTeamAlertAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(
          `Team alert sent to ${data.data.totalRecipients} recipients`
        );
        if (data.data.failedDeliveries > 0) {
          toast.warning(`${data.data.failedDeliveries} deliveries failed`);
        }
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send team alert");
    },
  });
}

export function useSendOrderAlert() {
  return useMutation({
    mutationFn: (orderId: string) => sendOrderAlertAction(orderId),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Order alert sent to team");
        if (data.data.failedDeliveries > 0) {
          toast.warning(`${data.data.failedDeliveries} deliveries failed`);
        }
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send order alert");
    },
  });
}

// Escalation Rule Mutations
export function useCreateEscalationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateEscalationRuleDto) =>
      createEscalationRuleAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Escalation rule created successfully");
        queryClient.invalidateQueries({
          queryKey: notificationsKeys.escalationRules(),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create escalation rule");
    },
  });
}

export function useUpdateEscalationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ruleId,
      values,
    }: {
      ruleId: string;
      values: UpdateEscalationRuleDto;
    }) => updateEscalationRuleAction(ruleId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Escalation rule updated successfully");
        queryClient.invalidateQueries({
          queryKey: notificationsKeys.escalationRules(),
        });
        queryClient.invalidateQueries({
          queryKey: notificationsKeys.escalationRule(variables.ruleId),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update escalation rule");
    },
  });
}

export function useDeleteEscalationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ruleId: string) => deleteEscalationRuleAction(ruleId),
    onSuccess: (data, ruleId) => {
      if (data.success) {
        toast.success("Escalation rule deleted successfully");
        queryClient.invalidateQueries({
          queryKey: notificationsKeys.escalationRules(),
        });
        queryClient.removeQueries({
          queryKey: notificationsKeys.escalationRule(ruleId),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete escalation rule");
    },
  });
}

export function useTriggerEscalation() {
  return useMutation({
    mutationFn: (ruleId: string) => triggerEscalationAction(ruleId),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Escalation rule triggered successfully");
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to trigger escalation");
    },
  });
}
