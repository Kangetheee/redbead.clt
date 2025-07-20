/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

// Types
interface EmailLog {
  id: string;
  templateId: string;
  template: {
    name: string;
    category: string;
  };
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  status:
    | "PENDING"
    | "SENT"
    | "DELIVERED"
    | "OPENED"
    | "CLICKED"
    | "BOUNCED"
    | "FAILED";
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  errorMessage?: string;
  orderId?: string;
  designApprovalId?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  data: EmailLog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    lastPage: number;
  };
}

interface EmailStats {
  totalSent: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  failureRate: number;
}

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  SENT: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  OPENED: "bg-purple-100 text-purple-800",
  CLICKED: "bg-indigo-100 text-indigo-800",
  BOUNCED: "bg-orange-100 text-orange-800",
  FAILED: "bg-red-100 text-red-800",
};

const STATUS_ICONS = {
  PENDING: Clock,
  SENT: Send,
  DELIVERED: CheckCircle,
  OPENED: Eye,
  CLICKED: TrendingUp,
  BOUNCED: AlertCircle,
  FAILED: XCircle,
};

export default function EmailLogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  );
  const [templateFilter, setTemplateFilter] = useState(
    searchParams.get("templateId") || "all"
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [totalPages, setTotalPages] = useState(1);

  // Mock data - replace with actual API calls
  const mockStats: EmailStats = {
    totalSent: 1247,
    deliveryRate: 98.2,
    openRate: 24.8,
    clickRate: 12.4,
    failureRate: 1.8,
  };

  const mockLogs: EmailLog[] = [
    {
      id: "log_001",
      templateId: "tpl_design_approval_001",
      template: {
        name: "Design Approval Request",
        category: "DESIGN_APPROVAL_REQUEST",
      },
      recipientEmail: "john.doe@example.com",
      recipientName: "John Doe",
      subject: "Please Review and Approve Your Design - Order ORD-2024-0001",
      status: "OPENED",
      sentAt: "2024-01-20T14:30:00.000Z",
      deliveredAt: "2024-01-20T14:31:00.000Z",
      openedAt: "2024-01-20T15:15:00.000Z",
      orderId: "order_123",
      designApprovalId: "da_approval_001",
      retryCount: 0,
      createdAt: "2024-01-20T14:30:00.000Z",
      updatedAt: "2024-01-20T15:15:00.000Z",
    },
    {
      id: "log_002",
      templateId: "tpl_order_conf_001",
      template: {
        name: "Order Confirmation",
        category: "ORDER_CONFIRMATION",
      },
      recipientEmail: "jane.smith@example.com",
      recipientName: "Jane Smith",
      subject: "Order Confirmed - ORD-2024-0002",
      status: "DELIVERED",
      sentAt: "2024-01-20T12:15:00.000Z",
      deliveredAt: "2024-01-20T12:16:00.000Z",
      orderId: "order_124",
      retryCount: 0,
      createdAt: "2024-01-20T12:15:00.000Z",
      updatedAt: "2024-01-20T12:16:00.000Z",
    },
    {
      id: "log_003",
      templateId: "tpl_shipping_001",
      template: {
        name: "Shipping Notification",
        category: "SHIPPING_NOTIFICATION",
      },
      recipientEmail: "bob.wilson@example.com",
      recipientName: "Bob Wilson",
      subject: "Your Order is on its Way! - ORD-2024-0003",
      status: "FAILED",
      errorMessage: "Recipient email address is invalid",
      orderId: "order_125",
      retryCount: 2,
      createdAt: "2024-01-20T10:45:00.000Z",
      updatedAt: "2024-01-20T11:30:00.000Z",
    },
    {
      id: "log_004",
      templateId: "tpl_design_approval_001",
      template: {
        name: "Design Approval Request",
        category: "DESIGN_APPROVAL_REQUEST",
      },
      recipientEmail: "alice.johnson@example.com",
      recipientName: "Alice Johnson",
      subject: "Please Review and Approve Your Design - Order ORD-2024-0004",
      status: "CLICKED",
      sentAt: "2024-01-20T09:20:00.000Z",
      deliveredAt: "2024-01-20T09:21:00.000Z",
      openedAt: "2024-01-20T10:05:00.000Z",
      clickedAt: "2024-01-20T10:08:00.000Z",
      orderId: "order_126",
      designApprovalId: "da_approval_002",
      retryCount: 0,
      createdAt: "2024-01-20T09:20:00.000Z",
      updatedAt: "2024-01-20T10:08:00.000Z",
    },
  ];

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [currentPage, searchTerm, statusFilter, templateFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      // const response = await fetch(`/api/email-logs?page=${currentPage}&search=${searchTerm}&status=${statusFilter}&templateId=${templateFilter}`);
      // const data: PaginatedResponse = await response.json();

      // Mock implementation with filtering
      const filteredLogs = mockLogs.filter((log) => {
        const matchesSearch =
          log.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.recipientName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || log.status === statusFilter;
        const matchesTemplate =
          templateFilter === "all" || log.templateId === templateFilter;
        return matchesSearch && matchesStatus && matchesTemplate;
      });

      setLogs(filteredLogs);
      setTotalPages(Math.ceil(filteredLogs.length / 10));
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Failed to fetch email logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Replace with actual API call
      // const response = await fetch('/api/email-logs/stats');
      // const data = await response.json();

      setStats(mockStats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchLogs(), fetchStats()]);
    setRefreshing(false);
    toast.success("Email logs refreshed");
  };

  const handleRetryEmail = async (logId: string) => {
    try {
      // Replace with actual API call
      // await fetch(`/api/email-logs/${logId}/retry`, { method: 'POST' });

      toast.success("Email retry initiated");
      fetchLogs();
    } catch (error) {
      toast.error("Failed to retry email");
    }
  };

  const getStatusIcon = (status: EmailLog["status"]) => {
    const Icon = STATUS_ICONS[status];
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Logs</h1>
          <p className="text-muted-foreground">
            Monitor email delivery and engagement metrics
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalSent.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Delivery Rate
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.deliveryRate}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.openRate}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.clickRate}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Failure Rate
              </CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.failureRate}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, subject, or recipient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="OPENED">Opened</SelectItem>
                <SelectItem value="CLICKED">Clicked</SelectItem>
                <SelectItem value="BOUNCED">Bounced</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={templateFilter} onValueChange={setTemplateFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Templates</SelectItem>
                <SelectItem value="tpl_design_approval_001">
                  Design Approval
                </SelectItem>
                <SelectItem value="tpl_order_conf_001">
                  Order Confirmation
                </SelectItem>
                <SelectItem value="tpl_shipping_001">
                  Shipping Notification
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Email Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Email Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Last Update</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {log.recipientName || "Unknown"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {log.recipientEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={log.subject}>
                        {log.subject}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">
                          {log.template.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {log.template.category.replace(/_/g, " ")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[log.status]}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(log.status)}
                          {log.status}
                        </div>
                      </Badge>
                      {log.retryCount > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Retries: {log.retryCount}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.sentAt ? (
                        <div>
                          <div className="text-sm">
                            {format(new Date(log.sentAt), "MMM dd, HH:mm")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.sentAt), {
                              addSuffix: true,
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not sent</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(log.updatedAt), "MMM dd, HH:mm")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.updatedAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(`/admin/email-logs/${log.id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {log.status === "FAILED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRetryEmail(log.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        {log.orderId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/orders/${log.orderId}`)
                            }
                          >
                            Order
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {logs.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              No email logs found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
