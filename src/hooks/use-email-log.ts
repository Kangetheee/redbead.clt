import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmailLogsAction,
  getEmailLogAction,
  resendEmailAction,
  getEmailAnalyticsAction,
} from "@/lib/email-logs/email-logs.actions";
import { GetEmailLogsDto } from "@/lib/email-logs/dto/email-log.dto";

export const useEmailLogs = (params?: GetEmailLogsDto) => {
  return useQuery({
    queryKey: ["email-logs", params],
    queryFn: () => getEmailLogsAction(params),
  });
};

export const useEmailLog = (logId: string) => {
  return useQuery({
    queryKey: ["email-logs", logId],
    queryFn: () => getEmailLogAction(logId),
    enabled: !!logId,
  });
};

export const useResendEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emailId: string) => resendEmailAction(emailId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-logs"] });
    },
  });
};

export const useEmailAnalytics = () => {
  return useQuery({
    queryKey: ["email-analytics"],
    queryFn: () => getEmailAnalyticsAction(),
  });
};
