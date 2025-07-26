/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  createCustomizationValueSchema,
  updateCustomizationValueSchema,
  CreateCustomizationValueDto,
  UpdateCustomizationValueDto,
  CustomizationOptionType,
} from "@/lib/customization/dto/options.dto";
import {
  useCustomizationValue,
  useCreateCustomizationValue,
  useUpdateCustomizationValue,
} from "@/hooks/use-customization";

interface ValueFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  optionId: string;
  optionType: CustomizationOptionType;
  valueId?: string | null;
}

export function ValueFormDialog({
  open,
  onOpenChange,
  optionId,
  optionType,
  valueId,
}: ValueFormDialogProps) {
  const isEditing = !!valueId;
  const createMutation = useCreateCustomizationValue();
  const updateMutation = useUpdateCustomizationValue();

  const { data: valueResponse } = useCustomizationValue(valueId || "");
  const value = valueResponse?.success ? valueResponse.data : null;

  const schema = isEditing
    ? updateCustomizationValueSchema
    : createCustomizationValueSchema;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const form = useForm<
    CreateCustomizationValueDto | UpdateCustomizationValueDto
  >({
    resolver: zodResolver(schema),
    defaultValues: {
      value: "",
      displayName: "",
      description: "",
      imageUrl: "",
      hexColor: "",
      priceAdjustment: 0,
      sortOrder: 0,
      isActive: true,
      ...(isEditing ? {} : { optionId }),
    },
  });

  // Reset form when dialog opens/closes or when editing different value
  useEffect(() => {
    if (open) {
      if (isEditing && value) {
        form.reset({
          value: value.value,
          displayName: value.displayName,
          description: value.description || "",
          imageUrl: value.imageUrl || "",
          hexColor: value.hexColor || "",
          priceAdjustment: value.priceAdjustment,
          sortOrder: value.sortOrder,
          isActive: value.isActive,
          ...(isEditing ? {} : { optionId: value.optionId }),
        });
      } else if (!isEditing) {
        form.reset({
          value: "",
          displayName: "",
          description: "",
          imageUrl: "",
          hexColor: "",
          priceAdjustment: 0,
          sortOrder: 0,
          isActive: true,
          optionId,
        });
      }
    }
  }, [open, isEditing, value, optionId, form]);

  const onSubmit = async (
    values: CreateCustomizationValueDto | UpdateCustomizationValueDto
  ) => {
    try {
      if (isEditing && valueId) {
        const result = await updateMutation.mutateAsync({
          valueId,
          data: values as UpdateCustomizationValueDto,
        });
        if (result.success) {
          toast.success("Value updated successfully");
          onOpenChange(false);
        } else {
          toast.error(result.error || "Failed to update value");
        }
      } else {
        const result = await createMutation.mutateAsync(
          values as CreateCustomizationValueDto
        );
        if (result.success) {
          toast.success("Value created successfully");
          onOpenChange(false);
        } else {
          toast.error(result.error || "Failed to create value");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  // Auto-generate display name from value
  const handleValueChange = (newValue: string) => {
    form.setValue("value", newValue);
    // Auto-generate display name if it's empty
    if (!form.getValues("displayName")) {
      const displayName = newValue
        .split(/[-_]/)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
      form.setValue("displayName", displayName);
    }
  };

  const showColorPicker = optionType === "COLOR_PICKER";
  const showImageUpload = optionType === "DROPDOWN" || optionType === "RADIO";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Value" : "Create Value"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the customization value details"
              : "Add a new value for this customization option"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="red"
                        {...field}
                        onChange={(e) => handleValueChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Internal value (lowercase, no spaces)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Red" {...field} />
                    </FormControl>
                    <FormDescription>Name shown to customers</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showColorPicker && (
              <FormField
                control={form.control}
                name="hexColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hex Color</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="#FF0000"
                          {...field}
                          className="font-mono"
                        />
                      </FormControl>
                      <div
                        className="w-10 h-10 rounded border border-input"
                        style={{
                          backgroundColor: field.value || "#ffffff",
                        }}
                      />
                    </div>
                    <FormDescription>
                      Hex color code (e.g., #FF0000 for red)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {showImageUpload && (
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional image to display with this value
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priceAdjustment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Adjustment</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Price change for this option ($)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Display order (lower first)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Whether this value is available to customers
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

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isEditing ? "Update Value" : "Create Value"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
