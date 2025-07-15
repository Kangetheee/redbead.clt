/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { useSendTeamAlert } from "@/hooks/use-communication";
import { OrderResponse } from "@/lib/orders/types/orders.types";
import { ActionResponse, PaginatedData } from "@/lib/shared/types";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Search,
  Eye,
  AlertTriangle,
  Clock,
  Zap,
  MessageSquare,
  CheckCircle,
  ArrowUp,
  Timer,
} from "lucide-react";
import {
  formatDistanceToNow,
  differenceInHours,
  differenceInDays,
} from "date-fns";
import { formatCurrency } from "@/lib/utils";

const URGENT_LEVELS = ["EXPEDITED", "RUSH", "EMERGENCY"] as const;

const URGENCY_CONFIG = {
  EMERGENCY: {
    color: "bg-red-500 text-white",
    icon: AlertTriangle,
    priority: 1,
    maxHours: 4,
  },
  RUSH: {
    color: "bg-orange-500 text-white",
    icon: Zap,
    priority: 2,
    maxHours: 24,
  },
  EXPEDITED: {
    color: "bg-yellow-500 text-white",
    icon: ArrowUp,
    priority: 3,
    maxHours: 72,
  },
} as const;

const STATUS_URGENT_THRESHOLD_HOURS = {
  PENDING: 24,
  DESIGN_PENDING: 48,
  PAYMENT_PENDING: 12,
  DESIGN_REJECTED: 6,
} as const;

const getTimeStatus = (order: OrderResponse) => {
  const now = new Date();
  const createdAt = new Date(order.createdAt);
  const hoursElapsed = differenceInHours(now, createdAt);

  if (order.urgencyLevel && URGENT_LEVELS.includes(order.urgencyLevel as any)) {
    const urgencyConfig =
      URGENCY_CONFIG[order.urgencyLevel as keyof typeof URGENCY_CONFIG];
    const isOverdue = hoursElapsed > urgencyConfig.maxHours;

    return {
      isOverdue,
      timeRemaining: urgencyConfig.maxHours - hoursElapsed,
      label: isOverdue
        ? `OVERDUE by ${hoursElapsed - urgencyConfig.maxHours}h`
        : `${urgencyConfig.maxHours - hoursElapsed}h remaining`,
      className: isOverdue ? "text-red-600 font-semibold" : "text-orange-600",
    };
  }

  return {
    isOverdue: true,
    timeRemaining: 0,
    label: `${Math.floor(hoursElapsed)}h elapsed`,
    className: "text-red-600",
  };
};

export default function UrgentOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
  }: {
    data: ActionResponse<PaginatedData<OrderResponse>> | undefined;
    isLoading: boolean;
    error: any;
    refetch: () => void;
  } = useOrders({
    page,
    limit: 50, // Get more orders to filter urgent ones
    search: searchTerm || undefined,
    urgencyLevel: urgencyFilter === "all" ? undefined : (urgencyFilter as any),
  });

  const sendTeamAlert = useSendTeamAlert();

  // Filter and sort urgent orders
  const urgentOrders = useMemo(() => {
    if (!ordersData?.success) return [];

    const now = new Date();

    return ordersData.data.items
      .filter((order) => {
        // Include orders with urgent urgency levels
        if (URGENT_LEVELS.includes(order.urgencyLevel as any)) {
          return true;
        }

        // Include orders that are time-sensitive based on status and time elapsed
        const hoursElapsed = differenceInHours(now, new Date(order.createdAt));
        const threshold =
          STATUS_URGENT_THRESHOLD_HOURS[
            order.status as keyof typeof STATUS_URGENT_THRESHOLD_HOURS
          ];

        return threshold && hoursElapsed > threshold;
      })
      .sort((a, b) => {
        // Sort by urgency priority first
        const aUrgency =
          URGENCY_CONFIG[a.urgencyLevel as keyof typeof URGENCY_CONFIG];
        const bUrgency =
          URGENCY_CONFIG[b.urgencyLevel as keyof typeof URGENCY_CONFIG];

        if (aUrgency && bUrgency) {
          return aUrgency.priority - bUrgency.priority;
        }
        if (aUrgency && !bUrgency) return -1;
        if (!aUrgency && bUrgency) return 1;

        // Then by creation time (oldest first)
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
  }, [ordersData]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleUrgencyFilter = (value: string) => {
    setUrgencyFilter(value);
    setPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const handleEscalate = async (order: OrderResponse) => {
    try {
      await sendTeamAlert.mutateAsync({
        message: `Order #${order.orderNumber} (${order.urgencyLevel || "Time-sensitive"}) needs immediate handling. Customer: ${order.customerId}, Amount: ${formatCurrency(order.totalAmount)}`,
        priority: "urgent",
        recipients: ["production", "management"],
        channel: "email",
        metadata: {
          subject: `URGENT: Order #${order.orderNumber} requires immediate attention`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          urgencyLevel: order.urgencyLevel,
        },
      });
    } catch (error) {
      console.error("Failed to send team alert:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading urgent orders...</span>
      </div>
    );
  }

  if (error || (ordersData && !ordersData.success)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">
          {error?.message ||
            (ordersData && !ordersData.success
              ? ordersData.error
              : "Error loading orders. Please try again.")}
        </p>
      </div>
    );
  }

  const emergencyCount = urgentOrders.filter(
    (o) => o.urgencyLevel === "EMERGENCY"
  ).length;
  const rushCount = urgentOrders.filter(
    (o) => o.urgencyLevel === "RUSH"
  ).length;
  const overdueCount = urgentOrders.filter(
    (o) => getTimeStatus(o).isOverdue
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            Urgent Orders
          </h1>
          <p className="text-gray-600">
            {urgentOrders.length} orders requiring immediate attention
          </p>
        </div>
        <Button onClick={() => refetch()}>
          <Timer className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      {urgentOrders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-red-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {emergencyCount}
                  </p>
                  <p className="text-sm text-gray-600">Emergency</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {rushCount}
                  </p>
                  <p className="text-sm text-gray-600">Rush</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {overdueCount}
                  </p>
                  <p className="text-sm text-gray-600">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{urgentOrders.length}</p>
                  <p className="text-sm text-gray-600">Total Urgent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search urgent orders..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={urgencyFilter} onValueChange={handleUrgencyFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgent</SelectItem>
                <SelectItem value="EMERGENCY">Emergency</SelectItem>
                <SelectItem value="RUSH">Rush</SelectItem>
                <SelectItem value="EXPEDITED">Expedited</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {urgentOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No urgent orders</h3>
                <p className="text-gray-600">
                  All orders are within normal processing times!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          urgentOrders.map((order) => (
            <UrgentOrderCard
              key={order.id}
              order={order}
              onEscalate={() => handleEscalate(order)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function UrgentOrderCard({
  order,
  onEscalate,
}: {
  order: OrderResponse;
  onEscalate: () => void;
}) {
  const updateOrderStatus = useUpdateOrderStatus(order.id);
  const timeStatus = getTimeStatus(order);

  const urgencyConfig = order.urgencyLevel
    ? URGENCY_CONFIG[order.urgencyLevel as keyof typeof URGENCY_CONFIG]
    : null;

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateOrderStatus.mutateAsync({
        status: newStatus as any,
        reason: `Urgent processing: Updated to ${newStatus.toLowerCase()}`,
      });
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const getQuickActions = () => {
    switch (order.status) {
      case "PENDING":
        return [
          { label: "Fast Track to Production", status: "PROCESSING" },
          { label: "Request Payment", status: "PAYMENT_PENDING" },
        ];
      case "DESIGN_PENDING":
        return [
          { label: "Approve Design", status: "DESIGN_APPROVED" },
          { label: "Start Production", status: "PRODUCTION" },
        ];
      case "PAYMENT_PENDING":
        return [{ label: "Payment Confirmed", status: "PAYMENT_CONFIRMED" }];
      case "DESIGN_APPROVED":
        return [{ label: "Start Production", status: "PRODUCTION" }];
      default:
        return [];
    }
  };

  return (
    <Card
      className={`border-l-4 hover:shadow-md transition-all ${
        timeStatus.isOverdue
          ? "border-l-red-500 bg-red-50"
          : urgencyConfig
            ? "border-l-orange-500 bg-orange-50"
            : "border-l-yellow-500 bg-yellow-50"
      }`}
    >
      <CardContent className="pt-6">
        {timeStatus.isOverdue && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              This order is overdue and requires immediate attention!
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Order Info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>

              {urgencyConfig && (
                <Badge className={urgencyConfig.color}>
                  <urgencyConfig.icon className="h-3 w-3 mr-1" />
                  {order.urgencyLevel}
                </Badge>
              )}

              <Badge variant="outline" className={timeStatus.className}>
                <Clock className="h-3 w-3 mr-1" />
                {timeStatus.label}
              </Badge>

              <Badge variant="outline">{order.status.replace("_", " ")}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
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
              <div>
                <span className="text-gray-600">Expected Days:</span>
                <p className="font-medium">
                  {order.expectedProductionDays || "N/A"} days
                </p>
              </div>
            </div>

            {order.specialInstructions && (
              <div className="text-sm">
                <span className="text-gray-600">Special Instructions:</span>
                <p className="text-gray-800 mt-1 font-medium">
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

            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={onEscalate}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Escalate to Team
            </Button>

            {getQuickActions().map((action) => (
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
