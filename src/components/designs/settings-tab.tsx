/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { CanvasElement } from "@/lib/design-studio/types/design-studio.types";

interface SettingsTabProps {
  designForm: UseFormReturn<any>;
  sizeVariants: SizeVariant[] | undefined;
  selectedVariant: SizeVariant | null;
  canvasElements: CanvasElement[];
  templatePresets: any;
  onVariantSelect: (variant: SizeVariant) => void;
  onCanvasElementsChange: (elements: CanvasElement[]) => void;
  isLoadingPresets: boolean;
}

export default function SettingsTab({
  designForm,
  sizeVariants,
  selectedVariant,
  canvasElements,
  templatePresets,
  onVariantSelect,
  onCanvasElementsChange,
  isLoadingPresets,
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

      {/* Canvas Settings */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-900">Canvas Settings</h4>
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={designForm.control}
            name="customizations.width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Width (px)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="800"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={designForm.control}
            name="customizations.height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height (px)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="600"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={designForm.control}
          name="customizations.backgroundColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Color</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Input
                    type="color"
                    {...field}
                    className="w-12 h-10 p-1 rounded border"
                  />
                  <Input {...field} placeholder="#ffffff" className="flex-1" />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </div>

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

      {/* Template Presets */}
      {templatePresets && !isLoadingPresets && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Template Presets</h4>
          <div className="text-sm text-gray-600">
            {templatePresets.colors && (
              <div className="mb-2">
                <span className="font-medium">Available Colors: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {templatePresets.colors.map(
                    (color: string, index: number) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    )
                  )}
                </div>
              </div>
            )}
            {templatePresets.fonts && (
              <div className="mb-2">
                <span className="font-medium">Recommended Fonts: </span>
                <span>{templatePresets.fonts.join(", ")}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">Design Statistics</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Total Elements:</span>
            <span className="ml-1 font-medium">{canvasElements.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Text Elements:</span>
            <span className="ml-1 font-medium">
              {canvasElements.filter((el) => el.type === "text").length}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Images:</span>
            <span className="ml-1 font-medium">
              {canvasElements.filter((el) => el.type === "image").length}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Shapes:</span>
            <span className="ml-1 font-medium">
              {canvasElements.filter((el) => el.type === "shape").length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
