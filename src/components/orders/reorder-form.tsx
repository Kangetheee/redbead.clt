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
  AlertTriangle,
  DollarSign,
  CheckCircle,
  Copy,
  Trash2,
  Loader2,
  MapPin,
  Settings,
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import {
  OrderResponse,
  ExtendedOrderItem,
} from "@/lib/orders/types/orders.types";
import { useReorder } from "@/hooks/use-orders";
import { type ReorderDto } from "@/lib/orders/dto/orders.dto";

interface ReorderFormProps {
  originalOrder: OrderResponse;
  onSuccess?: (newOrderId: string) => void;
  onCancel?: () => void;
}

const formSchema = z.object({
  originalOrderId: z.string(),
  modifyItems: z.boolean(),
  newShippingAddress: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      quantity: z.number().min(1),
      customizations: z.record(z.any()),
      included: z.boolean(),
      originalIndex: z.number(),
      originalItem: z.any().optional(),
    })
  ),
});

type FormData = z.infer<typeof formSchema>;

export default function ReorderForm({
  originalOrder,
  onSuccess,
  onCancel,
}: ReorderFormProps) {
  const router = useRouter();
  const [showAddressForm, setShowAddressForm] = useState(false);

  const { mutate: reorder, isPending: isProcessing } = useReorder();

  const transformOriginalItems = (): ExtendedOrderItem[] => {
    return originalOrder.orderItems.map((item, index) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      customizations: Array.isArray(item.customizations)
        ? item.customizations.reduce(
            (acc, custom) => ({
              ...acc,
              [custom.name || "customization"]: custom.value,
            }),
            {}
          )
        : item.customizations || {},
      included: true,
      originalIndex: index,
      originalItem: item,
    }));
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      originalOrderId: originalOrder.id,
      modifyItems: true,
      items: transformOriginalItems(),
      newShippingAddress: undefined,
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { fields, update, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedValues = watch();
  const includedItems =
    watchedValues.items?.filter((item) => item.included) || [];

  const estimatedTotal = includedItems.reduce((sum, item) => {
    const basePrice = item.originalItem?.unitPrice || 0;
    return sum + basePrice * item.quantity;
  }, 0);

  const onSubmit = async (data: FormData) => {
    try {
      const itemsToModify = data.items?.filter((item) => item.included) || [];

      if (itemsToModify.length === 0 && data.modifyItems) {
        throw new Error("Please select at least one item to reorder");
      }

      const reorderData: ReorderDto = {
        originalOrderId: originalOrder.id,
        modifyItems: data.modifyItems,
        newShippingAddress: data.newShippingAddress,
        modifiedItems: data.modifyItems
          ? itemsToModify.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              customizations: item.customizations,
            }))
          : undefined,
      };

      reorder(reorderData, {
        onSuccess: (response) => {
          toast.success(response.message);
          onSuccess?.(response.newOrderId);
          router.push(`/orders/${response.newOrderId}`);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
          console.error("Failed to create reorder:", error);
          toast.error(error?.message || "Failed to create reorder");
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast.error(error?.message || "Failed to process reorder");
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

  const handleExactDuplicate = () => {
    watchedValues.items?.forEach((_, index) => {
      const originalItem = originalOrder.orderItems[index];
      if (originalItem) {
        setValue(`items.${index}.quantity`, originalItem.quantity);
        setValue(`items.${index}.included`, true);
      }
    });
    setValue("modifyItems", false);
    setValue("newShippingAddress", undefined);
    setShowAddressForm(false);
  };

  const handleSelectAll = () => {
    watchedValues.items?.forEach((_, index) => {
      setValue(`items.${index}.included`, true);
    });
  };

  const handleDeselectAll = () => {
    watchedValues.items?.forEach((_, index) => {
      setValue(`items.${index}.included`, false);
    });
  };

  const renderItemCustomizations = (item: ExtendedOrderItem) => {
    const customizations = item.customizations;

    if (!customizations || Object.keys(customizations).length === 0) {
      return null;
    }

    return (
      <div className="mt-2">
        <Label className="text-xs font-medium text-muted-foreground">
          CUSTOMIZATIONS
        </Label>
        <div className="mt-1 p-2 bg-muted rounded text-sm space-y-1">
          {Object.entries(customizations).map(([key, value], idx) => (
            <div key={idx} className="text-xs">
              <span className="font-medium">{key}:</span> {String(value)}
            </div>
          ))}
        </div>
      </div>
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
            <Badge variant="outline" className="ml-2">
              {originalOrder.status}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Original Total:{" "}
              <span className="font-medium">
                ${originalOrder.totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExactDuplicate}
              >
                <Copy className="h-4 w-4 mr-2" />
                Exact Duplicate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Reorder Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Reorder Options
            </CardTitle>
            <CardDescription>
              Choose how you want to process this reorder
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modify Items</Label>
                <p className="text-sm text-muted-foreground">
                  Allow changes to quantities and items selection
                </p>
              </div>
              <Switch
                checked={watchedValues.modifyItems}
                onCheckedChange={(checked) => setValue("modifyItems", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Change Shipping Address</Label>
                <p className="text-sm text-muted-foreground">
                  Use a different shipping address
                </p>
              </div>
              <Switch
                checked={showAddressForm}
                onCheckedChange={setShowAddressForm}
              />
            </div>

            {showAddressForm && (
              <div className="space-y-2 pt-4">
                <Label htmlFor="newShippingAddress">New Shipping Address</Label>
                <Textarea
                  {...register("newShippingAddress")}
                  placeholder="Enter the complete new shipping address..."
                  rows={3}
                  className="resize-none"
                />
                {errors.newShippingAddress && (
                  <p className="text-sm text-red-600">
                    {errors.newShippingAddress.message}
                  </p>
                )}
              </div>
            )}

            {!watchedValues.modifyItems && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Exact duplicate mode:</strong> All original items will
                  be reordered with the same quantities and specifications.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Items Selection - Only show if modifications are allowed */}
        {watchedValues.modifyItems && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Select Items to Reorder</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {includedItems.length} of {fields.length} selected
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDeselectAll}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>
              </CardTitle>
              <CardDescription>
                Choose which items you want to reorder and adjust quantities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => {
                const item = watchedValues.items?.[index];
                const isIncluded = item?.included || false;
                const originalItem = item?.originalItem;

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

                      {/* Product Image */}
                      {originalItem?.product?.previewImage && (
                        <img
                          src={originalItem.product.previewImage}
                          alt={originalItem.product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}

                      {/* Item Details */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">
                              {originalItem?.product?.name ||
                                `Product ${item?.productId}`}
                            </h4>
                            {originalItem?.variant && (
                              <p className="text-sm text-muted-foreground">
                                Variant: {originalItem.variant.displayName}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              Original quantity: {originalItem?.quantity || 1}
                            </p>
                            <p className="text-sm font-medium">
                              ${(originalItem?.unitPrice || 0).toFixed(2)} each
                            </p>
                            {originalItem?.status && (
                              <Badge variant="outline" className="mt-1">
                                {originalItem.status}
                              </Badge>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(index, -1)}
                              disabled={
                                !isIncluded || (item?.quantity || 1) <= 1
                              }
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
                        {renderItemCustomizations(item)}
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

              {watchedValues.modifyItems && includedItems.length === 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please select at least one item to reorder.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Current Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>
                {showAddressForm ? "Original Address" : "Shipping To"}
              </Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">
                  {originalOrder.shippingAddress.recipientName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {originalOrder.shippingAddress.street}
                </p>
                <p className="text-sm text-muted-foreground">
                  {originalOrder.shippingAddress.city},{" "}
                  {originalOrder.shippingAddress.state}{" "}
                  {originalOrder.shippingAddress.postalCode}
                </p>
                <p className="text-sm text-muted-foreground">
                  {originalOrder.shippingAddress.country}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        {watchedValues.modifyItems && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Estimated Summary
              </CardTitle>
              <CardDescription>
                Final pricing will be calculated during checkout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {includedItems.map((item, index) => {
                  const unitPrice = item.originalItem?.unitPrice || 0;
                  return (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.originalItem?.product?.name ||
                          `Product ${item.productId}`}{" "}
                        (x{item.quantity})
                      </span>
                      <span>${(unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <Separator />

              <div className="flex justify-between font-bold">
                <span>Estimated Total</span>
                <span>${estimatedTotal.toFixed(2)}</span>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This is an estimate based on original prices. Final pricing,
                  taxes, and shipping will be calculated at checkout.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel || (() => router.back())}
            disabled={isProcessing}
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={
                (watchedValues.modifyItems && includedItems.length === 0) ||
                isProcessing
              }
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Reorder...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Place Reorder
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
