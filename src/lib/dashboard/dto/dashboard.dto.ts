import { z } from "zod";

// ============ QUERY VALIDATION SCHEMAS ============

export const dashboardSummaryQuerySchema = z
  .object({
    dateRange: z.number().min(1).optional(),
    includeDetails: z.boolean().optional(),
    timezone: z.string().optional(),
  })
  .optional();

export const metricsQuerySchema = z.object({
  dateRange: z.number().min(1).optional(),
  includeDetails: z.boolean().optional(),
  timezone: z.string().optional(),
  metrics: z.string().min(1), // comma-separated list of metric types
  includeComparison: z.boolean().optional(),
});

export const activityQuerySchema = z.object({
  pageIndex: z.number().min(0).optional(),
  pageSize: z.number().min(1).max(100).optional(),
  type: z.string().optional(), // comma-separated list of activity types
  severity: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dateRange: z.number().min(1).optional(),
});

// ============ RESPONSE VALIDATION SCHEMAS ============

export const recentActivitySchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  description: z.string(),
  timestamp: z.string(),
  metadata: z.record(z.any()).optional(),
  severity: z.enum(["low", "medium", "high", "urgent"]).optional(),
  templateId: z.string().optional(),
  orderId: z.string().optional(),
  userId: z.string().optional(),
});

export const topProductSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantitySold: z.number(),
});

export const adminCustomersSchema = z.object({
  total: z.number(),
  active: z.number(),
  newThisMonth: z.number(),
  growth: z.number(),
});

export const adminInventorySchema = z.object({
  totalProducts: z.number(),
  lowStock: z.number(),
  outOfStock: z.number(),
  stockValue: z.number(),
  reorderAlerts: z.number(),
});

export const adminOrdersSchema = z.object({
  total: z.number(),
  pending: z.number(),
  processing: z.number(),
  completed: z.number(),
  cancelled: z.number(),
  todaysOrders: z.number(),
});

export const adminSalesSchema = z.object({
  totalRevenue: z.number(),
  monthlyRevenue: z.number(),
  dailyAverage: z.number(),
  growth: z.number(),
  topProducts: z.array(topProductSchema),
});

export const adminSummarySchema = z.object({
  customers: adminCustomersSchema,
  inventory: adminInventorySchema,
  orders: adminOrdersSchema,
  sales: adminSalesSchema,
  recentActivity: z.array(recentActivitySchema),
});

export const customerProfileSchema = z.object({
  totalOrders: z.number(),
  totalSpent: z.number(),
  averageOrderValue: z.number(),
  joinDate: z.string().optional(),
  lastOrderDate: z.string().optional(),
});

export const recentDesignSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  updatedAt: z.string(),
  preview: z.string().optional(),
});

export const savedDesignsSchema = z.object({
  total: z.number(),
  drafts: z.number(),
  approved: z.number(),
  pending: z.number(),
  recentDesigns: z.array(recentDesignSchema),
});

export const recentOrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  status: z.string(),
  totalAmount: z.number(),
  createdAt: z.string(),
  expectedDelivery: z.string().optional(),
});

export const customerOrdersSchema = z.object({
  total: z.number(),
  pending: z.number(),
  processing: z.number(),
  completed: z.number(),
  cancelled: z.number(),
  recentOrders: z.array(recentOrderSchema),
});

export const cartItemSchema = z.object({
  id: z.string(),
  productName: z.string(),
  variantName: z.string().optional(),
  quantity: z.number(),
  unitPrice: z.number(),
});

export const customerCartSchema = z.object({
  itemCount: z.number(),
  totalValue: z.number(),
  items: z.array(cartItemSchema),
});

export const customerSummarySchema = z.object({
  profile: customerProfileSchema,
  savedDesigns: savedDesignsSchema,
  orders: customerOrdersSchema,
  cart: customerCartSchema,
});

export const dashboardSummaryResponseSchema = z.object({
  role: z.enum(["CUSTOMER", "ADMIN"]),
  data: z.union([customerSummarySchema, adminSummarySchema]),
  lastUpdated: z.string(),
  expiresAt: z.string().optional(),
  dataAge: z.number().optional(),
});

export const metricsResponseSchema = z.object({
  customers: adminCustomersSchema.optional(),
  inventory: adminInventorySchema.optional(),
  orders: z.union([adminOrdersSchema, customerProfileSchema]).optional(),
  sales: adminSalesSchema.optional(),
  designs: savedDesignsSchema.optional(),
});

export const activityMetaSchema = z.object({
  pageCount: z.number(),
  pageSize: z.number(),
  currentPage: z.number(),
  pageIndex: z.number(),
  itemCount: z.number(),
});

export const activityFeedResponseSchema = z.object({
  results: z.array(recentActivitySchema),
  meta: activityMetaSchema,
});

export const customerQuickStatsSchema = z.object({
  totalOrders: z.number(),
  totalSpent: z.number(),
  savedDesigns: z.number(),
  cartItems: z.number(),
});

export const adminQuickStatsSchema = z.object({
  totalCustomers: z.number(),
  totalOrders: z.number(),
  monthlyRevenue: z.number(),
  lowStockAlerts: z.number(),
});

export const quickStatsResponseSchema = z.object({
  role: z.enum(["CUSTOMER", "ADMIN"]),
  stats: z.union([customerQuickStatsSchema, adminQuickStatsSchema]),
});

// ============ INFERRED TYPES ============

export type DashboardSummaryQueryDto = z.infer<
  typeof dashboardSummaryQuerySchema
>;
export type MetricsQueryDto = z.infer<typeof metricsQuerySchema>;
export type ActivityQueryDto = z.infer<typeof activityQuerySchema>;
export type DashboardSummaryResponseDto = z.infer<
  typeof dashboardSummaryResponseSchema
>;
export type MetricsResponseDto = z.infer<typeof metricsResponseSchema>;
export type ActivityFeedResponseDto = z.infer<
  typeof activityFeedResponseSchema
>;
export type QuickStatsResponseDto = z.infer<typeof quickStatsResponseSchema>;

// ============ VALIDATION FUNCTIONS ============

export function validateDashboardSummaryQuery(
  query: unknown
): DashboardSummaryQueryDto {
  return dashboardSummaryQuerySchema.parse(query);
}

export function validateMetricsQuery(query: unknown): MetricsQueryDto {
  return metricsQuerySchema.parse(query);
}

export function validateActivityQuery(query: unknown): ActivityQueryDto {
  return activityQuerySchema.parse(query);
}

export function validateDashboardSummaryResponse(
  response: unknown
): DashboardSummaryResponseDto {
  return dashboardSummaryResponseSchema.parse(response);
}

export function validateMetricsResponse(response: unknown): MetricsResponseDto {
  return metricsResponseSchema.parse(response);
}

export function validateActivityFeedResponse(
  response: unknown
): ActivityFeedResponseDto {
  return activityFeedResponseSchema.parse(response);
}

export function validateQuickStatsResponse(
  response: unknown
): QuickStatsResponseDto {
  return quickStatsResponseSchema.parse(response);
}

// ============ UTILITY FUNCTIONS ============

export function buildMetricsQueryString(metrics: string[]): string {
  return metrics.join(",");
}

export function buildActivityTypeQueryString(types: string[]): string {
  return types.join(",");
}

export function getDefaultSummaryQuery(): DashboardSummaryQueryDto {
  return {
    dateRange: 30,
    includeDetails: true,
    timezone: "UTC",
  };
}

export function getDefaultMetricsQuery(metrics: string[]): MetricsQueryDto {
  return {
    dateRange: 30,
    includeDetails: true,
    timezone: "UTC",
    metrics: buildMetricsQueryString(metrics),
    includeComparison: true,
  };
}

export function getDefaultActivityQuery(): ActivityQueryDto {
  return {
    pageIndex: 0,
    pageSize: 20,
    dateRange: 7,
  };
}
