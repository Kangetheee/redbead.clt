/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
  Eye,
  Send,
  Download,
  Upload,
  MessageSquare,
  User,
  Calendar,
  RefreshCw,
  Filter,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import our order components
import OrderSummaryCard from "@/components/orders/order-summary-card";
import { GetOrdersDto } from "@/lib/orders/dto/orders.dto";
import { useOrders } from "@/hooks/use-orders";

export default function StaffApprovalQueuePage() {
  const [selectedTab, setSelectedTab] = useState("pending");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [reminderMessage, setReminderMessage] = useState("");

  // Fetch orders needing approval
  const {
    data: ordersData,
    isLoading,
    refetch,
  } = useOrders({
    status: "DESIGN_PENDING",
    page: 1,
    limit: 50,
  });

  const orders = ordersData?.success ? ordersData.data?.items || [] : [];

  // Categorize orders by urgency and time
  const categorizedOrders = {
    overdue: orders.filter((order) => {
      if (!order.designApproval?.requestedAt) return false;
      const requestedDate = new Date(order.designApproval.requestedAt);
      const hoursSinceRequested =
        (new Date().getTime() - requestedDate.getTime()) / (1000 * 60 * 60);
      return hoursSinceRequested > 24;
    }),
    urgent: orders.filter((order) =>
      ["RUSH", "EMERGENCY"].includes(order.urgencyLevel || "")
    ),
    pending: orders.filter((order) => {
      if (!order.designApproval?.requestedAt) return true;
      const requestedDate = new Date(order.designApproval.requestedAt);
      const hoursSinceRequested =
        (new Date().getTime() - requestedDate.getTime()) / (1000 * 60 * 60);
      return (
        hoursSinceRequested <= 24 &&
        !["RUSH", "EMERGENCY"].includes(order.urgencyLevel || "")
      );
    }),
  };

  const handleSendReminder = (orderId: string) => {
    // Implement send reminder logic
    console.log("Sending reminder for order:", orderId);
    setSelectedOrder(null);
    setReminderMessage("");
  };

  const handleEscalate = (orderId: string) => {
    // Implement escalation logic
    console.log("Escalating order:", orderId);
  };

  const getTimeColor = (requestedAt: string) => {
    const requestedDate = new Date(requestedAt);
    const hoursSinceRequested =
      (new Date().getTime() - requestedDate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceRequested > 24) return "text-red-600";
    if (hoursSinceRequested > 12) return "text-orange-600";
    return "text-green-600";
  };

  const approvalStats = {
    total: orders.length,
    overdue: categorizedOrders.overdue.length,
    urgent: categorizedOrders.urgent.length,
    pending: categorizedOrders.pending.length,
    avgResponseTime: "4.2 hours", // Mock data
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Design Approval Queue
          </h1>
          <p className="text-muted-foreground">
            Manage customer design approvals and follow up on pending requests
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>

          <Button>
            <Send className="h-4 w-4 mr-2" />
            Bulk Reminder
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
                  Avg Response
                </p>
                <p className="text-2xl font-bold">
                  {approvalStats.avgResponseTime}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {approvalStats.overdue > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{approvalStats.overdue} approvals are overdue</strong> -
            These have been waiting more than 24 hours
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overdue">
            Overdue ({approvalStats.overdue})
          </TabsTrigger>
          <TabsTrigger value="urgent">
            Urgent ({approvalStats.urgent})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({approvalStats.pending})
          </TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        {/* Overdue Tab */}
        <TabsContent value="overdue" className="space-y-4">
          {categorizedOrders.overdue.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-4 text-lg font-semibold">
                  No overdue approvals!
                </h3>
                <p className="text-muted-foreground">
                  All design approvals are up to date
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {categorizedOrders.overdue.map((order) => (
                <Card key={order.id} className="border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-red-50">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/staff/orders/${order.id}`}
                              className="font-medium hover:underline"
                            >
                              Order #{order.orderNumber}
                            </Link>
                            <Badge variant="destructive">OVERDUE</Badge>
                            {order.urgencyLevel &&
                              order.urgencyLevel !== "NORMAL" && (
                                <Badge variant="outline">
                                  {order.urgencyLevel}
                                </Badge>
                              )}
                          </div>

                          <p className="text-sm text-muted-foreground">
                            Customer: {order.customerId} •{" "}
                            {order.orderItems.length} items
                          </p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              Requested:{" "}
                              {order.designApproval?.requestedAt &&
                                formatDistanceToNow(
                                  new Date(order.designApproval.requestedAt),
                                  { addSuffix: true }
                                )}
                            </span>
                            <span>
                              Expected:{" "}
                              {order.expectedDelivery &&
                                format(
                                  new Date(order.expectedDelivery),
                                  "MMM dd"
                                )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedOrder(order.id)}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Remind
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Send Reminder</DialogTitle>
                              <DialogDescription>
                                Send a reminder to the customer for order #
                                {order.orderNumber}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="reminderType">
                                  Reminder Type
                                </Label>
                                <Select defaultValue="gentle">
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="gentle">
                                      Gentle Reminder
                                    </SelectItem>
                                    <SelectItem value="urgent">
                                      Urgent Follow-up
                                    </SelectItem>
                                    <SelectItem value="final">
                                      Final Notice
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label htmlFor="message">
                                  Additional Message (Optional)
                                </Label>
                                <Textarea
                                  id="message"
                                  value={reminderMessage}
                                  onChange={(e) =>
                                    setReminderMessage(e.target.value)
                                  }
                                  placeholder="Add a personal message..."
                                  rows={3}
                                />
                              </div>
                            </div>

                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setSelectedOrder(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleSendReminder(order.id)}
                              >
                                Send Reminder
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          onClick={() => handleEscalate(order.id)}
                        >
                          Escalate
                        </Button>

                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/staff/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Urgent Tab */}
        <TabsContent value="urgent" className="space-y-4">
          {categorizedOrders.urgent.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-blue-500" />
                <h3 className="mt-4 text-lg font-semibold">
                  No urgent approvals
                </h3>
                <p className="text-muted-foreground">
                  No rush or emergency orders waiting for approval
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {categorizedOrders.urgent.map((order) => (
                <OrderSummaryCard
                  key={order.id}
                  order={order}
                  variant="default"
                  showActions={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categorizedOrders.pending.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/dashboard/staff/orders/${order.id}`}
                        className="font-medium hover:underline"
                      >
                        #{order.orderNumber}
                      </Link>
                      <Badge variant="outline">
                        {order.designApproval?.requestedAt &&
                          formatDistanceToNow(
                            new Date(order.designApproval.requestedAt),
                            { addSuffix: true }
                          )}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {order.customerId.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{order.customerId}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{order.orderItems.length} items</span>
                      <span>${order.totalAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Send className="h-4 w-4 mr-2" />
                        Remind
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/staff/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Actions</CardTitle>
                <CardDescription>
                  Perform actions on multiple approval requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  <Send className="h-4 w-4 mr-2" />
                  Send Bulk Reminders
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Pending List
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Escalate Overdue
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Configure approval queue preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Auto-Reminder Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Templates
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  SLA Configuration
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Approval Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">85%</p>
                  <p className="text-sm text-muted-foreground">Response Rate</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">4.2h</p>
                  <p className="text-sm text-muted-foreground">
                    Avg Response Time
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">12</p>
                  <p className="text-sm text-muted-foreground">This Week</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">92%</p>
                  <p className="text-sm text-muted-foreground">Approval Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
