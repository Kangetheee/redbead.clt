/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Plus, MapPin } from "lucide-react";
import { useAddresses, useCreateAddress } from "@/hooks/use-address";
import { AddressResponse } from "@/lib/address/types/address.types";
import { AddressForm } from "@/components/forms/address-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AddressSelectorProps {
  type: "shipping" | "billing";
  selectedAddressId?: string;
  onAddressSelect: (addressId: string, address: AddressResponse) => void;
  guestMode?: boolean;
  onGuestAddressChange?: (address: any) => void;
}

export function AddressSelector({
  type,
  selectedAddressId,
  onAddressSelect,
  guestMode = false,
  onGuestAddressChange,
}: AddressSelectorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const { data: addressesData } = useAddresses();
  const createAddress = useCreateAddress();

  const addresses = addressesData?.success ? addressesData.data.items : [];
  const filteredAddresses = addresses.filter(
    (addr) =>
      addr.addressType === type.toUpperCase() || addr.addressType === "BOTH"
  );

  const handleAddressSelect = (addressId: string) => {
    const address = addresses.find((addr) => addr.id === addressId);
    if (address) {
      onAddressSelect(addressId, address);
    }
  };

  const handleCreateAddress = (data: any) => {
    createAddress.mutate(
      { ...data, addressType: type.toUpperCase() as any },
      {
        onSuccess: (response) => {
          if (response.success) {
            setShowAddForm(false);
            onAddressSelect(response.data.id, response.data);
          }
        },
      }
    );
  };

  if (guestMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {type === "shipping" ? "Shipping Address" : "Billing Address"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {onGuestAddressChange && (
            <AddressForm
              onSubmit={onGuestAddressChange}
              submitText={`Set ${type} Address`}
            />
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {type === "shipping" ? "Shipping Address" : "Billing Address"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredAddresses.length > 0 ? (
          <RadioGroup
            value={selectedAddressId}
            onValueChange={handleAddressSelect}
            className="space-y-3"
          >
            {filteredAddresses.map((address) => (
              <div key={address.id} className="flex items-start space-x-2">
                <RadioGroupItem
                  value={address.id}
                  id={address.id}
                  className="mt-1"
                />
                <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                  <div className="rounded-md border p-3 hover:bg-accent">
                    <div className="font-medium">{address.recipientName}</div>
                    {address.companyName && (
                      <div className="text-sm text-muted-foreground">
                        {address.companyName}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      {address.formattedAddress}
                    </div>
                    {address.isDefault && (
                      <div className="text-xs text-primary mt-1">Default</div>
                    )}
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No {type} addresses found. Add one below.
          </div>
        )}

        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add New {type === "shipping" ? "Shipping" : "Billing"} Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Add {type === "shipping" ? "Shipping" : "Billing"} Address
              </DialogTitle>
            </DialogHeader>
            <AddressForm
              onSubmit={handleCreateAddress}
              submitText="Add Address"
              loading={createAddress.isPending}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
