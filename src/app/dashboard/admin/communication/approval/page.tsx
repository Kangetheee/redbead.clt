/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  Loader2,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Mail,
  RefreshCw,
  MoreHorizontal,
  Eye,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Import the TanStack Query hooks
import {
  useEmailLogs,
  useEmailAnalytics,
  useSendEmail,
} from "@/hooks/use-communication";
import {
  GetEmailLogsDto,
  EmailStatus,
} from "@/lib/communications/dto/email-logs.dto";

interface ApprovalFilters {
  page: number;
  limit: number;
  search: string;
  status: EmailStatus | "";
  sortBy: string;
  sortOrder: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}

function ApprovalTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Template</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-8 w-8 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function ApprovalsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null);

  // Parse search params with defaults
  const [filters, setFilters] = useState<ApprovalFilters>({
    page: parseInt(searchParams.get("page") || "1"),
    limit: parseInt(searchParams.get("limit") || "20"),
    search: searchParams.get("search") || "",
    status: (searchParams.get("status") as EmailStatus) || "",
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
  });

  // Use TanStack Query hooks for data fetching
  const {
    data: logsData,
    isLoading: logsLoading,
    error: logsError,
    refetch,
  } = useEmailLogs({
    page: filters.page,
    limit: filters.limit,
    recipientEmail: filters.search || undefined,
    status: filters.status || undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  });

  const { data: analyticsData, isLoading: analyticsLoading } =
    useEmailAnalytics();

  const sendEmailMutation = useSendEmail();

  // Extract data from responses
  const logs = logsData?.items || [];
  const pagination = logsData?.meta;

  const analytics = analyticsData || {
    totalSent: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalBounced: 0,
    deliveryRate: 0,
    openRate: 0,
  };

  const isLoading = logsLoading || analyticsLoading;

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        params.set(key, value.toString());
      }
    });

    const newUrl = `/dashboard/admin/communication/approvals?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  // Handle filter changes
  const updateFilters = (newFilters: Partial<ApprovalFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  };

  // Handle search
  const handleSearch = (search: string) => {
    updateFilters({ search });
  };

  // Handle status filter
  const handleStatusFilter = (status: string) => {
    updateFilters({ status: status === "all" ? "" : (status as EmailStatus) });
  };

  // Handle sort
  const handleSort = (sortValue: string) => {
    const [sortBy, sortOrder] = sortValue.split("-");
    updateFilters({
      sortBy: sortBy,
      sortOrder: sortOrder as "asc" | "desc",
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  // Handle resend email
  const handleResendEmail = async (logId: string) => {
    const log = logs.find((l) => l.id === logId);
    if (!log) return;

    try {
      await sendEmailMutation.mutateAsync({
        templateId: log.templateId,
        recipientEmail: log.recipientEmail,
        recipientName: log.recipientName,
        variables: {},
        orderId: log.orderId,
        trackOpens: true, // Add required trackOpens property
        trackClicks: true,
      });
    } catch (error) {
      console.error("Error resending email:", error);
    }
  };

  const getStatusBadge = (status: EmailStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "DELIVERED":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Delivered
          </Badge>
        );
      case "OPENED":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Eye className="h-3 w-3 mr-1" />
            Opened
          </Badge>
        );
      case "CLICKED":
        return (
          <Badge className="bg-purple-100 text-purple-800">
            <Eye className="h-3 w-3 mr-1" />
            Clicked
          </Badge>
        );
      case "BOUNCED":
      case "FAILED":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            {status === "BOUNCED" ? "Bounced" : "Failed"}
          </Badge>
        );
      case "SPAM":
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Spam
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDistanceToNow = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Design Approvals
            </h1>
            <p className="text-muted-foreground">
              Manage customer design approval communications
            </p>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
        <ApprovalTableSkeleton />
      </div>
    );
  }

  if (logsError) {
    return (
      <div className="container mx-auto py-10">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Failed to load approval data. Please try again.
            <Button
              variant="link"
              onClick={() => refetch()}
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Design Approvals
          </h1>
          <p className="text-muted-foreground">
            Manage customer design approval communications
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Link href="/dashboard/admin/communication/approvals/templates">
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Templates
            </Button>
          </Link>
          <Link href="/dashboard/admin/communication/approvals/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Send Approval
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Sent
                </p>
                <p className="text-2xl font-bold">{analytics.totalSent}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Delivery Rate
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics.deliveryRate}%
                </p>
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
                  Open Rate
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.openRate}%
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Bounced
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {analytics.totalBounced}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Email Communications</CardTitle>
          <CardDescription>
            View and manage all design approval email communications.
            {logs.length > 0 && (
              <span className="ml-2">Showing {logs.length} emails</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by recipient email..."
                className="w-full pl-8"
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filters.status || "all"}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="OPENED">Opened</SelectItem>
                  <SelectItem value="CLICKED">Clicked</SelectItem>
                  <SelectItem value="BOUNCED">Bounced</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onValueChange={handleSort}
              >
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                  <SelectItem value="status-asc">Status</SelectItem>
                  <SelectItem value="recipientEmail-asc">Recipient</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-10">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No emails found</h3>
              <p className="text-muted-foreground mb-4">
                {filters.search || filters.status
                  ? "Try adjusting your filters"
                  : "No approval emails have been sent yet"}
              </p>
              <Link href="/dashboard/admin/communication/approvals/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Send First Approval
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        {/* Order */}
                        <TableCell className="font-medium">
                          {log.orderId ? (
                            <Link
                              href={`/dashboard/admin/orders/${log.orderId}`}
                              className="hover:underline"
                            >
                              {log.orderId}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        {/* Recipient */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {log.recipientName
                                  ? log.recipientName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                  : log.recipientEmail[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              {log.recipientName && (
                                <p className="font-medium text-sm">
                                  {log.recipientName}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {log.recipientEmail}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Template */}
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">
                              {log.templateName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {log.subject}
                            </p>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>{getStatusBadge(log.status)}</TableCell>

                        {/* Sent */}
                        <TableCell>
                          <div>
                            <p className="text-sm">
                              {log.sentAt
                                ? new Date(log.sentAt).toLocaleDateString()
                                : "—"}
                            </p>
                            {log.sentAt && (
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(log.sentAt)}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        {/* Last Activity */}
                        <TableCell>
                          <div>
                            {log.openedAt ? (
                              <p className="text-sm">
                                Opened {formatDistanceToNow(log.openedAt)}
                              </p>
                            ) : log.clickedAt ? (
                              <p className="text-sm">
                                Clicked {formatDistanceToNow(log.clickedAt)}
                              </p>
                            ) : log.deliveredAt ? (
                              <p className="text-sm">
                                Delivered {formatDistanceToNow(log.deliveredAt)}
                              </p>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                —
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/admin/emails/logs/${log.id}`}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleResendEmail(log.id)}
                                disabled={sendEmailMutation.isPending}
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Resend email
                              </DropdownMenuItem>
                              {log.orderId && (
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/dashboard/admin/orders/${log.orderId}`}
                                  >
                                    View order
                                  </Link>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {pagination.currentPage} of {pagination.totalPages}{" "}
                    pages ({pagination.totalItems} total emails)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={pagination.currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={pagination.currentPage >= pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
