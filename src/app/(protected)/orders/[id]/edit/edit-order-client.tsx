/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import EditOrderForm from "@/components/orders/edit-order-form";

interface EditOrderClientProps {
  orderId: string;
  session: unknown;
}

export default function EditOrderClient({
  orderId,
  session,
}: EditOrderClientProps) {
  const router = useRouter();

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
