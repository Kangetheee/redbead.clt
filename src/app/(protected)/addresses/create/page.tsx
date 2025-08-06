import { getSession } from "@/lib/session/session";
import { redirect } from "next/navigation";
import { AddressForm } from "@/components/addresses/address-form";

export default async function CreateAddressPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Address</h1>
        <p className="text-muted-foreground mt-2">
          Create a new address for shipping and billing.
        </p>
      </div>

      <AddressForm onSuccess={() => {}} onCancel={() => {}} />
    </div>
  );
}
