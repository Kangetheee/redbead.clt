/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

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
import { getOrderAction } from "@/lib/orders/orders.action";

// Update order schema - focusing on editable fields
const updateOrderSchema = z.object({
  status: z.string().min(1, "Status is required"),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().optional(),
  expectedDelivery: z.string().optional(),
  notes: z.string().optional(),
  shippingCarrier: z.string().optional(),
});

type UpdateOrderDto = z.infer<typeof updateOrderSchema>;

const ORDER_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "PAYMENT_PENDING", label: "Payment Pending" },
  { value: "PAYMENT_CONFIRMED", label: "Payment Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "PRODUCTION", label: "In Production" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

const SHIPPING_CARRIERS = [
  { value: "ups", label: "UPS" },
  { value: "fedex", label: "FedEx" },
  { value: "usps", label: "USPS" },
  { value: "dhl", label: "DHL" },
  { value: "amazon", label: "Amazon Logistics" },
  { value: "other", label: "Other" },
];

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);

  const form = useForm<UpdateOrderDto>({
    resolver: zodResolver(updateOrderSchema),
    defaultValues: {
      status: "",
      trackingNumber: "",
      trackingUrl: "",
      expectedDelivery: "",
      notes: "",
      shippingCarrier: "",
    },
  });

  // Load order data
  useEffect(() => {
    const loadOrder = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getOrderAction(orderId);

        if (!result.success) {
          setError(result.error || "Order not found");
          return;
        }

        const orderData = result.data;
        setOrder(orderData);

        // Populate form with existing data
        form.reset({
          status: orderData.status,
          trackingNumber: orderData.trackingNumber || "",
          trackingUrl: orderData.trackingUrl || "",
          expectedDelivery: orderData.expectedDelivery
            ? new Date(orderData.expectedDelivery).toISOString().split("T")[0]
            : "",
          notes: orderData.notes || "",
          shippingCarrier: orderData.shippingCarrier || "",
        });
      } catch (err) {
        setError("Failed to load order data");
        console.error("Error loading order:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      loadOrder();
    }
  }, [orderId, form]);

  const onSubmit = async (data: UpdateOrderDto) => {
    setIsSubmitting(true);

    try {
      // Mock update - replace with actual API call
      console.log("Updating order with data:", data);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For now, just show success message
      toast.success("Order updated successfully!", {
        description: "The order information has been updated.",
        duration: 3000,
      });

      router.push(`/admin/orders/${orderId}`);
    } catch (error) {
      console.error("Error updating order:", error);

      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          toast.error("Order Not Found", {
            description: "The order you're trying to update doesn't exist.",
            duration: 5000,
          });
        } else if (error.message.includes("permission")) {
          toast.error("Permission Denied", {
            description: "You don't have permission to update this order.",
            duration: 5000,
          });
        } else if (error.message.includes("status")) {
          toast.error("Invalid Status Transition", {
            description: "The status change is not allowed for this order.",
            duration: 5000,
          });
        } else {
          toast.error("Update Failed", {
            description: error.message || "An unexpected error occurred.",
            duration: 5000,
          });
        }
      } else {
        toast.error("System Error", {
          description:
            "A system error occurred. Please try again or contact support.",
          duration: 5000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading order...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Link href="/admin/orders" className="ml-2 underline">
              Return to orders
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href={`/admin/orders/${orderId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Order {order?.orderNumber}
            </h1>
          </div>
          <p className="text-muted-foreground">
            Update order status and shipping information
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/orders/${orderId}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? (
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="status" className="space-y-4">
            <TabsList className="grid grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            {/* Status Tab */}
            <TabsContent value="status">
              <Card>
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                  <CardDescription>
                    Update the current status of this order.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Status</FormLabel>
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
                    name="shippingCarrier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Carrier</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select shipping carrier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SHIPPING_CARRIERS.map((carrier) => (
                              <SelectItem
                                key={carrier.value}
                                value={carrier.value}
                              >
                                {carrier.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the carrier responsible for shipping this
                          order.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                  <CardDescription>
                    Add or update internal notes for this order.
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
                            placeholder="Add any notes about this order..."
                            className="min-h-[150px]"
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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
            <Link href={`/admin/orders/${orderId}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
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
    </div>
  );
}
