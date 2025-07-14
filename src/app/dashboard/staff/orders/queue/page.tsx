/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  Clock,
  Package,
  Zap,
  Play,
  Pause,
  CheckCircle,
  User,
  Calendar,
  Timer,
  BarChart3,
  Settings,
  RefreshCw,
  Filter,
  SortAsc,
  SortDesc,
  ArrowRight,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import our order components
import OrderSummaryCard from "@/components/orders/order-summary-card";
import { GetOrdersDto } from "@/lib/orders/dto/orders.dto";
import { useOrders } from "@/hooks/use-orders";

interface QueueMetrics {
  totalInQueue: number;
  urgentOrders: number;
  averageWaitTime: string;
  processingCapacity: number;
  completedToday: number;
  efficiency: number;
}

export default function StaffOrdersQueuePage() {
  const [selectedQueue, setSelectedQueue] = useState("urgent");
  const [sortBy, setSortBy] = useState("priority");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentWorkload, setCurrentWorkload] = useState(75); // Mock percentage

  // Fetch orders for different queues
  const urgentFilters: GetOrdersDto = {
    urgencyLevel: "RUSH",
    status: "PENDING",
    page: 1,
    limit: 20,
  };

  const pendingFilters: GetOrdersDto = {
    status: "PENDING",
    page: 1,
    limit: 20,
  };

  const processingFilters: GetOrdersDto = {
    status: "PROCESSING",
    page: 1,
    limit: 20,
  };

  const { data: urgentData } = useOrders(urgentFilters);
  const { data: pendingData } = useOrders(pendingFilters);
  const { data: processingData } = useOrders(processingFilters);

  const urgentOrders = urgentData?.success ? urgentData.data?.items || [] : [];
  const pendingOrders = pendingData?.success
    ? pendingData.data?.items || []
    : [];
  const processingOrders = processingData?.success
    ? processingData.data?.items || []
    : [];

  // Queue metrics
  const queueMetrics: QueueMetrics = {
    totalInQueue: pendingOrders.length,
    urgentOrders: urgentOrders.length,
    averageWaitTime: "2.3 hours",
    processingCapacity: 15,
    completedToday: 8,
    efficiency: Math.round((8 / 15) * 100),
  };

  const workQueues = [
    {
      id: "urgent",
      title: "Urgent Queue",
      description: "Rush and emergency orders requiring immediate attention",
      count: urgentOrders.length,
      icon: AlertTriangle,
      color: "border-red-200 bg-red-50",
      orders: urgentOrders,
    },
    {
      id: "pending",
      title: "Pending Queue",
      description: "Orders ready for processing",
      count: pendingOrders.length,
      icon: Clock,
      color: "border-yellow-200 bg-yellow-50",
      orders: pendingOrders,
    },
    {
      id: "processing",
      title: "In Progress",
      description: "Orders currently being processed",
      count: processingOrders.length,
      icon: Package,
      color: "border-blue-200 bg-blue-50",
      orders: processingOrders,
    },
  ];

  const activeQueue = workQueues.find((q) => q.id === selectedQueue);

  const handleStartProcessing = (orderId: string) => {
    console.log("Starting processing for order:", orderId);
  };

  const handlePauseProcessing = (orderId: string) => {
    console.log("Pausing processing for order:", orderId);
  };

  const getTimeInQueue = (createdAt: string) => {
    return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  };

  const getPriorityScore = (order: any) => {
    let score = 0;

    // Urgency level scoring
    switch (order.urgencyLevel) {
      case "EMERGENCY":
        score += 100;
        break;
      case "RUSH":
        score += 75;
        break;
      case "EXPEDITED":
        score += 50;
        break;
      default:
        score += 25;
    }

    // Time in queue scoring
    const hoursInQueue =
      (new Date().getTime() - new Date(order.createdAt).getTime()) /
      (1000 * 60 * 60);
    score += Math.min(hoursInQueue * 2, 50);

    // Order value scoring
    score += Math.min(order.totalAmount / 100, 25);

    return Math.round(score);
  };

  const sortOrders = (orders: any[]) => {
    return [...orders].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "priority":
          comparison = getPriorityScore(b) - getPriorityScore(a);
          break;
        case "time":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "value":
          comparison = b.totalAmount - a.totalAmount;
          break;
        default:
          comparison = getPriorityScore(b) - getPriorityScore(a);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  };

  const sortedOrders = activeQueue ? sortOrders(activeQueue.orders) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Order Processing Queue
          </h1>
          <p className="text-muted-foreground">
            Manage and prioritize order processing workflow
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>

          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Queue Settings
          </Button>
        </div>
      </div>

      {/* Queue Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  TOTAL IN QUEUE
                </p>
                <p className="text-2xl font-bold">
                  {queueMetrics.totalInQueue}
                </p>
              </div>
              <Package className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  URGENT
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {queueMetrics.urgentOrders}
                </p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  AVG WAIT TIME
                </p>
                <p className="text-2xl font-bold">
                  {queueMetrics.averageWaitTime}
                </p>
              </div>
              <Timer className="h-6 w-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  CAPACITY
                </p>
                <p className="text-2xl font-bold">
                  {queueMetrics.processingCapacity}
                </p>
              </div>
              <Target className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  COMPLETED TODAY
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {queueMetrics.completedToday}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  EFFICIENCY
                </p>
                <p className="text-2xl font-bold">{queueMetrics.efficiency}%</p>
              </div>
              <BarChart3 className="h-6 w-6 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workload Alert */}
      {currentWorkload > 80 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>High workload detected:</strong> Current processing load is
            at {currentWorkload}%. Consider redistributing tasks or requesting
            additional resources.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Queue Selection Sidebar */}
        <div className="lg:col-span-1 space-y-4">
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
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                      selectedQueue === queue.id
                        ? `${queue.color} ring-2 ring-primary`
                        : "border-border hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedQueue(queue.id)}
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

          {/* Current Workload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Workload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <p className="text-3xl font-bold">{currentWorkload}%</p>
                <p className="text-sm text-muted-foreground">
                  Current capacity
                </p>
              </div>
              <Progress value={currentWorkload} className="h-2" />
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Active:</span>
                  <span>{processingOrders.length} orders</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span>{queueMetrics.completedToday} today</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Queue Display */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {activeQueue && <activeQueue.icon className="h-5 w-5" />}
                    {activeQueue?.title} ({activeQueue?.count || 0})
                  </CardTitle>
                  <CardDescription>{activeQueue?.description}</CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="priority">Priority Score</SelectItem>
                      <SelectItem value="time">Time in Queue</SelectItem>
                      <SelectItem value="value">Order Value</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                  >
                    {sortOrder === "asc" ? (
                      <SortAsc className="h-4 w-4" />
                    ) : (
                      <SortDesc className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {sortedOrders.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-4 text-lg font-semibold">
                    Queue is empty!
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedQueue === "urgent"
                      ? "No urgent orders require immediate attention"
                      : selectedQueue === "pending"
                        ? "No orders are waiting for processing"
                        : "No orders are currently being processed"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedOrders.map((order, index) => (
                    <Card key={order.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                              {index + 1}
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/dashboard/staff/orders/${order.id}`}
                                  className="font-medium hover:underline"
                                >
                                  Order #{order.orderNumber}
                                </Link>

                                {order.urgencyLevel &&
                                  order.urgencyLevel !== "NORMAL" && (
                                    <Badge variant="destructive">
                                      {order.urgencyLevel}
                                    </Badge>
                                  )}

                                <Badge variant="outline">
                                  Score: {getPriorityScore(order)}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{order.customerId}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Package className="h-3 w-3" />
                                  <span>{order.orderItems.length} items</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    In queue {getTimeInQueue(order.createdAt)}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold">
                                  ${order.totalAmount.toFixed(2)}
                                </span>
                                {order.expectedDelivery && (
                                  <span className="text-xs text-muted-foreground">
                                    Due:{" "}
                                    {format(
                                      new Date(order.expectedDelivery),
                                      "MMM dd"
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {selectedQueue === "pending" && (
                              <Button
                                size="sm"
                                onClick={() => handleStartProcessing(order.id)}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Start
                              </Button>
                            )}

                            {selectedQueue === "processing" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePauseProcessing(order.id)}
                              >
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                              </Button>
                            )}

                            <Button size="sm" variant="outline" asChild>
                              <Link
                                href={`/dashboard/staff/orders/${order.id}`}
                              >
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                  Quick Actions
                                </DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <Timer className="mr-2 h-4 w-4" />
                                  Change Priority
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <User className="mr-2 h-4 w-4" />
                                  Reassign Order
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <AlertTriangle className="mr-2 h-4 w-4" />
                                  Report Issue
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Queue Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Queue Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {activeQueue?.orders.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Items in Queue
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {activeQueue?.orders.filter(
                      (o) =>
                        (new Date().getTime() -
                          new Date(o.createdAt).getTime()) /
                          (1000 * 60 * 60) >
                        4
                    ).length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Waiting 4+ Hours
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(
                      (activeQueue?.orders.reduce(
                        (sum, o) => sum + getPriorityScore(o),
                        0
                      ) || 0) / (activeQueue?.orders.length || 1)
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Avg Priority Score
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    $
                    {(
                      (activeQueue?.orders.reduce(
                        (sum, o) => sum + o.totalAmount,
                        0
                      ) || 0) / 1000
                    ).toFixed(1)}
                    k
                  </p>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
