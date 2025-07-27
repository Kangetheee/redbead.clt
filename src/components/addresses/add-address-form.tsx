/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useCreateAddress } from "@/hooks/use-address";
import { CreateAddressDto } from "@/lib/address/dto/address.dto";
import { ADDRESS_TYPES } from "@/lib/address/dto/address.dto";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAddressSchema } from "@/lib/address/dto/address.dto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Info } from "lucide-react";
import { toast } from "sonner";

export default function AddAddressForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Checkout integration parameters
  const checkoutSession = searchParams.get("session");
  const addressType = searchParams.get("type") as "SHIPPING" | "BILLING" | null;
  const returnTo = searchParams.get("returnTo");

  const createAddress = useCreateAddress();

  const form = useForm<CreateAddressDto>({
    resolver: zodResolver(createAddressSchema),
    defaultValues: {
      addressType: addressType || "SHIPPING",
      isDefault: false,
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
    },
  });

  const onSubmit = async (data: CreateAddressDto) => {
    try {
      const response = await createAddress.mutateAsync(data);

      if (response.success) {
        toast.success("Address created successfully!");

        // If coming from checkout, return with the new address ID
        if (checkoutSession && returnTo) {
          const returnUrl = new URL(returnTo, window.location.origin);
          returnUrl.searchParams.set("selectedAddress", response.data.id);
          returnUrl.searchParams.set("session", checkoutSession);
          router.push(returnUrl.toString());
        } else {
          // Normal flow - go to addresses list
          router.push("/addresses");
        }
      } else {
        toast.error(response.error || "Failed to create address");
      }
    } catch (error: any) {
      console.error("Error creating address:", error);
      toast.error(error?.message || "Failed to create address");
    }
  };

  const handleCancel = () => {
    if (checkoutSession && returnTo) {
      // Return to checkout without creating address
      router.push(`${returnTo}?session=${checkoutSession}`);
    } else {
      router.push("/addresses");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Add New Address</h1>
          {checkoutSession && (
            <p className="text-sm text-muted-foreground mt-1">
              Adding address for checkout
            </p>
          )}
        </div>
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {checkoutSession ? "Back to Checkout" : "Cancel"}
        </Button>
      </div>

      {/* Checkout context alert */}
      {checkoutSession && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            You&apos;re adding an address for your current order. After saving,
            you&apos;ll be returned to checkout with this address selected.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Home, Office, etc." {...field} />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+254..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <FormLabel>Apartment/Suite (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Apt, suite, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="addressType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
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
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-8">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Set as default address</FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Use this address as default for this type
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAddress.isPending}>
                  {createAddress.isPending ? "Saving..." : "Save Address"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
