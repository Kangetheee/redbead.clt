/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  Table as TableType,
  Row,
  Header,
  Cell,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Edit,
  Package,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Clock,
  User,
  Loader2,
  AlertTriangle,
  Download,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";

import { useOrders } from "@/hooks/use-orders";
import {
  GetOrdersDto,
  ORDER_STATUS,
  URGENCY_LEVELS,
  DESIGN_APPROVAL_STATUS,
} from "@/lib/orders/dto/orders.dto";
import { OrderResponse, OrderFilters } from "@/lib/orders/types/orders.types";

interface OrdersListProps {
  filters: OrderFilters;
  onFiltersChange: (filters: OrderFilters) => void;
  selectable?: boolean;
  selectedOrders: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  compact?: boolean;
}

export default function OrdersList({
  filters,
  onFiltersChange,
  selectable = false,
  selectedOrders,
  onSelectionChange,
  compact = false,
}: OrdersListProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Convert filters to GetOrdersDto format
  const queryParams: GetOrdersDto = {
    page: currentPage,
    limit: compact ? 5 : 10,
    status: filters.status as any,
    designApprovalStatus: filters.designApprovalStatus as any,
    minTotal: filters.minTotal,
    maxTotal: filters.maxTotal,
    startDate: filters.startDate,
    endDate: filters.endDate,
    search: filters.search,
    urgencyLevel: filters.urgencyLevel as any,
    templateId: filters.templateId,
  };

  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
  } = useOrders(queryParams);

  const orders = ordersData?.items || [];
  const totalOrders = ordersData?.meta?.totalItems || 0;
  const totalPages = ordersData?.meta?.totalPages || 1;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      CONFIRMED: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
      DESIGN_PENDING: {
        color: "bg-blue-100 text-blue-800",
        label: "Design Pending",
      },
      DESIGN_APPROVED: {
        color: "bg-green-100 text-green-800",
        label: "Design Approved",
      },
      DESIGN_REJECTED: {
        color: "bg-red-100 text-red-800",
        label: "Design Rejected",
      },
      PAYMENT_PENDING: {
        color: "bg-orange-100 text-orange-800",
        label: "Payment Pending",
      },
      PAYMENT_CONFIRMED: {
        color: "bg-green-100 text-green-800",
        label: "Payment Confirmed",
      },
      PROCESSING: {
        color: "bg-purple-100 text-purple-800",
        label: "Processing",
      },
      PRODUCTION: {
        color: "bg-purple-100 text-purple-800",
        label: "In Production",
      },
      SHIPPED: { color: "bg-blue-100 text-blue-800", label: "Shipped" },
      DELIVERED: { color: "bg-green-100 text-green-800", label: "Delivered" },
      CANCELLED: { color: "bg-red-100 text-red-800", label: "Cancelled" },
      REFUNDED: { color: "bg-gray-100 text-gray-800", label: "Refunded" },
    }[status] || { color: "bg-gray-100 text-gray-800", label: status };

    return <Badge className={statusConfig.color}>{statusConfig.label}</Badge>;
  };

  const getUrgencyBadge = (urgency?: string) => {
    if (!urgency || urgency === "NORMAL") return null;

    const urgencyConfig = {
      EXPEDITED: { color: "bg-orange-100 text-orange-800", label: "Expedited" },
      RUSH: { color: "bg-red-100 text-red-800", label: "Rush" },
      EMERGENCY: { color: "bg-red-200 text-red-900", label: "Emergency" },
    }[urgency];

    if (!urgencyConfig) return null;

    return (
      <Badge className={`${urgencyConfig.color} text-xs px-2 py-1`}>
        {urgencyConfig.label}
      </Badge>
    );
  };

  const formatOrderItems = (orderItems: any[]) => {
    if (!Array.isArray(orderItems)) return [];

    return orderItems.map((item, index) => {
      if (typeof item === "string") {
        return { id: item, templateId: "Unknown", quantity: 1 };
      }
      return item;
    });
  };

  const columns: ColumnDef<OrderResponse>[] = [
    ...(selectable
      ? [
          {
            id: "select",
            header: ({ table }: { table: TableType<OrderResponse> }) => (
              <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) =>
                  table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
              />
            ),
            cell: ({ row }: { row: Row<OrderResponse> }) => (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
              />
            ),
            enableSorting: false,
            enableHiding: false,
          },
        ]
      : []),
    {
      accessorKey: "orderNumber",
      header: "Order #",
      cell: ({ row }: { row: Row<OrderResponse> }) => {
        const order = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{order.orderNumber}</span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(order.createdAt), "MMM dd, yyyy")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "customerId",
      header: "Customer",
      cell: ({ row }: { row: Row<OrderResponse> }) => {
        const customerId = row.getValue("customerId") as string;
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{customerId || "Guest"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: Row<OrderResponse> }) => {
        const status = row.getValue("status") as string;
        const urgency = row.original.urgencyLevel;
        return (
          <div className="flex flex-col gap-1">
            {getStatusBadge(status)}
            {getUrgencyBadge(urgency)}
          </div>
        );
      },
    },
    ...(!compact
      ? [
          {
            accessorKey: "orderItems",
            header: "Items",
            cell: ({ row }: { row: Row<OrderResponse> }) => {
              const items = formatOrderItems(row.original.orderItems);
              const totalQuantity = items.reduce(
                (sum, item) => sum + (item.quantity || 0),
                0
              );
              return (
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{totalQuantity} items</span>
                </div>
              );
            },
          },
          {
            accessorKey: "designApprovalStatus",
            header: "Design",
            cell: ({ row }: { row: Row<OrderResponse> }) => {
              const status = row.original.designApprovalStatus;
              const required = row.original.designApprovalRequired;

              if (!required) {
                return (
                  <span className="text-muted-foreground">Not required</span>
                );
              }

              if (!status) {
                return <Badge variant="outline">Pending</Badge>;
              }

              const statusConfig: Record<
                string,
                { color: string; label: string }
              > = {
                PENDING: {
                  color: "bg-yellow-100 text-yellow-800",
                  label: "Pending",
                },
                APPROVED: {
                  color: "bg-green-100 text-green-800",
                  label: "Approved",
                },
                REJECTED: {
                  color: "bg-red-100 text-red-800",
                  label: "Rejected",
                },
                EXPIRED: {
                  color: "bg-gray-100 text-gray-800",
                  label: "Expired",
                },
                CANCELLED: {
                  color: "bg-gray-100 text-gray-800",
                  label: "Cancelled",
                },
              };

              const config = statusConfig[status] || {
                color: "bg-gray-100 text-gray-800",
                label: status,
              };

              return <Badge className={config.color}>{config.label}</Badge>;
            },
          },
        ]
      : []),
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }: { row: Row<OrderResponse> }) => {
        const amount = row.getValue("totalAmount") as number;
        return (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">${amount.toFixed(2)}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }: { row: Row<OrderResponse> }) => {
        const order = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/orders/${order.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Order
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(order.id)}
              >
                Copy Order ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: orders,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      rowSelection: selectable
        ? selectedOrders.reduce((acc, id) => ({ ...acc, [id]: true }), {})
        : {},
    },
    onRowSelectionChange: (updater) => {
      if (typeof updater === "function") {
        const currentSelection = selectedOrders.reduce(
          (acc, id) => ({ ...acc, [id]: true }),
          {}
        );
        const newSelection = updater(currentSelection);
        const newSelectedIds = Object.keys(newSelection).filter(
          (key) => newSelection[key]
        );
        onSelectionChange(newSelectedIds);
      }
    },
    enableRowSelection: selectable,
  });

  const handleFilterChange = (key: keyof OrderFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-red-600 mb-4">Failed to load orders</p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {!compact && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>Filter orders by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Order number, tracking..."
                    value={filters.search || ""}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.status || ""}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {ORDER_STATUS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select
                  value={filters.urgencyLevel || ""}
                  onValueChange={(value) =>
                    handleFilterChange("urgencyLevel", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All levels</SelectItem>
                    {URGENCY_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0) + level.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="designApproval">Design Approval</Label>
                <Select
                  value={filters.designApprovalStatus || ""}
                  onValueChange={(value) =>
                    handleFilterChange("designApprovalStatus", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {DESIGN_APPROVAL_STATUS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate || ""}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate || ""}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minTotal">Min Total</Label>
                <Input
                  id="minTotal"
                  type="number"
                  placeholder="0.00"
                  value={filters.minTotal || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "minTotal",
                      parseFloat(e.target.value) || undefined
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTotal">Max Total</Label>
                <Input
                  id="maxTotal"
                  type="number"
                  placeholder="1000.00"
                  value={filters.maxTotal || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "maxTotal",
                      parseFloat(e.target.value) || undefined
                    )
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              {totalOrders} orders found
              {selectable && selectedOrders.length > 0 && (
                <span className="ml-2">({selectedOrders.length} selected)</span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {!compact && (
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading orders...</span>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            if (!selectable) {
                              router.push(`/orders/${row.original.id}`);
                            }
                          }}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          No orders found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * (compact ? 5 : 10) + 1} to{" "}
                    {Math.min(currentPage * (compact ? 5 : 10), totalOrders)} of{" "}
                    {totalOrders} orders
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage <= 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage >= totalPages || isLoading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
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
