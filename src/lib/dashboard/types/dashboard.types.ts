export interface MetricValue {
  value: number;
  change: number;
}

export interface TopMetrics {
  activeClients: MetricValue;
  newClients: MetricValue;
  activeConversations: MetricValue;
  pendingFollowUps: MetricValue;
  plansInForce: MetricValue;
}

export interface WeeklyDataPoint {
  date: string;
  whatsapp: number;
  sms: number;
  instagram: number;
  email: number;
  total: number;
}

export interface ConversationMetrics {
  conversationRate: number;
  averageResponseTime: number;
  completionRate: number;
}

export interface ConversationInsights {
  weeklyData: WeeklyDataPoint[];
  metrics: ConversationMetrics;
}

export interface ActiveBots {
  active: number;
  total: number;
}

export interface ClientFeedback {
  averageRating: number;
  totalRatings: number;
  satisfactionRate: number;
}

export interface BotPerformance {
  activeBots: ActiveBots;
  questionsAsked: number;
  clientFeedback: ClientFeedback;
}

export interface RevenueByFrequency {
  frequency: string;
  amount: number;
  count: number;
}

export interface RevenueMetrics {
  byFrequency: RevenueByFrequency[];
  totalMonthlyRevenue: number;
}

export interface UnderwriterPerformanceItem {
  id: string;
  name: string;
  plansCount: number;
  clientsCount: number;
  revenue: number;
}

export interface UserActivityItem {
  id: string;
  name: string;
  lastActive: string;
  actionsCount: number;
}

export interface FollowUpItem {
  id: string;
  clientName: string;
  dueDate: string;
  type: string;
  priority: "low" | "medium" | "high";
}

export interface SystemAlert {
  id: string;
  message: string;
  type: "info" | "warning" | "error";
  createdAt: string;
}

export interface UpcomingTasks {
  followUps: FollowUpItem[];
  systemAlerts: SystemAlert[];
}

export interface DashboardSummaryResponse {
  topMetrics: TopMetrics;
  conversationInsights: ConversationInsights;
  botPerformance: BotPerformance;
  revenueMetrics: RevenueMetrics;
  underwriterPerformance: UnderwriterPerformanceItem[];
  userActivity: UserActivityItem[];
  upcomingTasks: UpcomingTasks;
  clientFeedback: ClientFeedback;
}

export type DashboardPreset =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_14_days"
  | "last_30_days"
  | "last_90_days"
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "last_quarter"
  | "this_year"
  | "last_year";

export interface DashboardSummaryQuery {
  preset?: DashboardPreset;
  startDate?: string;
  endDate?: string;
}
