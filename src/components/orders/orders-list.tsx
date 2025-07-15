/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Package,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
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
import { Label } from "@/components/ui/label";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useOrders } from "@/hooks/use-orders";
import { GetOrdersDto } from "@/lib/orders/dto/orders.dto";
import { OrderResponse } from "@/lib/orders/types/orders.types";
import OrderStatusBadge from "./order-status-badge";

interface OrdersListProps {
  filters?: GetOrdersDto;
  onFiltersChange?: (filters: GetOrdersDto) => void;
  selectable?: boolean;
  selectedOrders?: string[];
  onSelectionChange?: (orderIds: string[]) => void;
  showActions?: boolean;
  compact?: boolean;
}

type SortField =
  | "orderNumber"
  | "status"
  | "totalAmount"
  | "createdAt"
  | "customerId";
type SortDirection = "asc" | "desc";

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export default function OrdersList({
  filters = { page: 1, limit: 20 },
  onFiltersChange,
  selectable = false,
  selectedOrders = [],
  onSelectionChange,
  showActions = true,
  compact = false,
}: OrdersListProps) {
  const [localFilters, setLocalFilters] = useState<GetOrdersDto>(filters);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "createdAt",
    direction: "desc",
  });

  const selectAllRef = useRef<HTMLButtonElement>(null);

  // Fetch orders using the hook
  const { data: ordersData, isLoading, refetch } = useOrders(localFilters);

  const orders: OrderResponse[] = ordersData?.success
    ? ordersData.data?.items || []
    : [];
  const pagination = ordersData?.success ? ordersData.data?.meta : null;

  // Handle filter changes
  const updateFilters = (newFilters: Partial<GetOrdersDto>) => {
    const updatedFilters = { ...localFilters, ...newFilters, page: 1 };
    setLocalFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    const direction =
      sortConfig.field === field && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ field, direction });

    // Apply sorting to filters if backend supports it
    // updateFilters({ sortBy: field, sortDirection: direction });
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    updateFilters({ search: value || undefined });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  const handlePageSizeChange = (limit: number) => {
    updateFilters({ limit, page: 1 });
  };

  // Handle selection
  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(orders.map((order) => order.id));
    }
  };

  const handleSelectOrder = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      onSelectionChange?.(selectedOrders.filter((id) => id !== orderId));
    } else {
      onSelectionChange?.([...selectedOrders, orderId]);
    }
  };

  // Sort orders client-side for demo (normally done server-side)
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      let aValue: any = a[sortConfig.field];
      let bValue: any = b[sortConfig.field];

      // Handle different data types
      if (sortConfig.field === "createdAt") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortConfig.field === "totalAmount") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [orders, sortConfig]);

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

  const allSelected =
    selectedOrders.length === orders.length && orders.length > 0;
  const someSelected =
    selectedOrders.length > 0 && selectedOrders.length < orders.length;

  useEffect(() => {
    if (selectAllRef.current) {
      const checkbox = selectAllRef.current.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      if (checkbox) {
        checkbox.indeterminate = someSelected;
      }
    }
  }, [someSelected]);

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
      {/* Search and Filters */}
      {!compact && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Orders</CardTitle>
                <CardDescription>
                  Manage and track all customer orders
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button size="sm" asChild>
                  <Link href="/dashboard/customer/orders/new">
                    <Plus className="h-4 w-4 mr-2" />
                    New Order
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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

              <Select
                value={localFilters.status || "all"}
                onValueChange={(value) =>
                  updateFilters({
                    status: value === "all" ? undefined : (value as any),
                  })
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={localFilters.limit?.toString() || "20"}
                onValueChange={(value) => handlePageSizeChange(Number(value))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No orders found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || localFilters.status
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first order"}
              </p>
              <Button asChild>
                <Link href="/dashboard/customer/orders/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Order
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    {selectable && (
                      <TableHead className="w-[50px]">
                        <Checkbox
                          ref={selectAllRef}
                          checked={allSelected}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                    )}

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

                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("customerId")}
                        className="h-auto p-0 font-medium"
                      >
                        Customer
                        {getSortIcon("customerId")}
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

                    {showActions && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {sortedOrders.map((order) => (
                    <TableRow key={order.id}>
                      {selectable && (
                        <TableCell>
                          <Checkbox
                            checked={selectedOrders.includes(order.id)}
                            onCheckedChange={() => handleSelectOrder(order.id)}
                          />
                        </TableCell>
                      )}

                      <TableCell className="font-medium">
                        <Link
                          href={`/dashboard/customer/orders/${order.id}`}
                          className="hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </TableCell>

                      <TableCell>
                        <OrderStatusBadge status={order.status} size="sm" />
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customerId}</p>
                          {/* {order.customerPhone && (
                            <p className="text-sm text-muted-foreground">
                              {order.customerPhone}
                            </p>
                          )} */}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{order.orderItems.length}</span>
                        </div>
                      </TableCell>

                      <TableCell className="font-medium">
                        ${order.totalAmount.toFixed(2)}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {format(new Date(order.createdAt), "MMM dd, yyyy")}
                      </TableCell>

                      {showActions && (
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
                                <Link
                                  href={`/dashboard/customer/orders/${order.id}`}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/customer/orders/${order.id}/edit`}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Order
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Cancel Order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing{" "}
                    {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
                    to{" "}
                    {Math.min(
                      pagination.currentPage * pagination.itemsPerPage,
                      pagination.totalPages
                    )}{" "}
                    of {pagination.totalPages} results
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.currentPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={pagination.currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
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
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Selection Summary */}
      {selectable && selectedOrders.length > 0 && (
        <Alert>
          <Package className="h-4 w-4" />
          <AlertDescription>
            {selectedOrders.length} order{selectedOrders.length > 1 ? "s" : ""}{" "}
            selected
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
