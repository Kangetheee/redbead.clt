/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { getSession } from "@/lib/session/session";
import { notFound } from "next/navigation";
import OrderDetailView from "@/components/orders/order-detail-view";

interface OrderDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const session = getSession();
  const { id: orderId } = await params;

  if (!orderId || orderId.length < 10) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <OrderDetailView orderId={orderId} />
    </div>
  );
}
