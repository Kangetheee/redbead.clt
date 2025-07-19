/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AddressResponse,
  AddressType,
} from "@/lib/address/types/address.types";
import { useAddresses } from "@/hooks/use-address";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  Plus,
  Star,
  Building,
  Phone,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface AddressSelectorProps {
  addresses: AddressResponse[];
  selectedAddressId: string;
  onAddressSelect: (addressId: string) => void;
  addressType: AddressType;
  sessionId?: string;
  disabled?: boolean;
}

export function AddressSelector({
  addresses,
  selectedAddressId,
  onAddressSelect,
  addressType,
  sessionId,
  disabled = false,
}: AddressSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Check if we're returning from address creation with a new address
  const returnedAddressId = searchParams.get("selectedAddress");

  // Auto-select returned address
  useEffect(() => {
    if (returnedAddressId && !selectedAddressId) {
      onAddressSelect(returnedAddressId);
      // Clean up URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("selectedAddress");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [returnedAddressId, selectedAddressId, onAddressSelect]);

  // Filter addresses by type
  const filteredAddresses = addresses.filter(
    (address) =>
      address.addressType === addressType || address.addressType === "BOTH"
  );

  const handleAddNewAddress = () => {
    setIsLoading(true);

    // Parse current URL and create the destination URL
    const createUrl = new URL(
      "/dashboard/customer/addresses/create",
      window.location.origin
    );

    // Add checkout context parameters
    if (sessionId) {
      // Clean the session ID to avoid parameter nesting
      const cleanSessionId = sessionId.split("?")[0];
      createUrl.searchParams.set("session", cleanSessionId);

      // Set the return URL correctly
      const returnUrl = new URL(
        window.location.pathname,
        window.location.origin
      );
      returnUrl.searchParams.set("session", cleanSessionId);
      createUrl.searchParams.set("returnTo", returnUrl.toString());
    }

    createUrl.searchParams.set("type", addressType);

    router.push(createUrl.toString());
  };

  if (filteredAddresses.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <MapPin className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">
                No {addressType.toLowerCase()} addresses found
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add a {addressType.toLowerCase()} address to continue with
                checkout
              </p>
            </div>
            <Button
              onClick={handleAddNewAddress}
              disabled={disabled || isLoading}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isLoading ? "Redirecting..." : `Add ${addressType} Address`}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success message for returned address */}
      {returnedAddressId && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Address created successfully and selected for your order.
          </AlertDescription>
        </Alert>
      )}

      <RadioGroup
        value={selectedAddressId}
        onValueChange={onAddressSelect}
        disabled={disabled}
        className="space-y-3"
      >
        {filteredAddresses.map((address) => (
          <div key={address.id} className="relative">
            <Label htmlFor={address.id} className="cursor-pointer block">
              <Card
                className={`transition-all hover:shadow-md ${
                  selectedAddressId === address.id
                    ? "ring-2 ring-primary border-primary"
                    : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value={address.id}
                        id={address.id}
                        className="mt-1"
                      />
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
                    </div>

                    {selectedAddressId === address.id && (
                      <CheckCircle className="h-5 w-5 text-primary" />
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
              </Card>
            </Label>
          </div>
        ))}
      </RadioGroup>

      {/* Add New Address Button */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <Button
            variant="ghost"
            onClick={handleAddNewAddress}
            disabled={disabled || isLoading}
            className="w-full h-auto py-4 flex-col space-y-2"
          >
            <Plus className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Add New Address</div>
              <div className="text-xs text-muted-foreground">
                Create a new {addressType.toLowerCase()} address
              </div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading skeleton component
export function AddressSelectorSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex items-start space-x-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
