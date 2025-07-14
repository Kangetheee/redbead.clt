/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  Truck,
  User,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  Mail,
  Phone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { OrderResponse } from "@/lib/orders/types/orders.types";
import OrderStatusBadge from "@/components/orders/order-status-badge";

interface OrderTableProps {
  orders: OrderResponse[];
  loading?: boolean;
  selectable?: boolean;
  selectedOrders?: string[];
  onSelectionChange?: (orderIds: string[]) => void;
  onOrderAction?: (action: string, orderId: string) => void;
  showCustomerInfo?: boolean;
  showAdvancedActions?: boolean;
  compact?: boolean;
  sortable?: boolean;
}

type SortField =
  | "orderNumber"
  | "status"
  | "customerId"
  | "totalAmount"
  | "createdAt"
  | "urgencyLevel";
type SortDirection = "asc" | "desc";

export default function OrderTable({
  orders,
  loading = false,
  selectable = false,
  selectedOrders = [],
  onSelectionChange,
  onOrderAction,
  showCustomerInfo = true,
  showAdvancedActions = true,
  compact = false,
  sortable = true,
}: OrderTableProps) {
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (!sortable) return;

    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const checkboxRef = useRef<HTMLInputElement>(null);

  // Sort orders
  const sortedOrders = useMemo(() => {
    if (!sortable) return orders;

    return [...orders].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === "createdAt") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortField === "totalAmount") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [orders, sortField, sortDirection, sortable]);

  // Selection handlers
  const handleSelectAll = () => {
    if (!selectable || !onSelectionChange) return;

    if (selectedOrders.length === orders.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(orders.map((order) => order.id));
    }
  };

  const handleSelectOrder = (orderId: string) => {
    if (!selectable || !onSelectionChange) return;

    if (selectedOrders.includes(orderId)) {
      onSelectionChange(selectedOrders.filter((id) => id !== orderId));
    } else {
      onSelectionChange([...selectedOrders, orderId]);
    }
  };

  // Utility functions
  const getSortIcon = (field: SortField) => {
    if (!sortable || sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const getUrgencyIcon = (urgencyLevel?: string) => {
    switch (urgencyLevel) {
      case "EMERGENCY":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "RUSH":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "EXPEDITED":
        return <Truck className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const isOverdue = (order: OrderResponse) => {
    if (!order.expectedDelivery) return false;
    return (
      new Date(order.expectedDelivery) < new Date() &&
      !["DELIVERED", "CANCELLED", "REFUNDED"].includes(order.status)
    );
  };

  const allSelected =
    selectedOrders.length === orders.length && orders.length > 0;
  const someSelected =
    selectedOrders.length > 0 && selectedOrders.length < orders.length;

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  if (loading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {[...Array(compact ? 6 : 8)].map((_, i) => (
                <TableHead key={i}>
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(compact ? 6 : 8)].map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    ref={(el) => {
                      const input = el?.querySelector(
                        "input[type='checkbox']"
                      ) as HTMLInputElement | null;
                      if (input) {
                        input.indeterminate = someSelected;
                      }
                    }}
                  />
                </TableHead>
              )}

              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("orderNumber")}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Order #{getSortIcon("orderNumber")}
                </Button>
              </TableHead>

              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("status")}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Status {getSortIcon("status")}
                </Button>
              </TableHead>

              {showCustomerInfo && (
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("customerId")}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Customer {getSortIcon("customerId")}
                  </Button>
                </TableHead>
              )}

              {!compact && <TableHead>Items</TableHead>}

              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("totalAmount")}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Total {getSortIcon("totalAmount")}
                </Button>
              </TableHead>

              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("createdAt")}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Date {getSortIcon("createdAt")}
                </Button>
              </TableHead>

              {!compact && <TableHead>Priority</TableHead>}

              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedOrders.map((order) => {
              const urgencyIcon = getUrgencyIcon(order.urgencyLevel);
              const orderIsOverdue = isOverdue(order);

              return (
                <TableRow
                  key={order.id}
                  className={`${orderIsOverdue ? "bg-red-50" : ""} ${
                    selectedOrders.includes(order.id) ? "bg-blue-50" : ""
                  }`}
                >
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={() => handleSelectOrder(order.id)}
                      />
                    </TableCell>
                  )}

                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/admin/orders/${order.id}`}
                        className="hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                      {urgencyIcon && (
                        <Tooltip>
                          <TooltipTrigger>{urgencyIcon}</TooltipTrigger>
                          <TooltipContent>
                            {order.urgencyLevel} Priority
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {orderIsOverdue && (
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          </TooltipTrigger>
                          <TooltipContent>Order is overdue</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <OrderStatusBadge status={order.status} size="sm" />
                  </TableCell>

                  {showCustomerInfo && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {order.customerId.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{order.customerId}</p>
                          {/* Add customer phone if available */}
                        </div>
                      </div>
                    </TableCell>
                  )}

                  {!compact && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {order.orderItems.length}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          (
                          {order.orderItems.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          )}{" "}
                          qty)
                        </span>
                      </div>
                    </TableCell>
                  )}

                  <TableCell className="font-medium">
                    ${order.totalAmount.toFixed(2)}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    <Tooltip>
                      <TooltipTrigger>
                        {format(new Date(order.createdAt), "MMM dd")}
                      </TooltipTrigger>
                      <TooltipContent>
                        {format(
                          new Date(order.createdAt),
                          "MMM dd, yyyy 'at' HH:mm"
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>

                  {!compact && (
                    <TableCell>
                      {order.urgencyLevel && order.urgencyLevel !== "NORMAL" ? (
                        <Badge
                          variant={
                            order.urgencyLevel === "EMERGENCY"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {order.urgencyLevel}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Normal
                        </span>
                      )}
                    </TableCell>
                  )}

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Order Actions</DropdownMenuLabel>

                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/admin/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href={`/dashboard/admin/orders/${order.id}/edit`}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Order
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {showAdvancedActions && (
                          <>
                            <DropdownMenuItem
                              onClick={() => onOrderAction?.("email", order.id)}
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Email Customer
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => onOrderAction?.("call", order.id)}
                            >
                              <Phone className="mr-2 h-4 w-4" />
                              Call Customer
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() =>
                                onOrderAction?.("download", order.id)
                              }
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download Invoice
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                          </>
                        )}

                        {/* Status-specific actions */}
                        {order.status === "PENDING" && (
                          <DropdownMenuItem
                            onClick={() => onOrderAction?.("approve", order.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve Order
                          </DropdownMenuItem>
                        )}

                        {order.status === "PROCESSING" && (
                          <DropdownMenuItem
                            onClick={() => onOrderAction?.("ship", order.id)}
                          >
                            <Truck className="mr-2 h-4 w-4" />
                            Mark as Shipped
                          </DropdownMenuItem>
                        )}

                        {[
                          "PENDING",
                          "DESIGN_PENDING",
                          "PAYMENT_PENDING",
                        ].includes(order.status) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                onOrderAction?.("cancel", order.id)
                              }
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancel Order
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {sortedOrders.length === 0 && (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No orders found</h3>
            <p className="text-muted-foreground">
              No orders match the current filters
            </p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
