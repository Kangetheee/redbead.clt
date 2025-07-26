/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  Eye,
  Download,
  Repeat,
  Star,
  StarOff,
  MoreHorizontal,
  Package,
  Truck,
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  CreditCard,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useOrders } from "@/hooks/use-orders";
import { OrderResponse } from "@/lib/orders/types/orders.types";
import { GetOrdersDto } from "@/lib/orders/dto/orders.dto";
import { Meta } from "@/lib/shared/types";

interface OrderTableProps {
  filters?: GetOrdersDto;
  onFiltersChange?: (filters: GetOrdersDto) => void;
  showFilters?: boolean;
  compact?: boolean;
  pageSize?: number;
  baseUrl?: string; // For linking to order details
}

type SortField = "orderNumber" | "status" | "totalAmount" | "createdAt";
type SortDirection = "asc" | "desc";

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// Status configuration with proper typing
const STATUS_CONFIG = {
  PENDING: {
    color: "bg-yellow-100 text-yellow-800",
    label: "Pending",
    icon: Clock,
  },
  DESIGN_PENDING: {
    color: "bg-blue-100 text-blue-800",
    label: "Design Review",
    icon: AlertTriangle,
  },
  DESIGN_APPROVED: {
    color: "bg-green-100 text-green-800",
    label: "Design Approved",
    icon: CheckCircle,
  },
  DESIGN_REJECTED: {
    color: "bg-red-100 text-red-800",
    label: "Design Rejected",
    icon: AlertTriangle,
  },
  PAYMENT_PENDING: {
    color: "bg-orange-100 text-orange-800",
    label: "Payment Due",
    icon: CreditCard,
  },
  PAYMENT_CONFIRMED: {
    color: "bg-green-100 text-green-800",
    label: "Payment Confirmed",
    icon: CheckCircle,
  },
  PROCESSING: {
    color: "bg-purple-100 text-purple-800",
    label: "Processing",
    icon: Package,
  },
  PRODUCTION: {
    color: "bg-purple-100 text-purple-800",
    label: "In Production",
    icon: Package,
  },
  SHIPPED: {
    color: "bg-blue-100 text-blue-800",
    label: "Shipped",
    icon: Truck,
  },
  DELIVERED: {
    color: "bg-green-100 text-green-800",
    label: "Delivered",
    icon: CheckCircle,
  },
  CANCELLED: {
    color: "bg-red-100 text-red-800",
    label: "Cancelled",
    icon: AlertTriangle,
  },
  REFUNDED: {
    color: "bg-gray-100 text-gray-800",
    label: "Refunded",
    icon: AlertTriangle,
  },
} as const;

export default function OrderTable({
  filters = { page: 1, limit: 10 },
  onFiltersChange,
  showFilters = true,
  compact = false,
  pageSize = 10,
  baseUrl = "/orders",
}: OrderTableProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [statusFilter, setStatusFilter] = useState(filters.status || "all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "createdAt",
    direction: "desc",
  });
  const [favoriteOrders, setFavoriteOrders] = useState<Set<string>>(new Set());

  // Fetch orders using the hook
  const { data: ordersResult, isLoading } = useOrders({
    ...filters,
    limit: pageSize,
    search: searchTerm || undefined,
    status: statusFilter === "all" ? undefined : (statusFilter as any),
  });

  const orders: OrderResponse[] = ordersResult?.success
    ? ordersResult.data?.items || []
    : [];
  const pagination: Meta | null = ordersResult?.success
    ? ordersResult.data?.meta
    : null;

  const handleFiltersChange = (newFilters: Partial<GetOrdersDto>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    onFiltersChange?.(updatedFilters);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    handleFiltersChange({ search: value || undefined });
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    handleFiltersChange({
      status: status === "all" ? undefined : (status as any),
    });
  };

  const handleSort = (field: SortField) => {
    const direction =
      sortConfig.field === field && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ field, direction });
    // Note: Implement backend sorting if needed
    handleFiltersChange({
      sortBy: field,
      sortDirection: direction,
    } as any);
  };

  const handlePageChange = (page: number) => {
    handleFiltersChange({ page });
  };

  const toggleFavorite = (orderId: string) => {
    setFavoriteOrders((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(orderId)) {
        newFavorites.delete(orderId);
      } else {
        newFavorites.add(orderId);
      }
      return newFavorites;
    });
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
      icon: Clock,
    };

    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const getActionStatus = (order: OrderResponse) => {
    if (order.status === "DESIGN_PENDING") {
      return {
        required: true,
        action: "Review Design",
        description: "Design approval needed",
      };
    }
    if (order.status === "PAYMENT_PENDING") {
      return {
        required: true,
        action: "Complete Payment",
        description: "Payment required",
      };
    }
    if (order.status === "SHIPPED" && order.trackingNumber) {
      return {
        required: false,
        action: "Track Package",
        description: "Package in transit",
      };
    }
    return null;
  };

  const canReorder = (order: OrderResponse) => {
    return order.status === "DELIVERED";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            <span>Loading orders...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
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
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="DESIGN_PENDING">Design Review</SelectItem>
                  <SelectItem value="PAYMENT_PENDING">Payment Due</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 3 Months</SelectItem>
                  <SelectItem value="1y">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        {!compact && (
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              {pagination?.totalItems || 0} orders found
            </CardDescription>
          </CardHeader>
        )}

        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No orders found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "No orders to display"}
              </p>
              <Button asChild>
                <Link href={`${baseUrl}/create`}>
                  <Package className="mr-2 h-4 w-4" />
                  Create Order
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Star className="h-4 w-4" />
                  </TableHead>

                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("orderNumber")}
                      className="h-auto p-0 font-medium"
                    >
                      Order #{getSortIcon("orderNumber")}
                    </Button>
                  </TableHead>

                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("status")}
                      className="h-auto p-0 font-medium"
                    >
                      Status
                      {getSortIcon("status")}
                    </Button>
                  </TableHead>

                  <TableHead>Items</TableHead>

                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("totalAmount")}
                      className="h-auto p-0 font-medium"
                    >
                      Total
                      {getSortIcon("totalAmount")}
                    </Button>
                  </TableHead>

                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("createdAt")}
                      className="h-auto p-0 font-medium"
                    >
                      Date
                      {getSortIcon("createdAt")}
                    </Button>
                  </TableHead>

                  <TableHead>Action</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {orders.map((order) => {
                  const actionStatus = getActionStatus(order);
                  const isFavorited = favoriteOrders.has(order.id);

                  return (
                    <TableRow key={order.id}>
                      {/* Favorite */}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(order.id)}
                        >
                          {isFavorited ? (
                            <Star className="h-4 w-4 fill-current text-yellow-500" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>

                      {/* Order Number */}
                      <TableCell className="font-medium">
                        <Link
                          href={`${baseUrl}/${order.id}`}
                          className="hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <div className="space-y-1">
                          {getStatusBadge(order.status)}
                          {order.urgencyLevel &&
                            order.urgencyLevel !== "NORMAL" && (
                              <Badge variant="destructive" className="text-xs">
                                {order.urgencyLevel}
                              </Badge>
                            )}
                        </div>
                      </TableCell>

                      {/* Items */}
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {order.orderItems.length} items
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.orderItems.reduce(
                              (sum, item) => sum + item.quantity,
                              0
                            )}{" "}
                            total qty
                          </p>
                        </div>
                      </TableCell>

                      {/* Total */}
                      <TableCell className="font-medium">
                        ${order.totalAmount.toFixed(2)}
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">
                            {format(new Date(order.createdAt), "MMM dd, yyyy")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(order.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </TableCell>

                      {/* Action Required */}
                      <TableCell>
                        {actionStatus ? (
                          <div className="space-y-1">
                            <Button
                              size="sm"
                              variant={
                                actionStatus.required ? "default" : "outline"
                              }
                              asChild
                            >
                              <Link href={`${baseUrl}/${order.id}`}>
                                {actionStatus.required && (
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                )}
                                {actionStatus.action}
                              </Link>
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              {actionStatus.description}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            -
                          </span>
                        )}
                      </TableCell>

                      {/* Actions Menu */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>

                            <DropdownMenuItem asChild>
                              <Link href={`${baseUrl}/${order.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>

                            {order.trackingNumber && (
                              <DropdownMenuItem asChild>
                                <Link href={`${baseUrl}/${order.id}/tracking`}>
                                  <Truck className="mr-2 h-4 w-4" />
                                  Track Package
                                </Link>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download Invoice
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {canReorder(order) && (
                              <DropdownMenuItem asChild>
                                <Link href={`${baseUrl}/${order.id}/reorder`}>
                                  <Repeat className="mr-2 h-4 w-4" />
                                  Reorder
                                </Link>
                              </DropdownMenuItem>
                            )}

                            {order.trackingUrl && (
                              <DropdownMenuItem asChild>
                                <a
                                  href={order.trackingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  Carrier Site
                                </a>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => toggleFavorite(order.id)}
                            >
                              {isFavorited ? (
                                <>
                                  <StarOff className="mr-2 h-4 w-4" />
                                  Remove Favorite
                                </>
                              ) : (
                                <>
                                  <Star className="mr-2 h-4 w-4" />
                                  Add to Favorites
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{" "}
              {Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                pagination.totalItems
              )}{" "}
              of {pagination.totalItems} orders
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={
                          pagination.currentPage === page
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  }
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Action Required Summary */}
      {orders.some((order) => getActionStatus(order)?.required) && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>
              {
                orders.filter((order) => getActionStatus(order)?.required)
                  .length
              }{" "}
              orders
            </strong>{" "}
            require attention. Please review and take the necessary actions.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
