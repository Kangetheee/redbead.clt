import React from "react";
import { UseFormReturn } from "react-hook-form";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
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

import { SizeVariant } from "@/lib/design-templates/types/design-template.types";

interface SettingsTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  designForm: UseFormReturn<any>;
  sizeVariants: SizeVariant[] | undefined;
  selectedVariant: SizeVariant | null;
  onVariantSelect: (variant: SizeVariant) => void;
}

export default function SettingsTab({
  designForm,
  sizeVariants,
  selectedVariant,
  onVariantSelect,
}: SettingsTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Design Settings</h3>

      <Form {...designForm}>
        <div className="space-y-4">
          <FormField
            control={designForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Design Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter design name" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={designForm.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Enter design description" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={designForm.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={designForm.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="rounded"
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  Make design public
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
      </Form>

      {/* Size Variants */}
      {sizeVariants && sizeVariants.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Size Options</h4>
          <div className="space-y-2">
            {sizeVariants
              .filter((variant) => variant.isActive)
              .map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => onVariantSelect(variant)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedVariant?.id === variant.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium text-gray-900">
                    {variant.displayName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {variant.dimensions && (
                      <span>
                        {variant.dimensions.width} × {variant.dimensions.height}{" "}
                        {variant.dimensions.unit}
                      </span>
                    )}
                    {variant.price > 0 && (
                      <span className="ml-2 font-medium">
                        ${variant.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
