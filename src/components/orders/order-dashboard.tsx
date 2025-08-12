/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import {
  Plus,
  Search,
  Filter,
  Download,
  BarChart3,
  Package,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Truck,
  Users,
  Calendar,
  FileText,
  Settings,
  RefreshCw,
  Eye,
  Edit,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useOrders } from "@/hooks/use-orders";
import {
  GetOrdersDto,
  ORDER_STATUS,
  URGENCY_LEVELS,
} from "@/lib/orders/dto/orders.dto";
import { OrderResponse, OrderItem } from "@/lib/orders/types/orders.types";
import OrderAnalytics from "./order-analytics";
import OrderExport from "./order-export";

interface QuickStat {
  id: string;
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease";
    period: string;
  };
  icon: React.ElementType;
  color: string;
  trend?: Array<{ period: string; value: number }>;
}

interface RecentActivity {
  id: string;
  type:
    | "order_created"
    | "status_change"
    | "payment_received"
    | "shipped"
    | "delivered";
  title: string;
  description: string;
  timestamp: string;
  actor?: {
    name: string;
    avatar?: string;
  };
  metadata?: {
    orderId?: string;
    amount?: number;
    status?: string;
  };
}

interface TopCustomer {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  avatar: string;
}

interface PerformanceMetrics {
  fulfillmentRate: number;
  cancellationRate: number;
  processingEfficiency: number;
  onTimeDelivery: number;
}

// Component for advanced order search (placeholder)
function AdvancedOrderSearch({
  onFiltersChange,
  initialFilters,
}: {
  onFiltersChange: (filters: GetOrdersDto) => void;
  initialFilters: GetOrdersDto;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Search</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Advanced search filters will be implemented here.
        </p>
      </CardContent>
    </Card>
  );
}

// Helper function to get status badge configuration
const getStatusConfig = (status: string) => {
  const statusConfigs: Record<string, { color: string; label: string }> = {
    PENDING: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
    CONFIRMED: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
    DESIGN_PENDING: {
      color: "bg-blue-100 text-blue-800",
      label: "Design Pending",
    },
    DESIGN_APPROVED: {
      color: "bg-green-100 text-green-800",
      label: "Design Approved",
    },
    DESIGN_REJECTED: {
      color: "bg-red-100 text-red-800",
      label: "Design Rejected",
    },
    PAYMENT_PENDING: {
      color: "bg-orange-100 text-orange-800",
      label: "Payment Pending",
    },
    PAYMENT_CONFIRMED: {
      color: "bg-green-100 text-green-800",
      label: "Payment Confirmed",
    },
    PROCESSING: {
      color: "bg-purple-100 text-purple-800",
      label: "Processing",
    },
    PRODUCTION: {
      color: "bg-purple-100 text-purple-800",
      label: "In Production",
    },
    SHIPPED: { color: "bg-blue-100 text-blue-800", label: "Shipped" },
    DELIVERED: { color: "bg-green-100 text-green-800", label: "Delivered" },
    CANCELLED: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    REFUNDED: { color: "bg-gray-100 text-gray-800", label: "Refunded" },
  };

  return (
    statusConfigs[status] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
    }
  );
};

// Helper function to safely extract order items count
const getOrderItemsCount = (orderItems: (OrderItem | string)[]): number => {
  if (!Array.isArray(orderItems)) return 0;
  return orderItems.length;
};

// Helper function to extract product name from order items
const getMainProductName = (orderItems: (OrderItem | string)[]): string => {
  if (!Array.isArray(orderItems) || orderItems.length === 0)
    return "No products";

  const firstItem = orderItems[0];
  if (typeof firstItem === "string") return "Unknown product";

  return firstItem.template?.name || `Product ${firstItem.productId}`;
};

// Helper function to format currency for Kenya
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
};

export default function OrdersDashboard() {
  const router = useRouter();
  const [selectedDateRange, setSelectedDateRange] = useState("7d");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [filters, setFilters] = useState<GetOrdersDto>({
    page: 1,
    limit: 20,
  });

  // Fetch orders data using the hook
  const { data: ordersData, isLoading, error, refetch } = useOrders(filters);

  // Extract orders and pagination from the correct structure
  const orders: OrderResponse[] = ordersData?.items || [];
  const pagination = ordersData?.meta || null;

  // Calculate quick stats
  const quickStats: QuickStat[] = useMemo(() => {
    if (!orders.length) return [];

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const pendingOrders = orders.filter((order) =>
      ["PENDING", "DESIGN_PENDING", "PAYMENT_PENDING"].includes(order.status)
    ).length;

    const completedOrders = orders.filter(
      (order) => order.status === "DELIVERED"
    ).length;

    const rushOrders = orders.filter((order) =>
      ["RUSH", "EMERGENCY"].includes(order.urgencyLevel || "")
    ).length;

    const designApprovalNeeded = orders.filter(
      (order) =>
        order.designApprovalRequired && order.designApprovalStatus === "PENDING"
    ).length;

    return [
      {
        id: "total_orders",
        label: "Total Orders",
        value: totalOrders.toLocaleString(),
        change: {
          value: 12.5,
          type: "increase",
          period: "vs last week",
        },
        icon: Package,
        color: "text-blue-500",
      },
      {
        id: "revenue",
        label: "Revenue",
        value: formatCurrency(totalRevenue),
        change: {
          value: 8.2,
          type: "increase",
          period: "vs last week",
        },
        icon: DollarSign,
        color: "text-green-500",
      },
      {
        id: "avg_order_value",
        label: "Avg Order Value",
        value: formatCurrency(avgOrderValue),
        change: {
          value: 3.1,
          type: "decrease",
          period: "vs last week",
        },
        icon: TrendingUp,
        color: "text-purple-500",
      },
      {
        id: "pending_orders",
        label: "Pending Orders",
        value: pendingOrders,
        icon: Clock,
        color: "text-yellow-500",
      },
      {
        id: "completed_orders",
        label: "Completed",
        value: completedOrders,
        icon: CheckCircle,
        color: "text-green-500",
      },
      {
        id: "design_approval",
        label: "Need Approval",
        value: designApprovalNeeded,
        icon: Zap,
        color: "text-red-500",
      },
    ];
  }, [orders]);

  // Mock recent activities - would be replaced with real activity data
  const recentActivities: RecentActivity[] = [
    {
      id: "1",
      type: "order_created",
      title: "New order received",
      description: "Order #ORD-12345 placed by Sarah Johnson",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      actor: {
        name: "Sarah Johnson",
        avatar: "/avatars/sarah.jpg",
      },
      metadata: {
        orderId: "ORD-12345",
        amount: 245.99,
      },
    },
    {
      id: "2",
      type: "payment_received",
      title: "Payment confirmed",
      description: "M-PESA payment of KES 8,950 received",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      metadata: {
        amount: 8950,
      },
    },
    {
      id: "3",
      type: "status_change",
      title: "Order shipped",
      description: "Order #ORD-12340 has been shipped",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      metadata: {
        orderId: "ORD-12340",
        status: "SHIPPED",
      },
    },
    {
      id: "4",
      type: "delivered",
      title: "Order delivered",
      description: "Order #ORD-12335 successfully delivered",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      metadata: {
        orderId: "ORD-12335",
        status: "DELIVERED",
      },
    },
  ];

  // Performance metrics
  const performanceMetrics: PerformanceMetrics | null = useMemo(() => {
    const totalOrders = orders.length;
    if (totalOrders === 0) return null;

    const deliveredOrders = orders.filter(
      (o) => o.status === "DELIVERED"
    ).length;
    const cancelledOrders = orders.filter(
      (o) => o.status === "CANCELLED"
    ).length;
    const processingOrders = orders.filter((o) =>
      ["PROCESSING", "PRODUCTION"].includes(o.status)
    ).length;

    return {
      fulfillmentRate: (deliveredOrders / totalOrders) * 100,
      cancellationRate: (cancelledOrders / totalOrders) * 100,
      processingEfficiency: (processingOrders / totalOrders) * 100,
      onTimeDelivery: 94.2, // Mock data
    };
  }, [orders]);

  // Top customers (mock data)
  const topCustomers: TopCustomer[] = [
    {
      id: "1",
      name: "Acme Corporation",
      orders: 23,
      revenue: 458099,
      avatar: "AC",
    },
    {
      id: "2",
      name: "Tech Solutions Ltd",
      orders: 18,
      revenue: 342050,
      avatar: "TS",
    },
    {
      id: "3",
      name: "Creative Agency",
      orders: 15,
      revenue: 289025,
      avatar: "CA",
    },
    {
      id: "4",
      name: "Startup Hub",
      orders: 12,
      revenue: 215075,
      avatar: "SH",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order_created":
        return Package;
      case "payment_received":
        return DollarSign;
      case "status_change":
        return RefreshCw;
      case "shipped":
        return Truck;
      case "delivered":
        return CheckCircle;
      default:
        return FileText;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "order_created":
        return "text-blue-500";
      case "payment_received":
        return "text-green-500";
      case "status_change":
        return "text-purple-500";
      case "shipped":
        return "text-blue-500";
      case "delivered":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const handleFiltersChange = (newFilters: GetOrdersDto) => {
    setFilters(newFilters);
  };

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status);
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Orders Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage all your orders
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Orders Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage all your orders from one place
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/orders/create">
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    {stat.change.type === "increase" ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span
                      className={
                        stat.change.type === "increase"
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {stat.change.value}%
                    </span>
                    <span className="ml-1">{stat.change.period}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Performance Metrics */}
            {performanceMetrics && (
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fulfillment Rate</span>
                      <span className="font-medium">
                        {performanceMetrics.fulfillmentRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={performanceMetrics.fulfillmentRate} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>On-time Delivery</span>
                      <span className="font-medium">
                        {performanceMetrics.onTimeDelivery}%
                      </span>
                    </div>
                    <Progress value={performanceMetrics.onTimeDelivery} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cancellation Rate</span>
                      <span className="font-medium">
                        {performanceMetrics.cancellationRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={performanceMetrics.cancellationRate}
                      className="bg-red-100"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.slice(0, 4).map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-full bg-muted ${getActivityColor(activity.type)}`}
                        >
                          <Icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">
                            {activity.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(
                              new Date(activity.timestamp),
                              "MMM dd, HH:mm"
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Customers */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{customer.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer.orders} orders •{" "}
                          {formatCurrency(customer.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/orders">
                    View All Orders
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">
                    No orders found
                  </h3>
                  <p className="text-muted-foreground">
                    Create your first order to get started
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/orders/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Order
                    </Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 5).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/orders/${order.id}`}
                            className="hover:underline"
                          >
                            {order.orderNumber}
                          </Link>
                          {order.urgencyLevel &&
                            order.urgencyLevel !== "NORMAL" && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                {order.urgencyLevel}
                              </Badge>
                            )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {getMainProductName(order.orderItems)}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.createdAt), "MMM dd")}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/orders/${order.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/orders/${order.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <AdvancedOrderSearch
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
          />

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Orders ({pagination?.totalItems || 0})</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value="recent" onValueChange={() => {}}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="highest">Highest Value</SelectItem>
                      <SelectItem value="lowest">Lowest Value</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">
                    No orders found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or create a new order
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/orders/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Order
                    </Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/orders/${order.id}`}
                            className="hover:underline"
                          >
                            {order.orderNumber}
                          </Link>
                          {order.urgencyLevel &&
                            order.urgencyLevel !== "NORMAL" && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                {order.urgencyLevel}
                              </Badge>
                            )}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {getMainProductName(order.orderItems)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getOrderItemsCount(order.orderItems)} items
                        </TableCell>
                        <TableCell>
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.createdAt), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/orders/${order.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/orders/${order.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Order
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <OrderAnalytics />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Order Reports</CardTitle>
              <CardDescription>
                Generate and export detailed order reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Order export functionality will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
