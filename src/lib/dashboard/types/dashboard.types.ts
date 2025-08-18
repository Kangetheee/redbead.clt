export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
  severity?: "low" | "medium" | "high" | "urgent";
  templateId?: string;
  orderId?: string;
  userId?: string;
}

export interface RecentDesign {
  id: string;
  name: string;
  status: string;
  updatedAt: string;
  preview?: string;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  expectedDelivery?: string;
}

export interface CartItem {
  id: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantitySold: number;
}

// ============ CUSTOMER SUMMARY TYPES ============
export interface CustomerProfile {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  joinDate?: string;
  lastOrderDate?: string;
}

export interface SavedDesigns {
  total: number;
  drafts: number;
  approved: number;
  pending: number;
  recentDesigns: RecentDesign[];
}

export interface CustomerOrders {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
  recentOrders: RecentOrder[];
}

export interface CustomerCart {
  itemCount: number;
  totalValue: number;
  items: CartItem[];
}

export interface CustomerSummary {
  profile: CustomerProfile;
  savedDesigns: SavedDesigns;
  orders: CustomerOrders;
  cart: CustomerCart;
}

// ============ ADMIN SUMMARY TYPES ============
export interface AdminCustomers {
  total: number;
  active: number;
  newThisMonth: number;
  growth: number;
}

export interface AdminInventory {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  stockValue: number;
  reorderAlerts: number;
}

export interface AdminOrders {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
  todaysOrders: number;
}

export interface AdminSales {
  totalRevenue: number;
  monthlyRevenue: number;
  dailyAverage: number;
  growth: number;
  topProducts: TopProduct[];
}

export interface AdminSummary {
  customers: AdminCustomers;
  inventory: AdminInventory;
  orders: AdminOrders;
  sales: AdminSales;
  recentActivity: RecentActivity[];
}

// ============ MAIN DASHBOARD TYPES ============
export interface DashboardSummaryResponse {
  role: "CUSTOMER" | "ADMIN";
  data: CustomerSummary | AdminSummary;
  lastUpdated: string;
  expiresAt?: string;
  dataAge?: number;
}

export interface MetricsResponse {
  customers?: AdminCustomers;
  inventory?: AdminInventory;
  orders?: AdminOrders | CustomerProfile;
  sales?: AdminSales;
  designs?: SavedDesigns;
}

export interface ActivityFeedResponse {
  results: RecentActivity[];
  meta: {
    pageCount: number;
    pageSize: number;
    currentPage: number;
    pageIndex: number;
    itemCount: number;
  };
}

export interface QuickStatsResponse {
  role: "CUSTOMER" | "ADMIN";
  stats: CustomerQuickStats | AdminQuickStats;
}

export interface CustomerQuickStats {
  totalOrders: number;
  totalSpent: number;
  savedDesigns: number;
  cartItems: number;
}

export interface AdminQuickStats {
  totalCustomers: number;
  totalOrders: number;
  monthlyRevenue: number;
  lowStockAlerts: number;
}

// ============ QUERY TYPES ============
export interface DashboardSummaryQuery {
  dateRange?: number;
  includeDetails?: boolean;
  timezone?: string;
}

export interface MetricsQuery extends DashboardSummaryQuery {
  metrics: string; // comma-separated list
  includeComparison?: boolean;
}

export interface ActivityQuery {
  pageIndex?: number;
  pageSize?: number;
  type?: string; // comma-separated list
  severity?: "low" | "medium" | "high" | "urgent";
  dateRange?: number;
}

// ============ UTILITY TYPES ============
export type DashboardRole = "CUSTOMER" | "ADMIN";

export type MetricType =
  | "customers"
  | "inventory"
  | "orders"
  | "sales"
  | "designs";

export type ActivityType =
  | "NEW_ORDER"
  | "ORDER_UPDATE"
  | "DESIGN_UPDATE"
  | "NEW_CUSTOMER"
  | "LOW_STOCK";

// ============ TYPE GUARDS ============
export function isCustomerSummary(
  data: CustomerSummary | AdminSummary
): data is CustomerSummary {
  return "profile" in data;
}

export function isAdminSummary(
  data: CustomerSummary | AdminSummary
): data is AdminSummary {
  return "customers" in data;
}

export function isCustomerQuickStats(
  stats: CustomerQuickStats | AdminQuickStats
): stats is CustomerQuickStats {
  return "totalSpent" in stats;
}

export function isAdminQuickStats(
  stats: CustomerQuickStats | AdminQuickStats
): stats is AdminQuickStats {
  return "totalCustomers" in stats;
}
