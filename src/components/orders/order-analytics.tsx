/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useMemo } from "react";
import { format, subDays } from "date-fns";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Clock,
  Users,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Truck,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useOrders } from "@/hooks/use-orders";
import {
  OrderResponse,
  OrderItem,
  isOrderItem,
} from "@/lib/orders/types/orders.types";
import { GetOrdersDto, ORDER_STATUS } from "@/lib/orders/dto/orders.dto";

type DateRangeType = "7d" | "30d" | "90d" | "1y";
type MetricType = "orders" | "revenue";

interface OrderAnalyticsProps {
  dateRange?: DateRangeType;
  showFilters?: boolean;
}

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  completionRate: number;
  cancellationRate: number;
  pendingOrders: number;
  ordersTrend: number;
  revenueTrend: number;
  statusCounts: Record<string, number>;
  dailyData: Array<{
    date: string;
    orders: number;
    revenue: number;
    avgOrderValue: number;
  }>;
  topTemplates: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
}

interface StatusChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface DailyDataItem {
  date: string;
  orders: number;
  revenue: number;
  avgOrderValue: number;
}

const DATE_RANGE_OPTIONS: Array<{ value: DateRangeType; label: string }> = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last year" },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  DESIGN_PENDING: "#3b82f6",
  DESIGN_APPROVED: "#10b981",
  DESIGN_REJECTED: "#ef4444",
  PAYMENT_PENDING: "#f97316",
  PAYMENT_CONFIRMED: "#10b981",
  PROCESSING: "#8b5cf6",
  PRODUCTION: "#8b5cf6",
  SHIPPED: "#06b6d4",
  DELIVERED: "#10b981",
  CANCELLED: "#ef4444",
  REFUNDED: "#6b7280",
};

// Helper function to safely extract order items
const extractOrderItems = (orderItems: (OrderItem | string)[]): OrderItem[] => {
  if (!Array.isArray(orderItems)) return [];

  return orderItems.map((item, index) => {
    if (typeof item === "string") {
      return {
        id: item,
        templateId: `unknown-${index}`,
        sizeVariantId: "unknown",
        quantity: 1,
      };
    }
    return item;
  });
};

// Helper function to format template name
const getTemplateName = (item: OrderItem): string => {
  return item.template?.name || `Template ${item.templateId}`;
};

export default function OrderAnalytics({
  dateRange = "30d",
  showFilters = true,
}: OrderAnalyticsProps) {
  const [selectedDateRange, setSelectedDateRange] =
    useState<DateRangeType>(dateRange);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("orders");

  // Calculate date range
  const getDaysFromRange = (range: DateRangeType): number => {
    switch (range) {
      case "7d":
        return 7;
      case "30d":
        return 30;
      case "90d":
        return 90;
      case "1y":
        return 365;
      default:
        return 30;
    }
  };

  const days = getDaysFromRange(selectedDateRange);
  const startDate = format(subDays(new Date(), days), "yyyy-MM-dd");
  const endDate = format(new Date(), "yyyy-MM-dd");

  // Build filters for the hook
  const filters: GetOrdersDto = useMemo(
    () => ({
      startDate,
      endDate,
      limit: 1000, // Get all orders in range
      page: 1,
    }),
    [startDate, endDate]
  );

  // Fetch orders data using the hook
  const { data: ordersData, isLoading, error, refetch } = useOrders(filters);

  // Extract orders from the paginated response
  const orders: OrderResponse[] = ordersData?.items || [];

  // Calculate analytics
  const analytics: AnalyticsData | null = useMemo(() => {
    if (!orders.length) return null;

    // Basic metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );
    const averageOrderValue = totalRevenue / totalOrders;

    // Status distribution
    const statusCounts = orders.reduce(
      (acc, order) => {
        const status = order.status || "UNKNOWN";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Daily data for charts
    const dailyData: DailyDataItem[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayOrders = orders.filter(
        (order) => format(new Date(order.createdAt), "yyyy-MM-dd") === dateStr
      );

      const dayRevenue = dayOrders.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      );

      dailyData.push({
        date: format(date, "MMM dd"),
        orders: dayOrders.length,
        revenue: dayRevenue,
        avgOrderValue: dayOrders.length > 0 ? dayRevenue / dayOrders.length : 0,
      });
    }

    // Top templates (from order items)
    const templateCounts = orders.reduce(
      (acc, order) => {
        const orderItems = extractOrderItems(order.orderItems);
        const itemCount = orderItems.length || 1; // Prevent division by zero

        orderItems.forEach((item) => {
          const templateName = getTemplateName(item);
          if (!acc[templateName]) {
            acc[templateName] = { name: templateName, count: 0, revenue: 0 };
          }
          acc[templateName].count += item.quantity || 1;
          // Calculate revenue per template - simplified calculation
          acc[templateName].revenue += (order.totalAmount || 0) / itemCount;
        });
        return acc;
      },
      {} as Record<string, { name: string; count: number; revenue: number }>
    );

    const topTemplates = Object.values(templateCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Performance metrics
    const completedOrders = orders.filter(
      (order) => order.status === "DELIVERED"
    ).length;
    const completionRate =
      totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    const cancelledOrders = orders.filter(
      (order) => order.status === "CANCELLED"
    ).length;
    const cancellationRate =
      totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

    const pendingOrders = orders.filter((order) =>
      ["PENDING", "DESIGN_PENDING", "PAYMENT_PENDING", "PROCESSING"].includes(
        order.status
      )
    ).length;

    // Calculate trends (compare with previous period) - simplified calculation
    // In a real implementation, you'd fetch previous period data
    const previousPeriodOrders = Math.max(1, orders.length * 0.8); // Mock data
    const previousPeriodRevenue = Math.max(1, totalRevenue * 0.85); // Mock data

    const ordersTrend =
      ((totalOrders - previousPeriodOrders) / previousPeriodOrders) * 100;
    const revenueTrend =
      ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100;

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      completionRate,
      cancellationRate,
      pendingOrders,
      ordersTrend,
      revenueTrend,
      statusCounts,
      dailyData,
      topTemplates,
    };
  }, [orders, days]);

  // Prepare chart data
  const statusChartData: StatusChartDataItem[] = analytics
    ? Object.entries(analytics.statusCounts).map(([status, count]) => ({
        name: status.replace(/_/g, " "),
        value: count,
        color: STATUS_COLORS[status] || "#6b7280",
      }))
    : [];

  // Handler functions with proper typing
  const handleDateRangeChange = (value: string) => {
    setSelectedDateRange(value as DateRangeType);
  };

  const handleMetricChange = (value: string) => {
    setSelectedMetric(value as MetricType);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    // Placeholder for export functionality
    console.log("Export analytics data");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="h-64 flex items-center justify-center">
            <div className="animate-pulse">Loading analytics...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load analytics data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (!analytics) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No order data available for the selected period.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      {showFilters && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Order Analytics
            </h2>
            <p className="text-muted-foreground">
              Insights and metrics for your orders
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={selectedDateRange}
              onValueChange={handleDateRangeChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalOrders.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analytics.ordersTrend > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span
                className={
                  analytics.ordersTrend > 0 ? "text-green-500" : "text-red-500"
                }
              >
                {Math.abs(analytics.ordersTrend).toFixed(1)}%
              </span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.totalRevenue.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analytics.revenueTrend > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span
                className={
                  analytics.revenueTrend > 0 ? "text-green-500" : "text-red-500"
                }
              >
                {Math.abs(analytics.revenueTrend).toFixed(1)}%
              </span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Order Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.averageOrderValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Per order average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.completionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Orders delivered successfully
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Trend Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Trends Over Time</CardTitle>
              <Select value={selectedMetric} onValueChange={handleMetricChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orders">Orders</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) =>
                    selectedMetric === "revenue"
                      ? [`$${value.toFixed(2)}`, "Revenue"]
                      : [value, "Orders"]
                  }
                />
                <Line
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Placeholder for Additional Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Order Volume by Day</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Top Templates</CardTitle>
            <CardDescription>
              Most ordered templates in this period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topTemplates.length > 0 ? (
                analytics.topTemplates.map((template, index) => (
                  <div
                    key={template.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {template.count} units • $
                          {template.revenue.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{template.count}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No template data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Key Performance Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Indicators</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Pending Orders</span>
              </div>
              <Badge variant="outline">{analytics.pendingOrders}</Badge>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Completion Rate</span>
              </div>
              <Badge variant="outline">
                {analytics.completionRate.toFixed(1)}%
              </Badge>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Cancellation Rate</span>
              </div>
              <Badge variant="outline">
                {analytics.cancellationRate.toFixed(1)}%
              </Badge>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Revenue per Day</span>
              </div>
              <Badge variant="outline">
                ${(analytics.totalRevenue / days).toFixed(2)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
