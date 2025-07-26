"use client";
import Link from "next/link";
import {
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
} from "@/hooks/use-address";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pencil, Star, Trash, Plus, AlertCircle } from "lucide-react";

export default function AddressManagementPage() {
  const { data: addressesResponse, isLoading, error } = useAddresses();
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();

  // Extract addresses data from the action response
  const addressesData = addressesResponse?.success
    ? addressesResponse.data
    : null;
  const addressesError =
    addressesResponse?.success === false ? addressesResponse.error : null;
  const addresses = addressesData?.items || [];

  const handleDeleteAddress = (addressId: string, addressName: string) => {
    if (
      confirm(
        `Are you sure you want to delete "${addressName || "this address"}"?`
      )
    ) {
      deleteAddress.mutate(addressId);
    }
  };

  const handleSetDefault = (addressId: string) => {
    setDefaultAddress.mutate(addressId);
  };

  if (isLoading) return <LoadingSkeleton />;

  if (error || addressesError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Addresses</h1>
          <Link href="/dashboard/customer/addresses/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Address
            </Button>
          </Link>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {addressesError || "Failed to load addresses. Please try again."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Addresses</h1>
          {addressesData && (
            <p className="text-sm text-gray-600 mt-1">
              {addressesData.meta.total} address
              {addressesData.meta.total !== 1 ? "es" : ""} found
            </p>
          )}
        </div>
        <Link href="/dashboard/customer/addresses/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
        </Link>
      </div>

      {addresses.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Pencil className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No addresses yet</h3>
            <p className="text-gray-600 mb-6">
              Add your first address to get started with shipping and billing.
            </p>
            <Link href="/dashboard/customer/addresses/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Address
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className="relative hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {address.name || "Untitled Address"}
                  </CardTitle>
                  {address.isDefault && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  {address.addressType}
                </p>
              </CardHeader>

              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">
                    {address.recipientName}
                  </p>
                  {address.companyName && (
                    <p className="text-sm text-gray-600">
                      {address.companyName}
                    </p>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  <p>{address.formattedAddress}</p>
                </div>

                {address.phone && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {address.phone}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <Link
                    href={`/dashboard/customer/addresses/${address.id}/edit`}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-0"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>

                  {!address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                      disabled={setDefaultAddress.isPending}
                      className="flex-1 min-w-0"
                    >
                      <Star className="h-4 w-4 mr-1" />
                      {setDefaultAddress.isPending
                        ? "Setting..."
                        : "Set Default"}
                    </Button>
                  )}

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleDeleteAddress(address.id, address.name)
                    }
                    disabled={deleteAddress.isPending}
                    className="flex-1 min-w-0"
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    {deleteAddress.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination could be added here if needed */}
      {addressesData && addressesData.meta.total > addressesData.meta.limit && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Showing {addresses.length} of {addressesData.meta.total} addresses
          </p>
          {/* Add pagination controls here if needed */}
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 flex-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
