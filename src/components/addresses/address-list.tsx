"use client";

import { useState } from "react";
import {
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
} from "@/hooks/use-address";
import { AddressResponse } from "@/lib/address/types/address.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  MoreHorizontal,
  Edit,
  Star,
  Trash2,
  Phone,
  Building,
  Loader2,
} from "lucide-react";

interface AddressListProps {
  onEdit?: (address: AddressResponse) => void;
  onSelect?: (address: AddressResponse) => void;
  selectable?: boolean;
  selectedAddressId?: string;
}

export function AddressList({
  onEdit,
  onSelect,
  selectable = false,
  selectedAddressId,
}: AddressListProps) {
  const { data: addressesData, isLoading, error } = useAddresses();
  const deleteAddressMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (addressId: string) => {
    setDeletingId(addressId);
    try {
      await deleteAddressMutation.mutateAsync(addressId);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    await setDefaultMutation.mutateAsync(addressId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Failed to load addresses. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  const addresses = addressesData?.success ? addressesData.data.items : [];

  if (addresses.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <MapPin className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No addresses found</p>
            <p className="text-sm">Add your first address to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <Card
          key={address.id}
          className={`transition-colors ${
            selectable ? "cursor-pointer hover:bg-muted/50" : ""
          } ${selectedAddressId === address.id ? "ring-2 ring-primary" : ""}`}
          onClick={() => selectable && onSelect?.(address)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base flex items-center gap-2">
                  {address.name || "Unnamed Address"}
                  {address.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <Badge variant="outline" className="text-xs">
                    {address.addressType === "BOTH"
                      ? "Shipping & Billing"
                      : address.addressType.toLowerCase()}
                  </Badge>
                  {address.phone && (
                    <span className="flex items-center gap-1 text-xs">
                      <Phone className="w-3 h-3" />
                      {address.phone}
                    </span>
                  )}
                </CardDescription>
              </div>

              {!selectable && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onEdit?.(address)}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    {!address.isDefault && (
                      <DropdownMenuItem
                        onClick={() => handleSetDefault(address.id)}
                        disabled={setDefaultMutation.isPending}
                        className="cursor-pointer"
                      >
                        <Star className="mr-2 h-4 w-4" />
                        Set as Default
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Address</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this address? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(address.id)}
                            disabled={deletingId === address.id}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletingId === address.id && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">
                {address.recipientName}
              </p>
              {address.companyName && (
                <p className="flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  {address.companyName}
                </p>
              )}
              <div className="whitespace-pre-line">
                {address.formattedAddress}
              </div>
            </div>
          </CardContent>

          {selectable && selectedAddressId === address.id && (
            <CardFooter className="pt-0">
              <Badge className="w-full justify-center">Selected</Badge>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
