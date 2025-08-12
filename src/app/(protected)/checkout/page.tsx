/* eslint-disable @typescript-eslint/no-unused-vars */
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session/session";
import CheckoutClient from "./checkout-client";

export default async function CheckoutPage() {
  // Get session on server side
  let session;
  try {
    session = await getSession();
  } catch (error) {
    // Redirect to login if no session
    redirect("/sign-in?redirect=/checkout");
  }

  // If no session, redirect
  if (!session) {
    redirect("/sign-in?redirect=/checkout");
  }

  return <CheckoutClient session={session} />;
}
