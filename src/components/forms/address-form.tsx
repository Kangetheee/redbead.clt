/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { isValidPhoneNumber } from "react-phone-number-input";

const addressSchema = z.object({
  name: z.string().min(1, "Address name is required").optional(),
  recipientName: z.string().min(1, "Recipient name is required"),
  companyName: z.string().optional(),
  street: z.string().min(1, "Street address is required"),
  street2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(2, "Country is required").max(2),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || isValidPhoneNumber(val), {
      message: "Invalid phone number",
    }),
  addressType: z.enum(["SHIPPING", "BILLING", "BOTH"]).default("BOTH"),
  isDefault: z.boolean().default(false),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  onSubmit: (data: AddressFormData) => void;
  defaultValues?: Partial<AddressFormData>;
  submitText?: string;
  loading?: boolean;
  showAddressType?: boolean;
  showIsDefault?: boolean;
}

const countries = [
  { code: "KE", name: "Kenya" },
  { code: "UG", name: "Uganda" },
  { code: "TZ", name: "Tanzania" },
  { code: "RW", name: "Rwanda" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
];

export function AddressForm({
  onSubmit,
  defaultValues,
  submitText = "Save Address",
  loading = false,
  showAddressType = true,
  showIsDefault = true,
}: AddressFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues,
  });

  const watchedCountry = watch("country");
  const watchedAddressType = watch("addressType");
  const watchedIsDefault = watch("isDefault");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Address Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Address Name (Optional)</Label>
        <Input
          id="name"
          placeholder="e.g. Home, Office"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Recipient Name */}
      <div className="space-y-2">
        <Label htmlFor="recipientName">Full Name *</Label>
        <Input
          id="recipientName"
          placeholder="John Doe"
          {...register("recipientName")}
        />
        {errors.recipientName && (
          <p className="text-sm text-destructive">
            {errors.recipientName.message}
          </p>
        )}
      </div>

      {/* Company Name */}
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name (Optional)</Label>
        <Input
          id="companyName"
          placeholder="Acme Corp"
          {...register("companyName")}
        />
        {errors.companyName && (
          <p className="text-sm text-destructive">
            {errors.companyName.message}
          </p>
        )}
      </div>

      {/* Street Address */}
      <div className="space-y-2">
        <Label htmlFor="street">Street Address *</Label>
        <Input
          id="street"
          placeholder="123 Main Street"
          {...register("street")}
        />
        {errors.street && (
          <p className="text-sm text-destructive">{errors.street.message}</p>
        )}
      </div>

      {/* Street Address 2 */}
      <div className="space-y-2">
        <Label htmlFor="street2">Apartment, Suite, etc. (Optional)</Label>
        <Input
          id="street2"
          placeholder="Apt 4B, Suite 100"
          {...register("street2")}
        />
        {errors.street2 && (
          <p className="text-sm text-destructive">{errors.street2.message}</p>
        )}
      </div>

      {/* City and State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input id="city" placeholder="Nairobi" {...register("city")} />
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State/Province</Label>
          <Input
            id="state"
            placeholder="Nairobi County"
            {...register("state")}
          />
          {errors.state && (
            <p className="text-sm text-destructive">{errors.state.message}</p>
          )}
        </div>
      </div>

      {/* Postal Code and Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal Code *</Label>
          <Input
            id="postalCode"
            placeholder="00100"
            {...register("postalCode")}
          />
          {errors.postalCode && (
            <p className="text-sm text-destructive">
              {errors.postalCode.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <Select
            value={watchedCountry}
            onValueChange={(value) => setValue("country", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && (
            <p className="text-sm text-destructive">{errors.country.message}</p>
          )}
        </div>
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+254712345678"
          {...register("phone")}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      {/* Address Type */}
      {showAddressType && (
        <div className="space-y-2">
          <Label htmlFor="addressType">Address Type</Label>
          <Select
            value={watchedAddressType}
            onValueChange={(value) => setValue("addressType", value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select address type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SHIPPING">Shipping Only</SelectItem>
              <SelectItem value="BILLING">Billing Only</SelectItem>
              <SelectItem value="BOTH">Both Shipping & Billing</SelectItem>
            </SelectContent>
          </Select>
          {errors.addressType && (
            <p className="text-sm text-destructive">
              {errors.addressType.message}
            </p>
          )}
        </div>
      )}

      {/* Default Address */}
      {showIsDefault && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isDefault"
            checked={watchedIsDefault}
            onCheckedChange={(checked) => setValue("isDefault", !!checked)}
          />
          <Label htmlFor="isDefault">Set as default address</Label>
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : submitText}
      </Button>
    </form>
  );
}
