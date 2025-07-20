/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  ChevronDown,
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Mail,
  Send,
  Eye,
  RefreshCw,
  MoreHorizontal,
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

// Import the real hooks and types
import {
  useDesignApprovalStats,
  useUpdateDesignApproval,
} from "@/hooks/use-design-approval";
import { useOrders } from "@/hooks/use-orders";
import { DesignApproval } from "@/lib/design-approval/types/design-approval.types";
import { DesignApprovalStatus } from "@/lib/design-approval/enum/design-approval.enum";

interface ApprovalFilters {
  page: number;
  limit: number;
  search: string;
  status: string;
  urgency: string;
  sortBy: string;
  sortDirection: string;
}

function ApprovalTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Design</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Communication</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-20" />
                </div>
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
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
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
  const [deleteApprovalId, setDeleteApprovalId] = useState<string | null>(null);

  // Parse search params with defaults
  const [filters, setFilters] = useState<ApprovalFilters>({
    page: parseInt(searchParams.get("page") || "1"),
    limit: parseInt(searchParams.get("limit") || "10"),
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
    urgency: searchParams.get("urgency") || "",
    sortBy: searchParams.get("sortBy") || "requestedAt",
    sortDirection: searchParams.get("sortDirection") || "desc",
  });

  // Use real hooks for data fetching
  const { data: statsData, isLoading: statsLoading } = useDesignApprovalStats();

  // Fix: Remove status field and use proper type for designApprovalStatus
  const {
    data: ordersData,
    isLoading: ordersLoading,
    refetch,
  } = useOrders({
    page: filters.page,
    limit: filters.limit,
    search: filters.search || undefined,
    // Remove this line as it causes type issues: status: filters.status || undefined,
    // Filter for orders that need design approval - ensure the status is a valid DesignApprovalStatus
    designApprovalStatus:
      filters.status &&
      ["PENDING", "APPROVED", "REJECTED", "EXPIRED"].includes(filters.status)
        ? (filters.status as DesignApprovalStatus)
        : undefined,
  });

  const updateApprovalMutation = useUpdateDesignApproval();

  // Extract data from responses
  const stats = statsData || {
    total: 0,
    pending: 0,
    overdue: 0,
    approved: 0,
    rejected: 0,
  };

  const orders = ordersData?.success ? ordersData.data?.items || [] : [];
  const pagination = ordersData?.success ? ordersData.data?.meta : null;

  // Convert orders to approvals format for compatibility
  // Fix: Properly type the conversion and handle potential type mismatches
  const approvals: DesignApproval[] = useMemo(() => {
    return orders
      .filter((order) => order.designApproval)
      .map((order) => {
        const orderDesignApproval = order.designApproval!;
        // Convert order DesignApproval to design-approval DesignApproval format
        // Use optional chaining and fallbacks for properties that might not exist in orders module
        return {
          id: orderDesignApproval.id,
          orderId: orderDesignApproval.orderId,
          orderNumber: orderDesignApproval.orderNumber,
          designId: orderDesignApproval.designId,
          status: orderDesignApproval.status as DesignApprovalStatus,
          customerEmail: orderDesignApproval.customerEmail,
          previewImages: orderDesignApproval.previewImages,
          designSummary: orderDesignApproval.designSummary,
          requestedAt: orderDesignApproval.requestedAt,
          respondedAt: orderDesignApproval.respondedAt,
          approvedBy: orderDesignApproval.approvedBy,
          rejectedBy: (orderDesignApproval as any).rejectedBy,
          rejectionReason: orderDesignApproval.rejectionReason,
          expiresAt: orderDesignApproval.expiresAt,
          isExpired: orderDesignApproval.isExpired,
          canApprove: orderDesignApproval.canApprove,
          canReject: orderDesignApproval.canReject,
          timeRemaining: orderDesignApproval.timeRemaining,
          comments: (orderDesignApproval as any).comments,
          requestRevision: (orderDesignApproval as any).requestRevision,
          message: (orderDesignApproval as any).message,
          orderDetails: (orderDesignApproval as any).orderDetails,
          metadata: (orderDesignApproval as any).metadata,
        } as DesignApproval;
      })
      .filter((approval) => {
        // Apply filters
        if (filters.status && approval.status !== filters.status) return false;
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          return (
            approval.orderNumber.toLowerCase().includes(searchLower) ||
            approval.customerEmail.toLowerCase().includes(searchLower) ||
            approval.orderDetails?.customer.name
              .toLowerCase()
              .includes(searchLower)
          );
        }
        return true;
      });
  }, [orders, filters]);

  const isLoading = ordersLoading || statsLoading;

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
    updateFilters({ status: status === "all" ? "" : status });
  };

  // Handle urgency filter
  const handleUrgencyFilter = (urgency: string) => {
    updateFilters({ urgency: urgency === "all" ? "" : urgency });
  };

  // Handle sort
  const handleSort = (sortValue: string) => {
    const [sortBy, sortDirection] = sortValue.split("-");
    updateFilters({
      sortBy: sortBy,
      sortDirection: sortDirection,
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  // Handle delete
  const handleDelete = async (approvalId: string) => {
    try {
      // Find the order ID for this approval
      const order = orders.find((o) => o.designApproval?.id === approvalId);
      if (order) {
        await updateApprovalMutation.mutateAsync({
          orderId: order.id,
          data: { status: "CANCELLED" as DesignApprovalStatus },
        });
      }
      setDeleteApprovalId(null);
      refetch();
    } catch (error) {
      console.error("Error cancelling approval:", error);
    }
  };

  const getStatusBadge = (status: DesignApprovalStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUrgencyBadge = (urgency?: string) => {
    switch (urgency) {
      case "EMERGENCY":
        return (
          <Badge variant="destructive" className="text-xs">
            Emergency
          </Badge>
        );
      case "RUSH":
        return (
          <Badge className="bg-orange-100 text-orange-800 text-xs">Rush</Badge>
        );
      case "EXPEDITED":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
            Expedited
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            Normal
          </Badge>
        );
    }
  };

  // Calculate overdue count
  const overdueCount = approvals.filter(
    (approval) =>
      approval.status === "PENDING" && new Date(approval.expiresAt) < new Date()
  ).length;

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Design Approvals
            </h1>
            <p className="text-muted-foreground">
              Manage customer design approval requests
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

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Design Approvals
          </h1>
          <p className="text-muted-foreground">
            Manage customer design approval requests
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
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
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
                  Pending
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
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
                  {overdueCount}
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
                  Approved
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.approved}
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
                  Rejected
                </p>
                <p className="text-2xl font-bold text-gray-600">
                  {stats.rejected}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {overdueCount > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{overdueCount} approvals are overdue</strong> - These
            require immediate attention to prevent delivery delays.
            <Button
              variant="link"
              size="sm"
              className="ml-2 text-red-800 p-0 h-auto"
              onClick={() => handleStatusFilter("PENDING")}
            >
              View overdue approvals
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Design Approval Requests</CardTitle>
          <CardDescription>
            View and manage all design approval requests.
            {approvals.length > 0 && (
              <span className="ml-2">Showing {approvals.length} requests</span>
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
                placeholder="Search by order number, customer name, or email..."
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
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={`${filters.sortBy}-${filters.sortDirection}`}
                onValueChange={handleSort}
              >
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="requestedAt-desc">Newest First</SelectItem>
                  <SelectItem value="requestedAt-asc">Oldest First</SelectItem>
                  <SelectItem value="expiresAt-asc">Expires Soon</SelectItem>
                  <SelectItem value="status-asc">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {approvals.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                {filters.search || filters.status
                  ? "No approvals found matching your criteria"
                  : "No approval requests found"}
              </p>
              <Link href="/dashboard/admin/communication/approvals/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Send First Approval Request
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
                      <TableHead>Customer</TableHead>
                      <TableHead>Design</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvals.map((approval) => (
                      <TableRow key={approval.id}>
                        {/* Order */}
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/admin/orders/${approval.orderId}`}
                              className="hover:underline"
                            >
                              {approval.orderNumber}
                            </Link>
                          </div>
                          {approval.orderDetails && (
                            <div className="text-xs text-muted-foreground">
                              ${approval.orderDetails.totalAmount.toFixed(2)}
                            </div>
                          )}
                        </TableCell>

                        {/* Customer */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 relative rounded-full overflow-hidden bg-muted">
                              <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-xs">
                                {approval.orderDetails?.customer.name
                                  ? approval.orderDetails.customer.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                  : "U"}
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {approval.orderDetails?.customer.name ||
                                  "Unknown Customer"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {approval.customerEmail}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Design */}
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">
                              {approval.designSummary.productName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {approval.designSummary.quantity}
                              {approval.designSummary.material &&
                                ` • ${approval.designSummary.material}`}
                            </p>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>{getStatusBadge(approval.status)}</TableCell>

                        {/* Requested */}
                        <TableCell>
                          <div>
                            <p className="text-sm">
                              {new Date(
                                approval.requestedAt
                              ).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(
                                approval.requestedAt
                              ).toLocaleTimeString()}
                            </p>
                          </div>
                        </TableCell>

                        {/* Expires */}
                        <TableCell>
                          <div>
                            <p className="text-sm">
                              {new Date(
                                approval.expiresAt
                              ).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(
                                approval.expiresAt
                              ).toLocaleTimeString()}
                            </p>
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
                                  href={`/dashboard/admin/communication/approvals/${approval.id}`}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/admin/communication/approvals/${approval.id}/edit`}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit settings
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/admin/orders/${approval.orderId}`}
                                >
                                  View order
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {approval.status === "PENDING" && (
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onSelect={() =>
                                    setDeleteApprovalId(approval.id)
                                  }
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Cancel request
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteApprovalId}
        onOpenChange={() => setDeleteApprovalId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently cancel the
              approval request and notify the customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteApprovalId && handleDelete(deleteApprovalId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
