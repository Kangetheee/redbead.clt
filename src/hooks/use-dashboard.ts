"use client";

import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  getDashboardSummaryAction,
  getTopMetricsAction,
  getConversationInsightsAction,
  getBotPerformanceAction,
  getRevenueMetricsAction,
  getUnderwriterPerformanceAction,
  getUserActivityAction,
  getUpcomingTasksAction,
  getClientFeedbackAction,
} from "@/lib/dashboard/dashboard.actions";
import {
  DashboardSummaryResponse,
  DashboardSummaryQuery,
  TopMetrics,
  ConversationInsights,
  BotPerformance,
  RevenueMetrics,
  UnderwriterPerformanceItem,
  UserActivityItem,
  UpcomingTasks,
  ClientFeedback,
} from "@/lib/dashboard/types/dashboard.types";

// Query Keys
export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: (query?: DashboardSummaryQuery) =>
    [...dashboardKeys.all, "summary", query] as const,
  topMetrics: (query?: DashboardSummaryQuery) =>
    [...dashboardKeys.all, "topMetrics", query] as const,
  conversationInsights: (query?: DashboardSummaryQuery) =>
    [...dashboardKeys.all, "conversationInsights", query] as const,
  botPerformance: (query?: DashboardSummaryQuery) =>
    [...dashboardKeys.all, "botPerformance", query] as const,
  clientFeedback: (query?: DashboardSummaryQuery) =>
    [...dashboardKeys.all, "clientFeedback", query] as const,
  revenueMetrics: (query?: DashboardSummaryQuery) =>
    [...dashboardKeys.all, "revenueMetrics", query] as const,
  underwriterPerformance: (query?: DashboardSummaryQuery) =>
    [...dashboardKeys.all, "underwriterPerformance", query] as const,
  userActivity: (query?: DashboardSummaryQuery) =>
    [...dashboardKeys.all, "userActivity", query] as const,
  upcomingTasks: (query?: DashboardSummaryQuery) =>
    [...dashboardKeys.all, "upcomingTasks", query] as const,
};

// Default options for dashboard queries
const defaultOptions = {
  staleTime: 1000 * 60 * 5, // 5 minutes
  refetchInterval: 1000 * 60 * 10, // 10 minutes
  refetchOnWindowFocus: true,
  retry: 2,
};

export function useDashboardSummary(
  query?: DashboardSummaryQuery,
  options?: Omit<
    UseQueryOptions<DashboardSummaryResponse>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<DashboardSummaryResponse, Error> {
  return useQuery({
    queryKey: dashboardKeys.summary(query),
    queryFn: async () => {
      const result = await getDashboardSummaryAction(query);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...defaultOptions,
    ...options,
  });
}

export function useTopMetrics(
  query?: DashboardSummaryQuery,
  options?: Omit<UseQueryOptions<TopMetrics>, "queryKey" | "queryFn">
): UseQueryResult<TopMetrics, Error> {
  return useQuery({
    queryKey: dashboardKeys.topMetrics(query),
    queryFn: async () => {
      const result = await getTopMetricsAction(query);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...defaultOptions,
    ...options,
  });
}

export function useConversationInsights(
  query?: DashboardSummaryQuery,
  options?: Omit<UseQueryOptions<ConversationInsights>, "queryKey" | "queryFn">
): UseQueryResult<ConversationInsights, Error> {
  return useQuery({
    queryKey: dashboardKeys.conversationInsights(query),
    queryFn: async () => {
      const result = await getConversationInsightsAction(query);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...defaultOptions,
    ...options,
  });
}

export function useBotPerformance(
  query?: DashboardSummaryQuery,
  options?: Omit<UseQueryOptions<BotPerformance>, "queryKey" | "queryFn">
): UseQueryResult<BotPerformance, Error> {
  return useQuery({
    queryKey: dashboardKeys.botPerformance(query),
    queryFn: async () => {
      const result = await getBotPerformanceAction(query);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...defaultOptions,
    ...options,
  });
}

export function useClientFeedback(
  query?: DashboardSummaryQuery,
  options?: Omit<UseQueryOptions<ClientFeedback>, "queryKey" | "queryFn">
): UseQueryResult<ClientFeedback, Error> {
  return useQuery({
    queryKey: dashboardKeys.clientFeedback(query),
    queryFn: async () => {
      const result = await getClientFeedbackAction(query);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...defaultOptions,
    ...options,
  });
}

export function useRevenueMetrics(
  query?: DashboardSummaryQuery,
  options?: Omit<UseQueryOptions<RevenueMetrics>, "queryKey" | "queryFn">
): UseQueryResult<RevenueMetrics, Error> {
  return useQuery({
    queryKey: dashboardKeys.revenueMetrics(query),
    queryFn: async () => {
      const result = await getRevenueMetricsAction(query);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...defaultOptions,
    ...options,
  });
}

export function useUnderwriterPerformance(
  query?: DashboardSummaryQuery,
  options?: Omit<
    UseQueryOptions<UnderwriterPerformanceItem[]>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<UnderwriterPerformanceItem[], Error> {
  return useQuery({
    queryKey: dashboardKeys.underwriterPerformance(query),
    queryFn: async () => {
      const result = await getUnderwriterPerformanceAction(query);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...defaultOptions,
    ...options,
  });
}

export function useUserActivity(
  query?: DashboardSummaryQuery,
  options?: Omit<UseQueryOptions<UserActivityItem[]>, "queryKey" | "queryFn">
): UseQueryResult<UserActivityItem[], Error> {
  return useQuery({
    queryKey: dashboardKeys.userActivity(query),
    queryFn: async () => {
      const result = await getUserActivityAction(query);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...defaultOptions,
    ...options,
  });
}

export function useUpcomingTasks(
  query?: DashboardSummaryQuery,
  options?: Omit<UseQueryOptions<UpcomingTasks>, "queryKey" | "queryFn">
): UseQueryResult<UpcomingTasks, Error> {
  return useQuery({
    queryKey: dashboardKeys.upcomingTasks(query),
    queryFn: async () => {
      const result = await getUpcomingTasksAction(query);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...defaultOptions,
    ...options,
  });
}

// Utility hook for refreshing all dashboard data
export function useRefreshDashboard() {
  const { refetch: refetchSummary } = useDashboardSummary();

  return {
    refreshAll: () => {
      refetchSummary();
    },
  };
}

// Hook for dashboard with real-time updates (shorter intervals)
export function useDashboardRealTime(
  query?: DashboardSummaryQuery,
  refreshInterval = 1000 * 30 // 30 seconds
) {
  return useDashboardSummary(query, {
    refetchInterval: refreshInterval,
    refetchOnWindowFocus: true,
  });
}
