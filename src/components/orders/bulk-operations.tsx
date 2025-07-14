/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  CheckSquare,
  Square,
  MoreHorizontal,
  Download,
  Mail,
  Package,
  Trash2,
  Edit,
  Filter,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle,
  FileText,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

import { OrderResponse } from "@/lib/orders/types/orders.types";
import { useUpdateOrderStatus, useAddOrderNote } from "@/hooks/use-orders";
import {
  updateOrderStatusAction,
  addOrderNoteAction,
} from "@/lib/orders/orders.action";
import {
  UpdateOrderStatusDto,
  CreateOrderNoteDto,
} from "@/lib/orders/dto/orders.dto";

interface BulkOperationsProps {
  orders: OrderResponse[];
  selectedOrders: string[];
  onSelectionChange: (orderIds: string[]) => void;
  onOrdersUpdated?: () => void;
}

type BulkActionType =
  | "UPDATE_STATUS"
  | "EXPORT"
  | "SEND_EMAIL"
  | "ADD_NOTE"
  | "CANCEL_ORDERS"
  | "ARCHIVE";

// Define the exact order status type from the DTO
type OrderStatus =
  | "PENDING"
  | "DESIGN_PENDING"
  | "DESIGN_APPROVED"
  | "DESIGN_REJECTED"
  | "PAYMENT_PENDING"
  | "PAYMENT_CONFIRMED"
  | "PROCESSING"
  | "PRODUCTION"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

interface BulkAction {
  id: BulkActionType;
  label: string;
  description: string;
  icon: React.ElementType;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

const BULK_ACTIONS: BulkAction[] = [
  {
    id: "UPDATE_STATUS",
    label: "Update Status",
    description: "Change status for selected orders",
    icon: Package,
  },
  {
    id: "EXPORT",
    label: "Export Orders",
    description: "Download order data as CSV",
    icon: Download,
  },
  {
    id: "SEND_EMAIL",
    label: "Send Email",
    description: "Send notification to customers",
    icon: Mail,
  },
  {
    id: "ADD_NOTE",
    label: "Add Note",
    description: "Add note to selected orders",
    icon: FileText,
  },
  {
    id: "CANCEL_ORDERS",
    label: "Cancel Orders",
    description: "Cancel selected orders",
    icon: Trash2,
    variant: "destructive",
  },
];

const ORDER_STATUSES: Array<{ value: OrderStatus; label: string }> = [
  { value: "PENDING", label: "Pending" },
  { value: "DESIGN_PENDING", label: "Design Pending" },
  { value: "DESIGN_APPROVED", label: "Design Approved" },
  { value: "DESIGN_REJECTED", label: "Design Rejected" },
  { value: "PAYMENT_PENDING", label: "Payment Pending" },
  { value: "PAYMENT_CONFIRMED", label: "Payment Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "PRODUCTION", label: "In Production" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

const EMAIL_TEMPLATES = [
  {
    id: "status_update",
    name: "Status Update",
    subject: "Your order status has been updated",
    content:
      "Hi {customerName},\n\nYour order #{orderNumber} status has been updated to {status}.\n\nThank you for your business!",
  },
  {
    id: "shipping_notification",
    name: "Shipping Notification",
    subject: "Your order has been shipped",
    content:
      "Hi {customerName},\n\nGreat news! Your order #{orderNumber} has been shipped.\n\nTracking: {trackingNumber}\n\nEstimated delivery: {expectedDelivery}",
  },
  {
    id: "delay_notification",
    name: "Delay Notification",
    subject: "Update on your order",
    content:
      "Hi {customerName},\n\nWe're writing to update you on your order #{orderNumber}. There has been a slight delay, but we're working hard to get it to you as soon as possible.\n\nWe appreciate your patience.",
  },
];

export default function BulkOperations({
  orders,
  selectedOrders,
  onSelectionChange,
  onOrdersUpdated,
}: BulkOperationsProps) {
  const [activeAction, setActiveAction] = useState<BulkActionType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  // State for different bulk actions - properly typed
  const [bulkStatus, setBulkStatus] = useState<OrderStatus | null>(null);
  const [bulkNote, setBulkNote] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("");
  const [customEmailSubject, setCustomEmailSubject] = useState("");
  const [customEmailContent, setCustomEmailContent] = useState("");

  // Use hooks for individual order operations
  const updateOrderStatus = useUpdateOrderStatus("");
  const addOrderNote = useAddOrderNote("");

  const selectAllRef = useRef<HTMLButtonElement>(null);

  const selectedOrdersData = useMemo(() => {
    return orders.filter((order) => selectedOrders.includes(order.id));
  }, [orders, selectedOrders]);

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

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(orders.map((order) => order.id));
    }
  };

  const handleSelectOrder = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      onSelectionChange(selectedOrders.filter((id) => id !== orderId));
    } else {
      onSelectionChange([...selectedOrders, orderId]);
    }
  };

  const canPerformBulkAction = (actionId: BulkActionType): boolean => {
    if (selectedOrders.length === 0) return false;

    switch (actionId) {
      case "UPDATE_STATUS":
        // Only allow status updates for orders that can be updated
        return selectedOrdersData.some((order) =>
          ["PENDING", "DESIGN_PENDING", "PROCESSING", "PRODUCTION"].includes(
            order.status
          )
        );
      case "CANCEL_ORDERS":
        // Only allow cancellation for orders that haven't been shipped
        return selectedOrdersData.some(
          (order) =>
            !["SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"].includes(
              order.status
            )
        );
      default:
        return true;
    }
  };

  const executeBulkAction = async (actionId: BulkActionType) => {
    setIsProcessing(true);
    setProgress(0);
    setProcessedCount(0);
    setFailedCount(0);

    try {
      const totalOrders = selectedOrders.length;
      let completed = 0;
      let failed = 0;

      // Handle bulk operations sequentially
      for (const orderId of selectedOrders) {
        try {
          switch (actionId) {
            case "UPDATE_STATUS":
              if (bulkStatus) {
                const statusData: UpdateOrderStatusDto = {
                  status: bulkStatus,
                  reason: "Bulk status update",
                };

                // Use the action directly for bulk operations
                const result = await updateOrderStatusAction(
                  orderId,
                  statusData
                );
                if (!result.success) {
                  throw new Error(result.error);
                }

                console.log(`Updated order ${orderId} to status ${bulkStatus}`);
              }
              break;

            case "CANCEL_ORDERS":
              const cancelData: UpdateOrderStatusDto = {
                status: "CANCELLED",
                reason: "Bulk cancellation",
              };

              const cancelResult = await updateOrderStatusAction(
                orderId,
                cancelData
              );
              if (!cancelResult.success) {
                throw new Error(cancelResult.error);
              }

              console.log(`Cancelled order ${orderId}`);
              break;

            case "ADD_NOTE":
              if (bulkNote.trim()) {
                const noteData: CreateOrderNoteDto = {
                  noteType: "GENERAL",
                  title: "Bulk Note",
                  content: bulkNote,
                  isInternal: false,
                };

                const noteResult = await addOrderNoteAction(orderId, noteData);
                if (!noteResult.success) {
                  throw new Error(noteResult.error);
                }

                console.log(`Added note to order ${orderId}: ${bulkNote}`);
              }
              break;

            case "SEND_EMAIL":
              // Here you would call the email API action
              await new Promise((resolve) => setTimeout(resolve, 400));
              console.log(`Sent email for order ${orderId}`);
              break;

            case "EXPORT":
              // Export would be handled differently (likely a single API call)
              break;
          }

          completed++;
          setProcessedCount(completed);
          setProgress((completed / totalOrders) * 100);
        } catch (error) {
          console.error(`Failed to process order ${orderId}:`, error);
          failed++;
          setFailedCount(failed);
          // Continue with other orders even if one fails
        }
      }

      // Final actions
      switch (actionId) {
        case "EXPORT":
          // Generate and download CSV
          const csvContent = generateCSV(selectedOrdersData);
          downloadCSV(
            csvContent,
            `orders-${new Date().toISOString().split("T")[0]}.csv`
          );
          break;
      }

      if (failed > 0) {
        toast.success(
          `Bulk action completed: ${completed} successful, ${failed} failed`
        );
      } else {
        toast.success(
          `Bulk action completed successfully for ${completed} orders`
        );
      }

      setActiveAction(null);
      onOrdersUpdated?.();
      onSelectionChange([]); // Clear selection

      // Reset form states
      setBulkStatus(null);
      setBulkNote("");
      setEmailTemplate("");
      setCustomEmailSubject("");
      setCustomEmailContent("");
    } catch (error) {
      toast.error("Failed to complete bulk action");
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProcessedCount(0);
      setFailedCount(0);
    }
  };

  const generateCSV = (orders: OrderResponse[]): string => {
    const headers = [
      "Order Number",
      "Status",
      "Customer",
      "Total Amount",
      "Items",
      "Created Date",
      "Expected Delivery",
      "Tracking Number",
      "Urgency Level",
    ];

    const rows = orders.map((order) => [
      order.orderNumber,
      order.status,
      order.customerId,
      order.totalAmount.toString(),
      order.orderItems.length.toString(),
      new Date(order.createdAt).toLocaleDateString(),
      order.expectedDelivery
        ? new Date(order.expectedDelivery).toLocaleDateString()
        : "",
      order.trackingNumber || "",
      order.urgencyLevel || "",
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSelectionSummary = () => {
    if (selectedOrders.length === 0) return "No orders selected";

    const statusCounts = selectedOrdersData.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalValue = selectedOrdersData.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    return {
      count: selectedOrders.length,
      totalValue,
      statusCounts,
    };
  };

  const summary = getSelectionSummary();

  return (
    <div className="space-y-4">
      {/* Selection Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                ref={selectAllRef}
                checked={allSelected}
                onCheckedChange={handleSelectAll}
              />
              <div>
                <CardTitle className="text-lg">Bulk Operations</CardTitle>
                <CardDescription>
                  {typeof summary === "object" ? (
                    <>
                      {summary.count} orders selected • Total: $
                      {summary.totalValue.toFixed(2)}
                    </>
                  ) : (
                    summary
                  )}
                </CardDescription>
              </div>
            </div>

            {selectedOrders.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectionChange([])}
              >
                <X className="h-4 w-4 mr-1" />
                Clear Selection
              </Button>
            )}
          </div>
        </CardHeader>

        {selectedOrders.length > 0 && (
          <CardContent className="pt-0">
            {/* Status Summary */}
            {typeof summary === "object" && (
              <div className="mb-4">
                <Label className="text-xs font-medium text-muted-foreground">
                  SELECTED ORDERS BY STATUS
                </Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(summary.statusCounts).map(
                    ([status, count]) => (
                      <Badge key={status} variant="outline" className="text-xs">
                        {status.replace(/_/g, " ")}: {count}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Bulk Actions */}
            <div className="flex flex-wrap gap-2">
              {BULK_ACTIONS.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant || "outline"}
                  size="sm"
                  onClick={() => setActiveAction(action.id)}
                  disabled={!canPerformBulkAction(action.id) || isProcessing}
                  className="flex items-center gap-2"
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Order Selection List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Orders ({orders.length})</span>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Select:</Label>
              <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                {allSelected ? "None" : "All"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                  selectedOrders.includes(order.id)
                    ? "bg-muted border-primary"
                    : ""
                }`}
                onClick={() => handleSelectOrder(order.id)}
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => {}} // Handled by parent div
                  />
                  <div>
                    <p className="font-medium">#{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.orderItems.length} items • $
                      {order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {order.urgencyLevel && order.urgencyLevel !== "NORMAL" && (
                    <Badge variant="secondary" className="text-xs">
                      {order.urgencyLevel}
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {order.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Dialogs */}

      {/* Update Status Dialog */}
      <Dialog
        open={activeAction === "UPDATE_STATUS"}
        onOpenChange={() => setActiveAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status for {selectedOrders.length} selected orders
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulkStatus">New Status</Label>
              <Select
                value={bulkStatus || ""}
                onValueChange={(value: string) =>
                  setBulkStatus(value as OrderStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing orders...</span>
                  <span>
                    {processedCount}/{selectedOrders.length} (
                    {Math.round(progress)}%)
                  </span>
                </div>
                <Progress value={progress} />
                {failedCount > 0 && (
                  <p className="text-sm text-destructive">
                    {failedCount} operations failed
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActiveAction(null)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={() => executeBulkAction("UPDATE_STATUS")}
              disabled={!bulkStatus || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog
        open={activeAction === "ADD_NOTE"}
        onOpenChange={() => setActiveAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note to Orders</DialogTitle>
            <DialogDescription>
              Add a note to {selectedOrders.length} selected orders
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulkNote">Note Content</Label>
              <Textarea
                id="bulkNote"
                value={bulkNote}
                onChange={(e) => setBulkNote(e.target.value)}
                placeholder="Enter note content..."
                rows={4}
              />
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Adding notes...</span>
                  <span>
                    {processedCount}/{selectedOrders.length} (
                    {Math.round(progress)}%)
                  </span>
                </div>
                <Progress value={progress} />
                {failedCount > 0 && (
                  <p className="text-sm text-destructive">
                    {failedCount} operations failed
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActiveAction(null)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={() => executeBulkAction("ADD_NOTE")}
              disabled={!bulkNote.trim() || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Add Note"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog
        open={activeAction === "SEND_EMAIL"}
        onOpenChange={() => setActiveAction(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Email to Customers</DialogTitle>
            <DialogDescription>
              Send notification email to customers of {selectedOrders.length}{" "}
              selected orders
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailTemplate">Email Template</Label>
              <Select value={emailTemplate} onValueChange={setEmailTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {EMAIL_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {emailTemplate === "custom" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="customEmailSubject">Subject</Label>
                  <Input
                    id="customEmailSubject"
                    type="text"
                    value={customEmailSubject}
                    onChange={(e) => setCustomEmailSubject(e.target.value)}
                    placeholder="Email subject..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customEmailContent">Content</Label>
                  <Textarea
                    id="customEmailContent"
                    value={customEmailContent}
                    onChange={(e) => setCustomEmailContent(e.target.value)}
                    placeholder="Email content..."
                    rows={6}
                  />
                </div>
              </>
            )}

            {emailTemplate && emailTemplate !== "custom" && (
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Preview:</h4>
                <div className="text-sm">
                  <p>
                    <strong>Subject:</strong>{" "}
                    {
                      EMAIL_TEMPLATES.find((t) => t.id === emailTemplate)
                        ?.subject
                    }
                  </p>
                  <p className="mt-2">
                    <strong>Content:</strong>
                  </p>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {
                      EMAIL_TEMPLATES.find((t) => t.id === emailTemplate)
                        ?.content
                    }
                  </p>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sending emails...</span>
                  <span>
                    {processedCount}/{selectedOrders.length} (
                    {Math.round(progress)}%)
                  </span>
                </div>
                <Progress value={progress} />
                {failedCount > 0 && (
                  <p className="text-sm text-destructive">
                    {failedCount} emails failed to send
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActiveAction(null)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={() => executeBulkAction("SEND_EMAIL")}
              disabled={
                !emailTemplate ||
                (emailTemplate === "custom" &&
                  (!customEmailSubject.trim() || !customEmailContent.trim())) ||
                isProcessing
              }
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Emails"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Orders Dialog */}
      <Dialog
        open={activeAction === "CANCEL_ORDERS"}
        onOpenChange={() => setActiveAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Orders</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel {selectedOrders.length} selected
              orders?
            </DialogDescription>
          </DialogHeader>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This action cannot be undone. Cancelled orders cannot be
              reactivated.
            </AlertDescription>
          </Alert>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Cancelling orders...</span>
                <span>
                  {processedCount}/{selectedOrders.length} (
                  {Math.round(progress)}%)
                </span>
              </div>
              <Progress value={progress} />
              {failedCount > 0 && (
                <p className="text-sm text-destructive">
                  {failedCount} orders failed to cancel
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActiveAction(null)}
              disabled={isProcessing}
            >
              Keep Orders
            </Button>
            <Button
              variant="destructive"
              onClick={() => executeBulkAction("CANCEL_ORDERS")}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Orders"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
