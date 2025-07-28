import { getSession } from "@/lib/session/session";
import { redirect } from "next/navigation";
import AddressPageClient from "./address-page-client";
import { CustomerNavbar } from "@/components/layouts/customer-nav";

export default async function AddressPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <>
      <CustomerNavbar />
      <AddressPageClient />
    </>
  );
}
