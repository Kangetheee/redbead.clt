/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  Truck,
  CreditCard,
  FileText,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  Calendar,
  User,
  MessageSquare,
  History,
  Settings,
  Zap,
  Timer,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { OrderResponse } from "@/lib/orders/types/orders.types";
import OrderStatusBadge from "@/components/orders/order-status-badge";

interface StatusManagementProps {
  order: OrderResponse;
  onStatusUpdate?: (newStatus: string, data?: any) => void;
  showAdvancedControls?: boolean;
}

// Define status workflow
const STATUS_WORKFLOW = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600",
    nextStates: [
      "DESIGN_PENDING",
      "PAYMENT_PENDING",
      "PROCESSING",
      "CANCELLED",
    ],
    description: "Order received and under review",
  },
  DESIGN_PENDING: {
    label: "Design Pending",
    icon: FileText,
    color: "text-blue-600",
    nextStates: ["DESIGN_APPROVED", "DESIGN_REJECTED", "CANCELLED"],
    description: "Waiting for customer design approval",
  },
  DESIGN_APPROVED: {
    label: "Design Approved",
    icon: CheckCircle,
    color: "text-green-600",
    nextStates: ["PAYMENT_PENDING", "PROCESSING"],
    description: "Design approved by customer",
  },
  DESIGN_REJECTED: {
    label: "Design Rejected",
    icon: XCircle,
    color: "text-red-600",
    nextStates: ["DESIGN_PENDING", "CANCELLED"],
    description: "Design rejected, requires revision",
  },
  PAYMENT_PENDING: {
    label: "Payment Pending",
    icon: CreditCard,
    color: "text-orange-600",
    nextStates: ["PAYMENT_CONFIRMED", "CANCELLED"],
    description: "Waiting for payment confirmation",
  },
  PAYMENT_CONFIRMED: {
    label: "Payment Confirmed",
    icon: CheckCircle,
    color: "text-green-600",
    nextStates: ["PROCESSING"],
    description: "Payment received and confirmed",
  },
  PROCESSING: {
    label: "Processing",
    icon: Package,
    color: "text-purple-600",
    nextStates: ["PRODUCTION", "SHIPPED", "CANCELLED"],
    description: "Order is being prepared for production",
  },
  PRODUCTION: {
    label: "In Production",
    icon: Package,
    color: "text-purple-600",
    nextStates: ["SHIPPED", "CANCELLED"],
    description: "Order is in production",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    color: "text-blue-600",
    nextStates: ["DELIVERED"],
    description: "Order has been shipped",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle,
    color: "text-green-600",
    nextStates: ["REFUNDED"],
    description: "Order delivered successfully",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600",
    nextStates: ["REFUNDED"],
    description: "Order has been cancelled",
  },
  REFUNDED: {
    label: "Refunded",
    icon: RotateCcw,
    color: "text-gray-600",
    nextStates: [],
    description: "Order has been refunded",
  },
};

export default function StatusManagement({
  order,
  onStatusUpdate,
  showAdvancedControls = false,
}: StatusManagementProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [statusReason, setStatusReason] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [addNote, setAddNote] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  const currentStatus = order.status;
  const currentStatusConfig =
    STATUS_WORKFLOW[currentStatus as keyof typeof STATUS_WORKFLOW];
  const availableNextStates = currentStatusConfig?.nextStates || [];

  // Mock status history - in real app, this would come from API
  const statusHistory = [
    {
      status: "PENDING",
      timestamp: order.createdAt,
      user: "System",
      reason: "Order placed by customer",
    },
    {
      status: order.status,
      timestamp: order.updatedAt,
      user: "Admin Staff",
      reason: "Status updated",
    },
  ];

  const getProgressPercentage = () => {
    const statusOrder = [
      "PENDING",
      "DESIGN_APPROVED",
      "PAYMENT_CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);
    return currentIndex >= 0
      ? ((currentIndex + 1) / statusOrder.length) * 100
      : 0;
  };

  const handleStatusChange = () => {
    if (!selectedStatus) return;

    const updateData = {
      status: selectedStatus,
      reason: statusReason,
      trackingNumber: selectedStatus === "SHIPPED" ? trackingNumber : undefined,
      trackingUrl: selectedStatus === "SHIPPED" ? trackingUrl : undefined,
      expectedDelivery: expectedDelivery || undefined,
      addNote,
      noteContent,
    };

    onStatusUpdate?.(selectedStatus, updateData);
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedStatus("");
    setStatusReason("");
    setTrackingNumber("");
    setTrackingUrl("");
    setExpectedDelivery("");
    setAddNote(false);
    setNoteContent("");
  };

  const canChangeStatus = availableNextStates.length > 0;
  const isUrgent =
    order.urgencyLevel && ["RUSH", "EMERGENCY"].includes(order.urgencyLevel);

  return (
    <div className="space-y-6">
      {/* Current Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Status Management
              </CardTitle>
              <CardDescription>
                Current status and available actions for this order
              </CardDescription>
            </div>
            {isUrgent && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {order.urgencyLevel}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status Display */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              {currentStatusConfig && (
                <div
                  className={`p-2 rounded-full bg-background ${currentStatusConfig.color}`}
                >
                  <currentStatusConfig.icon className="h-5 w-5" />
                </div>
              )}
              <div>
                <h3 className="font-semibold">
                  {currentStatusConfig?.label || currentStatus}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentStatusConfig?.description}
                </p>
              </div>
            </div>
            <OrderStatusBadge status={currentStatus} size="default" />
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Order Progress</span>
              <span>{Math.round(getProgressPercentage())}% Complete</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          {/* Available Actions */}
          {canChangeStatus ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Available Actions</h4>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Change Status
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Update Order Status</DialogTitle>
                      <DialogDescription>
                        Change the status of order #{order.orderNumber}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* Status Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="newStatus">New Status</Label>
                        <Select
                          value={selectedStatus}
                          onValueChange={setSelectedStatus}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select new status" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableNextStates.map((status) => {
                              const statusConfig =
                                STATUS_WORKFLOW[
                                  status as keyof typeof STATUS_WORKFLOW
                                ];
                              return (
                                <SelectItem key={status} value={status}>
                                  <div className="flex items-center gap-2">
                                    <statusConfig.icon className="h-4 w-4" />
                                    <span>{statusConfig.label}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Reason */}
                      <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Change</Label>
                        <Textarea
                          id="reason"
                          value={statusReason}
                          onChange={(e) => setStatusReason(e.target.value)}
                          placeholder="Enter reason for status change..."
                          rows={2}
                        />
                      </div>

                      {/* Shipping Information (if applicable) */}
                      {selectedStatus === "SHIPPED" && (
                        <div className="space-y-4 p-4 border rounded-lg">
                          <h4 className="font-medium flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            Shipping Information
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="trackingNumber">
                                Tracking Number *
                              </Label>
                              <Input
                                id="trackingNumber"
                                value={trackingNumber}
                                onChange={(e) =>
                                  setTrackingNumber(e.target.value)
                                }
                                placeholder="Enter tracking number"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="expectedDelivery">
                                Expected Delivery
                              </Label>
                              <Input
                                id="expectedDelivery"
                                type="date"
                                value={expectedDelivery}
                                onChange={(e) =>
                                  setExpectedDelivery(e.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="trackingUrl">
                              Tracking URL (Optional)
                            </Label>
                            <Input
                              id="trackingUrl"
                              type="url"
                              value={trackingUrl}
                              onChange={(e) => setTrackingUrl(e.target.value)}
                              placeholder="https://tracking-url.com"
                            />
                          </div>
                        </div>
                      )}

                      {/* Expected Delivery (for other statuses) */}
                      {selectedStatus &&
                        selectedStatus !== "SHIPPED" &&
                        ["PROCESSING", "PRODUCTION"].includes(
                          selectedStatus
                        ) && (
                          <div className="space-y-2">
                            <Label htmlFor="expectedDelivery">
                              Expected Delivery Date
                            </Label>
                            <Input
                              id="expectedDelivery"
                              type="date"
                              value={expectedDelivery}
                              onChange={(e) =>
                                setExpectedDelivery(e.target.value)
                              }
                            />
                          </div>
                        )}

                      {/* Add Note Option */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="addNote"
                            checked={addNote}
                            onChange={(e) => setAddNote(e.target.checked)}
                            className="rounded"
                          />
                          <Label
                            htmlFor="addNote"
                            className="flex items-center gap-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Add note about this status change
                          </Label>
                        </div>

                        {addNote && (
                          <div className="space-y-2">
                            <Label htmlFor="noteContent">Note Content</Label>
                            <Textarea
                              id="noteContent"
                              value={noteContent}
                              onChange={(e) => setNoteContent(e.target.value)}
                              placeholder="Add additional details about this status change..."
                              rows={3}
                            />
                          </div>
                        )}
                      </div>

                      {/* Preview */}
                      {selectedStatus && (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Status will change to:</strong>{" "}
                            {
                              STATUS_WORKFLOW[
                                selectedStatus as keyof typeof STATUS_WORKFLOW
                              ]?.label
                            }
                            {statusReason && (
                              <div className="mt-1">
                                <strong>Reason:</strong> {statusReason}
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleStatusChange}
                        disabled={
                          !selectedStatus ||
                          (selectedStatus === "SHIPPED" && !trackingNumber)
                        }
                      >
                        Update Status
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {availableNextStates.slice(0, 2).map((status) => {
                  const statusConfig =
                    STATUS_WORKFLOW[status as keyof typeof STATUS_WORKFLOW];
                  return (
                    <Button
                      key={status}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedStatus(status);
                        setIsDialogOpen(true);
                      }}
                      className="justify-start"
                    >
                      <statusConfig.icon className="mr-2 h-3 w-3" />
                      {statusConfig.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No status changes available. Order is in final state or requires
                external action.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Status History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Status History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusHistory.map((entry, index) => {
              const statusConfig =
                STATUS_WORKFLOW[entry.status as keyof typeof STATUS_WORKFLOW];
              const isLatest = index === statusHistory.length - 1;

              return (
                <div key={index} className="relative">
                  {index < statusHistory.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
                  )}

                  <div className="flex items-start gap-4">
                    <div
                      className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-background bg-card ${isLatest ? "ring-2 ring-primary" : ""}`}
                    >
                      {statusConfig && (
                        <statusConfig.icon
                          className={`h-5 w-5 ${statusConfig.color}`}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          {statusConfig?.label || entry.status}
                        </h4>
                        {isLatest && <Badge variant="secondary">Current</Badge>}
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {entry.reason}
                      </p>

                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(
                              new Date(entry.timestamp),
                              "MMM dd, yyyy 'at' hh:mm a"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{entry.user}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Controls */}
      {showAdvancedControls && (
        <Card>
          <CardHeader>
            <CardTitle>Advanced Controls</CardTitle>
            <CardDescription>
              Administrative actions and overrides
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Timer className="h-4 w-4 mr-2" />
              Set Custom Timeline
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Internal Note
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Flag for Review
            </Button>
            <Separator />
            <Button
              variant="outline"
              className="w-full justify-start text-red-600"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Force Status Override
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
