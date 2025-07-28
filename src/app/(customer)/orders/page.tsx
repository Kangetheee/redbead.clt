/* eslint-disable @typescript-eslint/no-unused-vars */
import { getSession } from "@/lib/session/session";
import OrdersClient from "./orders-client";

export default async function OrdersPage() {
  const session = await getSession(); // Must be awaited

  return <OrdersClient />;
}
