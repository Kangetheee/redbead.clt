/* eslint-disable @typescript-eslint/no-explicit-any */
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

import { OrderResponse, OrderListItem } from "@/lib/orders/types/orders.types";
import {
  GetOrdersDto,
  ORDER_STATUS,
  URGENCY_LEVELS,
} from "@/lib/orders/dto/orders.dto";
import { useOrders } from "@/hooks/use-orders";

interface OrdersHookResponse {
  success: boolean;
  data?: {
    data: OrderListItem[];
    meta: {
      page: number;
      limit: number;
      total: number;
      lastPage: number;
    };
    links: {
      first: string;
      last: string;
      next?: string;
      prev?: string;
    };
  };
  error?: string;
}

interface CustomerOrderTableProps {
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

const URGENCY_CONFIG = {
  NORMAL: { label: "Standard", color: "bg-gray-100 text-gray-800" },
  EXPEDITED: { label: "Expedited", color: "bg-yellow-100 text-yellow-800" },
  RUSH: { label: "Rush", color: "bg-orange-100 text-orange-800" },
  EMERGENCY: { label: "Emergency", color: "bg-red-100 text-red-800" },
} as const;

export default function OrderTable({
  filters = { page: 1, limit: 10 },
  onFiltersChange,
  showFilters = true,
  compact = false,
  pageSize = 10,
  onOrderClick,
}: CustomerOrderTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [statusFilter, setStatusFilter] = useState<string>(
    filters.status || "all"
  );
  const [urgencyFilter, setUrgencyFilter] = useState<string>(
    filters.urgencyLevel || "all"
  );
  const [favoriteOrders, setFavoriteOrders] = useState<Set<string>>(new Set());

  // Build current filters
  const currentFilters: GetOrdersDto = {
    ...filters,
    page: filters.page || 1,
    limit: pageSize,
    search: searchTerm || undefined,
    status:
      statusFilter === "all"
        ? undefined
        : (statusFilter as (typeof ORDER_STATUS)[number]),
    urgencyLevel:
      urgencyFilter === "all"
        ? undefined
        : (urgencyFilter as (typeof URGENCY_LEVELS)[number]),
  };

  // Fetch orders using the proper hook
  const {
    data: ordersResponse,
    isLoading,
    error,
    isRefetching,
  } = useOrders(currentFilters) as {
    data: OrdersHookResponse | undefined;
    isLoading: boolean;
    error: any;
    isRefetching: boolean;
  };

  // Extract data with proper error handling
  const orders: OrderListItem[] = ordersResponse?.success
    ? ordersResponse.data?.data || []
    : [];
  const totalItems = ordersResponse?.success
    ? ordersResponse.data?.meta?.total || 0
    : 0;
  const pageCount = Math.ceil(totalItems / pageSize);

  // Helper functions
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
      status:
        status === "all"
          ? undefined
          : (status as (typeof ORDER_STATUS)[number]),
    });
  };

  const handleUrgencyFilter = (urgency: string) => {
    setUrgencyFilter(urgency);
    handleFiltersChange({
      urgencyLevel:
        urgency === "all"
          ? undefined
          : (urgency as (typeof URGENCY_LEVELS)[number]),
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

  const getStatusBadge = (status: (typeof ORDER_STATUS)[number]) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
    const Icon = config.icon;

    return (
      <Badge className={config.color} variant="outline">
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency?: (typeof URGENCY_LEVELS)[number]) => {
    if (!urgency || urgency === "NORMAL") return null;

    const config = URGENCY_CONFIG[urgency];
    return (
      <Badge className={`${config.color} text-xs`} variant="outline">
        {config.label}
      </Badge>
    );
  };

  const getActionStatus = (order: OrderListItem) => {
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

  const canReorder = (order: OrderListItem) => {
    return order.status === "DELIVERED";
  };

  // Helper function to check if order has templates (from order items)
  const hasTemplates = (order: OrderListItem) => {
    return (
      order.orderItems &&
      order.orderItems.length > 0 &&
      order.orderItems.some((item) => item.template)
    );
  };

  // Helper function to get primary template name from order items
  const getPrimaryTemplateName = (order: OrderListItem) => {
    if (!order.orderItems || order.orderItems.length === 0) {
      return "No template";
    }

    const firstTemplate = order.orderItems[0]?.template;
    if (order.orderItems.length === 1) {
      return firstTemplate?.name || "Unknown template";
    }

    return `${firstTemplate?.name || "Template"} (+${order.orderItems.length - 1} more)`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Define table columns
  const columns: ColumnDef<OrderListItem>[] = useMemo(
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
          return (
            <div className="space-y-1">
              {getStatusBadge(order.status)}
              {/* Note: OrderListItem might not have urgencyLevel, so we handle it conditionally */}
              {(order as any).urgencyLevel &&
                getUrgencyBadge((order as any).urgencyLevel)}
            </div>
          );
        },
      },

      // Items column with template information
      {
        id: "items",
        header: "Items & Templates",
        cell: ({ row }) => {
          const order = row.original;
          const totalQuantity = order.orderItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          const primaryTemplateName = getPrimaryTemplateName(order);

          return (
            <div className="space-y-1">
              <p className="font-medium">{order.orderItems.length} items</p>
              <p className="text-sm text-muted-foreground">
                {totalQuantity} total qty
              </p>
              <p
                className="text-xs text-muted-foreground truncate max-w-[200px]"
                title={primaryTemplateName}
              >
                {primaryTemplateName}
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
            <span className="font-medium">${amount?.toFixed(2) || "0.00"}</span>
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
            const statusConfig = {
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
            }[order.designApprovalStatus] || {
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

                <DropdownMenuItem asChild>
                  <Link href={`/orders/${order.id}/edit`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Edit Order
                  </Link>
                </DropdownMenuItem>

                {hasTemplates(order) && (
                  <DropdownMenuItem asChild>
                    <Link href={`/orders/${order.id}/tracking`}>
                      <Truck className="mr-2 h-4 w-4" />
                      Track Package
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    // Implement download invoice functionality
                    toast.info("Invoice download will be available soon");
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Invoice
                </DropdownMenuItem>

                <DropdownMenuSeparator />

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

      <Select value={urgencyFilter} onValueChange={handleUrgencyFilter}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Urgency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Urgency</SelectItem>
          {URGENCY_LEVELS.map((urgency) => (
            <SelectItem key={urgency} value={urgency}>
              {URGENCY_CONFIG[urgency]?.label || urgency}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ) : undefined;

  const handleRowClick = (order: OrderListItem) => {
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
            allowSearch={false} // We handle search in the filter header
            filterByDate={false}
            showViewOptions={true}
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
