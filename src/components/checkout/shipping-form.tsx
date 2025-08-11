/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MapPin, Truck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Import the correct types and hooks
import {
  shippingAddressSchema,
  type ShippingAddressDto,
  type CalculateShippingDto,
} from "@/lib/shipping/dto/shipping.dto";
import { type ShippingOptionResponse } from "@/lib/shipping/types/shipping.types";
import { useCalculateShipping } from "@/hooks/use-shipping";

// Define the response interface locally since it's not exported
interface ShippingCalculationResponse {
  sessionId: string;
  shippingOptions: ShippingOptionResponse[];
  updatedTotals: {
    subtotal: number;
    estimatedTax: number;
    shippingCost: number;
    discount: number;
    estimatedTotal: number;
  };
}

// Countries list - you might want to move this to a constants file
const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  // Add more countries as needed
];

const URGENCY_LEVELS = [
  {
    value: "LOW",
    label: "Standard (Low Priority)",
    description: "5-7 business days",
  },
  { value: "NORMAL", label: "Normal", description: "3-5 business days" },
  { value: "HIGH", label: "Expedited", description: "1-3 business days" },
  { value: "URGENT", label: "Urgent", description: "Next business day" },
] as const;

// Extended form schema with urgency level
const formSchema = shippingAddressSchema.extend({
  urgencyLevel: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
});

type FormData = z.infer<typeof formSchema>;

interface ShippingFormProps {
  sessionId: string;
  onShippingCalculated?: (options: ShippingCalculationResponse) => void;
  onShippingSelected?: (option: ShippingOptionResponse) => void;
  defaultAddress?: Partial<ShippingAddressDto>;
}

export function ShippingForm({
  sessionId,
  onShippingCalculated,
  onShippingSelected,
  defaultAddress,
}: ShippingFormProps) {
  const [selectedShippingOption, setSelectedShippingOption] =
    useState<string>("");
  const [shippingOptions, setShippingOptions] = useState<
    ShippingOptionResponse[]
  >([]);
  const [calculationError, setCalculationError] = useState<string>("");

  const calculateShippingMutation = useCalculateShipping();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultAddress?.name || "",
      recipientName: defaultAddress?.recipientName || "",
      street: defaultAddress?.street || "",
      city: defaultAddress?.city || "",
      state: defaultAddress?.state || "",
      postalCode: defaultAddress?.postalCode || "",
      country: defaultAddress?.country || "",
      phone: defaultAddress?.phone || "",
      type: defaultAddress?.type || "SHIPPING",
      urgencyLevel: "NORMAL",
    },
  });

  const watchedCountry = form.watch("country");
  const watchedUrgencyLevel = form.watch("urgencyLevel");

  // Calculate shipping when form is valid and complete
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Only trigger calculation if key fields change and form is valid
      const triggerFields = [
        "country",
        "state",
        "city",
        "postalCode",
        "urgencyLevel",
      ];
      if (triggerFields.includes(name || "")) {
        handleCalculateShipping();
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const handleCalculateShipping = async () => {
    const values = form.getValues();

    // Check if minimum required fields are filled
    if (!values.country || !values.city || !values.postalCode) {
      setShippingOptions([]);
      setCalculationError("");
      return;
    }

    const calculationData: CalculateShippingDto = {
      sessionId,
      shippingAddress: {
        name: values.name,
        recipientName: values.recipientName,
        street: values.street,
        city: values.city,
        state: values.state,
        postalCode: values.postalCode,
        country: values.country,
        phone: values.phone,
        type: values.type,
      },
    };

    try {
      setCalculationError("");
      const result =
        await calculateShippingMutation.mutateAsync(calculationData);

      // Handle the response - the hook returns { success: true, data: ShippingOptionResponse[] }
      if (result && typeof result === "object" && "success" in result) {
        if (result.success === false) {
          // Error response
          setShippingOptions([]);
          setCalculationError(result.error || "Failed to calculate shipping");
          return;
        } else if (
          result.success === true &&
          "data" in result &&
          Array.isArray(result.data)
        ) {
          // Success response with data array
          const shippingOptions = result.data as ShippingOptionResponse[];
          setShippingOptions(shippingOptions);

          // Create a full response object for the callback
          const shippingResponse: ShippingCalculationResponse = {
            sessionId,
            shippingOptions,
            updatedTotals: {
              subtotal: 0,
              estimatedTax: 0,
              shippingCost: 0,
              discount: 0,
              estimatedTotal: 0,
            },
          };
          onShippingCalculated?.(shippingResponse);

          // Auto-select first option if none selected
          if (shippingOptions.length > 0 && !selectedShippingOption) {
            const firstOption = shippingOptions[0];
            setSelectedShippingOption(firstOption.id);
            onShippingSelected?.(firstOption);
          }
        }
      } else {
        // Fallback for unexpected response format
        setShippingOptions([]);
        setCalculationError("Unexpected response format");
      }
    } catch (error) {
      setShippingOptions([]);
      setCalculationError("Unable to calculate shipping for this address");
    }
  };

  const handleShippingOptionChange = (optionId: string) => {
    setSelectedShippingOption(optionId);
    const selectedOption = shippingOptions.find(
      (option) => option.id === optionId
    );
    if (selectedOption) {
      onShippingSelected?.(selectedOption);
    }
  };

  const onSubmit = (values: FormData) => {
    if (!selectedShippingOption) {
      toast.error("Please select a shipping option");
      return;
    }

    // Form is valid and shipping option is selected
    const selectedOption = shippingOptions.find(
      (option) => option.id === selectedShippingOption
    );
    if (selectedOption) {
      toast.success("Shipping information saved");
      onShippingSelected?.(selectedOption);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Shipping Address
          </CardTitle>
          <CardDescription>
            Enter your shipping address to calculate shipping options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Home, Office, etc." {...field} />
                    </FormControl>
                    <FormDescription>
                      A name to identify this address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recipientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street, Apt 4B" {...field} />
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
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
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
                        <Input placeholder="NY" {...field} />
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
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name}
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SHIPPING">Shipping Only</SelectItem>
                        <SelectItem value="BILLING">Billing Only</SelectItem>
                        <SelectItem value="BOTH">Shipping & Billing</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urgencyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Priority</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {URGENCY_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              <div className="flex flex-col">
                                <span>{level.label}</span>
                                <span className="text-sm text-muted-foreground">
                                  {level.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Higher priority levels may increase shipping costs
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Shipping Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Options
          </CardTitle>
          <CardDescription>
            Select your preferred shipping method
          </CardDescription>
        </CardHeader>
        <CardContent>
          {calculateShippingMutation.isPending && (
            <div className="flex items-center gap-2 py-8">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Calculating shipping options...</span>
            </div>
          )}

          {calculationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{calculationError}</AlertDescription>
            </Alert>
          )}

          {!calculateShippingMutation.isPending &&
            !calculationError &&
            shippingOptions.length === 0 &&
            watchedCountry && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No shipping options available for the selected address. Please
                  verify your address details.
                </AlertDescription>
              </Alert>
            )}

          {!calculateShippingMutation.isPending &&
            !calculationError &&
            shippingOptions.length === 0 &&
            !watchedCountry && (
              <div className="text-center py-8 text-muted-foreground">
                <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter your shipping address to see available options</p>
              </div>
            )}

          {shippingOptions.length > 0 && (
            <RadioGroup
              value={selectedShippingOption}
              onValueChange={handleShippingOptionChange}
              className="space-y-3"
            >
              {shippingOptions.map((option) => (
                <div
                  key={option.id}
                  className={`relative flex items-center space-x-3 rounded-lg border p-4 transition-colors ${
                    selectedShippingOption === option.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{option.name}</span>
                          {option.isFree && (
                            <Badge variant="secondary" className="text-xs">
                              FREE
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Estimated delivery: {option.estimatedDays}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {option.isFree
                            ? "FREE"
                            : `$${option.cost.toFixed(2)}`}
                        </div>
                        {!option.isFree &&
                          option.originalCost !== option.cost && (
                            <div className="text-sm text-muted-foreground line-through">
                              ${option.originalCost.toFixed(2)}
                            </div>
                          )}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </CardContent>
      </Card>

      {shippingOptions.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={
              !selectedShippingOption || calculateShippingMutation.isPending
            }
            className="min-w-[150px]"
          >
            Continue to Payment
          </Button>
        </div>
      )}
    </div>
  );
}
