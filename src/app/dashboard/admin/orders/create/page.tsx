/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Loader2,
  Save,
  ChevronRight,
  Package,
  Clock,
  Zap,
  User,
  CreditCard,
  Truck,
  Eye,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Import hooks and types
import { useCreateOrder } from "@/hooks/use-orders";
import { useAddresses } from "@/hooks/use-address";
import {
  createOrderSchema,
  type CreateOrderDto,
} from "@/lib/orders/dto/orders.dto";

// Create a form schema that extends the base order schema
const createOrderFormSchema = createOrderSchema.extend({
  // Add any additional form-specific fields
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerCompany: z.string().optional(),
});

type CreateOrderFormData = z.infer<typeof createOrderFormSchema>;

// Order types configuration
const ORDER_TYPES = [
  {
    id: "custom-printing",
    title: "Custom Printing",
    description: "Business cards, flyers, banners, and custom designs",
    features: ["Custom Design", "High Quality Print", "Multiple Formats"],
    popular: true,
    icon: Package,
    estimatedDays: "5-7 business days",
  },
  {
    id: "promotional-items",
    title: "Promotional Items",
    description: "Branded merchandise, giveaways, and marketing materials",
    features: ["Brand Customization", "Bulk Pricing", "Quick Turnaround"],
    popular: false,
    icon: Package,
    estimatedDays: "3-5 business days",
  },
  {
    id: "event-materials",
    title: "Event Materials",
    description: "Conference materials, signage, and event collateral",
    features: [
      "Event Planning Support",
      "Rush Orders Available",
      "Large Format",
    ],
    popular: false,
    icon: Package,
    estimatedDays: "2-4 business days",
  },
] as const;

// Urgency options configuration
const URGENCY_OPTIONS = [
  {
    level: "NORMAL" as const,
    title: "Standard",
    description: "5-7 business days",
    icon: Clock,
    color: "text-green-600 bg-green-50 border-green-200",
    priceMultiplier: 1.0,
    badge: "Standard",
  },
  {
    level: "EXPEDITED" as const,
    title: "Expedited",
    description: "3-4 business days",
    icon: Zap,
    color: "text-orange-600 bg-orange-50 border-orange-200",
    priceMultiplier: 1.15,
    badge: "+15%",
  },
  {
    level: "RUSH" as const,
    title: "Rush",
    description: "1-2 business days",
    icon: Zap,
    color: "text-red-600 bg-red-50 border-red-200",
    priceMultiplier: 1.35,
    badge: "+35%",
  },
  {
    level: "EMERGENCY" as const,
    title: "Emergency",
    description: "Same day/next day",
    icon: Zap,
    color: "text-red-600 bg-red-50 border-red-200",
    priceMultiplier: 1.75,
    badge: "+75%",
  },
] as const;

// Order Type Selection Component
function OrderTypeCard({
  type,
  isSelected,
  onSelect,
}: {
  type: (typeof ORDER_TYPES)[number];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const Icon = type.icon;

  return (
    <div
      className={`relative p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
        isSelected
          ? "border-primary bg-primary/5 shadow-md"
          : type.popular
            ? "border-primary/30 bg-primary/5"
            : "border-border"
      }`}
      onClick={onSelect}
    >
      {type.popular && (
        <Badge className="absolute -top-2 -right-2 bg-primary">Popular</Badge>
      )}

      {isSelected && (
        <Badge className="absolute -top-2 -left-2 bg-green-500">Selected</Badge>
      )}

      <div className="flex items-start gap-3">
        <Icon className="h-6 w-6 mt-1 text-primary" />
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{type.title}</h3>
          <p className="text-sm text-muted-foreground mb-2">
            {type.description}
          </p>

          <div className="space-y-1 mb-3">
            {type.features.map((feature, idx) => (
              <div key={idx} className="flex items-center text-xs">
                <div className="h-1.5 w-1.5 bg-primary rounded-full mr-2" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="text-xs text-muted-foreground">
            Est. delivery: {type.estimatedDays}
          </div>
        </div>
      </div>
    </div>
  );
}

// Urgency Level Selection Component
function UrgencyCard({
  option,
  isSelected,
  onSelect,
}: {
  option: (typeof URGENCY_OPTIONS)[number];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const Icon = option.icon;

  return (
    <div
      className={`p-3 border rounded-lg cursor-pointer transition-all ${
        isSelected
          ? `${option.color} border-current shadow-md`
          : "border-border hover:shadow-sm"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="font-medium">{option.title}</span>
        </div>
        <Badge variant="outline" className="text-xs">
          {option.badge}
        </Badge>
      </div>
      <p className="text-sm mb-2">{option.description}</p>
      {isSelected && <Badge className="bg-green-500 text-xs">Selected</Badge>}
    </div>
  );
}

// Main component with no props - standard Next.js page structure
export default function CreateOrderPage() {
  const router = useRouter();
  const [selectedOrderType, setSelectedOrderType] = useState<string>("");
  const [activeTab, setActiveTab] = useState("basic");

  // Fixed values for page-specific behavior
  const returnPath = "/dashboard/admin/orders";

  // Hooks
  const createOrderMutation = useCreateOrder();
  const { data: addressesResult } = useAddresses();

  const addresses = addressesResult?.success
    ? addressesResult.data?.items || []
    : [];

  // Form setup
  const form = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderFormSchema),
    defaultValues: {
      shippingAddressId: "",
      billingAddressId: "",
      customerId: "",
      couponCode: "",
      notes: "",
      items: [],
      useCartItems: false,
      urgencyLevel: "NORMAL",
      expectedProductionDays: undefined,
      specialInstructions: "",
      designApprovalRequired: true,
      paymentMethod: "MPESA",
      customerPhone: "",
      customerName: "",
      customerEmail: "",
      customerCompany: "",
    },
  });

  // Computed values
  const selectedOrderTypeData = ORDER_TYPES.find(
    (type) => type.id === selectedOrderType
  );
  const selectedUrgencyLevel = form.watch("urgencyLevel");
  const selectedUrgencyData = URGENCY_OPTIONS.find(
    (option) => option.level === selectedUrgencyLevel
  );

  // Form submission
  const onSubmit = async (data: CreateOrderFormData) => {
    try {
      // Transform form data to CreateOrderDto
      const { customerName, customerEmail, customerCompany, ...orderData } =
        data;

      const result = await createOrderMutation.mutateAsync(orderData);

      if (result.success) {
        router.push(`${returnPath}/${result.data.id}`);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      // Error handling is done by the mutation hook
    }
  };

  // Navigation helpers
  const handleCancel = () => {
    router.push(returnPath);
  };

  const handleNext = (nextTab: string) => {
    setActiveTab(nextTab);
  };

  const handleOrderTypeSelect = (typeId: string) => {
    setSelectedOrderType(typeId);
  };

  const isFormValid = () => {
    const values = form.getValues();
    return (
      values.customerName &&
      values.customerEmail &&
      values.shippingAddressId &&
      selectedOrderType
    );
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href={returnPath}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">
              Create New Order
            </h1>
          </div>
          <p className="text-muted-foreground">
            Design and place a custom printing order
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={createOrderMutation.isPending || !isFormValid()}
          >
            {createOrderMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Order
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Alert>
          <Package className="h-4 w-4" />
          <AlertDescription>
            <strong>Need help?</strong> Our design team can assist with your
            project.
            <Button variant="link" size="sm" className="ml-2 p-0 h-auto">
              Contact Support
            </Button>
          </AlertDescription>
        </Alert>

        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <strong>Rush orders available.</strong> Need it faster? We offer
            same-day delivery for urgent projects.
          </AlertDescription>
        </Alert>

        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            <strong>Bulk discounts.</strong> Save more when you order larger
            quantities.
          </AlertDescription>
        </Alert>
      </div>

      {/* Main Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:w-[500px]">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic">
              <div className="space-y-6">
                {/* Order Type Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Choose Project Type
                    </CardTitle>
                    <CardDescription>
                      Select the type of printing project you need
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                      {ORDER_TYPES.map((type) => (
                        <OrderTypeCard
                          key={type.id}
                          type={type}
                          isSelected={selectedOrderType === type.id}
                          onSelect={() => handleOrderTypeSelect(type.id)}
                        />
                      ))}
                    </div>

                    {!selectedOrderType && (
                      <Alert className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Please select a project type to continue.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Urgency Level Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Delivery Timeline
                    </CardTitle>
                    <CardDescription>
                      Choose your preferred delivery speed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="urgencyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                              {URGENCY_OPTIONS.map((option) => (
                                <UrgencyCard
                                  key={option.level}
                                  option={option}
                                  isSelected={field.value === option.level}
                                  onSelect={() => field.onChange(option.level)}
                                />
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    onClick={() => handleNext("customer")}
                    disabled={!selectedOrderType}
                  >
                    Next: Customer Info
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Customer Info Tab */}
            <TabsContent value="customer">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                  <CardDescription>
                    Enter customer details for this order
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter customer name"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Full name of the customer placing this order.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Email *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="customer@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Email address for order notifications.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+254 700 000 000" {...field} />
                          </FormControl>
                          <FormDescription>
                            Contact number for delivery coordination.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerCompany"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Company name" {...field} />
                          </FormControl>
                          <FormDescription>
                            Company or organization name if applicable.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer ID (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Existing customer ID"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Leave blank for new customers.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => handleNext("basic")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  onClick={() => handleNext("shipping")}
                  disabled={
                    !form.getValues("customerName") ||
                    !form.getValues("customerEmail")
                  }
                >
                  Next: Shipping
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            {/* Shipping Tab */}
            <TabsContent value="shipping">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping & Delivery
                  </CardTitle>
                  <CardDescription>
                    Configure delivery addresses and special instructions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="shippingAddressId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping Address *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select shipping address" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {addresses.map((address) => (
                                <SelectItem key={address.id} value={address.id}>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>
                                      {address.street}, {address.city}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Where should we deliver this order?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="billingAddressId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Address</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Same as shipping" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">
                                Same as shipping address
                              </SelectItem>
                              {addresses.map((address) => (
                                <SelectItem key={address.id} value={address.id}>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>
                                      {address.street}, {address.city}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Billing address (defaults to shipping address).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="specialInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special delivery or handling instructions..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Additional instructions for production or delivery.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="designApprovalRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Design Approval Required
                          </FormLabel>
                          <FormDescription>
                            Customer must approve design before production
                            starts.
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
                </CardContent>
              </Card>

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => handleNext("customer")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  onClick={() => handleNext("payment")}
                  disabled={!form.getValues("shippingAddressId")}
                >
                  Next: Payment
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            {/* Payment Tab */}
            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                  <CardDescription>
                    Configure payment method and terms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MPESA">M-Pesa</SelectItem>
                            <SelectItem value="CARD">
                              Credit/Debit Card
                            </SelectItem>
                            <SelectItem value="BANK_TRANSFER">
                              Bank Transfer
                            </SelectItem>
                            <SelectItem value="CASH">
                              Cash on Delivery
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How the customer will pay for this order.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="couponCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coupon Code (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter coupon code" {...field} />
                        </FormControl>
                        <FormDescription>
                          Apply a discount coupon if available.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => handleNext("shipping")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button onClick={() => handleNext("review")}>
                  Next: Review
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            {/* Review Tab */}
            <TabsContent value="review">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Review & Submit
                  </CardTitle>
                  <CardDescription>
                    Review your order details before submitting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Summary */}
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <h4 className="font-medium">Order Type</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedOrderTypeData?.title || "Not selected"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Urgency Level</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedUrgencyData?.title} (
                          {selectedUrgencyData?.description})
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Customer</h4>
                        <p className="text-sm text-muted-foreground">
                          {form.watch("customerName") || "Not specified"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {form.watch("customerEmail")}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Payment Method</h4>
                        <p className="text-sm text-muted-foreground">
                          {form.watch("paymentMethod")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional notes for this order..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Internal notes about this order.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!isFormValid() && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please complete all required fields before submitting.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => handleNext("payment")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  type="submit"
                  disabled={createOrderMutation.isPending || !isFormValid()}
                  className="min-w-[120px]"
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Order
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
