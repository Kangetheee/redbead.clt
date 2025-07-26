"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAddresses } from "@/hooks/use-address";
import { AddressResponse } from "@/lib/address/types/address.types";
import { useCalculateShipping } from "@/hooks/use-checkout";
import { addressInputSchema } from "@/lib/checkout/dto/checkout.dto";
import {
  AddressInput,
  ShippingOption,
} from "@/lib/checkout/types/checkout.types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Truck,
  MapPin,
  Clock,
  DollarSign,
  Plus,
  Loader2,
  Zap,
  AlertCircle,
} from "lucide-react";

interface ShippingFormProps {
  sessionId: string;
  onShippingCalculated?: (
    options: ShippingOption[],
    selectedOption?: string
  ) => void;
  onAddressChange?: (address: AddressInput) => void;
  initialAddress?: AddressInput;
  urgencyLevel?: "NORMAL" | "EXPEDITED" | "RUSH" | "EMERGENCY";
  onUrgencyChange?: (
    level: "NORMAL" | "EXPEDITED" | "RUSH" | "EMERGENCY"
  ) => void;
  showUrgencySelector?: boolean;
}

const URGENCY_LEVELS = [
  {
    value: "NORMAL" as const,
    label: "Normal",
    description: "Standard processing time",
    icon: Clock,
    color: "bg-green-500",
  },
  {
    value: "EXPEDITED" as const,
    label: "Expedited",
    description: "Faster processing",
    icon: Truck,
    color: "bg-yellow-500",
  },
  {
    value: "RUSH" as const,
    label: "Rush",
    description: "Priority processing",
    icon: Zap,
    color: "bg-orange-500",
  },
  {
    value: "EMERGENCY" as const,
    label: "Emergency",
    description: "Urgent processing",
    icon: AlertCircle,
    color: "bg-red-500",
  },
];

export function ShippingForm({
  sessionId,
  onShippingCalculated,
  onAddressChange,
  initialAddress,
  urgencyLevel = "NORMAL",
  onUrgencyChange,
  showUrgencySelector = true,
}: ShippingFormProps) {
  const [useExistingAddress, setUseExistingAddress] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedShippingOption, setSelectedShippingOption] =
    useState<string>("");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);

  const { data: addressesData } = useAddresses();
  const calculateShippingMutation = useCalculateShipping();

  // Helper function to convert AddressResponse to AddressInput
  const convertAddressResponseToInput = useCallback(
    (address: AddressResponse): AddressInput => ({
      recipientName: address.recipientName,
      companyName: address.companyName || undefined,
      street: address.street,
      street2: address.street2 || undefined,
      city: address.city,
      state: address.state || undefined,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone || undefined,
    }),
    []
  );

  const form = useForm<AddressInput>({
    resolver: zodResolver(addressInputSchema),
    defaultValues: initialAddress || {
      recipientName: "",
      companyName: "",
      street: "",
      street2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "KE",
      phone: "",
    },
  });

  const watchedForm = form.watch();

  // Calculate shipping when address changes
  useEffect(() => {
    const selectedAddress = useExistingAddress
      ? addressesData?.success
        ? addressesData.data.items.find((addr) => addr.id === selectedAddressId)
        : undefined
      : undefined;

    const address: AddressInput | undefined =
      useExistingAddress && selectedAddress
        ? convertAddressResponseToInput(selectedAddress)
        : !useExistingAddress
          ? watchedForm
          : undefined;

    if (
      address &&
      sessionId &&
      ((useExistingAddress && selectedAddressId) ||
        (!useExistingAddress &&
          address.recipientName &&
          address.street &&
          address.city &&
          address.postalCode))
    ) {
      calculateShippingMutation.mutate(
        {
          sessionId,
          shippingAddress: address,
          urgencyLevel,
        },
        {
          onSuccess: (data) => {
            if (data.success) {
              setShippingOptions(data.data.shippingOptions);
              onShippingCalculated?.(
                data.data.shippingOptions,
                selectedShippingOption
              );
              onAddressChange?.(address);
            }
          },
        }
      );
    }
  }, [
    sessionId,
    selectedAddressId,
    useExistingAddress,
    watchedForm,
    urgencyLevel,
    addressesData,
    calculateShippingMutation,
    onShippingCalculated,
    onAddressChange,
    selectedShippingOption,
    convertAddressResponseToInput,
  ]);

  const handleAddressSelect = (address: AddressResponse) => {
    setSelectedAddressId(address.id);
  };

  const handleShippingOptionSelect = (optionId: string) => {
    setSelectedShippingOption(optionId);
    const option = shippingOptions.find((opt) => opt.id === optionId);
    if (option) {
      onShippingCalculated?.(shippingOptions, optionId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Urgency Level Selector */}
      {showUrgencySelector && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Processing Priority
            </CardTitle>
            <CardDescription>
              Choose how quickly you need your order processed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={urgencyLevel} onValueChange={onUrgencyChange}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {URGENCY_LEVELS.map((level) => {
                  const Icon = level.icon;
                  return (
                    <div
                      key={level.value}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={level.value} id={level.value} />
                      <Label
                        htmlFor={level.value}
                        className="flex items-center gap-2 cursor-pointer flex-1 p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${level.color}`}
                        />
                        <Icon className="h-4 w-4" />
                        <div className="flex-1">
                          <div className="font-medium">{level.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {level.description}
                          </div>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Address Source Toggle */}
          {addressesData?.success && addressesData.data.items.length > 0 && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant={useExistingAddress ? "default" : "outline"}
                onClick={() => setUseExistingAddress(true)}
                className="flex-1"
              >
                Use Saved Address
              </Button>
              <Button
                type="button"
                variant={!useExistingAddress ? "default" : "outline"}
                onClick={() => setUseExistingAddress(false)}
                className="flex-1"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Address
              </Button>
            </div>
          )}

          {/* Existing Address Selection */}
          {useExistingAddress &&
            addressesData?.success &&
            addressesData.data.items.length > 0 && (
              <div className="space-y-3">
                {addressesData.data.items.map((address) => (
                  <Card
                    key={address.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedAddressId === address.id
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                    onClick={() => handleAddressSelect(address)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {address.name || "Unnamed Address"}
                            {address.isDefault && (
                              <Badge
                                variant="secondary"
                                className="text-xs ml-2"
                              >
                                Default
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div className="font-medium text-foreground">
                              {address.recipientName}
                            </div>
                            <div className="whitespace-pre-line">
                              {address.formattedAddress}
                            </div>
                          </div>
                        </div>
                        {selectedAddressId === address.id && (
                          <Badge className="text-xs">Selected</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

          {/* New Address Form */}
          {!useExistingAddress && (
            <Form {...form}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="recipientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+254..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Company Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Street Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="Street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="street2"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Apartment, Suite, etc. (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Apartment, suite, unit, building, floor, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="State or province" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="Postal code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Input placeholder="Country code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          )}
        </CardContent>
      </Card>

      {/* Shipping Options */}
      {(calculateShippingMutation.isPending || shippingOptions.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calculateShippingMutation.isPending ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Calculating shipping options...
                  </span>
                </div>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : shippingOptions.length > 0 ? (
              <RadioGroup
                value={selectedShippingOption}
                onValueChange={handleShippingOptionSelect}
              >
                <div className="space-y-3">
                  {shippingOptions.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label
                        htmlFor={option.id}
                        className="flex items-center justify-between w-full cursor-pointer p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{option.name}</span>
                            {option.isFree && (
                              <Badge variant="secondary" className="text-xs">
                                FREE
                              </Badge>
                            )}
                            {option.urgencyMultiplier > 1 && (
                              <Badge variant="outline" className="text-xs">
                                {option.urgencyMultiplier}x Priority
                              </Badge>
                            )}
                          </div>
                          {option.description && (
                            <p className="text-sm text-muted-foreground">
                              {option.description}
                            </p>
                          )}
                          {option.estimatedDays && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {option.estimatedDays}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {option.isFree
                              ? "FREE"
                              : `KES ${option.cost.toLocaleString()}`}
                          </div>
                          {option.originalCost !== option.cost && (
                            <div className="text-xs text-muted-foreground line-through">
                              KES {option.originalCost.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No shipping options available for this address.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
