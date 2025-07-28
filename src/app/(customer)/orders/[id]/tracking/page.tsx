/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { getSession } from "@/lib/session/session";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import CustomerOrderTracking from "@/components/orders/order-tracking";

interface OrderTrackingPageProps {
  params: {
    orderId: string;
  };
}

export default function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  const session = getSession();
  const { orderId } = params;

  if (!orderId || orderId.length < 10) {
    notFound();
  }

  const handleDesignApprovalClick = () => {
    window.location.href = `/orders/${orderId}/design-approval`;
  };

  const handlePaymentClick = () => {
    window.location.href = `/orders/${orderId}/payment`;
  };

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
              <h1 className="text-2xl font-bold">Order Tracking</h1>
              <p className="text-muted-foreground">
                Track your order progress in real-time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Component */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <CustomerOrderTracking
          orderId={orderId}
          showEstimates={true}
          autoRefresh={true}
          onDesignApprovalClick={handleDesignApprovalClick}
          onPaymentClick={handlePaymentClick}
        />
      </div>
    </div>
  );
}
