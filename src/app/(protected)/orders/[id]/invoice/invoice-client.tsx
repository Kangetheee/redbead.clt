"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import OrderInvoices from "@/components/orders/order-invoice";
import { useOrder } from "@/hooks/use-orders";

interface OrderInvoiceClientProps {
  orderId: string;
}

export default function OrderInvoiceClient({
  orderId,
}: OrderInvoiceClientProps) {
  const { data: order, isLoading, error } = useOrder(orderId);

  const handleDownload = () => {
    window.print();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    const subject = `Invoice ${order?.orderNumber}`;
    const body = `Please find attached the invoice for order ${order?.orderNumber}.`;
    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              <span>Loading invoice...</span>
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
              <h1 className="text-2xl font-bold">Invoice</h1>
              <p className="text-muted-foreground">
                Order not found or you don&apos;t have permission to view it
              </p>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              The order you&apos;re trying to view could not be found or you
              don&apos;t have permission to access it. Please check the order ID
              and try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-white print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/orders/${orderId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Order
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Invoice</h1>
              <p className="text-muted-foreground">
                Invoice for Order #{order.orderNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <OrderInvoices
          order={order}
          showActions={true}
          onDownload={handleDownload}
          onPrint={handlePrint}
          onEmail={handleEmail}
        />
      </div>
    </div>
  );
}
