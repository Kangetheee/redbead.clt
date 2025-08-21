/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReorderForm from "@/components/orders/reorder-form";
import { useOrder } from "@/hooks/use-orders";

interface OrderReorderClientProps {
  orderId: string;
  session: unknown;
}

export default function OrderReorderClient({
  orderId,
  session,
}: OrderReorderClientProps) {
  const router = useRouter();
  const { data: order, isLoading, error } = useOrder(orderId);

  const handleSuccess = (newOrderId: string) => {
    router.push(`/orders/${newOrderId}`);
  };

  const handleCancel = () => {
    router.push(`/orders/${orderId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              <span>Loading order details...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" asChild>
              <Link href="/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Reorder Items</h1>
              <p className="text-muted-foreground">
                Order not found or you don&apos;t have permission to reorder it
              </p>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              The order you&apos;re trying to reorder could not be found or you
              don&apos;t have permission to access it. Please check the order ID
              and try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Check if order can be reordered
  const canReorder = ["DELIVERED", "CANCELLED"].includes(order.status);

  if (!canReorder) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/orders/${orderId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Order
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Reorder Items</h1>
              <p className="text-muted-foreground">
                This order cannot be reordered at this time
              </p>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              Orders can only be reordered once they have been delivered or
              cancelled. The current status of this order is &quot;
              {order.status}&quot;.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/orders/${orderId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Order
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Reorder Items</h1>
              <p className="text-muted-foreground">
                Create a new order based on Order #{order.orderNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reorder Form */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <ReorderForm
          originalOrder={order}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
