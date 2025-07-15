/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddressResponse } from "@/lib/address/types/address.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressSelectorProps {
  addresses: AddressResponse[];
  selectedAddressId: string;
  onAddressSelect: (addressId: string) => void;
  addressType: "SHIPPING" | "BILLING" | "BOTH";
}

export function AddressSelector({
  addresses,
  selectedAddressId,
  onAddressSelect,
  addressType,
}: AddressSelectorProps) {
  const router = useRouter();

  const filteredAddresses = addresses.filter(
    (addr) => addr.addressType === addressType || addr.addressType === "BOTH"
  );

  if (filteredAddresses.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">
          No {addressType.toLowerCase()} addresses found
        </h3>
        <p className="text-muted-foreground mb-4">
          Add a {addressType.toLowerCase()} address to continue with checkout.
        </p>
        <Button
          onClick={() =>
            router.push(
              `/dashboard/customer/addresses/create?type=${addressType}`
            )
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          Add {addressType.charAt(0) + addressType.slice(1).toLowerCase()}{" "}
          Address
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Select {addressType.charAt(0) + addressType.slice(1).toLowerCase()}{" "}
          Address
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            router.push(
              `/dashboard/customer/addresses/create?type=${addressType}`
            )
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>

      <RadioGroup value={selectedAddressId} onValueChange={onAddressSelect}>
        <div className="space-y-3">
          {filteredAddresses.map((address) => (
            <div key={address.id} className="relative">
              <Label
                htmlFor={address.id}
                className={cn(
                  "cursor-pointer",
                  selectedAddressId === address.id &&
                    "ring-2 ring-primary rounded-lg"
                )}
              >
                <Card
                  className={cn(
                    "transition-all duration-200 hover:shadow-md",
                    selectedAddressId === address.id && "border-primary"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem
                        value={address.id}
                        id={address.id}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">
                            {address.name || address.recipientName}
                          </span>
                          {address.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {address.addressType}
                          </Badge>
                        </div>

                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>{address.recipientName}</div>
                          {address.companyName && (
                            <div>{address.companyName}</div>
                          )}
                          <div>{address.formattedAddress}</div>
                          {address.phone && <div>Phone: {address.phone}</div>}
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(
                            `/dashboard/customer/addresses/${address.id}`
                          );
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}
