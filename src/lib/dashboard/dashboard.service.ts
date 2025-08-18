import "server-only";

import { Fetcher } from "../api/api.service";
import {
  DashboardSummaryResponse,
  DashboardSummaryQuery,
  MetricsResponse,
  MetricsQuery,
  ActivityFeedResponse,
  ActivityQuery,
  QuickStatsResponse,
  AdminCustomers,
  AdminInventory,
  AdminOrders,
  AdminSales,
  SavedDesigns,
  RecentActivity,
  CustomerProfile,
} from "./types/dashboard.types";

export class DashboardService {
  constructor(private fetcher = new Fetcher()) {}

  /**
   * Get the main dashboard summary based on user role
   * GET /v1/summary
   */
  async getSummary(
    query?: DashboardSummaryQuery
  ): Promise<DashboardSummaryResponse> {
    const searchParams = new URLSearchParams();

    if (query?.dateRange) {
      searchParams.append("dateRange", query.dateRange.toString());
    }
    if (query?.includeDetails !== undefined) {
      searchParams.append("includeDetails", query.includeDetails.toString());
    }
    if (query?.timezone) {
      searchParams.append("timezone", query.timezone);
    }

    const queryString = searchParams.toString();
    const url = `/v1/summary${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<DashboardSummaryResponse>(url);
  }

  /**
   * Get specific metrics based on user role and requested metrics
   * GET /v1/summary/metrics
   */
  async getMetrics(query: MetricsQuery): Promise<MetricsResponse> {
    const searchParams = new URLSearchParams();

    searchParams.append("metrics", query.metrics);

    if (query?.dateRange) {
      searchParams.append("dateRange", query.dateRange.toString());
    }
    if (query?.includeDetails !== undefined) {
      searchParams.append("includeDetails", query.includeDetails.toString());
    }
    if (query?.timezone) {
      searchParams.append("timezone", query.timezone);
    }
    if (query?.includeComparison !== undefined) {
      searchParams.append(
        "includeComparison",
        query.includeComparison.toString()
      );
    }

    const queryString = searchParams.toString();
    const url = `/v1/summary/metrics?${queryString}`;

    return this.fetcher.request<MetricsResponse>(url);
  }

  /**
   * Get activity feed with pagination
   * GET /v1/summary/activity
   */
  async getActivityFeed(query?: ActivityQuery): Promise<ActivityFeedResponse> {
    const searchParams = new URLSearchParams();

    if (query?.pageIndex !== undefined) {
      searchParams.append("pageIndex", query.pageIndex.toString());
    }
    if (query?.pageSize) {
      searchParams.append("pageSize", query.pageSize.toString());
    }
    if (query?.type) {
      searchParams.append("type", query.type);
    }
    if (query?.severity) {
      searchParams.append("severity", query.severity);
    }
    if (query?.dateRange) {
      searchParams.append("dateRange", query.dateRange.toString());
    }

    const queryString = searchParams.toString();
    const url = `/v1/summary/activity${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<ActivityFeedResponse>(url);
  }

  /**
   * Get quick stats for dashboard widgets
   * GET /v1/summary/quick-stats
   */
  async getQuickStats(): Promise<QuickStatsResponse> {
    const url = `/v1/summary/quick-stats`;
    return this.fetcher.request<QuickStatsResponse>(url);
  }

  // ============ CONVENIENCE METHODS ============

  /**
   * Get customer metrics (admin only)
   */
  async getCustomerMetrics(
    query?: DashboardSummaryQuery
  ): Promise<AdminCustomers | null> {
    try {
      const metrics = await this.getMetrics({
        metrics: "customers",
        ...query,
      });
      return metrics.customers || null;
    } catch {
      return null;
    }
  }

  /**
   * Get inventory metrics (admin only)
   */
  async getInventoryMetrics(
    query?: DashboardSummaryQuery
  ): Promise<AdminInventory | null> {
    try {
      const metrics = await this.getMetrics({
        metrics: "inventory",
        ...query,
      });
      return metrics.inventory || null;
    } catch {
      return null;
    }
  }

  /**
   * Get order metrics (available for both admin and customer)
   */
  async getOrderMetrics(
    query?: DashboardSummaryQuery
  ): Promise<AdminOrders | CustomerProfile | null> {
    try {
      const metrics = await this.getMetrics({
        metrics: "orders",
        ...query,
      });
      return metrics.orders || null;
    } catch {
      return null;
    }
  }

  /**
   * Get sales metrics (admin only)
   */
  async getSalesMetrics(
    query?: DashboardSummaryQuery
  ): Promise<AdminSales | null> {
    try {
      const metrics = await this.getMetrics({
        metrics: "sales",
        ...query,
      });
      return metrics.sales || null;
    } catch {
      return null;
    }
  }

  /**
   * Get design metrics (customer only)
   */
  async getDesignMetrics(
    query?: DashboardSummaryQuery
  ): Promise<SavedDesigns | null> {
    try {
      const metrics = await this.getMetrics({
        metrics: "designs",
        ...query,
      });
      return metrics.designs || null;
    } catch {
      return null;
    }
  }

  /**
   * Get recent activity with default pagination
   */
  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await this.getActivityFeed({
        pageSize: limit,
        pageIndex: 0,
      });
      return response.results;
    } catch {
      return [];
    }
  }

  /**
   * Get all admin metrics in one call
   */
  async getAllAdminMetrics(query?: DashboardSummaryQuery): Promise<{
    customers: AdminCustomers | null;
    inventory: AdminInventory | null;
    orders: AdminOrders | null;
    sales: AdminSales | null;
  }> {
    try {
      const metrics = await this.getMetrics({
        metrics: "customers,inventory,orders,sales",
        ...query,
      });

      return {
        customers: metrics.customers || null,
        inventory: metrics.inventory || null,
        orders: (metrics.orders as AdminOrders) || null,
        sales: metrics.sales || null,
      };
    } catch {
      return {
        customers: null,
        inventory: null,
        orders: null,
        sales: null,
      };
    }
  }

  /**
   * Get customer-specific data
   */
  async getCustomerData(query?: DashboardSummaryQuery): Promise<{
    orders: CustomerProfile | null;
    designs: SavedDesigns | null;
  }> {
    try {
      const metrics = await this.getMetrics({
        metrics: "orders,designs",
        ...query,
      });

      return {
        orders: (metrics.orders as CustomerProfile) || null,
        designs: metrics.designs || null,
      };
    } catch {
      return {
        orders: null,
        designs: null,
      };
    }
  }

  /**
   * Check if user has admin access based on summary response
   */
  async checkUserRole(): Promise<"CUSTOMER" | "ADMIN" | null> {
    try {
      const summary = await this.getSummary();
      return summary.role;
    } catch {
      return null;
    }
  }

  /**
   * Get activity feed filtered by type
   */
  async getActivityByType(
    types: string[],
    query?: Omit<ActivityQuery, "type">
  ): Promise<ActivityFeedResponse> {
    return this.getActivityFeed({
      ...query,
      type: types.join(","),
    });
  }

  /**
   * Get activity feed filtered by severity
   */
  async getActivityBySeverity(
    severity: "low" | "medium" | "high" | "urgent",
    query?: Omit<ActivityQuery, "severity">
  ): Promise<ActivityFeedResponse> {
    return this.getActivityFeed({
      ...query,
      severity,
    });
  }

  /**
   * Get high priority activities
   */
  async getHighPriorityActivities(
    limit: number = 5
  ): Promise<RecentActivity[]> {
    try {
      const response = await this.getActivityBySeverity("high", {
        pageSize: limit,
        pageIndex: 0,
      });
      return response.results;
    } catch {
      return [];
    }
  }

  /**
   * Get new orders activity
   */
  async getNewOrdersActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await this.getActivityByType(["NEW_ORDER"], {
        pageSize: limit,
        pageIndex: 0,
      });
      return response.results;
    } catch {
      return [];
    }
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await this.getActivityByType(["LOW_STOCK"], {
        pageSize: limit,
        pageIndex: 0,
      });
      return response.results;
    } catch {
      return [];
    }
  }

  /**
   * Get user's dashboard cache info
   */
  async getDashboardCacheInfo(): Promise<{
    lastUpdated: string;
    expiresAt?: string;
    dataAge?: number;
  } | null> {
    try {
      const summary = await this.getSummary();
      return {
        lastUpdated: summary.lastUpdated,
        expiresAt: summary.expiresAt,
        dataAge: summary.dataAge,
      };
    } catch {
      return null;
    }
  }

  /**
   * Check if dashboard data is stale
   */
  async isDashboardDataStale(maxAgeMinutes: number = 5): Promise<boolean> {
    try {
      const cacheInfo = await this.getDashboardCacheInfo();
      if (!cacheInfo?.dataAge) return false;

      return cacheInfo.dataAge > maxAgeMinutes * 60; // Convert minutes to seconds
    } catch {
      return true; // Assume stale if we can't check
    }
  }
}
