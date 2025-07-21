/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useOrder, useUpdateOrder } from "@/hooks/use-orders";
import { updateOrderSchema, UpdateOrderDto } from "@/lib/orders/dto/orders.dto";
import { OrderResponse } from "@/lib/orders/types/orders.types";

const ORDER_STATUSES = [
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

const URGENCY_LEVELS = [
  { value: "NORMAL", label: "Normal" },
  { value: "EXPEDITED", label: "Expedited" },
  { value: "RUSH", label: "Rush" },
  { value: "EMERGENCY", label: "Emergency" },
];

function EditOrderSkeleton() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-8 w-64" />
      </div>

      <div className="space-y-6">
        <Skeleton className="h-10 w-full max-w-md" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const { data: orderResult, isLoading, error } = useOrder(orderId);
  const updateOrderMutation = useUpdateOrder(orderId);

  const form = useForm<UpdateOrderDto>({
    resolver: zodResolver(updateOrderSchema),
    defaultValues: {
      status: undefined,
      trackingNumber: "",
      trackingUrl: "",
      expectedDelivery: "",
      notes: "",
      urgencyLevel: undefined,
      expectedProductionDays: undefined,
      specialInstructions: "",
    },
  });

  // Load order data and populate form
  useEffect(() => {
    if (orderResult?.success && orderResult.data) {
      const order = orderResult.data as OrderResponse;

      form.reset({
        status: order.status as any,
        trackingNumber: order.trackingNumber || "",
        trackingUrl: order.trackingUrl || "",
        expectedDelivery: order.expectedDelivery
          ? new Date(order.expectedDelivery).toISOString().split("T")[0]
          : "",
        notes: order.notes || "",
        urgencyLevel: order.urgencyLevel as any,
        expectedProductionDays: order.expectedProductionDays,
        specialInstructions: order.specialInstructions || "",
      });
    }
  }, [orderResult, form]);

  const onSubmit = async (data: UpdateOrderDto) => {
    try {
      await updateOrderMutation.mutateAsync(data);
      router.push(`/dashboard/admin/orders/${orderId}`);
    } catch (error) {
      // Error handling is done in the mutation
      console.error("Error updating order:", error);
    }
  };

  if (isLoading) {
    return <EditOrderSkeleton />;
  }

  if (error || !orderResult?.success) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || "Order not found"}
            <Link href="/dashboard/admin/orders" className="ml-2 underline">
              Return to orders
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const order = orderResult.data as OrderResponse;

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href={`/dashboard/admin/orders/${orderId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Order {order.orderNumber}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Current Status: {order.status.replace("_", " ")}
            </Badge>
            {order.urgencyLevel && order.urgencyLevel !== "NORMAL" && (
              <Badge variant="destructive">{order.urgencyLevel}</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/admin/orders/${orderId}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={updateOrderMutation.isPending}
          >
            {updateOrderMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Order
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium">Total Amount</p>
              <p className="text-muted-foreground">
                ${order.totalAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="font-medium">Items</p>
              <p className="text-muted-foreground">
                {order.orderItems?.length || 0}
              </p>
            </div>
            <div>
              <p className="font-medium">Customer</p>
              <p className="text-muted-foreground">
                {order.customerId || "Guest"}
              </p>
            </div>
            <div>
              <p className="font-medium">Created</p>
              <p className="text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="status" className="space-y-4">
            <TabsList className="grid grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="status">Status & Details</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="notes">Notes & Instructions</TabsTrigger>
            </TabsList>

            {/* Status & Details Tab */}
            <TabsContent value="status">
              <Card>
                <CardHeader>
                  <CardTitle>Order Status & Details</CardTitle>
                  <CardDescription>
                    Update the order status and priority settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <SelectValue placeholder="Select order status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ORDER_STATUSES.map((status) => (
                                <SelectItem
                                  key={status.value}
                                  value={status.value}
                                >
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Update the order status to reflect its current state
                            in the fulfillment process.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                                <SelectValue placeholder="Select urgency level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {URGENCY_LEVELS.map((level) => (
                                <SelectItem
                                  key={level.value}
                                  value={level.value}
                                >
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Set the priority level for this order.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="expectedDelivery"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Delivery Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>
                            Set the expected delivery date for this order.
                          </FormDescription>
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
                              placeholder="Number of days"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Estimated number of days for production.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Shipping Tab */}
            <TabsContent value="shipping">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                  <CardDescription>
                    Update tracking and shipping details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="trackingNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tracking Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter tracking number"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide the tracking number for this shipment.
                        </FormDescription>
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
                            placeholder="https://..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional: Direct link to track this shipment.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Display current shipping info */}
                  {order.shippingAddress && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">
                        Current Shipping Address
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Address ID: {order.shippingAddress.id}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        To update the shipping address, please contact support.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notes & Instructions Tab */}
            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Notes & Instructions</CardTitle>
                  <CardDescription>
                    Add or update notes and special instructions for this order.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Internal Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any internal notes about this order..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          These notes are for internal use and will not be
                          visible to the customer.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any special instructions for production..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Special instructions for production, handling, or
                          delivery.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Submit Actions */}
          <div className="flex justify-end gap-4">
            <Link href={`/dashboard/admin/orders/${orderId}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={updateOrderMutation.isPending}>
              {updateOrderMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Order
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Design Approval Quick Actions */}
      {order.designApprovalRequired && (
        <Card>
          <CardHeader>
            <CardTitle>Design Approval Actions</CardTitle>
            <CardDescription>
              Quick actions for managing design approval for this order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm">
                  <strong>Status:</strong>{" "}
                  {order.designApproval?.status || "Not Requested"}
                </p>
                {order.designApproval?.requestedAt && (
                  <p className="text-sm text-muted-foreground">
                    Requested:{" "}
                    {new Date(
                      order.designApproval.requestedAt
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {!order.designApproval ? (
                  <Link
                    href={`/dashboard/admin/communication/approvals/create?orderId=${order.id}`}
                  >
                    <Button variant="outline" size="sm">
                      Send Approval Request
                    </Button>
                  </Link>
                ) : (
                  <Link
                    href={`/dashboard/admin/communication/approvals/${order.designApproval.id}`}
                  >
                    <Button variant="outline" size="sm">
                      View Approval Details
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
