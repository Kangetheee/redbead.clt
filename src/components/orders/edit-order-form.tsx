/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Minus,
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import { useOrder, useUpdateOrder } from "@/hooks/use-orders";
import { UpdateOrderDto, updateOrderSchema } from "@/lib/orders/dto/orders.dto";
import { OrderResponse } from "@/lib/orders/types/orders.types";

// Define the types explicitly to match the schema
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

type UrgencyLevel = "NORMAL" | "EXPEDITED" | "RUSH" | "EMERGENCY";

interface EditOrderFormProps {
  orderId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditOrderForm({
  orderId,
  onSuccess,
  onCancel,
}: EditOrderFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch order data
  const { data: orderData } = useOrder(orderId);
  const order: OrderResponse | null = orderData?.success
    ? orderData.data
    : null;

  const updateOrder = useUpdateOrder(orderId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateOrderDto>({
    resolver: zodResolver(updateOrderSchema),
    defaultValues: {
      urgencyLevel: "NORMAL",
      expectedProductionDays: 5,
    },
  });

  const watchedValues = watch();

  // Initialize form with order data
  useEffect(() => {
    if (order) {
      reset({
        status: order.status as OrderStatus,
        trackingNumber: order.trackingNumber || "",
        trackingUrl: order.trackingUrl || "",
        expectedDelivery: order.expectedDelivery
          ? new Date(order.expectedDelivery).toISOString().split("T")[0]
          : "",
        notes: order.notes || "",
        urgencyLevel: (order.urgencyLevel as UrgencyLevel) || "NORMAL",
        expectedProductionDays: order.expectedProductionDays || 5,
        specialInstructions: order.specialInstructions || "",
      });
      setIsLoading(false);
    }
  }, [order, reset]);

  const onSubmit = async (data: UpdateOrderDto) => {
    try {
      await updateOrder.mutateAsync(data);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
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
    }[status] || { color: "bg-gray-100 text-gray-800", label: status };

    return <Badge className={statusConfig.color}>{statusConfig.label}</Badge>;
  };

  if (isLoading || !order) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading order details...</span>
        </div>
      </div>
    );
  }

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
            {getStatusBadge(order.status)}
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
              <p className="font-medium">{order.customerId}</p>
              {/* {order.customerPhone && (
                <p className="text-sm text-muted-foreground">
                  {order.customerPhone}
                </p>
              )} */}
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                TOTAL AMOUNT
              </Label>
              <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">
                {order.orderItems.length} items
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
              <div className="space-y-2">
                <Label htmlFor="status">Order Status</Label>
                <Select
                  value={watchedValues.status}
                  onValueChange={(value) =>
                    setValue("status", value as OrderStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="DESIGN_PENDING">
                      Design Pending
                    </SelectItem>
                    <SelectItem value="DESIGN_APPROVED">
                      Design Approved
                    </SelectItem>
                    <SelectItem value="DESIGN_REJECTED">
                      Design Rejected
                    </SelectItem>
                    <SelectItem value="PAYMENT_PENDING">
                      Payment Pending
                    </SelectItem>
                    <SelectItem value="PAYMENT_CONFIRMED">
                      Payment Confirmed
                    </SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="PRODUCTION">In Production</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedDelivery">Expected Delivery</Label>
                <Input
                  type="date"
                  id="expectedDelivery"
                  {...register("expectedDelivery")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trackingNumber">Tracking Number</Label>
                <Input
                  id="trackingNumber"
                  {...register("trackingNumber")}
                  placeholder="Enter tracking number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trackingUrl">Tracking URL</Label>
                <Input
                  type="url"
                  id="trackingUrl"
                  {...register("trackingUrl")}
                  placeholder="https://tracking-url.com"
                />
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="urgencyLevel">Urgency Level</Label>
                <Select
                  value={watchedValues.urgencyLevel}
                  onValueChange={(value) =>
                    setValue("urgencyLevel", value as UrgencyLevel)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="EXPEDITED">Expedited</SelectItem>
                    <SelectItem value="RUSH">Rush</SelectItem>
                    <SelectItem value="EMERGENCY">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedProductionDays">
                  Expected Production Days
                </Label>
                <Input
                  type="number"
                  min="1"
                  id="expectedProductionDays"
                  {...register("expectedProductionDays", {
                    valueAsNumber: true,
                  })}
                  placeholder="5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialInstructions">Special Instructions</Label>
              <Textarea
                id="specialInstructions"
                {...register("specialInstructions")}
                placeholder="Any special requirements or notes..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Internal notes about this order..."
                rows={3}
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
              {order.orderItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">Product {item.productId}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                    {item.customizations &&
                      Object.keys(item.customizations).length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Customizations:{" "}
                          {JSON.stringify(item.customizations, null, 1)}
                        </p>
                      )}
                  </div>
                  <Badge variant="outline">Item {index + 1}</Badge>
                </div>
              ))}
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
              disabled={!isDirty || updateOrder.isPending}
            >
              Reset Changes
            </Button>

            <Button type="submit" disabled={!isDirty || updateOrder.isPending}>
              {updateOrder.isPending ? (
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
    </div>
  );
}
