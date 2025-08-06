/* eslint-disable @typescript-eslint/no-unused-vars */
import { getSession } from "@/lib/session/session";
import { redirect } from "next/navigation";
import EditAddressForm from "@/components/addresses/edit-address-form";

interface EditAddressPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditAddressPage({
  params,
}: EditAddressPageProps) {
  const session = await getSession();
  const { id } = await params;

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Address</h1>
        <p className="text-muted-foreground mt-2">
          Update your address information.
        </p>
      </div>

      <EditAddressForm />
    </div>
  );
}
