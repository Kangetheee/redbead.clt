/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Send,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  FileText,
  Settings,
  Plus,
  RefreshCw,
  ArrowRight,
  BarChart3,
  MessageSquare,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useEmailAnalytics,
  useEmailLogs,
  useEmailTemplates,
} from "@/hooks/use-communication";
import { EmailStatus } from "@/lib/communications/dto/email-logs.dto";

// Types
interface CommunicationStats {
  emails: {
    totalSent: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    recentSent: number;
  };
  designApprovals: {
    totalRequests: number;
    pending: number;
    approved: number;
    rejected: number;
    overdue: number;
  };
  templates: {
    total: number;
    active: number;
    categories: number;
  };
}

interface RecentActivity {
  id: string;
  type:
    | "EMAIL_SENT"
    | "APPROVAL_REQUEST"
    | "APPROVAL_APPROVED"
    | "APPROVAL_REJECTED"
    | "TEMPLATE_CREATED";
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  recipient?: string;
}

interface QuickStat {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export default function CommunicationsPage() {
  const router = useRouter();

  // Use the actual hooks to fetch real data
  const {
    data: emailAnalytics,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useEmailAnalytics();

  const {
    data: recentEmailLogs,
    isLoading: logsLoading,
    error: logsError,
    refetch: refetchLogs,
  } = useEmailLogs({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const {
    data: templatesData,
    isLoading: templatesLoading,
    error: templatesError,
    refetch: refetchTemplates,
  } = useEmailTemplates({
    page: 1,
    limit: 100, // Get all templates for counting
  });

  const { data: approvalTemplatesData, isLoading: approvalTemplatesLoading } =
    useEmailTemplates({
      category: "DESIGN_APPROVAL_REQUEST",
      limit: 100,
    });

  // Calculate design approval stats from email logs
  const { data: approvalLogs, isLoading: approvalLogsLoading } = useEmailLogs({
    page: 1,
    limit: 100,
    // Filter for approval-related templates if possible
  });

  const isLoading =
    analyticsLoading ||
    logsLoading ||
    templatesLoading ||
    approvalTemplatesLoading ||
    approvalLogsLoading;
  const hasError = analyticsError || logsError || templatesError;

  // Transform real data into component state
  const stats: CommunicationStats | null = useMemo(() => {
    if (!emailAnalytics || !templatesData) return null;

    // Calculate recent sent (last 24 hours) from daily stats
    const today = new Date().toISOString().split("T")[0];
    const todayStats = emailAnalytics.dailyStats?.find(
      (stat) => stat.date === today
    );
    const recentSent = todayStats?.sent || 0;

    // Calculate design approval stats from approval logs
    const approvalStats = {
      totalRequests: approvalLogs?.items?.length || 0,
      pending:
        approvalLogs?.items?.filter(
          (log) => log.status === "PENDING" || log.status === "SENT"
        )?.length || 0,
      approved:
        approvalLogs?.items?.filter(
          (log) => log.status === "DELIVERED" || log.status === "OPENED"
        )?.length || 0,
      rejected:
        approvalLogs?.items?.filter(
          (log) => log.status === "FAILED" || log.status === "BOUNCED"
        )?.length || 0,
      overdue: 0, // This would need additional logic based on business rules
    };

    return {
      emails: {
        totalSent: emailAnalytics.totalSent,
        deliveryRate: emailAnalytics.deliveryRate,
        openRate: emailAnalytics.openRate,
        clickRate: emailAnalytics.clickRate,
        recentSent,
      },
      designApprovals: approvalStats,
      templates: {
        total: templatesData.meta?.totalItems || 0,
        active: templatesData.items?.filter((t) => t.isActive)?.length || 0,
        categories:
          new Set(templatesData.items?.map((t) => t.category)).size || 0,
      },
    };
  }, [emailAnalytics, templatesData, approvalLogs]);

  // Transform email logs into recent activity
  const recentActivity: RecentActivity[] = useMemo(() => {
    if (!recentEmailLogs?.items) return [];

    return recentEmailLogs.items.slice(0, 5).map((log) => {
      let type: RecentActivity["type"] = "EMAIL_SENT";
      let title = "Email Sent";

      // Determine activity type based on template category or status
      if (log.templateName?.toLowerCase().includes("approval")) {
        if (log.status === "DELIVERED" || log.status === "OPENED") {
          type = "APPROVAL_REQUEST";
          title = "Design Approval Request Sent";
        } else if (log.status === "CLICKED") {
          type = "APPROVAL_APPROVED";
          title = "Design Approved";
        }
      }

      return {
        id: log.id,
        type,
        title,
        description: `${log.templateName} - ${log.orderId || "Direct Email"}`,
        timestamp: log.createdAt,
        status: log.status,
        recipient: log.recipientEmail,
      };
    });
  }, [recentEmailLogs]);

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "EMAIL_SENT":
        return <Send className="h-4 w-4 text-blue-600" />;
      case "APPROVAL_REQUEST":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "APPROVAL_APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "APPROVAL_REJECTED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "TEMPLATE_CREATED":
        return <FileText className="h-4 w-4 text-purple-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    const statusConfig = {
      DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-800" },
      OPENED: { label: "Opened", color: "bg-blue-100 text-blue-800" },
      CLICKED: { label: "Clicked", color: "bg-purple-100 text-purple-800" },
      FAILED: { label: "Failed", color: "bg-red-100 text-red-800" },
      PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
      SENT: { label: "Sent", color: "bg-blue-100 text-blue-800" },
      BOUNCED: { label: "Bounced", color: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const quickStats: QuickStat[] = useMemo(() => {
    if (!stats) return [];

    return [
      {
        title: "Emails Sent Today",
        value: stats.emails.recentSent.toString(),
        change: "+12%", // This could be calculated from comparing with yesterday
        trend: "up",
        icon: Send,
        color: "text-blue-600",
      },
      {
        title: "Pending Approvals",
        value: stats.designApprovals.pending.toString(),
        change: "-5%",
        trend: "down",
        icon: Clock,
        color: "text-yellow-600",
      },
      {
        title: "Email Open Rate",
        value: `${stats.emails.openRate.toFixed(1)}%`,
        change: "+2.3%",
        trend: "up",
        icon: Eye,
        color: "text-green-600",
      },
      {
        title: "Overdue Approvals",
        value: stats.designApprovals.overdue.toString(),
        change: stats.designApprovals.overdue > 0 ? "+3" : "0",
        trend: stats.designApprovals.overdue > 0 ? "up" : "neutral",
        icon: AlertTriangle,
        color: "text-red-600",
      },
    ];
  }, [stats]);

  const handleRefresh = () => {
    refetchAnalytics();
    refetchLogs();
    refetchTemplates();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="container mx-auto py-10">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Failed to load communications data. Please try again.
            <Button
              variant="link"
              onClick={handleRefresh}
              className="ml-2 p-0 h-auto"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communications</h1>
          <p className="text-muted-foreground">
            Manage email templates, design approvals, and communication
            analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Link href="/dashboard/admin/communication/approval/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Send Approval
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp
                        className={`h-3 w-3 ${
                          stat.trend === "up"
                            ? "text-green-600"
                            : stat.trend === "down"
                              ? "text-red-600 rotate-180"
                              : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          stat.trend === "up"
                            ? "text-green-600"
                            : stat.trend === "down"
                              ? "text-red-600"
                              : "text-gray-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Overview Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Email Performance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Performance
              </CardTitle>
              <Link href="/dashboard/admin/communication/logs">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Logs
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats?.emails.totalSent.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Sent
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.emails.deliveryRate.toFixed(1) || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Delivery Rate
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats?.emails.openRate.toFixed(1) || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Open Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats?.emails.clickRate.toFixed(1) || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Click Rate
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Design Approvals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Design Approvals
              </CardTitle>
              <Link href="/dashboard/admin/communication/approvals">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {stats?.designApprovals.totalRequests || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Requests
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats?.designApprovals.pending || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.designApprovals.approved || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Approved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {stats?.designApprovals.overdue || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Overdue</div>
                </div>
              </div>

              {(stats?.designApprovals.overdue ?? 0) > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">
                      {stats?.designApprovals.overdue} approvals are overdue
                    </span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    These require immediate attention to prevent delivery
                    delays.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <Link href="/dashboard/admin/communication/approvals/create">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Send Design Approval
                  </Button>
                </Link>
                <Link href="/dashboard/admin/communication/templates/create">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Create Email Template
                  </Button>
                </Link>
                <Link href="/dashboard/admin/communication/logs">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Email Analytics
                  </Button>
                </Link>
                <Link href="/dashboard/admin/communication/approval/templates">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Templates
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {activity.title}
                          </p>
                          {activity.status && getStatusBadge(activity.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        {activity.recipient && (
                          <p className="text-xs text-muted-foreground">
                            To: {activity.recipient}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activity
                  </p>
                )}
                <Button variant="ghost" className="w-full mt-4">
                  View All Activity
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Template Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Email Templates
              </CardTitle>
              <Link href="/dashboard/admin/communication/templates">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Templates:</span>
                  <span className="font-medium">
                    {stats?.templates.total || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active:</span>
                  <span className="font-medium text-green-600">
                    {stats?.templates.active || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Categories:</span>
                  <span className="font-medium">
                    {stats?.templates.categories || 0}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/dashboard/admin/communication/templates/create">
                  <Button size="sm" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Template
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Service:</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Template Engine:</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Approval System:</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Operational
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
