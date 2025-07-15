import "server-only";

import { Fetcher } from "../api/api.service";
import {
  DashboardSummaryResponse,
  DashboardSummaryQuery,
} from "./types/dashboard.types";

export class DashboardService {
  constructor(private fetcher = new Fetcher()) {}

  async getSummary(query?: DashboardSummaryQuery) {
    const searchParams = new URLSearchParams();

    if (query?.preset) {
      searchParams.append("preset", query.preset);
    }
    if (query?.startDate) {
      searchParams.append("startDate", query.startDate);
    }
    if (query?.endDate) {
      searchParams.append("endDate", query.endDate);
    }

    const queryString = searchParams.toString();
    const url = `/v1/reports/summary${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<DashboardSummaryResponse>(url);
  }

  async getTopMetrics(query?: DashboardSummaryQuery) {
    const summary = await this.getSummary(query);
    return summary.topMetrics;
  }

  async getConversationInsights(query?: DashboardSummaryQuery) {
    const summary = await this.getSummary(query);
    return summary.conversationInsights;
  }

  async getBotPerformance(query?: DashboardSummaryQuery) {
    const summary = await this.getSummary(query);
    return summary.botPerformance;
  }

  async getRevenueMetrics(query?: DashboardSummaryQuery) {
    const summary = await this.getSummary(query);
    return summary.revenueMetrics;
  }

  async getUnderwriterPerformance(query?: DashboardSummaryQuery) {
    const summary = await this.getSummary(query);
    return summary.underwriterPerformance;
  }

  async getUserActivity(query?: DashboardSummaryQuery) {
    const summary = await this.getSummary(query);
    return summary.userActivity;
  }

  async getUpcomingTasks(query?: DashboardSummaryQuery) {
    const summary = await this.getSummary(query);
    return summary.upcomingTasks;
  }

  async getClientFeedback(query?: DashboardSummaryQuery) {
    const summary = await this.getSummary(query);
    return summary.clientFeedback;
  }
}
