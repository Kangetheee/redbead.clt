/* eslint-disable @typescript-eslint/no-unused-vars */
import { getSession } from "@/lib/session/session";
import { notFound } from "next/navigation";
import OrderInvoiceClient from "./invoice-client";

interface OrderInvoicePageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function OrderInvoicePage({
  params,
}: OrderInvoicePageProps) {
  const session = await getSession(); // Don't forget to await
  const { orderId } = await params;

  if (!orderId || orderId.length < 10) {
    notFound();
  }

  return <OrderInvoiceClient orderId={orderId} />;
}
