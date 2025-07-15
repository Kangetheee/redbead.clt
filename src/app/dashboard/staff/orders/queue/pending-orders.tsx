/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { OrderResponse } from "@/lib/orders/types/orders.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { getUrgencyBadge } from "@/lib/urgency";

const PENDING_STATUSES = [
  "PENDING",
  "DESIGN_PENDING",
  "PAYMENT_PENDING",
  "DESIGN_REJECTED",
] as const;

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  DESIGN_PENDING: "bg-blue-100 text-blue-800",
  PAYMENT_PENDING: "bg-orange-100 text-orange-800",
  DESIGN_REJECTED: "bg-red-100 text-red-800",
} as const;

const STATUS_ICONS = {
  PENDING: Clock,
  DESIGN_PENDING: Eye,
  PAYMENT_PENDING: AlertTriangle,
  DESIGN_REJECTED: XCircle,
} as const;

export default function PendingOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const {
    data: ordersData,
    isLoading,
    error,
  } = useOrders({
    page,
    limit: 20,
    status: statusFilter === "all" ? undefined : (statusFilter as any),
    search: searchTerm || undefined,
  });

  const pendingOrders =
    ordersData?.success && ordersData.data
      ? ordersData.data.items.filter((order: OrderResponse) =>
          PENDING_STATUSES.includes(order.status as any)
        )
      : [];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page when searching
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading pending orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Error loading orders. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pending Orders</h1>
          <p className="text-gray-600">
            {pendingOrders.length} orders requiring attention
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order number, customer..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pending</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="DESIGN_PENDING">Design Pending</SelectItem>
                <SelectItem value="PAYMENT_PENDING">Payment Pending</SelectItem>
                <SelectItem value="DESIGN_REJECTED">Design Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {pendingOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No pending orders</h3>
                <p className="text-gray-600">All orders are up to date!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          pendingOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>

      {/* Pagination */}
      {ordersData?.success && ordersData.data?.meta?.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {ordersData.data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === ordersData.data.meta.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: OrderResponse }) {
  const updateOrderStatus = useUpdateOrderStatus(order.id);
  const StatusIcon =
    STATUS_ICONS[order.status as keyof typeof STATUS_ICONS] || Clock;

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateOrderStatus.mutateAsync({
        status: newStatus as any,
        reason: `Updated by staff to ${newStatus.toLowerCase()}`,
      });
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const getNextActions = () => {
    switch (order.status) {
      case "PENDING":
        return [
          { label: "Approve for Design", status: "DESIGN_PENDING" },
          { label: "Request Payment", status: "PAYMENT_PENDING" },
        ];
      case "DESIGN_PENDING":
        return [
          { label: "Design Approved", status: "DESIGN_APPROVED" },
          { label: "Reject Design", status: "DESIGN_REJECTED" },
        ];
      case "PAYMENT_PENDING":
        return [{ label: "Payment Confirmed", status: "PAYMENT_CONFIRMED" }];
      case "DESIGN_REJECTED":
        return [
          { label: "Resubmit for Design", status: "DESIGN_PENDING" },
          { label: "Cancel Order", status: "CANCELLED" },
        ];
      default:
        return [];
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Order Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
              <Badge
                className={
                  STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]
                }
              >
                <StatusIcon className="h-3 w-3 mr-1" />
                {order.status.replace("_", " ")}
              </Badge>
              {getUrgencyBadge(order.urgencyLevel)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Amount:</span>
                <p className="font-medium">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Items:</span>
                <p className="font-medium">
                  {order.orderItems?.length || 0} items
                </p>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(order.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            {order.specialInstructions && (
              <div className="text-sm">
                <span className="text-gray-600">Special Instructions:</span>
                <p className="text-gray-800 mt-1">
                  {order.specialInstructions}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 min-w-[200px]">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>

            {getNextActions().map((action) => (
              <Button
                key={action.status}
                size="sm"
                className="w-full"
                onClick={() => handleStatusUpdate(action.status)}
                disabled={updateOrderStatus.isPending}
              >
                {updateOrderStatus.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
