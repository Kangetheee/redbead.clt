import { z } from "zod";

// Dashboard query validation schema
export const dashboardSummaryQuerySchema = z
  .object({
    preset: z
      .enum(["last_7_days", "last_30_days", "last_90_days", "last_year"])
      .optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      // If using custom dates, both startDate and endDate should be provided
      if (data.startDate || data.endDate) {
        return data.startDate && data.endDate;
      }
      return true;
    },
    {
      message:
        "Both startDate and endDate must be provided when using custom date range",
    }
  )
  .refine(
    (data) => {
      // If using custom dates, startDate should be before endDate
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate);
      }
      return true;
    },
    {
      message: "startDate must be before endDate",
    }
  );

export type DashboardSummaryQueryDto = z.infer<
  typeof dashboardSummaryQuerySchema
>;

// Response validation schemas
export const metricValueSchema = z.object({
  value: z.number(),
  change: z.number(),
});

export const topMetricsSchema = z.object({
  activeClients: metricValueSchema,
  newClients: metricValueSchema,
  activeConversations: metricValueSchema,
  pendingFollowUps: metricValueSchema,
  plansInForce: metricValueSchema,
});

export const weeklyDataPointSchema = z.object({
  date: z.string(),
  whatsapp: z.number(),
  sms: z.number(),
  instagram: z.number(),
  email: z.number(),
  total: z.number(),
});

export const conversationMetricsSchema = z.object({
  conversationRate: z.number(),
  averageResponseTime: z.number(),
  completionRate: z.number(),
});

export const conversationInsightsSchema = z.object({
  weeklyData: z.array(weeklyDataPointSchema),
  metrics: conversationMetricsSchema,
});

export const activeBotsSchema = z.object({
  active: z.number(),
  total: z.number(),
});

export const clientFeedbackSchema = z.object({
  averageRating: z.number(),
  totalRatings: z.number(),
  satisfactionRate: z.number(),
});

export const botPerformanceSchema = z.object({
  activeBots: activeBotsSchema,
  questionsAsked: z.number(),
  clientFeedback: clientFeedbackSchema,
});

export const revenueByFrequencySchema = z.object({
  frequency: z.string(),
  amount: z.number(),
  count: z.number(),
});

export const revenueMetricsSchema = z.object({
  byFrequency: z.array(revenueByFrequencySchema),
  totalMonthlyRevenue: z.number(),
});

export const underwriterPerformanceItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  plansCount: z.number(),
  clientsCount: z.number(),
  revenue: z.number(),
});

export const userActivityItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  lastActive: z.string(),
  actionsCount: z.number(),
});

export const followUpItemSchema = z.object({
  id: z.string(),
  clientName: z.string(),
  dueDate: z.string(),
  type: z.string(),
  priority: z.enum(["low", "medium", "high"]),
});

export const systemAlertSchema = z.object({
  id: z.string(),
  message: z.string(),
  type: z.enum(["info", "warning", "error"]),
  createdAt: z.string(),
});

export const upcomingTasksSchema = z.object({
  followUps: z.array(followUpItemSchema),
  systemAlerts: z.array(systemAlertSchema),
});

export const dashboardSummaryResponseSchema = z.object({
  topMetrics: topMetricsSchema,
  conversationInsights: conversationInsightsSchema,
  botPerformance: botPerformanceSchema,
  revenueMetrics: revenueMetricsSchema,
  underwriterPerformance: z.array(underwriterPerformanceItemSchema),
  userActivity: z.array(userActivityItemSchema),
  upcomingTasks: upcomingTasksSchema,
});

export type DashboardSummaryResponseDto = z.infer<
  typeof dashboardSummaryResponseSchema
>;

// Utility function to validate dashboard query
export function validateDashboardQuery(
  query: unknown
): DashboardSummaryQueryDto {
  return dashboardSummaryQuerySchema.parse(query);
}

// Utility function to validate dashboard response
export function validateDashboardResponse(
  response: unknown
): DashboardSummaryResponseDto {
  return dashboardSummaryResponseSchema.parse(response);
}
