import React from "react";
import { getSession } from "@/lib/session/session";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import OrderTracking from "@/components/orders/order-tracking";

interface OrderTrackingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderTrackingPage({
  params,
}: OrderTrackingPageProps) {
  const session = await getSession();
  const { id: orderId } = await params;

  // Check if user is authenticated
  if (!session) {
    redirect("/auth/login");
  }

  if (!orderId || orderId.length < 10) {
    notFound();
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
        <OrderTracking orderId={orderId} userId={session.user.id} />
      </div>
    </div>
  );
}
