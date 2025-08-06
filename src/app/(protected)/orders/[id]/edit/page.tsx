import { getSession } from "@/lib/session/session";
import { notFound } from "next/navigation";
import EditOrderClient from "./edit-order-client";

interface EditOrderPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function EditOrdersPage({ params }: EditOrderPageProps) {
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

  return <EditOrderClient orderId={orderId} session={session} />;
}
