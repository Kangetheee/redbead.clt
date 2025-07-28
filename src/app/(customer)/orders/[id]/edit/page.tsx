/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { getSession } from "@/lib/session/session";
import { notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import EditOrderForm from "@/components/orders/edit-order-form";

interface EditOrderPageProps {
  params: {
    orderId: string;
  };
}

export default function EditOrdersPage({ params }: EditOrderPageProps) {
  const session = getSession();
  const router = useRouter();
  const { orderId } = params;

  if (!orderId || orderId.length < 10) {
    notFound();
  }

  const handleSuccess = () => {
    router.push(`/orders/${orderId}`);
  };

  const handleCancel = () => {
    router.push(`/orders/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <EditOrderForm
        orderId={orderId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
