/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Minus,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  FileText,
  AlertTriangle,
  Save,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import { useCreateOrder } from "@/hooks/use-orders";
import {
  CreateOrderDto,
  createOrderSchema,
  OrderItemDto,
} from "@/lib/orders/dto/orders.dto";

interface CreateOrderFormProps {
  onSuccess?: (orderId: string) => void;
  onCancel?: () => void;
}

export default function CreateOrderForm({
  onSuccess,
  onCancel,
}: CreateOrderFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const createOrder = useCreateOrder();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateOrderDto>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      urgencyLevel: "NORMAL",
      designApprovalRequired: true,
      paymentMethod: "MPESA",
      useCartItems: false,
      items: [
        {
          productId: "",
          quantity: 1,
          customizations: {},
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedValues = watch();

  const onSubmit = async (data: CreateOrderDto) => {
    try {
      const result = await createOrder.mutateAsync(data);
      if (result.success && result.data) {
        onSuccess?.(result.data.id);
        router.push(`/dashboard/customer/orders/${result.data.id}`);
      }
    } catch (error) {
      console.error("Failed to create order:", error);
    }
  };

  const addItem = () => {
    append({
      productId: "",
      quantity: 1,
      customizations: {},
    });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const getStepIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return Package;
      case 2:
        return User;
      case 3:
        return MapPin;
      case 4:
        return CreditCard;
      default:
        return Package;
    }
  };

  const isStepValid = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return watchedValues.items?.every(
          (item) => item.productId && item.quantity > 0
        );
      case 2:
        return true; // Customer info is optional for now
      case 3:
        return !!watchedValues.shippingAddressId;
      case 4:
        return !!watchedValues.paymentMethod;
      default:
        return false;
    }
  };

  const steps = [
    {
      number: 1,
      title: "Order Items",
      description: "Add products to the order",
    },
    {
      number: 2,
      title: "Customer Info",
      description: "Customer details and preferences",
    },
    {
      number: 3,
      title: "Shipping",
      description: "Delivery address and options",
    },
    {
      number: 4,
      title: "Payment",
      description: "Payment method and confirmation",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create New Order
          </h1>
          <p className="text-muted-foreground">
            Set up a new order for your customer
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => onCancel?.() || router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((stepInfo, index) => {
              const Icon = getStepIcon(stepInfo.number);
              const isActive = step === stepInfo.number;
              const isCompleted = step > stepInfo.number;
              const isValid = isStepValid(stepInfo.number);

              return (
                <div
                  key={stepInfo.number}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : isCompleted && isValid
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-muted bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {stepInfo.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stepInfo.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-5 left-1/2 w-full h-0.5 bg-muted -z-10" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Order Items */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
              <CardDescription>
                Add products and specify quantities for this order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Item {index + 1}
                    </Label>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`items.${index}.productId`}>
                        Product
                      </Label>
                      <Select
                        value={field.productId}
                        onValueChange={(value) =>
                          setValue(`items.${index}.productId`, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="product1">
                            Custom T-Shirt
                          </SelectItem>
                          <SelectItem value="product2">
                            Business Cards
                          </SelectItem>
                          <SelectItem value="product3">
                            Promotional Banner
                          </SelectItem>
                          <SelectItem value="product4">Coffee Mug</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.items?.[index]?.productId && (
                        <p className="text-sm text-red-500">
                          Product is required
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`items.${index}.quantity`}>
                        Quantity
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        {...register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                        placeholder="1"
                      />
                      {errors.items?.[index]?.quantity && (
                        <p className="text-sm text-red-500">
                          {errors.items[index]?.quantity?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Customization</Label>
                      <Textarea
                        placeholder="Special requests, text, colors..."
                        rows={2}
                        onChange={(e) =>
                          setValue(`items.${index}.customizations`, {
                            text: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Item
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Customer Info */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
              <CardDescription>
                Specify customer details and order preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer ID (Optional)</Label>
                  <Input
                    id="customerId"
                    {...register("customerId")}
                    placeholder="Leave empty to create guest order"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Customer Phone</Label>
                  <Input
                    id="customerPhone"
                    {...register("customerPhone")}
                    placeholder="+254..."
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-medium">
                  Order Preferences
                </Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="urgencyLevel">Urgency Level</Label>
                    <Select
                      value={watchedValues.urgencyLevel}
                      onValueChange={(value) =>
                        setValue("urgencyLevel", value as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="EXPEDITED">Expedited</SelectItem>
                        <SelectItem value="RUSH">Rush</SelectItem>
                        <SelectItem value="EMERGENCY">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedProductionDays">
                      Expected Production Days
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      {...register("expectedProductionDays", {
                        valueAsNumber: true,
                      })}
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="designApprovalRequired">
                      Design Approval Required
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Customer must approve design before production
                    </p>
                  </div>
                  <Switch
                    id="designApprovalRequired"
                    checked={watchedValues.designApprovalRequired}
                    onCheckedChange={(checked) =>
                      setValue("designApprovalRequired", checked)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialInstructions">
                  Special Instructions
                </Label>
                <Textarea
                  id="specialInstructions"
                  {...register("specialInstructions")}
                  placeholder="Any special requirements or notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Shipping */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Information
              </CardTitle>
              <CardDescription>
                Select delivery address and shipping options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shippingAddressId">Shipping Address</Label>
                <Select
                  value={watchedValues.shippingAddressId}
                  onValueChange={(value) =>
                    setValue("shippingAddressId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shipping address" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="address1">
                      123 Main St, Nairobi, Kenya
                    </SelectItem>
                    <SelectItem value="address2">
                      456 Business Ave, Mombasa, Kenya
                    </SelectItem>
                    <SelectItem value="address3">
                      789 Corporate Blvd, Kisumu, Kenya
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.shippingAddressId && (
                  <p className="text-sm text-red-500">
                    Shipping address is required
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingAddressId">
                  Billing Address (Optional)
                </Label>
                <Select
                  value={watchedValues.billingAddressId || ""}
                  onValueChange={(value) =>
                    setValue("billingAddressId", value || undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Same as shipping address" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Same as shipping address</SelectItem>
                    <SelectItem value="address1">
                      123 Main St, Nairobi, Kenya
                    </SelectItem>
                    <SelectItem value="address2">
                      456 Business Ave, Mombasa, Kenya
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
              <CardDescription>
                Select payment method and add any coupons
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={watchedValues.paymentMethod}
                  onValueChange={(value) => setValue("paymentMethod", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MPESA">M-PESA</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="couponCode">Coupon Code (Optional)</Label>
                <Input
                  id="couponCode"
                  {...register("couponCode")}
                  placeholder="Enter coupon code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Order Notes</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder="Internal notes about this order..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {step < 4 ? (
              <Button
                type="button"
                onClick={() => setStep(Math.min(4, step + 1))}
                disabled={!isStepValid(step)}
              >
                Next
                {!isStepValid(step) && (
                  <AlertTriangle className="h-4 w-4 ml-2" />
                )}
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={createOrder.isPending || !isStepValid(step)}
              >
                {createOrder.isPending ? (
                  <>Creating Order...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Order
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Form Errors */}
        {Object.keys(errors).length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please fix the errors above before proceeding.
            </AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
}
