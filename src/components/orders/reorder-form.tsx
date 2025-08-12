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
  Loader2,
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
import { toast } from "sonner";

import { OrderResponse } from "@/lib/orders/types/orders.types";
import { useCreateOrder } from "@/hooks/use-orders";
import {
  createOrderSchema,
  orderItemSchema,
  URGENCY_LEVELS,
} from "@/lib/orders/dto/orders.dto";

// Extended reorder schema based on createOrderSchema
const reorderSchema = createOrderSchema.extend({
  items: z
    .array(
      orderItemSchema.extend({
        included: z.boolean().default(true),
        originalIndex: z.number().optional(),
      })
    )
    .min(1, "At least one item must be selected"),
  reorderNotes: z.string().optional(),
});

type ReorderFormData = z.infer<typeof reorderSchema>;

interface CustomerReorderFormProps {
  originalOrder: OrderResponse;
  onSuccess?: (newOrderId: string) => void;
  onCancel?: () => void;
}

const URGENCY_LEVEL_CONFIG = {
  NORMAL: {
    label: "Standard (5-7 days)",
    description: "Free shipping",
    fee: 0,
  },
  EXPEDITED: { label: "Expedited (3-4 days)", description: "+$10", fee: 10 },
  RUSH: { label: "Rush (1-2 days)", description: "+$25", fee: 25 },
  EMERGENCY: { label: "Emergency (Same day)", description: "+$50", fee: 50 },
} as const;

export default function CustomerReorderForm({
  originalOrder,
  onSuccess,
  onCancel,
}: CustomerReorderFormProps) {
  const router = useRouter();
  const [showCustomizations, setShowCustomizations] = useState(false);

  // Use the hook correctly
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();

  // Transform original order items to match the new schema
  const transformOriginalItems = () => {
    // Handle both array and string cases for orderItems
    const items = Array.isArray(originalOrder.orderItems)
      ? originalOrder.orderItems
      : [];

    return items.map((item, index) => ({
      // FIXED: Use correct property names from OrderItem type
      productId: typeof item === "object" ? item.productId || "" : "",
      variantId: typeof item === "object" ? item.variantId || "" : "",
      quantity: typeof item === "object" ? item.quantity : 1,
      // FIXED: Handle customizations properly - convert array to object if needed
      customizations:
        typeof item === "object" && item.customizations
          ? Array.isArray(item.customizations)
            ? item.customizations.reduce(
                (acc, custom) => ({
                  ...acc,
                  [custom.name]: custom.value,
                }),
                {} as Record<string, string>
              )
            : item.customizations
          : {},
      designId: typeof item === "object" ? item.designId : undefined,
      included: true,
      originalIndex: index,
    }));
  };

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
      items: transformOriginalItems(),
      shippingAddressId: originalOrder.shippingAddress.id || "",
      billingAddressId: originalOrder.billingAddress?.id,
      urgencyLevel: originalOrder.urgencyLevel || "NORMAL",
      expectedProductionDays: originalOrder.expectedProductionDays,
      specialInstructions: originalOrder.specialInstructions || "",
      designApprovalRequired: originalOrder.designApprovalRequired,
      notes: "",
      reorderNotes: "",
      paymentMethod: "MPESA", // Default payment method
      customerPhone: "", // Should be populated from user context
      useCartItems: false,
    },
  });

  const { fields, update, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedValues = watch();
  const includedItems =
    watchedValues.items?.filter((item) => item.included) || [];
  const urgencyFee =
    URGENCY_LEVEL_CONFIG[watchedValues.urgencyLevel || "NORMAL"].fee;

  // Calculate totals (simplified - in real app, would call pricing API)
  const subtotal = includedItems.reduce((sum, item) => {
    // Mock pricing - in real app, would fetch from API based on productId + variantId
    const originalItems = Array.isArray(originalOrder.orderItems)
      ? originalOrder.orderItems
      : [];
    const originalItem = originalItems.find((oi) => {
      if (typeof oi === "object") {
        return (
          oi.productId === item.productId && oi.variantId === item.variantId
        );
      }
      return false;
    });
    const basePrice =
      (typeof originalItem === "object" && originalItem.sizeVariant?.price) ||
      10;
    return sum + basePrice * item.quantity;
  }, 0);

  const tax = subtotal * 0.16; // 16% VAT
  const shipping = urgencyFee > 0 ? urgencyFee : 5.0; // Free shipping for standard, otherwise urgency fee
  const total = subtotal + tax + shipping;

  // Corrected onSubmit to use the mutation properly
  const onSubmit = async (data: ReorderFormData) => {
    try {
      const itemsToOrder = data.items?.filter((item) => item.included) || [];

      if (itemsToOrder.length === 0) {
        throw new Error("Please select at least one item to reorder");
      }

      // Transform items to match CreateOrderDto structure
      const transformedItems = itemsToOrder.map(
        ({ included, originalIndex, ...item }) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          customizations: item.customizations,
          designId: item.designId,
        })
      );

      // Combine notes
      const combinedNotes = [
        data.notes,
        data.reorderNotes,
        `Reorder of #${originalOrder.orderNumber}`,
      ]
        .filter(Boolean)
        .join("\n");

      // Create the order using the proper DTO structure
      const orderData = {
        items: transformedItems,
        shippingAddressId: data.shippingAddressId,
        billingAddressId: data.billingAddressId,
        urgencyLevel: data.urgencyLevel,
        expectedProductionDays: data.expectedProductionDays,
        specialInstructions: data.specialInstructions,
        designApprovalRequired: data.designApprovalRequired,
        paymentMethod: data.paymentMethod,
        customerPhone: data.customerPhone,
        notes: combinedNotes,
        useCartItems: false,
        couponCode: data.couponCode,
        customerId: originalOrder.customerId, // Preserve customer
        templateId: originalOrder.templateId, // Preserve template if applicable
      };

      // Use the mutation correctly - it returns OrderResponse directly
      createOrder(orderData, {
        onSuccess: (orderResponse) => {
          // orderResponse is already the OrderResponse object
          toast.success("Reorder created successfully!");
          onSuccess?.(orderResponse.id);
          router.push(`/orders/${orderResponse.id}`);
        },
        onError: (error: any) => {
          console.error("Failed to create reorder:", error);
          toast.error(error?.message || "Failed to create reorder");
        },
      });
    } catch (error: any) {
      console.error("Failed to create reorder:", error);
      toast.error(error?.message || "Failed to create reorder");
    }
  };

  const handleToggleItem = (index: number) => {
    const currentValue = watchedValues.items?.[index]?.included || false;
    setValue(`items.${index}.included`, !currentValue);
  };

  const handleQuantityChange = (index: number, change: number) => {
    const currentQuantity = watchedValues.items?.[index]?.quantity || 1;
    const newQuantity = Math.max(1, currentQuantity + change);
    setValue(`items.${index}.quantity`, newQuantity);
  };

  const handleDuplicateOrder = () => {
    // Copy all original values exactly
    setValue("urgencyLevel", originalOrder.urgencyLevel || "NORMAL");
    setValue("specialInstructions", originalOrder.specialInstructions || "");
    setValue("designApprovalRequired", originalOrder.designApprovalRequired);
    setValue("expectedProductionDays", originalOrder.expectedProductionDays);
    setValue(
      "reorderNotes",
      `Exact duplicate of order placed on ${new Date(originalOrder.createdAt).toLocaleDateString()}`
    );

    // Reset all items to original quantities
    watchedValues.items?.forEach((_, index) => {
      const originalItems = Array.isArray(originalOrder.orderItems)
        ? originalOrder.orderItems
        : [];
      const originalItem =
        originalItems[watchedValues.items?.[index]?.originalIndex || 0];
      if (originalItem && typeof originalItem === "object") {
        setValue(`items.${index}.quantity`, originalItem.quantity);
        setValue(`items.${index}.included`, true);
      }
    });
  };

  const renderItemCustomizations = (item: any, originalIndex?: number) => {
    const originalItems = Array.isArray(originalOrder.orderItems)
      ? originalOrder.orderItems
      : [];
    const originalItem = originalItems[originalIndex || 0];

    if (
      !originalItem ||
      typeof originalItem !== "object" ||
      !originalItem.customizations?.length
    ) {
      return null;
    }

    return (
      <div className="mt-2">
        <Label className="text-xs font-medium text-muted-foreground">
          ORIGINAL CUSTOMIZATIONS
        </Label>
        <div className="mt-1 p-2 bg-muted rounded text-sm space-y-1">
          {/* FIXED: Handle both array and object customizations */}
          {Array.isArray(originalItem.customizations)
            ? originalItem.customizations.map((customization, idx) => (
                <div key={idx} className="text-xs">
                  <span className="font-medium">{customization.name}:</span>{" "}
                  {customization.value}
                </div>
              ))
            : Object.entries(
                originalItem.customizations as Record<string, string>
              ).map(([key, value], idx) => (
                <div key={idx} className="text-xs">
                  <span className="font-medium">{key}:</span> {String(value)}
                </div>
              ))}
        </div>
      </div>
    );
  };

  // Helper function to safely get original item
  const getOriginalItem = (index?: number) => {
    const originalItems = Array.isArray(originalOrder.orderItems)
      ? originalOrder.orderItems
      : [];
    const item = originalItems[index || 0];
    return typeof item === "object" ? item : null;
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
            {originalOrder.status === "DELIVERED" && (
              <Badge variant="outline" className="ml-2">
                <CheckCircle className="h-3 w-3 mr-1" />
                Delivered
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">
                Status: <Badge variant="outline">{originalOrder.status}</Badge>
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
              const item = watchedValues.items?.[index];
              const isIncluded = item?.included || false;
              const originalItem = getOriginalItem(item?.originalIndex);

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
                            {originalItem?.template?.name ||
                              `Product ${item?.productId}`}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Size:{" "}
                            {originalItem?.sizeVariant?.displayName ||
                              originalItem?.variantId}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Original quantity: {originalItem?.quantity || 1}
                          </p>
                          {originalItem?.sizeVariant?.price && (
                            <p className="text-sm font-medium">
                              ${originalItem.sizeVariant.price.toFixed(2)} each
                            </p>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(index, -1)}
                            disabled={!isIncluded || (item?.quantity || 1) <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <Input
                            type="number"
                            min="1"
                            value={item?.quantity || 1}
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
                      {renderItemCustomizations(item, item?.originalIndex)}
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
                    setValue(
                      "urgencyLevel",
                      value as (typeof URGENCY_LEVELS)[number]
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCY_LEVELS.map((level) => {
                      const config = URGENCY_LEVEL_CONFIG[level];
                      return (
                        <SelectItem key={level} value={level}>
                          <div>
                            <p>{config.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {config.description}
                            </p>
                          </div>
                        </SelectItem>
                      );
                    })}
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
                    <SelectItem value={originalOrder.shippingAddress.id || ""}>
                      Same as original order
                    </SelectItem>
                    {/* Add other addresses from user context */}
                  </SelectContent>
                </Select>
                {errors.shippingAddressId && (
                  <p className="text-sm text-red-600">
                    {errors.shippingAddressId.message}
                  </p>
                )}
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

            <div className="space-y-2">
              <Label htmlFor="reorderNotes">Reorder Notes</Label>
              <Textarea
                {...register("reorderNotes")}
                placeholder="Additional notes specific to this reorder..."
                rows={2}
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
              {includedItems.map((item, index) => {
                const originalItem = getOriginalItem(item.originalIndex);
                const price = originalItem?.sizeVariant?.price || 10;
                return (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {originalItem?.template?.name ||
                        `Product ${item.productId}`}{" "}
                      (x{item.quantity})
                    </span>
                    <span>${(price * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
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
                    {
                      URGENCY_LEVEL_CONFIG[
                        watchedValues.urgencyLevel || "NORMAL"
                      ].label
                    }{" "}
                    selected.
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
            disabled={isCreatingOrder}
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!isDirty || isCreatingOrder}
              onClick={() => {
                // Save as draft functionality - could implement with a separate mutation
                console.log("Save as draft", watchedValues);
                toast.info("Draft saved locally");
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>

            <Button
              type="submit"
              disabled={includedItems.length === 0 || isCreatingOrder}
            >
              {isCreatingOrder ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
              <div className="space-y-1">
                <p>Please fix the following errors:</p>
                {Object.entries(errors).map(([key, error]) => (
                  <p key={key} className="text-xs">
                    • {error.message}
                  </p>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
}
