"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse } from "../shared/types";
import { DashboardService } from "./dashboard.service";
import {
  DashboardSummaryResponse,
  DashboardSummaryQuery,
  MetricsResponse,
  MetricsQuery,
  ActivityFeedResponse,
  ActivityQuery,
  QuickStatsResponse,
} from "./types/dashboard.types";

const dashboardService = new DashboardService();

/**
 * Get role-based dashboard summary
 */
export async function getDashboardSummaryAction(
  query?: DashboardSummaryQuery
): Promise<ActionResponse<DashboardSummaryResponse>> {
  try {
    const res = await dashboardService.getSummary(query);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get specific metrics based on role and requested metric types
 */
export async function getMetricsAction(
  query: MetricsQuery
): Promise<ActionResponse<MetricsResponse>> {
  try {
    const res = await dashboardService.getMetrics(query);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get paginated activity feed
 */
export async function getActivityFeedAction(
  query?: ActivityQuery
): Promise<ActionResponse<ActivityFeedResponse>> {
  try {
    const res = await dashboardService.getActivityFeed(query);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get quick statistics overview
 */
export async function getQuickStatsAction(): Promise<
  ActionResponse<QuickStatsResponse>
> {
  try {
    const res = await dashboardService.getQuickStats();
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// ============ CONVENIENCE ACTIONS ============

/**
 * Get customer metrics specifically
 */
export async function getCustomerMetricsAction(
  query?: DashboardSummaryQuery
): Promise<ActionResponse<MetricsResponse>> {
  try {
    const res = await dashboardService.getMetrics({
      metrics: "customers",
      ...query,
    });
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get inventory metrics specifically
 */
export async function getInventoryMetricsAction(
  query?: DashboardSummaryQuery
): Promise<ActionResponse<MetricsResponse>> {
  try {
    const res = await dashboardService.getMetrics({
      metrics: "inventory",
      ...query,
    });
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get order metrics specifically
 */
export async function getOrderMetricsAction(
  query?: DashboardSummaryQuery
): Promise<ActionResponse<MetricsResponse>> {
  try {
    const res = await dashboardService.getMetrics({
      metrics: "orders",
      ...query,
    });
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get sales metrics specifically
 */
export async function getSalesMetricsAction(
  query?: DashboardSummaryQuery
): Promise<ActionResponse<MetricsResponse>> {
  try {
    const res = await dashboardService.getMetrics({
      metrics: "sales",
      ...query,
    });
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get design metrics specifically
 */
export async function getDesignMetricsAction(
  query?: DashboardSummaryQuery
): Promise<ActionResponse<MetricsResponse>> {
  try {
    const res = await dashboardService.getMetrics({
      metrics: "designs",
      ...query,
    });
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get all admin metrics in one call
 */
export async function getAllAdminMetricsAction(
  query?: DashboardSummaryQuery
): Promise<ActionResponse<MetricsResponse>> {
  try {
    const res = await dashboardService.getMetrics({
      metrics: "customers,inventory,orders,sales",
      ...query,
    });
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get customer-specific data
 */
export async function getCustomerDataAction(
  query?: DashboardSummaryQuery
): Promise<ActionResponse<MetricsResponse>> {
  try {
    const res = await dashboardService.getMetrics({
      metrics: "orders,designs",
      ...query,
    });
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get recent activity with specified limit
 */
export async function getRecentActivityAction(
  limit: number = 10
): Promise<ActionResponse<ActivityFeedResponse>> {
  try {
    const res = await dashboardService.getActivityFeed({
      pageSize: limit,
      pageIndex: 0,
    });
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
