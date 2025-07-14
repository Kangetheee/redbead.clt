/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Package,
  Clock,
  AlertTriangle,
  CheckCircle,
  Zap,
  Users,
  BarChart3,
  Filter,
  RefreshCw,
  PlayCircle,
  PauseCircle,
  Settings,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

// Import our order components
import OrdersList from "@/components/orders/orders-list";
import OrderSummaryCard from "@/components/orders/order-summary-card";
import { GetOrdersDto } from "@/lib/orders/dto/orders.dto";
import { useOrders } from "@/hooks/use-orders";

export default function StaffOrdersPage() {
  const [selectedQueue, setSelectedQueue] = useState("all");
  const [filters, setFilters] = useState<GetOrdersDto>({
    page: 1,
    limit: 20,
  });

  // Fetch orders data
  const { data: ordersData, isLoading, refetch } = useOrders(filters);
  const orders = ordersData?.success ? ordersData.data?.items || [] : [];

  const handleFiltersChange = (newFilters: GetOrdersDto) => {
    setFilters(newFilters);
  };

  // Staff-specific metrics
  const staffMetrics = {
    totalAssigned: orders.length,
    inProgress: orders.filter((o) =>
      ["PROCESSING", "PRODUCTION"].includes(o.status)
    ).length,
    urgent: orders.filter((o) =>
      ["RUSH", "EMERGENCY"].includes(o.urgencyLevel || "")
    ).length,
    completedToday: orders.filter((o) => {
      const today = new Date().toDateString();
      return (
        o.status === "DELIVERED" &&
        new Date(o.updatedAt).toDateString() === today
      );
    }).length,
    needingApproval: orders.filter((o) => o.status === "DESIGN_PENDING").length,
    overdue: orders.filter((o) => {
      if (!o.expectedDelivery) return false;
      return (
        new Date(o.expectedDelivery) < new Date() &&
        !["DELIVERED", "CANCELLED"].includes(o.status)
      );
    }).length,
  };

  const workQueues = [
    {
      id: "urgent",
      title: "Urgent Queue",
      description: "Rush and emergency orders",
      count: staffMetrics.urgent,
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50 border-red-200",
      filters: { urgencyLevel: "RUSH" as const },
    },
    {
      id: "processing",
      title: "In Production",
      description: "Orders currently being processed",
      count: staffMetrics.inProgress,
      icon: Package,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      filters: { status: "PROCESSING" as const },
    },
    {
      id: "approval",
      title: "Design Approval",
      description: "Waiting for customer approval",
      count: staffMetrics.needingApproval,
      icon: Clock,
      color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      filters: { status: "DESIGN_PENDING" as const },
    },
    {
      id: "completed",
      title: "Completed Today",
      description: "Orders finished today",
      count: staffMetrics.completedToday,
      icon: CheckCircle,
      color: "text-green-600 bg-green-50 border-green-200",
      filters: { status: "DELIVERED" as const },
    },
  ];

  const todaysTasks = [
    {
      id: "1",
      title: "Complete business card designs",
      description: "3 orders waiting for design completion",
      priority: "HIGH",
      dueTime: "2:00 PM",
    },
    {
      id: "2",
      title: "Process banner printing orders",
      description: "5 banners ready for production",
      priority: "MEDIUM",
      dueTime: "4:00 PM",
    },
    {
      id: "3",
      title: "Review urgent order specifications",
      description: "Emergency order needs immediate attention",
      priority: "URGENT",
      dueTime: "ASAP",
    },
  ];

  const workloadProgress = {
    assigned: staffMetrics.totalAssigned,
    completed: staffMetrics.completedToday + 15, // Mock previous completions
    target: 25, // Daily target
  };

  const completionRate =
    workloadProgress.target > 0
      ? (workloadProgress.completed / workloadProgress.target) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Production Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage order processing, track progress, and optimize workflow
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/staff/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Link>
          </Button>

          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Today&apos;s Progress
                </p>
                <p className="text-2xl font-bold">
                  {workloadProgress.completed}/{workloadProgress.target}
                </p>
              </div>
              <div className="text-right">
                <Progress value={completionRate} className="w-16 h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(completionRate)}%
                </p>
              </div>
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
                <p className="text-2xl font-bold">{staffMetrics.inProgress}</p>
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
                  Urgent Orders
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {staffMetrics.urgent}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed Today
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {staffMetrics.completedToday}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Alerts */}
      {staffMetrics.overdue > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{staffMetrics.overdue} orders are overdue</strong> - These
            require immediate attention
            <Button
              variant="link"
              size="sm"
              className="ml-2 text-red-800 p-0 h-auto"
              onClick={() =>
                handleFiltersChange({
                  page: 1,
                  limit: 20,
                  // Filter for overdue orders
                })
              }
            >
              View overdue orders
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Sidebar - Queues and Tasks */}
        <div className="lg:col-span-1 space-y-6">
          {/* Work Queues */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Work Queues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {workQueues.map((queue) => {
                const Icon = queue.icon;
                return (
                  <div
                    key={queue.id}
                    className={`p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow ${queue.color} ${
                      selectedQueue === queue.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => {
                      setSelectedQueue(queue.id);
                      handleFiltersChange({
                        ...queue.filters,
                        page: 1,
                        limit: 20,
                      });
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium text-sm">
                          {queue.title}
                        </span>
                      </div>
                      <Badge variant="outline">{queue.count}</Badge>
                    </div>
                    <p className="text-xs mt-1 opacity-80">
                      {queue.description}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Today's Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today&apos;s Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todaysTasks.map((task) => (
                <div key={task.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    </div>
                    <div className="ml-2 text-right">
                      <Badge
                        variant={
                          task.priority === "URGENT" ? "destructive" : "outline"
                        }
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.dueTime}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="queue" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="queue">Order Queue</TabsTrigger>
              <TabsTrigger value="processing">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            {/* Order Queue Tab */}
            <TabsContent value="queue">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Order Processing Queue</CardTitle>
                      <CardDescription>
                        Orders ready for processing (
                        {
                          orders.filter((o) =>
                            [
                              "PENDING",
                              "DESIGN_APPROVED",
                              "PAYMENT_CONFIRMED",
                            ].includes(o.status)
                          ).length
                        }
                        )
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Start Batch
                      </Button>
                      <Button size="sm">
                        <Package className="h-4 w-4 mr-2" />
                        Process Next
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <OrdersList
                    filters={{
                      status:
                        selectedQueue === "urgent" ? undefined : "PENDING",
                      urgencyLevel:
                        selectedQueue === "urgent" ? "RUSH" : undefined,
                      page: 1,
                      limit: 10,
                    }}
                    selectable={true}
                    showActions={true}
                    compact={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* In Progress Tab */}
            <TabsContent value="processing">
              <Card>
                <CardHeader>
                  <CardTitle>Orders In Production</CardTitle>
                  <CardDescription>
                    Currently processing ({staffMetrics.inProgress} orders)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {orders
                      .filter((o) =>
                        ["PROCESSING", "PRODUCTION"].includes(o.status)
                      )
                      .slice(0, 4)
                      .map((order) => (
                        <OrderSummaryCard
                          key={order.id}
                          order={order}
                          variant="compact"
                          showActions={true}
                        />
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Completed Tab */}
            <TabsContent value="completed">
              <Card>
                <CardHeader>
                  <CardTitle>Completed Today</CardTitle>
                  <CardDescription>
                    Orders finished today ({staffMetrics.completedToday}{" "}
                    completed)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OrdersList
                    filters={{
                      status: "DELIVERED",
                      page: 1,
                      limit: 10,
                    }}
                    selectable={false}
                    showActions={true}
                    compact={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {staffMetrics.totalAssigned}
              </p>
              <p className="text-sm text-muted-foreground">Total Assigned</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {staffMetrics.inProgress}
              </p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {staffMetrics.completedToday}
              </p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {staffMetrics.urgent}
              </p>
              <p className="text-sm text-muted-foreground">Urgent</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Math.round(completionRate)}%
              </p>
              <p className="text-sm text-muted-foreground">Target Progress</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
