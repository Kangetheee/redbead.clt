/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Send,
  Download,
  MoreHorizontal,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  User,
  Package,
  FileText,
  Zap,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { OrderResponse } from "@/lib/orders/types/orders.types";

interface ApprovalQueueTableProps {
  orders: OrderResponse[];
  loading?: boolean;
  onSendReminder?: (orderId: string, message?: string) => void;
  onRefresh?: () => void;
  showOverdueAlert?: boolean;
  showUrgentAlert?: boolean;
}

export default function ApprovalQueueTable({
  orders,
  loading = false,
  onSendReminder,
  onRefresh,
  showOverdueAlert = false,
  showUrgentAlert = false,
}: ApprovalQueueTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [reminderMessage, setReminderMessage] = useState("");
  const [reminderType, setReminderType] = useState("gentle");

  const handleSendReminder = () => {
    if (selectedOrder) {
      onSendReminder?.(selectedOrder, reminderMessage);
      setSelectedOrder(null);
      setReminderMessage("");
      setReminderType("gentle");
    }
  };

  const getTimeColor = (requestedAt: string) => {
    const requestedDate = new Date(requestedAt);
    const hoursSinceRequested =
      (new Date().getTime() - requestedDate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceRequested > 24) return "text-red-600";
    if (hoursSinceRequested > 12) return "text-orange-600";
    if (hoursSinceRequested > 6) return "text-yellow-600";
    return "text-green-600";
  };

  const getTimeIcon = (requestedAt: string) => {
    const requestedDate = new Date(requestedAt);
    const hoursSinceRequested =
      (new Date().getTime() - requestedDate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceRequested > 24) return AlertTriangle;
    if (hoursSinceRequested > 12) return Clock;
    return CheckCircle;
  };

  const isOverdue = (requestedAt: string) => {
    const requestedDate = new Date(requestedAt);
    const hoursSinceRequested =
      (new Date().getTime() - requestedDate.getTime()) / (1000 * 60 * 60);
    return hoursSinceRequested > 24;
  };

  const getUrgencyBadge = (urgencyLevel?: string) => {
    switch (urgencyLevel) {
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

  const reminderTemplates = {
    gentle: {
      subject: "Design Approval Reminder",
      message:
        "Hi! We're excited to move forward with your order. Could you please review and approve the design when you have a moment?",
    },
    urgent: {
      subject: "Urgent: Design Approval Needed",
      message:
        "We need your design approval to keep your order on schedule. Please review at your earliest convenience.",
    },
    final: {
      subject: "Final Notice: Design Approval Required",
      message:
        "This is a final reminder that your design approval is needed to proceed with production. Please respond within 24 hours.",
    },
  };

  if (loading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {[...Array(7)].map((_, i) => (
                <TableHead key={i}>
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(7)].map((_, j) => (
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
      <div className="space-y-4">
        {/* Alerts */}
        {showOverdueAlert && orders.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              These approvals are overdue and may impact delivery schedules.
              Consider escalating or offering expedited approval options.
            </AlertDescription>
          </Alert>
        )}

        {showUrgentAlert && orders.length > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <Zap className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              These are urgent orders that require priority attention for design
              approval.
            </AlertDescription>
          </Alert>
        )}

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Design Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.map((order) => {
                const requestedAt =
                  order.designApproval?.requestedAt || order.createdAt;
                const TimeIcon = getTimeIcon(requestedAt);
                const timeColor = getTimeColor(requestedAt);
                const orderIsOverdue = isOverdue(requestedAt);

                return (
                  <TableRow
                    key={order.id}
                    className={orderIsOverdue ? "bg-red-50" : ""}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/admin/orders/${order.id}`}
                          className="hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                        {orderIsOverdue && (
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            </TooltipTrigger>
                            <TooltipContent>Approval is overdue</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {order.orderItems.length} items • $
                        {order.totalAmount.toFixed(2)}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {order.customerId.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {order.customerId}
                          </p>
                          {/* Add customer email/phone if available */}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            order.designApproval?.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.designApproval?.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : order.designApproval?.status === "REJECTED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          {order.designApproval?.status || "PENDING"}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className={`flex items-center gap-1 ${timeColor}`}>
                        <TimeIcon className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">
                            {formatDistanceToNow(new Date(requestedAt), {
                              addSuffix: true,
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(requestedAt), "MMM dd, HH:mm")}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{getUrgencyBadge(order.urgencyLevel)}</TableCell>

                    <TableCell>
                      {order.expectedDelivery ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm">
                              {format(
                                new Date(order.expectedDelivery),
                                "MMM dd"
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.expectedDelivery) < new Date()
                                ? "Overdue"
                                : formatDistanceToNow(
                                    new Date(order.expectedDelivery)
                                  )}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Not set
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Send Reminder Dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedOrder(order.id)}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Remind
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Send Approval Reminder</DialogTitle>
                              <DialogDescription>
                                Send a reminder to the customer for order #
                                {order.orderNumber}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="reminderType">
                                  Reminder Type
                                </Label>
                                <Select
                                  value={reminderType}
                                  onValueChange={setReminderType}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="gentle">
                                      Gentle Reminder
                                    </SelectItem>
                                    <SelectItem value="urgent">
                                      Urgent Follow-up
                                    </SelectItem>
                                    <SelectItem value="final">
                                      Final Notice
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label>Preview Message</Label>
                                <div className="p-3 bg-muted rounded text-sm">
                                  <p className="font-medium mb-1">
                                    {
                                      reminderTemplates[
                                        reminderType as keyof typeof reminderTemplates
                                      ].subject
                                    }
                                  </p>
                                  <p>
                                    {
                                      reminderTemplates[
                                        reminderType as keyof typeof reminderTemplates
                                      ].message
                                    }
                                  </p>
                                </div>
                              </div>

                              <div>
                                <Label htmlFor="customMessage">
                                  Additional Message (Optional)
                                </Label>
                                <Textarea
                                  id="customMessage"
                                  value={reminderMessage}
                                  onChange={(e) =>
                                    setReminderMessage(e.target.value)
                                  }
                                  placeholder="Add a personal message..."
                                  rows={3}
                                />
                              </div>
                            </div>

                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setSelectedOrder(null)}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleSendReminder}>
                                <Send className="h-4 w-4 mr-2" />
                                Send Reminder
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>

                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/admin/orders/${order.id}`}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Order
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Email Customer
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                              <Phone className="mr-2 h-4 w-4" />
                              Call Customer
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Add Note
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download Design
                            </DropdownMenuItem>

                            {orderIsOverdue && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <AlertTriangle className="mr-2 h-4 w-4" />
                                  Escalate to Manager
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-4 text-lg font-semibold">All caught up!</h3>
              <p className="text-muted-foreground">
                No pending design approvals at the moment
              </p>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {orders.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing {orders.length} approval{orders.length !== 1 ? "s" : ""}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 bg-red-500 rounded-full" />
                <span>
                  Overdue:{" "}
                  {
                    orders.filter((o) =>
                      isOverdue(o.designApproval?.requestedAt || o.createdAt)
                    ).length
                  }
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 bg-orange-500 rounded-full" />
                <span>
                  Urgent:{" "}
                  {
                    orders.filter((o) =>
                      ["RUSH", "EMERGENCY"].includes(o.urgencyLevel || "")
                    ).length
                  }
                </span>
              </div>
              {onRefresh && (
                <Button variant="ghost" size="sm" onClick={onRefresh}>
                  <Clock className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
