"use client";

import { useParams, useRouter } from "next/navigation";
import { useAddress } from "@/hooks/use-address";
import { AddressForm } from "./address-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function EditAddressPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: response, isLoading, error } = useAddress(id);

  const address = response?.success ? response.data : null;
  const addressError = response?.success === false ? response.error : null;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || addressError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {addressError || "Failed to load address. Please try again."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AddressForm
        address={address || undefined}
        onSuccess={() => router.push("/addresses")}
        onCancel={() => router.back()}
      />
    </div>
  );
}
