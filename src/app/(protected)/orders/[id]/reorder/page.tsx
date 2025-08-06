import { getSession } from "@/lib/session/session";
import { notFound } from "next/navigation";
import OrderReorderClient from "./reorder-client";

interface OrderReorderPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function OrderReorderPage({
  params,
}: OrderReorderPageProps) {
  const session = await getSession();
  const { orderId } = await params;

  // Server-side validation
  if (!orderId || orderId.length < 10) {
    notFound();
  }

  if (!session) {
    // Redirect to login or handle unauthorized access
    notFound();
  }

  return <OrderReorderClient orderId={orderId} session={session} />;
}
