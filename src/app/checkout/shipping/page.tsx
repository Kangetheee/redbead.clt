/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Truck, MapPin, Clock, Lock, Plus } from "lucide-react";
import {
  createAddressSchema,
  CreateAddressDto,
} from "@/lib/address/dto/address.dto";
import { useShippingCalculation } from "@/hooks/use-shipping";
import { useCreateAddress } from "@/hooks/use-address";
import { AddressForm } from "@/components/addresses/address-form";
import { formatAmount } from "@/lib/utils";
import { toast } from "sonner";

type ShippingAddressForm = CreateAddressDto;

interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface CartItemCustomization {
  optionId: string;
  valueId?: string;
  customValue?: string;
  option: {
    name: string;
    type: string;
    required: boolean;
  };
}

interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customizations: CartItemCustomization[];
  product: {
    id: string;
    name: string;
    thumbnailImage?: string;
  };
  variant: {
    id: string;
    name: string;
    price: number;
  };
}

interface CartSummary {
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  total: number;
}

interface CheckoutSnapshot {
  guestInfo?: GuestInfo;
  cartItems: CartItem[];
  cartSummary: CartSummary;
  timestamp: string;
}

export default function CheckoutShippingPage() {
  const router = useRouter();
  const [selectedShippingMethod, setSelectedShippingMethod] =
    useState<string>("");
  const [useBillingAddress, setUseBillingAddress] = useState(true);
  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);
  const [checkoutSnapshot, setCheckoutSnapshot] =
    useState<CheckoutSnapshot | null>(null);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isUsingQuickAddress, setIsUsingQuickAddress] = useState(false);

  const createAddress = useCreateAddress();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ShippingAddressForm>({
    resolver: zodResolver(createAddressSchema),
    defaultValues: {
      addressType: "SHIPPING",
      country: "KE",
      isDefault: false,
    },
  });

  const shippingAddress = watch();

  // Calculate shipping when address is complete
  const { data: shippingOptions, isLoading: calculatingShipping } =
    useShippingCalculation(
      {
        sessionId,
        shippingAddress: {
          name: shippingAddress.name || "",
          recipientName: shippingAddress.recipientName || "",
          street: shippingAddress.street || "",
          city: shippingAddress.city || "",
          state: shippingAddress.state || "",
          postalCode: shippingAddress.postalCode || "",
          country: shippingAddress.country || "KE",
          phone: shippingAddress.phone || "",
          type: "SHIPPING",
        },
      },
      !!(
        shippingAddress.street &&
        shippingAddress.city &&
        shippingAddress.postalCode &&
        shippingAddress.country
      )
    );

  useEffect(() => {
    // Get stored checkout data
    const storedSnapshot = sessionStorage.getItem("checkoutSnapshot");
    const storedGuestInfo = sessionStorage.getItem("guestCheckout");

    if (!storedSnapshot) {
      // No checkout data found, redirect back to checkout
      router.push("/checkout");
      return;
    }

    try {
      const snapshot: CheckoutSnapshot = JSON.parse(storedSnapshot);
      setCheckoutSnapshot(snapshot);

      // Check if snapshot is not too old (e.g., 1 hour)
      const snapshotTime = new Date(snapshot.timestamp).getTime();
      const now = new Date().getTime();
      const oneHour = 60 * 60 * 1000;

      if (now - snapshotTime > oneHour) {
        toast.error("Your checkout session has expired. Please start over.");
        router.push("/checkout");
        return;
      }

      // Use guest info from snapshot if available, otherwise from separate storage
      const guestData =
        snapshot.guestInfo ||
        (storedGuestInfo ? JSON.parse(storedGuestInfo) : null);

      if (guestData) {
        setGuestInfo(guestData);

        // Pre-fill form with guest info
        if (guestData.firstName && guestData.lastName) {
          setValue(
            "recipientName",
            `${guestData.firstName} ${guestData.lastName}`
          );
        }
        if (guestData.phone) {
          setValue("phone", guestData.phone);
        }
      }
    } catch (error) {
      console.error("Failed to parse checkout data:", error);
      router.push("/checkout");
    }
  }, [setValue, router]);

  const onSubmit = async (data: ShippingAddressForm) => {
    if (!selectedShippingMethod) {
      toast.error("Please select a shipping method");
      return;
    }

    if (!checkoutSnapshot) {
      toast.error("Checkout session expired. Please start over.");
      router.push("/checkout");
      return;
    }

    try {
      // Ensure recipientName and phone are set from guest info if not provided
      const addressData: CreateAddressDto = {
        ...data,
        recipientName:
          data.recipientName ||
          (guestInfo ? `${guestInfo.firstName} ${guestInfo.lastName}` : ""),
        phone: data.phone || guestInfo?.phone,
        addressType: "SHIPPING",
      };

      // Create shipping address
      const shippingResult = await createAddress.mutateAsync(addressData);

      if (!shippingResult.success) {
        throw new Error(shippingResult.error);
      }

      let billingAddressId = shippingResult.data.id;

      // Create separate billing address if needed
      if (!useBillingAddress) {
        // Create billing address with same data but different type
        const billingData: CreateAddressDto = {
          ...addressData,
          name: `${addressData.name} (Billing)`,
          addressType: "BILLING",
        };

        const billingResult = await createAddress.mutateAsync(billingData);

        if (!billingResult.success) {
          throw new Error(billingResult.error);
        }

        billingAddressId = billingResult.data.id;
      }

      // Store checkout data for next step with addresses
      const updatedCheckoutData = {
        ...checkoutSnapshot,
        shippingAddressId: shippingResult.data.id,
        billingAddressId,
        selectedShippingMethod,
        shippingOptions: shippingOptions?.success ? shippingOptions.data : [],
        shippingCost: getSelectedShippingCost(),
      };

      sessionStorage.setItem(
        "checkoutData",
        JSON.stringify(updatedCheckoutData)
      );
      router.push("/checkout/payment");
    } catch (error) {
      console.error("Failed to process shipping:", error);
      toast.error("Failed to process shipping information");
    }
  };

  const handleAddressCreated = (address: any) => {
    setIsUsingQuickAddress(true);
    setShowAddressForm(false);
    toast.success("Address created! You can now select a shipping method.");

    // Pre-fill the shipping form with the created address
    setValue("name", address.name || "");
    setValue("recipientName", address.recipientName);
    setValue("companyName", address.companyName || "");
    setValue("street", address.street);
    setValue("street2", address.street2 || "");
    setValue("city", address.city);
    setValue("state", address.state || "");
    setValue("postalCode", address.postalCode);
    setValue("country", address.country);
    setValue("phone", address.phone || "");
  };

  const handleBack = () => {
    router.push("/checkout");
  };

  const getSelectedShippingCost = () => {
    if (!selectedShippingMethod || !shippingOptions?.success) return 0;
    const option = shippingOptions.data.find(
      (o) => o.id === selectedShippingMethod
    );
    return option?.cost || 0;
  };

  const getSelectedShippingDisplay = () => {
    if (!selectedShippingMethod || !shippingOptions?.success) return "TBD";
    const option = shippingOptions.data.find(
      (o) => o.id === selectedShippingMethod
    );
    return option?.isFree ? "Free" : formatAmount(option?.cost || 0);
  };

  // Show loading if checkout snapshot is not loaded yet
  if (!checkoutSnapshot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout information...</p>
        </div>
      </div>
    );
  }

  const cartItems = checkoutSnapshot.cartItems;
  const cartSummary = checkoutSnapshot.cartSummary;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Shipping Information
            </h1>
            <p className="text-gray-600">Where should we deliver your order?</p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">
                Information
              </span>
            </div>
            <div className="flex-1 h-px bg-green-600 mx-4"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">
                Shipping
              </span>
            </div>
            <div className="flex-1 h-px bg-gray-300 mx-4"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm text-gray-500">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
                <CardDescription>
                  Enter the address where you&apos;d like your order delivered
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Address Name</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="Home, Office, etc."
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="recipientName">Recipient Name</Label>
                    <Input
                      id="recipientName"
                      {...register("recipientName")}
                      placeholder={
                        guestInfo
                          ? `${guestInfo.firstName} ${guestInfo.lastName}`
                          : "Full name"
                      }
                      className={errors.recipientName ? "border-red-500" : ""}
                    />
                    {errors.recipientName && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.recipientName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="companyName">Company Name (optional)</Label>
                    <Input
                      id="companyName"
                      {...register("companyName")}
                      placeholder="Company or organization name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      {...register("street")}
                      placeholder="123 Main Street"
                      className={errors.street ? "border-red-500" : ""}
                    />
                    {errors.street && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.street.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="street2">
                      Apartment, suite, etc. (optional)
                    </Label>
                    <Input
                      id="street2"
                      {...register("street2")}
                      placeholder="Apartment, suite, unit, building, floor, etc."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        {...register("city")}
                        placeholder="Nairobi"
                        className={errors.city ? "border-red-500" : ""}
                      />
                      {errors.city && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.city.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province (optional)</Label>
                      <Input
                        id="state"
                        {...register("state")}
                        placeholder="Nairobi County"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        {...register("postalCode")}
                        placeholder="00100"
                        className={errors.postalCode ? "border-red-500" : ""}
                      />
                      {errors.postalCode && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.postalCode.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        {...register("country")}
                        value="KE"
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register("phone")}
                      placeholder={guestInfo?.phone || "+254 700 000 000"}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sameBilling"
                      checked={useBillingAddress}
                      onCheckedChange={(checked) =>
                        setUseBillingAddress(checked as boolean)
                      }
                    />
                    <Label htmlFor="sameBilling">
                      Use shipping address as billing address
                    </Label>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Shipping Methods */}
            {shippingOptions?.success && shippingOptions.data.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Shipping Method
                  </CardTitle>
                  <CardDescription>
                    Choose how you&apos;d like your order delivered
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={selectedShippingMethod}
                    onValueChange={setSelectedShippingMethod}
                    className="space-y-3"
                  >
                    {shippingOptions.data.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <RadioGroupItem value={option.id} id={option.id} />
                        <div className="flex-1">
                          <Label htmlFor={option.id} className="cursor-pointer">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{option.name}</p>
                                <p className="text-sm text-gray-600">
                                  {option.description}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">
                                    {option.estimatedDays}
                                  </span>
                                </div>
                                {option.zone && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Zone: {option.zone.name}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                {option.isFree ? (
                                  <span className="font-medium text-green-600">
                                    Free
                                  </span>
                                ) : (
                                  <span className="font-medium">
                                    {formatAmount(option.cost)}
                                  </span>
                                )}
                                {option.originalCost !== option.cost && (
                                  <p className="text-sm text-gray-500 line-through">
                                    {formatAmount(option.originalCost)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Label>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {calculatingShipping && (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">
                      Calculating shipping options...
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Show address creation form when no shipping options and form is requested */}
            {showAddressForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create Shipping Address
                  </CardTitle>
                  <CardDescription>
                    Create a complete address to get accurate shipping options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AddressForm
                    onSuccess={handleAddressCreated}
                    onCancel={() => setShowAddressForm(false)}
                    title=""
                    showHeader={false}
                    compact={true}
                    autoFocus={true}
                    defaultValues={{
                      recipientName: guestInfo
                        ? `${guestInfo.firstName} ${guestInfo.lastName}`
                        : "",
                      phone: guestInfo?.phone || "",
                      country: "KE",
                      addressType: "SHIPPING",
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Show message and options when no shipping options available */}
            {!calculatingShipping &&
              !showAddressForm &&
              (!shippingOptions?.success ||
                (shippingOptions.success &&
                  shippingOptions.data.length === 0)) &&
              shippingAddress.street &&
              shippingAddress.city &&
              shippingAddress.postalCode && (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center space-y-4">
                      <Truck className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-gray-600 mb-2 font-medium">
                          No shipping options available
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          We couldn&apos;t find shipping options for this
                          address. This could be due to:
                        </p>
                        <ul className="text-sm text-gray-500 text-left max-w-md mx-auto space-y-1">
                          <li>• Unsupported delivery location</li>
                          <li>• Incomplete address information</li>
                          <li>• Temporary service unavailability</li>
                        </ul>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          variant="outline"
                          onClick={() => setShowAddressForm(true)}
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Create Complete Address
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => {
                            // Allow continuing with manual shipping selection
                            setSelectedShippingMethod("standard");
                          }}
                        >
                          Continue with Standard Shipping
                        </Button>
                      </div>

                      <p className="text-xs text-gray-400 mt-4">
                        Creating a complete address helps us provide accurate
                        shipping rates and delivery options
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
              <div className="flex gap-2">
                {!shippingOptions?.success &&
                  !calculatingShipping &&
                  shippingAddress.street &&
                  shippingAddress.city &&
                  shippingAddress.postalCode && (
                    <Button
                      type="submit"
                      variant="outline"
                      onClick={() => {
                        // Allow continuing without shipping selection for now
                        setSelectedShippingMethod("manual-entry");
                        handleSubmit(onSubmit)();
                      }}
                    >
                      Continue Without Shipping Calculation
                    </Button>
                  )}
                <Button
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  disabled={
                    isSubmitting ||
                    !selectedShippingMethod ||
                    calculatingShipping
                  }
                >
                  {isSubmitting ? "Processing..." : "Continue to Payment"}
                </Button>
              </div>
            </div>

            {/* Debug Information
            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">
                  Debug Info:
                </h4>
                <div className="text-sm space-y-1">
                  <p>
                    Selected Shipping Method: {selectedShippingMethod || "None"}
                  </p>
                  <p>
                    Calculating Shipping: {calculatingShipping ? "Yes" : "No"}
                  </p>
                  <p>
                    Shipping Options Success:{" "}
                    {shippingOptions?.success ? "Yes" : "No"}
                  </p>
                  <p>
                    Shipping Options Count: {shippingOptions?.success || 0}
                  </p>
                  <p>
                    Address Complete:{" "}
                    {!!(
                      shippingAddress.street &&
                      shippingAddress.city &&
                      shippingAddress.postalCode
                    )
                      ? "Yes"
                      : "No"}
                  </p>
                  <p>Street: {shippingAddress.street || "Empty"}</p>
                  <p>City: {shippingAddress.city || "Empty"}</p>
                  <p>Postal Code: {shippingAddress.postalCode || "Empty"}</p>
                </div>
              </div>
            )} */}
          </div>

          {/* Order Summary - Read Only */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Order Summary
                  <Lock className="w-4 h-4 text-gray-400" />
                </CardTitle>
                <CardDescription>
                  Items locked from checkout step
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Cart Items - Read Only */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg opacity-90"
                      >
                        {item.product.thumbnailImage && (
                          <img
                            src={item.product.thumbnailImage}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {item.variant.name}
                          </p>
                          {item.customizations.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {item.customizations.map(
                                (customization, index) => (
                                  <span key={customization.optionId}>
                                    {customization.option.name}:{" "}
                                    {customization.customValue ||
                                      customization.valueId}
                                    {index < item.customizations.length - 1 &&
                                      ", "}
                                  </span>
                                )
                              )}
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatAmount(item.totalPrice)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Summary */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Items ({cartSummary.itemCount})</span>
                      <span>{formatAmount(cartSummary.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>{getSelectedShippingDisplay()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span className="text-gray-500">
                        Calculated at next step
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium text-lg">
                      <span>Estimated Total</span>
                      <span>
                        {formatAmount(
                          cartSummary.total + getSelectedShippingCost()
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Final total will be calculated after tax
                    </p>
                  </div>

                  {/* Checkout Session Info */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Lock className="w-3 h-3" />
                      <span>Items locked from previous step</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      To modify items, go back to cart
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
