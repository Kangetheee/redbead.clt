/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateAddress, useUpdateAddress } from "@/hooks/use-address";
import {
  createAddressSchema,
  updateAddressSchema,
  CreateAddressDto,
  UpdateAddressDto,
  ADDRESS_TYPES,
} from "@/lib/address/dto/address.dto";
import { AddressResponse } from "@/lib/address/types/address.types";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface AddressFormProps {
  address?: AddressResponse;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddressForm({
  address,
  onSuccess,
  onCancel,
}: AddressFormProps) {
  const isEditing = !!address;
  const schema = isEditing ? updateAddressSchema : createAddressSchema;
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress(address?.id || "");

  const form = useForm<CreateAddressDto | UpdateAddressDto>({
    resolver: zodResolver(schema),
    defaultValues: address
      ? {
          name: address.name || "",
          recipientName: address.recipientName,
          companyName: address.companyName || "",
          street: address.street,
          street2: address.street2 || "",
          city: address.city,
          state: address.state || "",
          postalCode: address.postalCode,
          country: address.country,
          phone: address.phone || "",
          addressType: address.addressType,
          isDefault: address.isDefault,
        }
      : {
          name: "",
          recipientName: "",
          companyName: "",
          street: "",
          street2: "",
          city: "",
          state: "",
          postalCode: "",
          country: "KE", // Default to Kenya based on user location
          phone: "",
          addressType: "BOTH",
          isDefault: false,
        },
  });

  const mutation = isEditing ? updateMutation : createMutation;

  const onSubmit = async (values: CreateAddressDto | UpdateAddressDto) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(values as UpdateAddressDto);
      } else {
        await createMutation.mutateAsync(values as CreateAddressDto);
      }
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation hooks
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Address" : "Add New Address"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Home, Office" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                name="companyName"
                render={({ field }) => (
                  <FormItem>
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+254..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
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
                <FormItem>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <FormLabel>State/Province (Optional)</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country *</FormLabel>
                  <FormControl>
                    <Input placeholder="Country code (e.g., KE)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="addressType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select address type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ADDRESS_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type === "BOTH"
                              ? "Shipping & Billing"
                              : type.toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Set as Default</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Use this address as default for this type
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Update Address" : "Save Address"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
