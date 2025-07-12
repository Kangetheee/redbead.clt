"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse } from "../shared/types";
import { DashboardService } from "./dashboard.service";
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
} from "./types/dashboard.types";

const dashboardService = new DashboardService();

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

export async function getTopMetricsAction(
  query?: DashboardSummaryQuery
): Promise<ActionResponse<TopMetrics>> {
  try {
    const res = await dashboardService.getTopMetrics(query);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getConversationInsightsAction(
  query?: DashboardSummaryQuery
): Promise<ActionResponse<ConversationInsights>> {
  try {
    const res = await dashboardService.getConversationInsights(query);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getBotPerformanceAction(
  query?: DashboardSummaryQuery
): Promise<ActionResponse<BotPerformance>> {
  try {
    const res = await dashboardService.getBotPerformance(query);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getClientFeedbackAction(
  query?: DashboardSummaryQuery
): Promise<ActionResponse<ClientFeedback>> {
  try {
    const res = await dashboardService.getClientFeedback(query);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getRevenueMetricsAction(
  query?: DashboardSummaryQuery
): Promise<ActionResponse<RevenueMetrics>> {
  try {
    const res = await dashboardService.getRevenueMetrics(query);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getUnderwriterPerformanceAction(
  query?: DashboardSummaryQuery
): Promise<ActionResponse<UnderwriterPerformanceItem[]>> {
  try {
    const res = await dashboardService.getUnderwriterPerformance(query);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getUserActivityAction(
  query?: DashboardSummaryQuery
): Promise<ActionResponse<UserActivityItem[]>> {
  try {
    const res = await dashboardService.getUserActivity(query);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getUpcomingTasksAction(
  query?: DashboardSummaryQuery
): Promise<ActionResponse<UpcomingTasks>> {
  try {
    const res = await dashboardService.getUpcomingTasks(query);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
