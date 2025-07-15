/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Repeat,
  Clock,
  CheckCircle,
  Truck,
  ShoppingCart,
  Star,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Import our order components
import OrdersList from "@/components/orders/orders-list";
import OrderSummaryCard from "@/components/orders/order-summary-card";
import { GetOrdersDto } from "@/lib/orders/dto/orders.dto";
import { useOrders } from "@/hooks/use-orders";

export default function CustomerOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filters, setFilters] = useState<GetOrdersDto>({
    page: 1,
    limit: 20,
  });

  // Fetch orders data - in a real app, this would filter by current customer
  const { data: ordersData, isLoading, refetch } = useOrders(filters);
  const orders = ordersData?.success ? ordersData.data?.items || [] : [];

  const handleFiltersChange = (newFilters: GetOrdersDto) => {
    setFilters(newFilters);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters((prev) => ({
      ...prev,
      search: value || undefined,
      page: 1,
    }));
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setFilters((prev) => ({
      ...prev,
      status: status === "all" ? undefined : (status as any),
      page: 1,
    }));
  };

  // Customer-focused order stats
  const orderStats = {
    total: orders.length,
    active: orders.filter(
      (o) => !["DELIVERED", "CANCELLED", "REFUNDED"].includes(o.status)
    ).length,
    completed: orders.filter((o) => o.status === "DELIVERED").length,
    pending: orders.filter((o) =>
      ["PENDING", "DESIGN_PENDING", "PAYMENT_PENDING"].includes(o.status)
    ).length,
    needsAction: orders.filter(
      (o) => o.status === "DESIGN_PENDING" || o.payment?.status === "PENDING"
    ).length,
  };

  // Recent orders for quick view
  const recentOrders = orders.slice(0, 3);

  const quickActions = [
    {
      title: "Create New Order",
      description: "Start a new custom printing order",
      icon: Plus,
      href: "/dashboard/customer/orders/create",
      color: "bg-blue-500 text-white",
    },
    {
      title: "Reorder Previous",
      description: "Quickly reorder from your history",
      icon: Repeat,
      href: "/dashboard/customer/orders?filter=delivered",
      color: "bg-green-500 text-white",
    },
    {
      title: "Track Orders",
      description: "Check status of current orders",
      icon: Truck,
      href: "/dashboard/customer/orders?filter=active",
      color: "bg-purple-500 text-white",
    },
  ];

  const statusOptions = [
    { value: "all", label: "All Orders", count: orderStats.total },
    { value: "PENDING", label: "Pending", count: orderStats.pending },
    { value: "PROCESSING", label: "In Progress", count: orderStats.active },
    {
      value: "SHIPPED",
      label: "Shipped",
      count: orders.filter((o) => o.status === "SHIPPED").length,
    },
    { value: "DELIVERED", label: "Completed", count: orderStats.completed },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground">
            Track your orders, view history, and create new orders
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard/customer/orders/create">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </p>
                <p className="text-2xl font-bold">{orderStats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Orders
                </p>
                <p className="text-2xl font-bold">{orderStats.active}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-2xl font-bold">{orderStats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Need Action
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {orderStats.needsAction}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items Alert */}
      {orderStats.needsAction > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>
              {orderStats.needsAction} orders need your attention.
            </strong>
            This includes design approvals and payment confirmations.
            <Button
              variant="link"
              size="sm"
              className="ml-2 text-orange-800 p-0 h-auto"
              onClick={() => handleStatusFilter("DESIGN_PENDING")}
            >
              Review pending items
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <Link href={action.href}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${action.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all-orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-orders">All Orders</TabsTrigger>
          <TabsTrigger value="recent">Recent Orders</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        {/* All Orders Tab */}
        <TabsContent value="all-orders" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                          <Badge variant="outline" className="ml-2">
                            {option.count}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <OrdersList
            filters={filters}
            onFiltersChange={handleFiltersChange}
            selectable={false}
            showActions={true}
            compact={false}
          />
        </TabsContent>

        {/* Recent Orders Tab */}
        <TabsContent value="recent" className="space-y-6">
          {recentOrders.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentOrders.map((order) => (
                <OrderSummaryCard
                  key={order.id}
                  order={order}
                  variant="default"
                  showActions={true}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No recent orders</h3>
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t placed any orders yet
                </p>
                <Button asChild>
                  <Link href="/dashboard/customer/orders/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Order
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Favorite Orders
              </CardTitle>
              <CardDescription>
                Orders you&apos;ve marked as favorites for easy reordering
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* This would show favorited orders */}
              <div className="text-center py-8">
                <Star className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No favorites yet</h3>
                <p className="text-muted-foreground mb-4">
                  Mark orders as favorites to easily find and reorder them
                </p>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/customer/orders">
                    Browse Your Orders
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order History Summary */}
      {orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Order History Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  $
                  {orders
                    .reduce((sum, order) => sum + order.totalAmount, 0)
                    .toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Total Spent</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round((orderStats.completed / orderStats.total) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  $
                  {(
                    orders.reduce((sum, order) => sum + order.totalAmount, 0) /
                    orderStats.total
                  ).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {
                    orders.filter(
                      (o) =>
                        format(new Date(o.createdAt), "yyyy-MM") ===
                        format(new Date(), "yyyy-MM")
                    ).length
                  }
                </p>
                <p className="text-sm text-muted-foreground">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
