"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle,
  Clock,
  Truck,
  Package,
  XCircle,
  AlertTriangle,
  CreditCard,
  Loader2,
  MessageSquare,
  Palette,
  Factory,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

import { useUpdateOrderStatus, useUpdateOrder } from "@/hooks/use-orders";
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  UpdateOrderStatusDto,
  CreateOrderNoteDto,
  UpdateOrderDto,
  ORDER_STATUS,
  NOTE_TYPES,
  NOTE_PRIORITIES,
} from "@/lib/orders/dto/orders.dto";
import { OrderResponse } from "@/lib/orders/types/orders.types";

interface OrderStatusUpdateProps {
  order: OrderResponse;
  onStatusUpdated?: () => void;
}

// Define the exact types from the DTO
type OrderStatus = (typeof ORDER_STATUS)[number];

interface StatusConfig {
  label: string;
  icon: React.ElementType;
  color: string;
  nextStatuses: OrderStatus[];
}

const ORDER_STATUS_FLOW: Record<OrderStatus, StatusConfig> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800",
    nextStatuses: [
      "CONFIRMED",
      "DESIGN_PENDING",
      "PAYMENT_PENDING",
      "PROCESSING",
      "CANCELLED",
    ],
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800",
    nextStatuses: ["DESIGN_PENDING", "PAYMENT_PENDING", "PROCESSING"],
  },
  DESIGN_PENDING: {
    label: "Design Pending",
    icon: Palette,
    color: "bg-blue-100 text-blue-800",
    nextStatuses: ["DESIGN_APPROVED", "DESIGN_REJECTED", "CANCELLED"],
  },
  DESIGN_APPROVED: {
    label: "Design Approved",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800",
    nextStatuses: ["PAYMENT_PENDING", "PROCESSING"],
  },
  DESIGN_REJECTED: {
    label: "Design Rejected",
    icon: XCircle,
    color: "bg-red-100 text-red-800",
    nextStatuses: ["DESIGN_PENDING", "CANCELLED"],
  },
  PAYMENT_PENDING: {
    label: "Payment Pending",
    icon: CreditCard,
    color: "bg-orange-100 text-orange-800",
    nextStatuses: ["PAYMENT_CONFIRMED", "CANCELLED"],
  },
  PAYMENT_CONFIRMED: {
    label: "Payment Confirmed",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800",
    nextStatuses: ["PROCESSING", "PRODUCTION"],
  },
  PROCESSING: {
    label: "Processing",
    icon: Package,
    color: "bg-purple-100 text-purple-800",
    nextStatuses: ["PRODUCTION", "SHIPPED", "CANCELLED"],
  },
  PRODUCTION: {
    label: "In Production",
    icon: Factory,
    color: "bg-purple-100 text-purple-800",
    nextStatuses: ["SHIPPED", "CANCELLED"],
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    color: "bg-blue-100 text-blue-800",
    nextStatuses: ["DELIVERED"],
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800",
    nextStatuses: ["REFUNDED"],
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-100 text-red-800",
    nextStatuses: ["REFUNDED"],
  },
  REFUNDED: {
    label: "Refunded",
    icon: XCircle,
    color: "bg-gray-100 text-gray-800",
    nextStatuses: [],
  },
};

const STATUS_CHANGE_REASONS: Record<string, string[]> = {
  CONFIRMED: [
    "Order details verified",
    "Payment method confirmed",
    "Customer information validated",
  ],
  DESIGN_APPROVED: [
    "Customer approved the design",
    "Design meets requirements",
    "Auto-approved after timeout",
  ],
  DESIGN_REJECTED: [
    "Customer requested changes",
    "Design doesn't meet specifications",
    "Quality concerns",
  ],
  PAYMENT_CONFIRMED: [
    "Payment received via M-PESA",
    "Bank transfer confirmed",
    "Credit card payment processed",
  ],
  PROCESSING: [
    "Order moved to production queue",
    "Materials sourced and ready",
    "Production started",
  ],
  PRODUCTION: [
    "Manufacturing has begun",
    "Items are being produced",
    "Quality control in progress",
  ],
  SHIPPED: [
    "Package handed to courier",
    "Tracking number assigned",
    "Out for delivery",
  ],
  DELIVERED: [
    "Successfully delivered to customer",
    "Customer confirmed receipt",
    "Package delivered per tracking",
  ],
  CANCELLED: [
    "Customer requested cancellation",
    "Payment failed",
    "Out of stock",
    "Quality issues",
  ],
};

// Mock note implementation
const mockAddOrderNote = async (noteData: CreateOrderNoteDto) => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log("Mock note added:", noteData);
  toast.success("Note added successfully");
  return { success: true, data: noteData };
};

export default function OrderStatusUpdate({
  order,
  onStatusUpdated,
}: OrderStatusUpdateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(
    null
  );
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [addNote, setAddNote] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] =
    useState<(typeof NOTE_TYPES)[number]>("GENERAL");
  const [notePriority, setNotePriority] =
    useState<(typeof NOTE_PRIORITIES)[number]>("NORMAL");
  const [isAddingNote, setIsAddingNote] = useState(false);

  const { mutate: updateOrderStatus, isPending: isUpdatingStatus } =
    useUpdateOrderStatus();
  const { mutate: updateOrder, isPending: isUpdatingOrder } = useUpdateOrder();

  const currentStatus = order.status as OrderStatus;
  const currentStatusConfig = ORDER_STATUS_FLOW[currentStatus];
  const availableStatuses = currentStatusConfig?.nextStatuses || [];

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;

    const finalReason = reason === "custom" ? customReason : reason;

    try {
      // Update the order status
      updateOrderStatus({
        orderId: order.id,
        values: {
          status: selectedStatus,
          reason: finalReason,
        },
      });

      // Update additional fields if needed (for shipping)
      if (selectedStatus === "SHIPPED") {
        const updateData: UpdateOrderDto = {};

        if (trackingNumber) updateData.trackingNumber = trackingNumber;
        if (trackingUrl) updateData.trackingUrl = trackingUrl;
        if (expectedDelivery) updateData.expectedDelivery = expectedDelivery;

        if (Object.keys(updateData).length > 0) {
          updateOrder({
            orderId: order.id,
            values: updateData,
          });
        }
      }

      // Add note if requested
      if (addNote && noteContent.trim()) {
        setIsAddingNote(true);
        try {
          await mockAddOrderNote({
            type: noteType,
            content: noteContent,
            title: `Status change to ${selectedStatus}`,
            priority: notePriority,
            isInternal: true,
          });
        } catch (error) {
          console.error("Failed to add note:", error);
          toast.error("Failed to add note, but status was updated");
        } finally {
          setIsAddingNote(false);
        }
      }

      // Close dialog and reset form
      setIsOpen(false);
      resetForm();

      // Call callback if provided
      onStatusUpdated?.();
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  const resetForm = () => {
    setSelectedStatus(null);
    setReason("");
    setCustomReason("");
    setTrackingNumber("");
    setTrackingUrl("");
    setExpectedDelivery("");
    setAddNote(false);
    setNoteContent("");
    setNoteType("GENERAL");
    setNotePriority("NORMAL");
  };

  const getCurrentStatusBadge = () => {
    const Icon = currentStatusConfig?.icon || Clock;
    return (
      <Badge
        className={currentStatusConfig?.color || "bg-gray-100 text-gray-800"}
      >
        <Icon className="mr-1 h-3 w-3" />
        {currentStatusConfig?.label || currentStatus}
      </Badge>
    );
  };

  const canUpdateStatus = availableStatuses.length > 0;
  const selectedStatusConfig = selectedStatus
    ? ORDER_STATUS_FLOW[selectedStatus]
    : null;
  const reasonOptions = selectedStatus
    ? STATUS_CHANGE_REASONS[selectedStatus] || []
    : [];

  const isFormValid = () => {
    if (!selectedStatus) return false;
    if (!reason) return false;
    if (reason === "custom" && !customReason.trim()) return false;
    if (selectedStatus === "SHIPPED" && !trackingNumber.trim()) return false;
    return true;
  };

  const isLoading = isUpdatingStatus || isUpdatingOrder || isAddingNote;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Order Status</span>
          {getCurrentStatusBadge()}
        </CardTitle>
        <CardDescription>Current status and available actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canUpdateStatus ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No status updates available for orders in{" "}
              {currentStatusConfig?.label} status.
            </AlertDescription>
          </Alert>
        ) : (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Package className="mr-2 h-4 w-4" />
                Update Status
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
                {/* Current Status */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Current Status:</span>
                  {getCurrentStatusBadge()}
                </div>

                {/* New Status Selection */}
                <div className="space-y-2">
                  <Label htmlFor="status">New Status</Label>
                  <Select
                    value={selectedStatus || ""}
                    onValueChange={(value: string) => {
                      setSelectedStatus(value as OrderStatus);
                      setReason(""); // Reset reason when status changes
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStatuses.map((status) => {
                        const statusConfig = ORDER_STATUS_FLOW[status];
                        const Icon = statusConfig?.icon || Clock;
                        return (
                          <SelectItem key={status} value={status}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{statusConfig?.label || status}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Change Reason */}
                {selectedStatus && reasonOptions.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Change</Label>
                    <Select value={reason} onValueChange={setReason}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {reasonOptions.map((reasonOption, index) => (
                          <SelectItem key={index} value={reasonOption}>
                            {reasonOption}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom reason...</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Custom Reason Input */}
                {reason === "custom" && (
                  <div className="space-y-2">
                    <Label htmlFor="customReason">Custom Reason</Label>
                    <Textarea
                      id="customReason"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Enter custom reason..."
                      rows={2}
                    />
                  </div>
                )}

                {/* Shipping Information (for SHIPPED status) */}
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
                          onChange={(e) => setTrackingNumber(e.target.value)}
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
                          onChange={(e) => setExpectedDelivery(e.target.value)}
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
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="noteType">Note Type</Label>
                          <Select
                            value={noteType}
                            onValueChange={(value) =>
                              setNoteType(value as (typeof NOTE_TYPES)[number])
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {NOTE_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type.replace("_", " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notePriority">Priority</Label>
                          <Select
                            value={notePriority}
                            onValueChange={(value) =>
                              setNotePriority(
                                value as (typeof NOTE_PRIORITIES)[number]
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {NOTE_PRIORITIES.map((priority) => (
                                <SelectItem key={priority} value={priority}>
                                  {priority}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

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
                    </div>
                  )}
                </div>

                {/* Preview */}
                {selectedStatus && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Preview Changes:</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <span>Status will change from</span>
                      {getCurrentStatusBadge()}
                      <span>to</span>
                      {selectedStatusConfig && (
                        <Badge className={selectedStatusConfig.color}>
                          <selectedStatusConfig.icon className="mr-1 h-3 w-3" />
                          {selectedStatusConfig.label}
                        </Badge>
                      )}
                    </div>
                    {reason && reason !== "custom" && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Reason: {reason}
                      </p>
                    )}
                    {customReason && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Reason: {customReason}
                      </p>
                    )}
                    {selectedStatus === "SHIPPED" && trackingNumber && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Tracking: {trackingNumber}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStatusUpdate}
                  disabled={!isFormValid() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Status"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Quick Actions */}
        {canUpdateStatus && (
          <div className="grid grid-cols-2 gap-2">
            {availableStatuses.slice(0, 2).map((status) => {
              const statusConfig = ORDER_STATUS_FLOW[status];
              const Icon = statusConfig?.icon || Clock;

              return (
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedStatus(status);
                    setIsOpen(true);
                  }}
                  className="justify-start"
                >
                  <Icon className="mr-2 h-3 w-3" />
                  {statusConfig?.label}
                </Button>
              );
            })}
          </div>
        )}

        {/* Order Timeline Preview */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            POSSIBLE NEXT STEPS
          </Label>
          <div className="flex flex-wrap gap-1">
            {availableStatuses.map((status) => {
              const statusConfig = ORDER_STATUS_FLOW[status];
              return (
                <Badge key={status} variant="outline" className="text-xs">
                  {statusConfig?.label || status}
                </Badge>
              );
            })}
            {availableStatuses.length === 0 && (
              <span className="text-xs text-muted-foreground">
                No further status changes available
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
