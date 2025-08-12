/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Truck, MapPin, Loader2, Plus, Check, CreditCard } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { formatAmount } from "@/lib/utils";
import {
  useCheckoutSession,
  useCalculateShipping,
  useValidateCheckout,
} from "@/hooks/use-checkout";
import {
  useAddresses,
  useCreateAddress,
  useDefaultAddress,
} from "@/hooks/use-address";
import { useUserProfile } from "@/hooks/use-users";
import {
  addressInputSchema,
  type ShippingCalculationDto,
  type ValidateCheckoutDto,
} from "@/lib/checkout/dto/checkout.dto";
import {
  createAddressSchema,
  type CreateAddressDto,
  type GetAddressesDto,
} from "@/lib/address/dto/address.dto";
import {
  AddressResponse,
  AddressType,
} from "@/lib/address/types/address.types";
import { ShippingOption } from "@/lib/checkout/types/checkout.types";
import { toast } from "sonner";

type AddressForm = z.infer<typeof addressInputSchema>;

export default function CheckoutShippingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");

  // State
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedShippingOption, setSelectedShippingOption] =
    useState<string>("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [calculatedTotals, setCalculatedTotals] = useState<any>(null);
  const [urgencyLevel, setUrgencyLevel] = useState<
    "NORMAL" | "EXPEDITED" | "RUSH" | "EMERGENCY"
  >("NORMAL");

  // User and auth state
  const { data: userProfile } = useUserProfile();
  const isAuthenticated = !!userProfile;

  // Hooks
  const { data: checkoutSession, isLoading: sessionLoading } =
    useCheckoutSession(sessionId || "", !!sessionId);

  // Fix the useAddresses hook call - it needs proper parameters
  const addressParams: GetAddressesDto = { page: 1, limit: 10 };
  const { data: addressesData, refetch: refetchAddresses } = useAddresses(
    isAuthenticated ? addressParams : undefined
  );

  const { data: defaultShippingAddress } = useDefaultAddress(
    "SHIPPING" as AddressType,
    isAuthenticated
  );

  const calculateShippingMutation = useCalculateShipping();
  const validateCheckoutMutation = useValidateCheckout();
  const createAddressMutation = useCreateAddress();

  // Address form
  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    formState: { errors: addressErrors },
    reset: resetAddressForm,
  } = useForm<AddressForm>({
    resolver: zodResolver(addressInputSchema),
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, router]);

  // Auto-select default address for authenticated users
  useEffect(() => {
    if (isAuthenticated && defaultShippingAddress && !selectedAddressId) {
      setSelectedAddressId(defaultShippingAddress.id);
      calculateShippingForAddress(defaultShippingAddress);
    }
  }, [defaultShippingAddress, selectedAddressId, isAuthenticated]);

  // Redirect if no session
  useEffect(() => {
    if (!sessionId) {
      router.push("/checkout");
    }
  }, [sessionId, router]);

  const calculateShippingForAddress = async (address: AddressResponse) => {
    if (!sessionId) return;

    try {
      const shippingData: ShippingCalculationDto = {
        sessionId,
        shippingAddress: {
          recipientName: address.recipientName,
          companyName: address.companyName || undefined,
          street: address.street,
          street2: address.street2 || undefined,
          city: address.city,
          state: address.state || undefined,
          postalCode: address.postalCode,
          country: address.country,
          phone: address.phone || undefined,
        },
        urgencyLevel: urgencyLevel,
      };

      const result = await calculateShippingMutation.mutateAsync(shippingData);
      setShippingOptions(result.shippingOptions);
      setCalculatedTotals(result.updatedTotals);

      // Auto-select first shipping option
      if (result.shippingOptions.length > 0 && !selectedShippingOption) {
        setSelectedShippingOption(result.shippingOptions[0].id);
      }
    } catch (error) {
      console.error("Failed to calculate shipping:", error);
    }
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    const address = addressesData?.success
      ? addressesData.data.items.find((a) => a.id === addressId)
      : null;

    if (address) {
      calculateShippingForAddress(address);
    }
  };

  const handleNewAddressSubmit = async (data: AddressForm) => {
    try {
      const addressData: CreateAddressDto = {
        name: "Shipping Address",
        recipientName: data.recipientName,
        companyName: data.companyName || undefined,
        street: data.street,
        street2: data.street2 || undefined,
        city: data.city,
        state: data.state || undefined,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone || undefined,
        addressType: "SHIPPING" as AddressType,
        isDefault: false,
      };

      const result = await createAddressMutation.mutateAsync(addressData);
      if (result.success) {
        // Store the address temporarily in session storage as fallback
        sessionStorage.setItem("tempAddress", JSON.stringify(result.data));

        // Refetch addresses to get the updated list
        await refetchAddresses();

        setSelectedAddressId(result.data.id);
        setShowNewAddressForm(false);
        resetAddressForm();
        calculateShippingForAddress(result.data);
      }
    } catch (error) {
      console.error("Failed to create address:", error);
    }
  };

  const handleContinueToPayment = async () => {
    if (!sessionId || !selectedShippingOption || !selectedAddressId) {
      return;
    }

    try {
      let address = addressesData?.success
        ? addressesData.data.items.find((a) => a.id === selectedAddressId)
        : null;

      // If address not found in the list, try to fetch it directly
      if (!address) {
        try {
          // Force refetch addresses
          await refetchAddresses();

          // Check again after refetch
          const refetchedData = await refetchAddresses();

          if (refetchedData?.success) {
            address = refetchedData.data.items.find(
              (a) => a.id === selectedAddressId
            );
          }
        } catch (refetchError) {
          console.error("Failed to refetch addresses:", refetchError);
        }
      }

      // If still no address, try using session storage as fallback
      if (!address) {
        const storedAddress = sessionStorage.getItem("tempAddress");
        if (storedAddress) {
          try {
            const parsedAddress = JSON.parse(storedAddress);
            address = parsedAddress;
          } catch (parseError) {
            console.error("Failed to parse stored address:", parseError);
          }
        }
      }

      if (!address) {
        toast.error(
          "Selected address not found. Please select an address again."
        );
        return;
      }

      const shippingAddress = {
        recipientName: address.recipientName,
        companyName: address.companyName || undefined,
        street: address.street,
        street2: address.street2 || undefined,
        city: address.city,
        state: address.state || undefined,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone || undefined,
      };

      // Validate checkout before proceeding
      const validateData: ValidateCheckoutDto = {
        sessionId,
        shippingAddress,
        selectedShippingOption,
        paymentMethod: "MPESA", // Default, will be selected in payment step
      };

      // Add customerPhone if available
      if (userProfile?.phone) {
        validateData.customerPhone = userProfile.phone;
      }

      const validationResult =
        await validateCheckoutMutation.mutateAsync(validateData);

      if (validationResult.isValid) {
        // Find the selected shipping option details
        const selectedOption = shippingOptions.find(
          (opt) => opt.id === selectedShippingOption
        );

        // Store comprehensive checkout data for the payment page
        const checkoutData = {
          sessionId,
          shippingAddress,
          selectedShippingMethod: selectedShippingOption,
          shippingOptions,
          selectedShippingOption: selectedOption,
          calculatedTotals,
          checkoutSession,
          shippingAddressId: selectedAddressId,
          billingAddressId: selectedAddressId, // Assuming same as shipping
          urgencyLevel,
          customerId: userProfile?.id,
          // Explicitly include cart items for order creation
          useCartItems: true, // This tells the API to use items from the checkout session
          items: checkoutSession.items, // Include the items for reference
        };

        // Store all checkout data for payment page
        sessionStorage.setItem("checkoutData", JSON.stringify(checkoutData));

        // Store individual items for backward compatibility
        sessionStorage.setItem(
          "selectedShippingOption",
          selectedShippingOption
        );
        sessionStorage.setItem(
          "shippingAddress",
          JSON.stringify(shippingAddress)
        );
        sessionStorage.setItem("selectedAddressId", selectedAddressId);

        // Navigate to payment with session parameter
        router.push(`/checkout/payment?session=${sessionId}`);
      } else {
        toast.error("Checkout validation failed. Please try again.");
      }
    } catch (error) {
      console.error("Failed to validate checkout:", error);
      toast.error("Failed to proceed to payment. Please try again.");
    }
  };

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading checkout session...</p>
        </div>
      </div>
    );
  }

  if (!checkoutSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Checkout session not found</p>
          <Button onClick={() => router.push("/checkout")}>Start Over</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipping</h1>
          <p className="text-gray-600">
            Choose your shipping address and method
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                <Check className="w-4 h-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">
                Information
              </span>
            </div>
            <div className="flex-1 h-px bg-green-300 mx-4"></div>
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
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Saved Addresses */}
                  {addressesData?.success &&
                    addressesData.data.items.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium">Saved Addresses</h4>
                        <RadioGroup
                          value={selectedAddressId}
                          onValueChange={handleAddressSelect}
                        >
                          {addressesData.data.items
                            .filter(
                              (addr) =>
                                addr.addressType === "SHIPPING" ||
                                addr.addressType === "BOTH"
                            )
                            .map((address) => (
                              <div
                                key={address.id}
                                className="flex items-start space-x-3"
                              >
                                <RadioGroupItem
                                  value={address.id}
                                  id={address.id}
                                  className="mt-1"
                                />
                                <Label
                                  htmlFor={address.id}
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="p-3 border rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium">
                                        {address.name || "Address"}
                                      </span>
                                      {address.isDefault && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          Default
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-900">
                                      {address.recipientName}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {address.formattedAddress}
                                    </p>
                                  </div>
                                </Label>
                              </div>
                            ))}
                        </RadioGroup>
                      </div>
                    )}

                  {/* Add New Address */}
                  <div className="pt-4 border-t">
                    {!showNewAddressForm ? (
                      <Button
                        variant="outline"
                        onClick={() => setShowNewAddressForm(true)}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Address
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">New Shipping Address</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowNewAddressForm(false);
                              resetAddressForm();
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                        <AddressForm
                          onSubmit={handleAddressSubmit(handleNewAddressSubmit)}
                          register={registerAddress}
                          errors={addressErrors}
                          isSubmitting={createAddressMutation.isPending}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Options */}
            {shippingOptions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Shipping Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Urgency Level Selector */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Urgency Level</Label>
                    <RadioGroup
                      value={urgencyLevel}
                      onValueChange={(
                        value: "NORMAL" | "EXPEDITED" | "RUSH" | "EMERGENCY"
                      ) => {
                        setUrgencyLevel(value);
                        // Recalculate shipping when urgency changes
                        if (selectedAddressId) {
                          const currentAddress = addressesData?.success
                            ? addressesData.data.items.find(
                                (a) => a.id === selectedAddressId
                              )
                            : null;

                          if (currentAddress) {
                            calculateShippingForAddress(currentAddress);
                          }
                        }
                      }}
                      className="grid grid-cols-2 gap-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NORMAL" id="normal" />
                        <Label htmlFor="normal" className="text-sm">
                          Normal
                          <span className="block text-xs text-gray-500">
                            Standard processing
                          </span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="EXPEDITED" id="expedited" />
                        <Label htmlFor="expedited" className="text-sm">
                          Expedited
                          <span className="block text-xs text-gray-500">
                            Faster processing
                          </span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="RUSH" id="rush" />
                        <Label htmlFor="rush" className="text-sm">
                          Rush
                          <span className="block text-xs text-gray-500">
                            Priority processing
                          </span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="EMERGENCY" id="emergency" />
                        <Label htmlFor="emergency" className="text-sm">
                          Emergency
                          <span className="block text-xs text-gray-500">
                            Immediate processing
                          </span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Shipping Options */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Delivery Options
                    </Label>
                    <RadioGroup
                      value={selectedShippingOption}
                      onValueChange={setSelectedShippingOption}
                    >
                      {shippingOptions.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-start space-x-3"
                        >
                          <RadioGroupItem
                            value={option.id}
                            id={option.id}
                            className="mt-1"
                          />
                          <Label
                            htmlFor={option.id}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="p-3 border rounded-lg hover:bg-gray-50">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{option.name}</p>
                                  {option.description && (
                                    <p className="text-sm text-gray-600">
                                      {option.description}
                                    </p>
                                  )}
                                  {option.estimatedDays && (
                                    <p className="text-sm text-gray-500">
                                      {option.estimatedDays}
                                    </p>
                                  )}
                                  {option.urgencyMultiplier > 1 && (
                                    <Badge variant="outline" className="mt-1">
                                      {option.urgencyMultiplier}x urgency
                                      multiplier
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-right">
                                  {option.isFree ? (
                                    <span className="font-medium text-green-600">
                                      Free
                                    </span>
                                  ) : (
                                    <div>
                                      <span className="font-medium">
                                        {formatAmount(option.cost)}
                                      </span>
                                      {option.originalCost !== option.cost && (
                                        <p className="text-xs text-gray-500 line-through">
                                          {formatAmount(option.originalCost)}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items Summary */}
                <div className="space-y-2">
                  {checkoutSession.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="truncate mr-2">
                        {item.productName} × {item.quantity}
                      </span>
                      <span>{formatAmount(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>
                      {formatAmount(
                        calculatedTotals?.subtotal || checkoutSession.subtotal
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>
                      {calculatedTotals?.shippingCost !== undefined
                        ? formatAmount(calculatedTotals.shippingCost)
                        : "TBD"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>
                      {formatAmount(
                        calculatedTotals?.estimatedTax ||
                          checkoutSession.estimatedTax
                      )}
                    </span>
                  </div>
                  {calculatedTotals?.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{formatAmount(calculatedTotals.discount)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>
                    {formatAmount(
                      calculatedTotals?.estimatedTotal ||
                        checkoutSession.estimatedTotal
                    )}
                  </span>
                </div>

                <Button
                  onClick={handleContinueToPayment}
                  className="w-full"
                  size="lg"
                  disabled={
                    !selectedShippingOption ||
                    !selectedAddressId ||
                    validateCheckoutMutation.isPending
                  }
                >
                  {validateCheckoutMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Continue to Payment
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Address Form Component
function AddressForm({
  onSubmit,
  register,
  errors,
  isSubmitting,
  submitText = "Save Address",
}: {
  onSubmit: () => void;
  register: any;
  errors: any;
  isSubmitting: boolean;
  submitText?: string;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="recipientName">Full Name</Label>
          <Input
            id="recipientName"
            {...register("recipientName")}
            className={errors.recipientName ? "border-red-500" : ""}
          />
          {errors.recipientName && (
            <p className="text-sm text-red-500 mt-1">
              {errors.recipientName.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="companyName">Company (Optional)</Label>
          <Input id="companyName" {...register("companyName")} />
        </div>
      </div>

      <div>
        <Label htmlFor="street">Street Address</Label>
        <Input
          id="street"
          {...register("street")}
          className={errors.street ? "border-red-500" : ""}
        />
        {errors.street && (
          <p className="text-sm text-red-500 mt-1">{errors.street.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="street2">Apartment, suite, etc. (Optional)</Label>
        <Input id="street2" {...register("street2")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            {...register("city")}
            className={errors.city ? "border-red-500" : ""}
          />
          {errors.city && (
            <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="state">State/Province (Optional)</Label>
          <Input id="state" {...register("state")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            {...register("postalCode")}
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
            placeholder="KE"
            className={errors.country ? "border-red-500" : ""}
          />
          {errors.country && (
            <p className="text-sm text-red-500 mt-1">
              {errors.country.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="phone">Phone Number (Optional)</Label>
        <Input
          id="phone"
          type="tel"
          {...register("phone")}
          placeholder="+254 700 000 000"
          className={errors.phone ? "border-red-500" : ""}
        />
        {errors.phone && (
          <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          submitText
        )}
      </Button>
    </form>
  );
}
