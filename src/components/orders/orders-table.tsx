/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
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
  Filter,
  Search,
  ArrowUpDown,
  Palette,
  Factory,
  PackageCheck,
  ShoppingCart,
  Copy,
  FileText,
  Phone,
  Mail,
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
import { DataTable } from "@/components/ui/data-table";
import { toast } from "sonner";

import { OrderResponse } from "@/lib/orders/types/orders.types";
import { GetOrdersDto } from "@/lib/orders/dto/orders.dto";
import { useOrders } from "@/hooks/use-orders";
import { formatCurrency } from "@/lib/utils";

// Define the order statuses based on your types
const ORDER_STATUS = [
  "PENDING",
  "CONFIRMED",
  "DESIGN_PENDING",
  "DESIGN_APPROVED",
  "DESIGN_REJECTED",
  "PAYMENT_PENDING",
  "PAYMENT_CONFIRMED",
  "PROCESSING",
  "PRODUCTION",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

const URGENCY_LEVELS = ["NORMAL", "EXPEDITED", "RUSH", "EMERGENCY"] as const;

interface OrderTableProps {
  filters?: GetOrdersDto;
  onFiltersChange?: (filters: GetOrdersDto) => void;
  showFilters?: boolean;
  compact?: boolean;
  pageSize?: number;
  onOrderClick?: (orderId: string) => void;
}

// Status configuration with proper typing
const STATUS_CONFIG = {
  PENDING: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    label: "Pending",
    icon: Clock,
  },
  CONFIRMED: {
    color: "bg-green-100 text-green-800 border-green-200",
    label: "Confirmed",
    icon: CheckCircle,
  },
  DESIGN_PENDING: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    label: "Design Review",
    icon: Palette,
  },
  DESIGN_APPROVED: {
    color: "bg-green-100 text-green-800 border-green-200",
    label: "Design Approved",
    icon: CheckCircle,
  },
  DESIGN_REJECTED: {
    color: "bg-red-100 text-red-800 border-red-200",
    label: "Design Rejected",
    icon: AlertTriangle,
  },
  PAYMENT_PENDING: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    label: "Payment Due",
    icon: CreditCard,
  },
  PAYMENT_CONFIRMED: {
    color: "bg-green-100 text-green-800 border-green-200",
    label: "Payment Confirmed",
    icon: CheckCircle,
  },
  PROCESSING: {
    color: "bg-purple-100 text-purple-800 border-purple-200",
    label: "Processing",
    icon: Package,
  },
  PRODUCTION: {
    color: "bg-purple-100 text-purple-800 border-purple-200",
    label: "In Production",
    icon: Factory,
  },
  SHIPPED: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    label: "Shipped",
    icon: Truck,
  },
  DELIVERED: {
    color: "bg-green-100 text-green-800 border-green-200",
    label: "Delivered",
    icon: PackageCheck,
  },
  CANCELLED: {
    color: "bg-red-100 text-red-800 border-red-200",
    label: "Cancelled",
    icon: AlertTriangle,
  },
  REFUNDED: {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    label: "Refunded",
    icon: AlertTriangle,
  },
} as const;

export default function OrderTable({
  filters = {},
  onFiltersChange,
  showFilters = true,
  compact = false,
  pageSize = 10,
  onOrderClick,
}: OrderTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [statusFilter, setStatusFilter] = useState<string>(
    filters.status || "all"
  );
  const [favoriteOrders, setFavoriteOrders] = useState<Set<string>>(new Set());

  // Build current filters for the query
  const queryFilters: GetOrdersDto = {
    ...filters,
    search: searchTerm || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  };

  // Fetch orders using the hook
  const {
    data: ordersData,
    isLoading,
    error,
    isRefetching,
  } = useOrders(queryFilters);

  // Extract orders from the response structure
  const orders: OrderResponse[] = ordersData?.items || [];
  const totalItems = ordersData?.meta?.itemCount || 0;
  const pageCount = ordersData?.meta?.pageCount || 0;

  // Helper functions
  const handleFiltersChange = (newFilters: Partial<GetOrdersDto>) => {
    const updatedFilters = { ...filters, ...newFilters };
    onFiltersChange?.(updatedFilters);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    handleFiltersChange({ search: value || undefined });
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    handleFiltersChange({
      status: status === "all" ? undefined : status,
    });
  };

  const toggleFavorite = (orderId: string) => {
    setFavoriteOrders((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(orderId)) {
        newFavorites.delete(orderId);
        toast.success("Removed from favorites");
      } else {
        newFavorites.add(orderId);
        toast.success("Added to favorites");
      }
      return newFavorites;
    });
  };

  const getStatusBadge = (status: string) => {
    const config =
      STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ||
      STATUS_CONFIG.PENDING;
    const Icon = config.icon;

    return (
      <Badge className={config.color} variant="outline">
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getActionStatus = (order: OrderResponse) => {
    if (order.status === "DESIGN_PENDING") {
      return {
        required: true,
        action: "Review Design",
        description: "Design approval needed",
        href: `/orders/${order.id}/design-approval`,
      };
    }
    if (order.status === "PAYMENT_PENDING") {
      return {
        required: true,
        action: "Complete Payment",
        description: "Payment required",
        href: `/orders/${order.id}/payment`,
      };
    }
    if (order.status === "SHIPPED") {
      return {
        required: false,
        action: "Track Package",
        description: "Package in transit",
        href: `/orders/${order.id}/tracking`,
      };
    }
    return null;
  };

  const canReorder = (order: OrderResponse) => {
    return order.status === "DELIVERED";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Define table columns
  const columns: ColumnDef<OrderResponse>[] = useMemo(
    () => [
      // Favorite column
      {
        id: "favorite",
        header: () => <Star className="h-4 w-4" />,
        cell: ({ row }) => {
          const order = row.original;
          const isFavorited = favoriteOrders.has(order.id);

          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(order.id);
              }}
            >
              {isFavorited ? (
                <Star className="h-4 w-4 fill-current text-yellow-500" />
              ) : (
                <StarOff className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          );
        },
        enableSorting: false,
        size: 50,
      },

      // Order Number column
      {
        accessorKey: "orderNumber",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Order #
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const order = row.original;
          return (
            <div className="space-y-1">
              <Link
                href={`/orders/${order.id}`}
                className="font-medium hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {order.orderNumber}
              </Link>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(order.orderNumber);
                  }}
                  className="h-4 w-4 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        },
      },

      // Status column
      {
        accessorKey: "status",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const order = row.original;
          return getStatusBadge(order.status);
        },
      },

      // Items column
      {
        id: "items",
        header: "Items",
        cell: ({ row }) => {
          const order = row.original;
          const totalQuantity = order.orderItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );

          return (
            <div className="space-y-1">
              <p className="font-medium">{order.orderItems.length} items</p>
              <p className="text-sm text-muted-foreground">
                {totalQuantity} total qty
              </p>
            </div>
          );
        },
        enableSorting: false,
      },

      // Total Amount column
      {
        accessorKey: "totalAmount",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Total
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const amount = row.getValue("totalAmount") as number;
          return (
            <span className="font-medium">
              {formatCurrency(amount) || "0.00"}
            </span>
          );
        },
      },

      // Date column
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = row.getValue("createdAt") as string;
          return (
            <div className="space-y-1">
              <p className="text-sm">
                {format(new Date(date), "MMM dd, yyyy")}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(date), { addSuffix: true })}
              </p>
            </div>
          );
        },
      },

      // Design Approval Status column
      {
        id: "designApproval",
        header: "Design Status",
        cell: ({ row }) => {
          const order = row.original;

          if (!order.designApprovalRequired) {
            return (
              <span className="text-xs text-muted-foreground">
                Not required
              </span>
            );
          }

          if (order.designApprovalStatus) {
            const designStatusConfig = {
              PENDING: {
                color: "bg-yellow-100 text-yellow-800",
                label: "Pending",
              },
              APPROVED: {
                color: "bg-green-100 text-green-800",
                label: "Approved",
              },
              REJECTED: { color: "bg-red-100 text-red-800", label: "Rejected" },
              EXPIRED: { color: "bg-gray-100 text-gray-800", label: "Expired" },
              CANCELLED: {
                color: "bg-gray-100 text-gray-800",
                label: "Cancelled",
              },
            } as const;

            const statusConfig = designStatusConfig[
              order.designApprovalStatus as keyof typeof designStatusConfig
            ] || {
              color: "bg-gray-100 text-gray-800",
              label: order.designApprovalStatus,
            };

            return (
              <Badge className={statusConfig.color} variant="outline">
                {statusConfig.label}
              </Badge>
            );
          }

          return (
            <span className="text-xs text-muted-foreground">Required</span>
          );
        },
        enableSorting: false,
      },

      // Action column
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => {
          const order = row.original;
          const actionStatus = getActionStatus(order);

          if (!actionStatus) {
            return <span className="text-sm text-muted-foreground">-</span>;
          }

          return (
            <div className="space-y-1">
              <Button
                size="sm"
                variant={actionStatus.required ? "default" : "outline"}
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <Link href={actionStatus.href}>
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
          );
        },
        enableSorting: false,
      },

      // Actions menu column
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const order = row.original;
          const isFavorited = favoriteOrders.has(order.id);

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                <DropdownMenuItem asChild>
                  <Link href={`/orders/${order.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>

                {/* <DropdownMenuItem asChild>
                  <Link href={`/orders/${order.id}/edit`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Edit Order
                  </Link>
                </DropdownMenuItem> */}

                <DropdownMenuItem asChild>
                  <Link href={`/orders/${order.id}/track`}>
                    <Truck className="mr-2 h-4 w-4" />
                    Track Package
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href={`/orders/${order.id}/notes`}>
                    <Repeat className="mr-2 h-4 w-4" />
                    Order Notes
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.info("Invoice download will be available soon");
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Invoice
                </DropdownMenuItem>

                <DropdownMenuSeparator /> */}

                {canReorder(order) && (
                  <DropdownMenuItem asChild>
                    <Link href={`/orders/${order.id}/reorder`}>
                      <Repeat className="mr-2 h-4 w-4" />
                      Reorder
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(order.id);
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Order ID
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(order.id);
                  }}
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
          );
        },
        enableSorting: false,
        size: 50,
      },
    ],
    [favoriteOrders]
  );

  // Filter header component
  const filterHeader = showFilters ? (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex-1 min-w-[200px]">
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
          <SelectItem value="all">All Status</SelectItem>
          {ORDER_STATUS.map((status) => (
            <SelectItem key={status} value={status}>
              {STATUS_CONFIG[status]?.label || status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ) : undefined;

  const handleRowClick = (order: OrderResponse) => {
    if (onOrderClick) {
      onOrderClick(order.id);
    } else {
      router.push(`/orders/${order.id}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main table card */}
      <Card>
        {!compact && (
          <CardHeader>
            <CardTitle>Your Orders</CardTitle>
            <CardDescription>{totalItems} orders found</CardDescription>
          </CardHeader>
        )}

        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={orders}
            pageCount={pageCount}
            headerComponent={filterHeader}
            isFetching={isLoading}
            isRefetching={isRefetching}
            error={error}
            allowSearch={false}
            filterByDate={false}
            // showViewOptions={true}
            onRowClick={handleRowClick}
            paginate={true}
          />
        </CardContent>
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
            require your attention. Please review and take the necessary
            actions.
          </AlertDescription>
        </Alert>
      )}

      {/* Empty state for first-time users */}
      {!isLoading &&
        orders.length === 0 &&
        !searchTerm &&
        statusFilter === "all" && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No orders yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven&apos;t placed any orders yet. Start by creating your
                first order.
              </p>
              <Button asChild>
                <Link href="/orders/quick-order">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Create Your First Order
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
