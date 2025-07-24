"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCallback } from "react";
import {
  sendEmailAction,
  sendDesignApprovalEmailAction,
  resendEmailAction,
  getEmailTemplatesAction,
  createEmailTemplateAction,
  getSystemTemplatesAction,
  getEmailTemplateAction,
  updateEmailTemplateAction,
  deleteEmailTemplateAction,
  previewEmailTemplateAction,
  duplicateEmailTemplateAction,
  getEmailLogsAction,
  getEmailLogAction,
  getEmailAnalyticsAction,
  getTemplateUsageStatsAction,
  getEmailServiceHealthAction,
  sendTestEmailAction,
  handleEmailWebhookAction,
} from "@/lib/communications/communications.actions";
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
} from "@/lib/communications/dto/emails.dto";

// Query Keys
export const emailKeys = {
  all: ["emails"] as const,

  // Templates
  templates: () => [...emailKeys.all, "templates"] as const,
  templatesList: (params?: GetEmailTemplatesDto) =>
    [...emailKeys.templates(), "list", params] as const,
  template: (id: string) => [...emailKeys.templates(), "detail", id] as const,
  systemTemplates: () => [...emailKeys.templates(), "system"] as const,
  templateUsageStats: (id: string) =>
    [...emailKeys.templates(), "usage-stats", id] as const,

  // Logs
  logs: () => [...emailKeys.all, "logs"] as const,
  logsList: (params?: GetEmailLogsDto) =>
    [...emailKeys.logs(), "list", params] as const,
  log: (id: string) => [...emailKeys.logs(), "detail", id] as const,

  // Analytics & Health
  analytics: () => [...emailKeys.all, "analytics"] as const,
  health: () => [...emailKeys.all, "health"] as const,
};

// Query Hooks

/**
 * Get email templates with pagination and filtering
 * Uses GET /v1/emails/templates
 */
export function useEmailTemplates(params?: GetEmailTemplatesDto) {
  return useQuery({
    queryKey: emailKeys.templatesList(params),
    queryFn: () => getEmailTemplatesAction(params),
    select: (response) => {
      if (!response.success) {
        return {
          success: false as const,
          error: response.error,
        };
      }
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get email template by ID
 * Uses GET /v1/emails/templates/{id}
 */
export function useEmailTemplate(templateId: string, enabled = true) {
  return useQuery({
    queryKey: emailKeys.template(templateId),
    queryFn: () => getEmailTemplateAction(templateId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!templateId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get system template definitions
 * Uses GET /v1/emails/templates/system
 */
export function useSystemTemplates() {
  return useQuery({
    queryKey: emailKeys.systemTemplates(),
    queryFn: () => getSystemTemplatesAction(),
    select: (data) => (data.success ? data.data : undefined),
    staleTime: 30 * 60 * 1000, // 30 minutes - system templates rarely change
  });
}

/**
 * Get template usage statistics
 * Uses GET /v1/emails/templates/{id}/usage-stats
 */
export function useTemplateUsageStats(templateId: string, enabled = true) {
  return useQuery({
    queryKey: emailKeys.templateUsageStats(templateId),
    queryFn: () => getTemplateUsageStatsAction(templateId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!templateId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Get email logs with filtering
 * Uses GET /v1/emails/logs
 */
export function useEmailLogs(params?: GetEmailLogsDto) {
  return useQuery({
    queryKey: emailKeys.logsList(params),
    queryFn: () => getEmailLogsAction(params),
    select: (response) => {
      if (!response.success) {
        return {
          success: false as const,
          error: response.error,
        };
      }
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - logs update frequently
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
}

/**
 * Get detailed email log
 * Uses GET /v1/emails/logs/{id}
 */
export function useEmailLog(logId: string, enabled = true) {
  return useQuery({
    queryKey: emailKeys.log(logId),
    queryFn: () => getEmailLogAction(logId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!logId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get email analytics
 * Uses GET /v1/emails/analytics
 */
export function useEmailAnalytics() {
  return useQuery({
    queryKey: emailKeys.analytics(),
    queryFn: () => getEmailAnalyticsAction(),
    select: (data) => (data.success ? data.data : undefined),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 15 * 60 * 1000, // Auto-refetch every 15 minutes
    refetchOnWindowFocus: false, // Analytics don't need frequent updates on focus
  });
}

/**
 * Get email service health status
 * Uses GET /v1/emails/health
 */
export function useEmailServiceHealth() {
  return useQuery({
    queryKey: emailKeys.health(),
    queryFn: () => getEmailServiceHealthAction(),
    select: (data) => (data.success ? data.data : undefined),
    staleTime: 1 * 60 * 1000, // 1 minute - health status changes quickly
    refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Mutation Hooks

/**
 * Send single email
 * Uses POST /v1/emails/send
 */
export function useSendEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: SendEmailDto) => sendEmailAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Email sent successfully");

        // Invalidate email logs and analytics
        queryClient.invalidateQueries({ queryKey: emailKeys.logs() });
        queryClient.invalidateQueries({ queryKey: emailKeys.analytics() });

        // Show additional info based on response
        if (data.data.status === "queued") {
          toast.info("Email queued for delivery", { duration: 5000 });
        } else if (data.data.estimatedDelivery) {
          toast.info(`Estimated delivery: ${data.data.estimatedDelivery}`, {
            duration: 8000,
          });
        }
      } else {
        toast.error(data.error || "Failed to send email");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send email");
    },
  });
}

/**
 * Send design approval email
 * Uses POST /v1/emails/send-design-approval
 */
export function useSendDesignApprovalEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: SendDesignApprovalEmailDto) =>
      sendDesignApprovalEmailAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Design approval email sent successfully");

        // Show approval details
        if (data.data.approvalToken) {
          toast.info(`Approval expires: ${data.data.expiresAt}`, {
            duration: 10000,
          });
        }

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: emailKeys.logs() });
        queryClient.invalidateQueries({ queryKey: emailKeys.analytics() });
      } else {
        toast.error(data.error || "Failed to send design approval email");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send design approval email");
    },
  });
}

/**
 * Resend failed email
 * Uses POST /v1/emails/{id}/resend
 */
export function useResendEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emailId: string) => resendEmailAction(emailId),
    onSuccess: (data, emailId) => {
      if (data.success) {
        toast.success("Email resent successfully");

        // Invalidate email log for this specific email
        queryClient.invalidateQueries({ queryKey: emailKeys.log(emailId) });
        queryClient.invalidateQueries({ queryKey: emailKeys.logs() });
      } else {
        toast.error(data.error || "Failed to resend email");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resend email");
    },
  });
}

/**
 * Create new email template
 * Uses POST /v1/emails/templates
 */
export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateEmailTemplateDto) =>
      createEmailTemplateAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Email template created successfully");

        // Invalidate templates list
        queryClient.invalidateQueries({ queryKey: emailKeys.templates() });

        // Set the created template in cache
        queryClient.setQueryData(emailKeys.template(data.data.id), {
          success: true,
          data: data.data,
        });
      } else {
        toast.error(data.error || "Failed to create template");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create template");
    },
  });
}

/**
 * Update email template
 * Uses PATCH /v1/emails/templates/{id}
 */
export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      values,
    }: {
      templateId: string;
      values: UpdateEmailTemplateDto;
    }) => updateEmailTemplateAction(templateId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Email template updated successfully");

        // Update specific template cache
        queryClient.setQueryData(emailKeys.template(variables.templateId), {
          success: true,
          data: data.data,
        });

        // Invalidate templates list
        queryClient.invalidateQueries({ queryKey: emailKeys.templates() });
      } else {
        toast.error(data.error || "Failed to update template");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update template");
    },
  });
}

/**
 * Delete email template
 * Uses DELETE /v1/emails/templates/{id}
 */
export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => deleteEmailTemplateAction(templateId),
    onSuccess: (data, templateId) => {
      if (data.success) {
        toast.success("Email template deleted successfully");

        // Remove from cache
        queryClient.removeQueries({ queryKey: emailKeys.template(templateId) });
        queryClient.removeQueries({
          queryKey: emailKeys.templateUsageStats(templateId),
        });

        // Invalidate templates list
        queryClient.invalidateQueries({ queryKey: emailKeys.templates() });
      } else {
        toast.error(data.error || "Failed to delete template");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete template");
    },
  });
}

/**
 * Preview email template
 * Uses POST /v1/emails/templates/preview
 */
export function usePreviewEmailTemplate() {
  return useMutation({
    mutationFn: (values: PreviewEmailTemplateDto) =>
      previewEmailTemplateAction(values),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to preview template");
    },
  });
}

/**
 * Duplicate email template
 * Uses POST /v1/emails/templates/{id}/duplicate
 */
export function useDuplicateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) =>
      duplicateEmailTemplateAction(templateId),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Email template duplicated successfully");

        // Invalidate templates list to show new template
        queryClient.invalidateQueries({ queryKey: emailKeys.templates() });

        // Set duplicated template in cache
        queryClient.setQueryData(emailKeys.template(data.data.id), {
          success: true,
          data: data.data,
        });
      } else {
        toast.error(data.error || "Failed to duplicate template");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to duplicate template");
    },
  });
}

/**
 * Send test email
 * Uses POST /v1/emails/test
 */
export function useSendTestEmail() {
  return useMutation({
    mutationFn: (values: SendTestEmailDto) => sendTestEmailAction(values),
    onSuccess: (data) => {
      if (data.success) {
        if (data.data.success) {
          toast.success(`Test email sent to ${data.data.testEmail}`);

          if (data.data.previewUrl) {
            toast.info("Preview URL available in response", { duration: 8000 });
          }
        } else {
          toast.error(`Test email failed: ${data.data.message}`);
        }
      } else {
        toast.error(data.error || "Failed to send test email");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send test email");
    },
  });
}

/**
 * Handle email provider webhooks (for server-side use)
 * Uses POST /v1/emails/webhooks
 */
export function useHandleEmailWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (webhookData: EmailWebhookDto) =>
      handleEmailWebhookAction(webhookData),
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate logs and analytics to reflect webhook updates
        queryClient.invalidateQueries({ queryKey: emailKeys.logs() });
        queryClient.invalidateQueries({ queryKey: emailKeys.analytics() });
      }
    },
    onError: (error: Error) => {
      console.error("Failed to process email webhook:", error);
    },
  });
}

// Utility Hooks

/**
 * Manual refetch hook for email templates
 */
export function useRefetchEmailTemplates() {
  const queryClient = useQueryClient();

  return useCallback(
    (params?: GetEmailTemplatesDto) => {
      queryClient.invalidateQueries({
        queryKey: params
          ? emailKeys.templatesList(params)
          : emailKeys.templates(),
      });
    },
    [queryClient]
  );
}

/**
 * Manual refetch hook for email logs
 */
export function useRefetchEmailLogs() {
  const queryClient = useQueryClient();

  return useCallback(
    (params?: GetEmailLogsDto) => {
      queryClient.invalidateQueries({
        queryKey: params ? emailKeys.logsList(params) : emailKeys.logs(),
      });
    },
    [queryClient]
  );
}

/**
 * Get template from cache without triggering network request
 */
export function useTemplateFromCache(templateId: string) {
  const queryClient = useQueryClient();

  return queryClient.getQueryData(emailKeys.template(templateId));
}

/**
 * Prefetch template data
 */
export function usePrefetchEmailTemplate() {
  const queryClient = useQueryClient();

  return useCallback(
    (templateId: string) => {
      queryClient.prefetchQuery({
        queryKey: emailKeys.template(templateId),
        queryFn: () => getEmailTemplateAction(templateId),
        staleTime: 10 * 60 * 1000,
      });
    },
    [queryClient]
  );
}
