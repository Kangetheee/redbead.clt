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
  FormDescription,
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, User, Building2, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface AddressFormProps {
  address?: AddressResponse;
  onSuccess?: (address: AddressResponse) => void;
  onCancel?: () => void;
  title?: string;
  showHeader?: boolean;
  compact?: boolean;
  autoFocus?: boolean;
}

export function AddressForm({
  address,
  onSuccess,
  onCancel,
  title,
  showHeader = true,
  compact = false,
  autoFocus = true,
}: AddressFormProps) {
  const [isDirty, setIsDirty] = useState(false);
  const isEditing = !!address;
  const schema = isEditing ? updateAddressSchema : createAddressSchema;

  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();

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
          country: "KE",
          phone: "",
          addressType: "BOTH",
          isDefault: false,
        },
  });

  const mutation = isEditing ? updateMutation : createMutation;

  // Track form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setIsDirty(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (values: CreateAddressDto | UpdateAddressDto) => {
    try {
      let result;
      if (isEditing && address) {
        result = await updateMutation.mutateAsync({
          addressId: address.id,
          values: values as UpdateAddressDto,
        });
      } else {
        result = await createMutation.mutateAsync(values as CreateAddressDto);
      }

      if (result.success) {
        setIsDirty(false);
        onSuccess?.(result.data);
      }
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error("Address form submission error:", error);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (
        confirm("You have unsaved changes. Are you sure you want to cancel?")
      ) {
        onCancel?.();
      }
    } else {
      onCancel?.();
    }
  };

  const formTitle = title || (isEditing ? "Edit Address" : "Add New Address");

  const FormWrapper = ({ children }: { children: React.ReactNode }) => {
    if (compact) {
      return <div className="space-y-4">{children}</div>;
    }
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {formTitle}
              {isEditing && (
                <Badge variant="outline" className="ml-auto">
                  Editing
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>{children}</CardContent>
      </Card>
    );
  };

  return (
    <FormWrapper>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Contact Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recipientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Full name"
                        autoFocus={autoFocus}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Label</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Home, Office, John's Place"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional name to help you identify this address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+254 700 000 000"
                        type="tel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Address Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Address Details</h3>
            </div>

            <div className="space-y-4">
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
                    <FormLabel>Apartment, Suite, etc.</FormLabel>
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
              </div>

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Country code (e.g., KE)"
                        maxLength={2}
                        style={{ textTransform: "uppercase" }}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Use 2-letter country code (e.g., KE for Kenya, US for
                      United States)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Settings Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Address Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              : type === "SHIPPING"
                                ? "Shipping Only"
                                : "Billing Only"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose how this address will be used
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Set as Default
                      </FormLabel>
                      <FormDescription>
                        Use this address as the default for its type
                      </FormDescription>
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
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="min-w-[120px]"
            >
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? "Update Address" : "Save Address"}
            </Button>
          </div>
        </form>
      </Form>
    </FormWrapper>
  );
}
