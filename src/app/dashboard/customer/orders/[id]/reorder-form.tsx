/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Package,
  Plus,
  Minus,
  ShoppingCart,
  Edit,
  Save,
  AlertTriangle,
  Clock,
  DollarSign,
  CheckCircle,
  Copy,
  Trash2,
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import { OrderResponse } from "@/lib/orders/types/orders.types";
import { useCreateOrder } from "@/hooks/use-orders";

// Reorder form schema
const reorderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1, "Product is required"),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      customizations: z.record(z.any()).optional(),
      included: z.boolean().default(true),
    })
  ),
  urgencyLevel: z
    .enum(["NORMAL", "EXPEDITED", "RUSH", "EMERGENCY"])
    .default("NORMAL"),
  shippingAddressId: z.string().min(1, "Shipping address is required"),
  billingAddressId: z.string().optional(),
  specialInstructions: z.string().optional(),
  designApprovalRequired: z.boolean().default(true),
  expectedProductionDays: z.number().optional(),
  notes: z.string().optional(),
});

type ReorderFormData = z.infer<typeof reorderSchema>;

interface CustomerReorderFormProps {
  originalOrder: OrderResponse;
  onSuccess?: (newOrderId: string) => void;
  onCancel?: () => void;
}

export default function CustomerReorderForm({
  originalOrder,
  onSuccess,
  onCancel,
}: CustomerReorderFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomizations, setShowCustomizations] = useState(false);

  const createOrder = useCreateOrder();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ReorderFormData>({
    resolver: zodResolver(reorderSchema),
    defaultValues: {
      items: originalOrder.orderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        customizations: item.customizations || {},
        included: true,
      })),
      urgencyLevel: (originalOrder.urgencyLevel as any) || "NORMAL",
      shippingAddressId: originalOrder.shippingAddress.id,
      billingAddressId: originalOrder.billingAddress?.id,
      specialInstructions: originalOrder.specialInstructions || "",
      designApprovalRequired: originalOrder.designApprovalRequired,
      expectedProductionDays: originalOrder.expectedProductionDays,
      notes: "",
    },
  });

  const { fields, update, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedValues = watch();
  const includedItems = watchedValues.items.filter((item) => item.included);

  // Calculate totals (simplified - in real app, would call pricing API)
  const subtotal = includedItems.reduce((sum, item) => {
    // Mock pricing - in real app, would fetch from API
    const basePrice = 10; // Base price per item
    return sum + basePrice * item.quantity;
  }, 0);

  const tax = subtotal * 0.16; // 16% VAT
  const shipping = 5.0; // Flat shipping rate
  const total = subtotal + tax + shipping;

  const onSubmit = async (data: ReorderFormData) => {
    setIsSubmitting(true);

    try {
      const itemsToOrder = data.items.filter((item) => item.included);

      if (itemsToOrder.length === 0) {
        throw new Error("Please select at least one item to reorder");
      }

      // Create the new order
      const orderData = {
        items: itemsToOrder.map(
          ({ included, customizations = {}, ...item }) => ({
            ...item,
            customizations,
          })
        ),
        urgencyLevel: data.urgencyLevel,
        shippingAddressId: data.shippingAddressId,
        billingAddressId: data.billingAddressId,
        specialInstructions: data.specialInstructions,
        designApprovalRequired: data.designApprovalRequired,
        expectedProductionDays: data.expectedProductionDays,
        notes: data.notes,
        customerPhone: "", // Add if available
        paymentMethod: "MPESA", // Default payment method
        couponCode: undefined,
        useCartItems: false,
      };

      const result = await createOrder.mutateAsync(orderData);

      if (result.success && result.data) {
        onSuccess?.(result.data.id);
        router.push(`/dashboard/customer/orders/${result.data.id}`);
      }
    } catch (error) {
      console.error("Failed to create reorder:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleItem = (index: number) => {
    const currentValue = watchedValues.items[index].included;
    setValue(`items.${index}.included`, !currentValue);
  };

  const handleQuantityChange = (index: number, change: number) => {
    const currentQuantity = watchedValues.items[index].quantity;
    const newQuantity = Math.max(1, currentQuantity + change);
    setValue(`items.${index}.quantity`, newQuantity);
  };

  const handleDuplicateOrder = () => {
    // Copy all original values
    setValue("urgencyLevel", "NORMAL");
    setValue("specialInstructions", `Reorder of #${originalOrder.orderNumber}`);
    setValue(
      "notes",
      `Duplicate of original order placed on ${new Date(originalOrder.createdAt).toLocaleDateString()}`
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Reorder Items
          </CardTitle>
          <CardDescription>
            Reorder items from Order #{originalOrder.orderNumber} placed on{" "}
            {new Date(originalOrder.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                Original order delivered successfully
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleDuplicateOrder}>
              <Copy className="h-4 w-4 mr-2" />
              Exact Duplicate
            </Button>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Items Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Select Items to Reorder</span>
              <Badge variant="outline">
                {includedItems.length} of {fields.length} selected
              </Badge>
            </CardTitle>
            <CardDescription>
              Choose which items you want to reorder and adjust quantities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => {
              const item = watchedValues.items[index];
              const isIncluded = item.included;

              return (
                <div
                  key={field.id}
                  className={`p-4 border rounded-lg transition-opacity ${
                    isIncluded ? "" : "opacity-50 bg-muted"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={isIncluded}
                        onChange={() => handleToggleItem(index)}
                        className="rounded"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">
                            Product {item.productId}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Original quantity:{" "}
                            {originalOrder.orderItems[index]?.quantity}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(index, -1)}
                            disabled={!isIncluded || item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              setValue(
                                `items.${index}.quantity`,
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-20 text-center"
                            disabled={!isIncluded}
                          />

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(index, 1)}
                            disabled={!isIncluded}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Customizations */}
                      {item.customizations &&
                        Object.keys(item.customizations).length > 0 && (
                          <div
                            className={`transition-opacity ${isIncluded ? "" : "opacity-50"}`}
                          >
                            <Label className="text-xs font-medium text-muted-foreground">
                              ORIGINAL CUSTOMIZATIONS
                            </Label>
                            <div className="mt-1 p-2 bg-muted rounded text-sm">
                              <pre className="text-xs whitespace-pre-wrap">
                                {JSON.stringify(item.customizations, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Remove Item */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {includedItems.length === 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please select at least one item to reorder.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Order Options */}
        <Card>
          <CardHeader>
            <CardTitle>Order Options</CardTitle>
            <CardDescription>
              Customize your reorder preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="urgencyLevel">Delivery Speed</Label>
                <Select
                  value={watchedValues.urgencyLevel}
                  onValueChange={(value) =>
                    setValue("urgencyLevel", value as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL">
                      <div>
                        <p>Standard (5-7 days)</p>
                        <p className="text-xs text-muted-foreground">
                          Free shipping
                        </p>
                      </div>
                    </SelectItem>
                    <SelectItem value="EXPEDITED">
                      <div>
                        <p>Expedited (3-4 days)</p>
                        <p className="text-xs text-muted-foreground">+$10</p>
                      </div>
                    </SelectItem>
                    <SelectItem value="RUSH">
                      <div>
                        <p>Rush (1-2 days)</p>
                        <p className="text-xs text-muted-foreground">+$25</p>
                      </div>
                    </SelectItem>
                    <SelectItem value="EMERGENCY">
                      <div>
                        <p>Emergency (Same day)</p>
                        <p className="text-xs text-muted-foreground">+$50</p>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingAddressId">Shipping Address</Label>
                <Select
                  value={watchedValues.shippingAddressId}
                  onValueChange={(value) =>
                    setValue("shippingAddressId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={originalOrder.shippingAddress.id}>
                      Same as original order
                    </SelectItem>
                    <SelectItem value="address2">Home Address</SelectItem>
                    <SelectItem value="address3">Office Address</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Design Approval Required</Label>
                <p className="text-sm text-muted-foreground">
                  Require approval before production starts
                </p>
              </div>
              <Switch
                checked={watchedValues.designApprovalRequired}
                onCheckedChange={(checked) =>
                  setValue("designApprovalRequired", checked)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialInstructions">Special Instructions</Label>
              <Textarea
                {...register("specialInstructions")}
                placeholder="Any special requirements or changes from the original order..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {includedItems.map((item, originalIndex) => (
                <div
                  key={originalIndex}
                  className="flex justify-between text-sm"
                >
                  <span>
                    Product {item.productId} (x{item.quantity})
                  </span>
                  <span>${(10 * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (16%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {watchedValues.urgencyLevel !== "NORMAL" && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <strong>
                    {watchedValues.urgencyLevel} delivery selected.
                  </strong>{" "}
                  Additional fees apply for faster processing.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel || (() => router.back())}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!isDirty || isSubmitting}
              onClick={() => {
                // Save as draft functionality
                console.log("Save as draft");
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>

            <Button
              type="submit"
              disabled={includedItems.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Creating Order...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Place Reorder (${total.toFixed(2)})
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Form Errors */}
        {Object.keys(errors).length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please fix the errors above before placing your order.
            </AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
}
