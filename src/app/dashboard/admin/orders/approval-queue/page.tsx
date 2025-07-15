/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Send,
  Download,
  Eye,
  MessageSquare,
  RefreshCw,
  Filter,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Mail,
  Phone,
  Zap,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Import our components
import ApprovalQueueTable from "./approval-queue-table";
import { GetOrdersDto } from "@/lib/orders/dto/orders.dto";
import { useOrders } from "@/hooks/use-orders";

export default function AdminApprovalQueuePage() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterUrgency, setFilterUrgency] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");

  // Fetch all orders needing approval
  const allApprovalFilters: GetOrdersDto = {
    page: 1,
    limit: 100,
  };

  const {
    data: ordersData,
    isLoading,
    refetch,
  } = useOrders(allApprovalFilters);
  const allOrders = ordersData?.success ? ordersData.data?.items || [] : [];

  // Filter for design approval orders
  const approvalOrders = allOrders.filter(
    (order) =>
      order.designApprovalRequired &&
      (order.status === "DESIGN_PENDING" ||
        order.designApproval?.status === "PENDING")
  );

  // Categorize approval orders
  const categorizedOrders = {
    overdue: approvalOrders.filter((order) => {
      if (!order.designApproval?.requestedAt) return false;
      const requestedDate = new Date(order.designApproval.requestedAt);
      const hoursSinceRequested =
        (new Date().getTime() - requestedDate.getTime()) / (1000 * 60 * 60);
      return hoursSinceRequested > 24;
    }),
    urgent: approvalOrders.filter((order) =>
      ["RUSH", "EMERGENCY"].includes(order.urgencyLevel || "")
    ),
    pending: approvalOrders.filter((order) => {
      if (!order.designApproval?.requestedAt) return true;
      const requestedDate = new Date(order.designApproval.requestedAt);
      const hoursSinceRequested =
        (new Date().getTime() - requestedDate.getTime()) / (1000 * 60 * 60);
      return (
        hoursSinceRequested <= 24 &&
        !["RUSH", "EMERGENCY"].includes(order.urgencyLevel || "")
      );
    }),
    approved: allOrders.filter(
      (order) => order.designApproval?.status === "APPROVED"
    ),
    rejected: allOrders.filter(
      (order) => order.designApproval?.status === "REJECTED"
    ),
  };

  // Filter orders based on current filters
  const getFilteredOrders = () => {
    let orders = approvalOrders;

    if (filterStatus !== "all") {
      switch (filterStatus) {
        case "overdue":
          orders = categorizedOrders.overdue;
          break;
        case "urgent":
          orders = categorizedOrders.urgent;
          break;
        case "pending":
          orders = categorizedOrders.pending;
          break;
        case "approved":
          orders = categorizedOrders.approved;
          break;
        case "rejected":
          orders = categorizedOrders.rejected;
          break;
      }
    }

    if (filterUrgency !== "all") {
      orders = orders.filter((order) => order.urgencyLevel === filterUrgency);
    }

    if (searchTerm) {
      orders = orders.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return orders;
  };

  const filteredOrders = getFilteredOrders();

  // Calculate statistics
  const approvalStats = {
    total: approvalOrders.length,
    overdue: categorizedOrders.overdue.length,
    urgent: categorizedOrders.urgent.length,
    pending: categorizedOrders.pending.length,
    approved: categorizedOrders.approved.length,
    rejected: categorizedOrders.rejected.length,
    avgResponseTime: "4.2 hours", // Mock data
    approvalRate:
      approvalOrders.length > 0
        ? Math.round(
            (categorizedOrders.approved.length /
              (categorizedOrders.approved.length +
                categorizedOrders.rejected.length)) *
              100
          )
        : 0,
  };

  const handleBulkAction = (action: string) => {
    console.log("Bulk action:", action);
    // Implement bulk action logic
  };

  const handleSendReminder = (orderId: string) => {
    console.log("Sending reminder for order:", orderId);
    // Implement reminder logic
  };

  const quickActions = [
    {
      title: "Send Bulk Reminders",
      description: "Send reminders to customers with pending approvals",
      action: () => handleBulkAction("bulk-reminder"),
      icon: Send,
      color: "bg-blue-500",
    },
    {
      title: "Export Pending List",
      description: "Download list of pending approvals",
      action: () => handleBulkAction("export"),
      icon: Download,
      color: "bg-green-500",
    },
    {
      title: "Escalate Overdue",
      description: "Escalate overdue approvals to management",
      action: () => handleBulkAction("escalate"),
      icon: AlertTriangle,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Design Approval Queue
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage customer design approvals across all orders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/admin/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Link>
          </Button>

          <Button>
            <Send className="h-4 w-4 mr-2" />
            Bulk Actions
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Pending
                </p>
                <p className="text-2xl font-bold">{approvalStats.total}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Overdue
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {approvalStats.overdue}
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
                  Urgent
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {approvalStats.urgent}
                </p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Approval Rate
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {approvalStats.approvalRate}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {approvalStats.overdue > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{approvalStats.overdue} approvals are overdue</strong> -
            These have been waiting more than 24 hours and may impact delivery
            schedules.
            <Button
              variant="link"
              size="sm"
              className="ml-2 text-red-800 p-0 h-auto"
              onClick={() => setFilterStatus("overdue")}
            >
              View overdue approvals
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
              <CardContent className="p-4" onClick={action.action}>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${action.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">All Approvals</TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue ({approvalStats.overdue})
          </TabsTrigger>
          <TabsTrigger value="urgent">
            Urgent ({approvalStats.urgent})
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* All Approvals Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="text-sm font-medium">
                    Search
                  </Label>
                  <Input
                    id="search"
                    placeholder="Search by order number or customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Select
                    value={filterUrgency}
                    onValueChange={setFilterUrgency}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="EXPEDITED">Expedited</SelectItem>
                      <SelectItem value="RUSH">Rush</SelectItem>
                      <SelectItem value="EMERGENCY">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approval Queue Table */}
          <ApprovalQueueTable
            orders={filteredOrders}
            loading={isLoading}
            onSendReminder={handleSendReminder}
            onRefresh={() => refetch()}
          />
        </TabsContent>

        {/* Overdue Tab */}
        <TabsContent value="overdue">
          <ApprovalQueueTable
            orders={categorizedOrders.overdue}
            loading={isLoading}
            onSendReminder={handleSendReminder}
            onRefresh={() => refetch()}
            showOverdueAlert={true}
          />
        </TabsContent>

        {/* Urgent Tab */}
        <TabsContent value="urgent">
          <ApprovalQueueTable
            orders={categorizedOrders.urgent}
            loading={isLoading}
            onSendReminder={handleSendReminder}
            onRefresh={() => refetch()}
            showUrgentAlert={true}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Approval Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Average Response Time</span>
                  <span className="font-medium">
                    {approvalStats.avgResponseTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Approval Rate</span>
                  <span className="font-medium">
                    {approvalStats.approvalRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>First-Time Approval</span>
                  <span className="font-medium">78%</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer Satisfaction</span>
                  <span className="font-medium">4.6/5</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time Breakdown</CardTitle>
                <CardDescription>
                  Distribution of approval response times
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">2 hours</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-green-200 rounded">
                        <div className="h-2 w-16 bg-green-500 rounded" />
                      </div>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">2-8 hours</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-blue-200 rounded">
                        <div className="h-2 w-12 bg-blue-500 rounded" />
                      </div>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">8-24 hours</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-orange-200 rounded">
                        <div className="h-2 w-6 bg-orange-500 rounded" />
                      </div>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm"> 24 hours</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-red-200 rounded">
                        <div className="h-2 w-3 bg-red-500 rounded" />
                      </div>
                      <span className="text-sm font-medium">5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-center">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day, index) => (
                    <div key={day} className="space-y-1">
                      <p className="text-xs text-muted-foreground">{day}</p>
                      <div className="h-16 bg-blue-100 rounded relative">
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded"
                          style={{ height: `${(index + 1) * 10}%` }}
                        />
                      </div>
                      <p className="text-xs font-medium">{(index + 1) * 3}</p>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
