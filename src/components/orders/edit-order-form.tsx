/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  FileText,
  AlertTriangle,
  Save,
  ArrowLeft,
  Loader2,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useOrder, useUpdateOrder } from "@/hooks/use-orders";
import {
  UpdateOrderDto,
  updateOrderSchema,
  ORDER_STATUS,
  URGENCY_LEVELS,
} from "@/lib/orders/dto/orders.dto";
import {
  OrderResponse,
  OrderItem,
  isOrderItem,
} from "@/lib/orders/types/orders.types";

interface EditOrderFormProps {
  orderId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Helper function to format date for input
const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toISOString().split("T")[0];
  } catch {
    return "";
  }
};

// Helper function to get status badge configuration
const getStatusConfig = (status: string) => {
  const statusConfigs: Record<string, { color: string; label: string }> = {
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
  };

  return (
    statusConfigs[status] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
    }
  );
};

// Helper function to format order items properly
const formatOrderItems = (orderItems: (OrderItem | string)[]): OrderItem[] => {
  if (!Array.isArray(orderItems)) return [];

  return orderItems.map((item, index) => {
    if (typeof item === "string") {
      return {
        id: item,
        templateId: "Unknown",
        sizeVariantId: "Unknown",
        quantity: 1,
      };
    }
    return item;
  });
};

export default function EditOrderForm({
  orderId,
  onSuccess,
  onCancel,
}: EditOrderFormProps) {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch order data
  const {
    data: order,
    isLoading: orderLoading,
    error: orderError,
  } = useOrder(orderId);
  const updateOrder = useUpdateOrder();

  const form = useForm<UpdateOrderDto>({
    resolver: zodResolver(updateOrderSchema),
    defaultValues: {
      urgencyLevel: "NORMAL",
      expectedProductionDays: 5,
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = form;

  // Initialize form with order data
  useEffect(() => {
    if (order && !isInitialized) {
      const formData: Partial<UpdateOrderDto> = {
        status: order.status,
        trackingNumber: order.trackingNumber || "",
        trackingUrl: order.trackingUrl || "",
        expectedDelivery: formatDateForInput(order.expectedDelivery),
        notes: order.notes || "",
        urgencyLevel: order.urgencyLevel || "NORMAL",
        expectedProductionDays: order.expectedProductionDays || 5,
        specialInstructions: order.specialInstructions || "",
        designStartDate: formatDateForInput(order.designStartDate),
        designCompletionDate: formatDateForInput(order.designCompletionDate),
        productionStartDate: formatDateForInput(order.productionStartDate),
        productionEndDate: formatDateForInput(order.productionEndDate),
        shippingDate: formatDateForInput(order.shippingDate),
        actualDeliveryDate: formatDateForInput(order.actualDeliveryDate),
      };

      reset(formData);
      setIsInitialized(true);
    }
  }, [order, reset, isInitialized]);

  const onSubmit = async (data: UpdateOrderDto) => {
    try {
      await updateOrder.mutateAsync({ orderId, values: data });
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  const renderStatusBadge = (status: string) => {
    const config = getStatusConfig(status);
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const renderOrderItem = (item: OrderItem, index: number) => (
    <div
      key={item.id || index}
      className="flex items-center justify-between p-3 border rounded-lg"
    >
      <div className="space-y-1">
        <p className="font-medium">
          {item.template?.name || `Template ID: ${item.templateId}`}
        </p>
        <p className="text-sm text-muted-foreground">
          Size: {item.sizeVariant?.displayName || item.sizeVariantId}
        </p>
        <p className="text-sm text-muted-foreground">
          Quantity: {item.quantity}
        </p>
        {item.customizations && item.customizations.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Customizations:{" "}
            {item.customizations.map((c, i) => (
              <span key={i}>
                {c.customValue || c.valueId}
                {i < item.customizations!.length - 1 && ", "}
              </span>
            ))}
          </p>
        )}
        {item.status && (
          <Badge variant="outline" className="text-xs">
            {item.status.replace(/_/g, " ")}
          </Badge>
        )}
      </div>
      <Badge variant="outline">Item {index + 1}</Badge>
    </div>
  );

  if (orderLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading order details...</span>
        </div>
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load order details. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const formattedOrderItems = formatOrderItems(order.orderItems);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Edit Order #{order.orderNumber}
          </h1>
          <p className="text-muted-foreground">
            Update order details and status
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">
              Current Status:
            </span>
            {renderStatusBadge(order.status)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => onCancel?.() || router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                CUSTOMER
              </Label>
              <p className="font-medium">
                {order.customerId || "Guest Customer"}
              </p>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                TOTAL AMOUNT
              </Label>
              <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">
                {formattedOrderItems.length} items
              </p>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                CREATED
              </Label>
              <p className="font-medium">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Order Status & Tracking
              </CardTitle>
              <CardDescription>
                Update order status and shipping information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ORDER_STATUS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectedDelivery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Delivery</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="trackingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tracking Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter tracking number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trackingUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tracking URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://tracking-url.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Order Details
              </CardTitle>
              <CardDescription>
                Update order specifications and requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="urgencyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urgency Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select urgency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {URGENCY_LEVELS.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level.charAt(0) + level.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectedProductionDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Production Days</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="5"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              parseInt(e.target.value) || undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="specialInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special requirements or notes..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internal Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Internal notes about this order..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Timeline Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline Management
              </CardTitle>
              <CardDescription>
                Set and track important dates for this order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="designStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Design Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="designCompletionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Design Completion Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productionStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Production Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productionEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Production End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shippingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="actualDeliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Actual Delivery Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Items (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
              <CardDescription>Items in this order (read-only)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formattedOrderItems.length > 0 ? (
                  formattedOrderItems.map((item, index) =>
                    renderOrderItem(item, index)
                  )
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No items found in this order
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {isDirty ? "You have unsaved changes" : "No changes made"}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={!isDirty || isSubmitting}
              >
                Reset Changes
              </Button>

              <Button type="submit" disabled={!isDirty || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Form Errors */}
          {Object.keys(errors).length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please fix the errors above before saving.
              </AlertDescription>
            </Alert>
          )}
        </form>
      </Form>
    </div>
  );
}
