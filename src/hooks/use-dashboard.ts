"use client";

import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getDashboardSummaryAction,
  getMetricsAction,
  getActivityFeedAction,
  getQuickStatsAction,
  getCustomerMetricsAction,
  getInventoryMetricsAction,
  getOrderMetricsAction,
  getSalesMetricsAction,
  getDesignMetricsAction,
  getAllAdminMetricsAction,
  getCustomerDataAction,
  getRecentActivityAction,
} from "@/lib/dashboard/dashboard.actions";
import {
  DashboardSummaryResponse,
  DashboardSummaryQuery,
  MetricsResponse,
  MetricsQuery,
  ActivityFeedResponse,
  ActivityQuery,
  QuickStatsResponse,
} from "@/lib/dashboard/types/dashboard.types";
import React from "react";

// ============ QUERY KEYS ============
export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: (query?: DashboardSummaryQuery) =>
    [...dashboardKeys.all, "summary", query] as const,
  metrics: (query: MetricsQuery) =>
    [...dashboardKeys.all, "metrics", query] as const,
  activity: (query?: ActivityQuery) =>
    [...dashboardKeys.all, "activity", query] as const,
  quickStats: () => [...dashboardKeys.all, "quickStats"] as const,

  // Convenience keys for specific metric types
  customerMetrics: (query?: DashboardSummaryQuery) =>
    [...dashboardKeys.all, "customerMetrics", query] as const,
  inventoryMetrics: (query?: DashboardSummaryQuery) =>
    [...dashboardKeys.all, "inventoryMetrics", query] as const,
  orderMetrics: (query?: DashboardSummaryQuery) =>
    [...dashboardKeys.all, "orderMetrics", query] as const,
  salesMetrics: (query?: DashboardSummaryQuery) =>
    [...dashboardKeys.all, "salesMetrics", query] as const,
  designMetrics: (query?: DashboardSummaryQuery) =>
    [...dashboardKeys.all, "designMetrics", query] as const,
  allAdminMetrics: (query?: DashboardSummaryQuery) =>
    [...dashboardKeys.all, "allAdminMetrics", query] as const,
  customerData: (query?: DashboardSummaryQuery) =>
    [...dashboardKeys.all, "customerData", query] as const,
  recentActivity: (limit: number) =>
    [...dashboardKeys.all, "recentActivity", limit] as const,
};

// ============ DEFAULT OPTIONS ============
const defaultOptions = {
  staleTime: 1000 * 60 * 5, // 5 minutes
  refetchInterval: 1000 * 60 * 10, // 10 minutes
  refetchOnWindowFocus: true,
  retry: 2,
};

const quickOptions = {
  staleTime: 1000 * 60 * 2, // 2 minutes
  refetchInterval: 1000 * 60 * 5, // 5 minutes
  refetchOnWindowFocus: true,
  retry: 1,
};

// ============ CORE HOOKS ============

/**
 * Get role-based dashboard summary
 */
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

/**
 * Get specific metrics
 */
export function useMetrics(
  query: MetricsQuery,
  options?: Omit<UseQueryOptions<MetricsResponse>, "queryKey" | "queryFn">
): UseQueryResult<MetricsResponse, Error> {
  return useQuery({
    queryKey: dashboardKeys.metrics(query),
    queryFn: async () => {
      const result = await getMetricsAction(query);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...defaultOptions,
    ...options,
  });
}

/**
 * Get paginated activity feed
 */
export function useActivityFeed(
  query?: ActivityQuery,
  options?: Omit<UseQueryOptions<ActivityFeedResponse>, "queryKey" | "queryFn">
): UseQueryResult<ActivityFeedResponse, Error> {
  return useQuery({
    queryKey: dashboardKeys.activity(query),
    queryFn: async () => {
      const result = await getActivityFeedAction(query);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...defaultOptions,
    ...options,
  });
}

/**
 * Get quick statistics overview
 */
export function useQuickStats(
  options?: Omit<UseQueryOptions<QuickStatsResponse>, "queryKey" | "queryFn">
): UseQueryResult<QuickStatsResponse, Error> {
  return useQuery({
    queryKey: dashboardKeys.quickStats(),
    queryFn: async () => {
      const result = await getQuickStatsAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...quickOptions,
    ...options,
  });
}

// ============ CONVENIENCE HOOKS ============

/**
 * Get customer metrics (admin only)
 */
export function useCustomerMetrics(
  query?: DashboardSummaryQuery,
  options?: Omit<UseQueryOptions<MetricsResponse>, "queryKey" | "queryFn">
): UseQueryResult<MetricsResponse, Error> {
  return useQuery({
    queryKey: dashboardKeys.customerMetrics(query),
    queryFn: async () => {
      const result = await getCustomerMetricsAction(query);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...defaultOptions,
    ...options,
  });
}

/**
 * Get inventory metrics (admin only)
 */
export function useInventoryMetrics(
  query?: DashboardSummaryQuery,
  options?: Omit<UseQueryOptions<MetricsResponse>, "queryKey" | "queryFn">
): UseQueryResult<MetricsResponse, Error> {
  return useQuery({
    queryKey: dashboardKeys.inventoryMetrics(query),
    queryFn: async () => {
      const result = await getInventoryMetricsAction(query);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...defaultOptions,
    ...options,
  });
}

/**
 * Get order metrics
 */
export function useOrderMetrics(
  query?: DashboardSummaryQuery,
  options?: Omit<UseQueryOptions<MetricsResponse>, "queryKey" | "queryFn">
): UseQueryResult<MetricsResponse, Error> {
  return useQuery({
    queryKey: dashboardKeys.orderMetrics(query),
    queryFn: async () => {
      const result = await getOrderMetricsAction(query);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...defaultOptions,
    ...options,
  });
}

/**
 * Get sales metrics (admin only)
 */
export function useSalesMetrics(
  query?: DashboardSummaryQuery,
  options?: Omit<UseQueryOptions<MetricsResponse>, "queryKey" | "queryFn">
): UseQueryResult<MetricsResponse, Error> {
  return useQuery({
    queryKey: dashboardKeys.salesMetrics(query),
    queryFn: async () => {
      const result = await getSalesMetricsAction(query);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...defaultOptions,
    ...options,
  });
}

/**
 * Get design metrics (customer only)
 */
export function useDesignMetrics(
  query?: DashboardSummaryQuery,
  options?: Omit<UseQueryOptions<MetricsResponse>, "queryKey" | "queryFn">
): UseQueryResult<MetricsResponse, Error> {
  return useQuery({
    queryKey: dashboardKeys.designMetrics(query),
    queryFn: async () => {
      const result = await getDesignMetricsAction(query);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...defaultOptions,
    ...options,
  });
}

/**
 * Get all admin metrics in one call
 */
export function useAllAdminMetrics(
  query?: DashboardSummaryQuery,
  options?: Omit<UseQueryOptions<MetricsResponse>, "queryKey" | "queryFn">
): UseQueryResult<MetricsResponse, Error> {
  return useQuery({
    queryKey: dashboardKeys.allAdminMetrics(query),
    queryFn: async () => {
      const result = await getAllAdminMetricsAction(query);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...defaultOptions,
    ...options,
  });
}

/**
 * Get customer-specific data
 */
export function useCustomerData(
  query?: DashboardSummaryQuery,
  options?: Omit<UseQueryOptions<MetricsResponse>, "queryKey" | "queryFn">
): UseQueryResult<MetricsResponse, Error> {
  return useQuery({
    queryKey: dashboardKeys.customerData(query),
    queryFn: async () => {
      const result = await getCustomerDataAction(query);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...defaultOptions,
    ...options,
  });
}

/**
 * Get recent activity with specified limit
 */
export function useRecentActivity(
  limit: number = 10,
  options?: Omit<UseQueryOptions<ActivityFeedResponse>, "queryKey" | "queryFn">
): UseQueryResult<ActivityFeedResponse, Error> {
  return useQuery({
    queryKey: dashboardKeys.recentActivity(limit),
    queryFn: async () => {
      const result = await getRecentActivityAction(limit);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...defaultOptions,
    ...options,
  });
}

// ============ UTILITY HOOKS ============

/**
 * Hook for refreshing all dashboard data
 */
export function useRefreshDashboard() {
  const queryClient = useQueryClient();

  return {
    refreshAll: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    refreshSummary: (query?: DashboardSummaryQuery) => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary(query) });
    },
    refreshMetrics: (query: MetricsQuery) => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.metrics(query) });
    },
    refreshActivity: (query?: ActivityQuery) => {
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.activity(query),
      });
    },
    refreshQuickStats: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.quickStats() });
    },
  };
}

/**
 * Hook for dashboard with real-time updates (shorter intervals)
 */
export function useDashboardRealTime(
  query?: DashboardSummaryQuery,
  refreshInterval = 1000 * 30 // 30 seconds
) {
  return useDashboardSummary(query, {
    refetchInterval: refreshInterval,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 15, // 15 seconds
  });
}

/**
 * Hook for getting dashboard data with role-based logic
 */
export function useDashboardByRole(query?: DashboardSummaryQuery) {
  const summaryQuery = useDashboardSummary(query);

  const isAdmin = summaryQuery.data?.role === "ADMIN";
  const isCustomer = summaryQuery.data?.role === "CUSTOMER";

  // Get additional data based on role
  const adminMetrics = useAllAdminMetrics(query, {
    enabled: isAdmin,
  });

  const customerData = useCustomerData(query, {
    enabled: isCustomer,
  });

  return {
    summary: summaryQuery,
    role: summaryQuery.data?.role,
    isAdmin,
    isCustomer,
    adminMetrics: isAdmin ? adminMetrics : null,
    customerData: isCustomer ? customerData : null,
    isLoading: summaryQuery.isLoading,
    error: summaryQuery.error || adminMetrics.error || customerData.error,
  };
}

/**
 * Hook for pagination in activity feed
 */
export function usePaginatedActivity(
  baseQuery?: Omit<ActivityQuery, "pageIndex" | "pageSize">,
  pageSize: number = 20
) {
  const [currentPage, setCurrentPage] = React.useState(0);

  const query = React.useMemo(
    () => ({
      ...baseQuery,
      pageIndex: currentPage,
      pageSize,
    }),
    [baseQuery, currentPage, pageSize]
  );

  const result = useActivityFeed(query);

  const hasNextPage = result.data
    ? currentPage < result.data.meta.pageCount - 1
    : false;
  const hasPreviousPage = currentPage > 0;

  return {
    ...result,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    nextPage: () => setCurrentPage((prev) => prev + 1),
    previousPage: () => setCurrentPage((prev) => Math.max(0, prev - 1)),
    goToPage: (page: number) => setCurrentPage(page),
    totalPages: result.data?.meta.pageCount ?? 0,
    totalItems: result.data?.meta.itemCount ?? 0,
  };
}
