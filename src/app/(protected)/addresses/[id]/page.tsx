"use client";

import { useParams, useRouter } from "next/navigation";
import { useAddress } from "@/hooks/use-address";
import { AddressDetails } from "@/components/addresses/address-details";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function AddressDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: address, isLoading, error } = useAddress(params.id);

  const handleEdit = () => {
    router.push(`/addresses/${params.id}/edit`);
  };

  const handleBack = () => {
    router.push("/addresses");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !address) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Address Details</h1>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message ||
              "Address not found. It may have been deleted or the ID is invalid."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Address Details</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your address information
            </p>
          </div>
        </div>
        <Button onClick={handleEdit}>Edit Address</Button>
      </div>

      <AddressDetails
        address={address}
        showActions={true}
        onEdit={handleEdit}
        variant="default"
      />
    </div>
  );
}
