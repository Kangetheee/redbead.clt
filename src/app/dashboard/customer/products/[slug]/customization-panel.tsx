/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useCustomizationOptionsByCategory } from "@/hooks/use-customization";
import { CustomizationChoiceDto } from "@/lib/cart/dto/cart.dto";
import { CustomizationOptionDetail } from "@/lib/customization/types/options.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface CustomizationPanelProps {
  productId: string;
  categoryId: string;
  onCustomizationChange: (customizations: CustomizationChoiceDto[]) => void;
  initialCustomizations?: CustomizationChoiceDto[];
}

export default function CustomizationPanel({
  productId,
  categoryId,
  onCustomizationChange,
  initialCustomizations = [],
}: CustomizationPanelProps) {
  const [customizations, setCustomizations] = useState<
    CustomizationChoiceDto[]
  >(initialCustomizations);

  const { data: options, isLoading } =
    useCustomizationOptionsByCategory(categoryId);

  useEffect(() => {
    onCustomizationChange(customizations);
  }, [customizations, onCustomizationChange]);

  const handleCustomizationChange = (
    optionId: string,
    valueId: string,
    customValue?: string
  ) => {
    setCustomizations((prev) => {
      const existing = prev.find((c) => c.optionId === optionId);
      const newCustomization: CustomizationChoiceDto = {
        optionId,
        valueId,
        customValue,
      };

      if (existing) {
        return prev.map((c) =>
          c.optionId === optionId ? newCustomization : c
        );
      } else {
        return [...prev, newCustomization];
      }
    });
  };

  const handleTextInputChange = (optionId: string, value: string) => {
    setCustomizations((prev) => {
      const existing = prev.find((c) => c.optionId === optionId);
      const newCustomization: CustomizationChoiceDto = {
        optionId,
        valueId: "custom",
        customValue: value,
      };

      if (existing) {
        return prev.map((c) =>
          c.optionId === optionId ? newCustomization : c
        );
      } else {
        return [...prev, newCustomization];
      }
    });
  };

  const getCurrentCustomization = (optionId: string) => {
    return customizations.find((c) => c.optionId === optionId);
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "";
    return price > 0
      ? `+$${price.toFixed(2)}`
      : `-$${Math.abs(price).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customization Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded mb-2 w-1/3"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!options?.success || !options.data?.length) {
    return null;
  }

  // Type assertion to fix the type mismatch
  const optionsWithValues = options.data as CustomizationOptionDetail[];

  // Updated to use CustomizationOptionDetail type
  const renderOption = (option: CustomizationOptionDetail) => {
    const currentCustomization = getCurrentCustomization(option.id);

    switch (option.type) {
      case "DROPDOWN":
        return (
          <Select
            value={currentCustomization?.valueId || ""}
            onValueChange={(valueId) =>
              handleCustomizationChange(option.id, valueId)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${option.displayName}`} />
            </SelectTrigger>
            <SelectContent>
              {option.values?.map((value) => (
                <SelectItem key={value.id} value={value.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{value.displayName}</span>
                    {value.priceAdjustment !== 0 && (
                      <span className="text-sm text-gray-500">
                        {formatPrice(value.priceAdjustment)}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "RADIO":
        return (
          <RadioGroup
            value={currentCustomization?.valueId || ""}
            onValueChange={(valueId) =>
              handleCustomizationChange(option.id, valueId)
            }
          >
            {option.values?.map((value) => (
              <div key={value.id} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={value.id}
                  id={`${option.id}-${value.id}`}
                />
                <Label
                  htmlFor={`${option.id}-${value.id}`}
                  className="flex items-center gap-2"
                >
                  {value.hexColor && (
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: value.hexColor }}
                    />
                  )}
                  <span>{value.displayName}</span>
                  {value.priceAdjustment !== 0 && (
                    <Badge variant="outline" className="text-xs">
                      {formatPrice(value.priceAdjustment)}
                    </Badge>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "COLOR_PICKER":
        return (
          <div className="grid grid-cols-6 gap-2">
            {option.values?.map((value) => (
              <button
                key={value.id}
                onClick={() => handleCustomizationChange(option.id, value.id)}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                  currentCustomization?.valueId === value.id
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                style={{ backgroundColor: value.hexColor || "#ccc" }}
                title={value.displayName}
              />
            ))}
          </div>
        );

      case "TEXT_INPUT":
        return (
          <Input
            placeholder={`Enter ${option.displayName}`}
            value={currentCustomization?.customValue || ""}
            onChange={(e) => handleTextInputChange(option.id, e.target.value)}
          />
        );

      case "NUMBER_INPUT":
        return (
          <Input
            type="number"
            placeholder={`Enter ${option.displayName}`}
            value={currentCustomization?.customValue || ""}
            onChange={(e) => handleTextInputChange(option.id, e.target.value)}
          />
        );

      case "CHECKBOX":
        return (
          <div className="space-y-2">
            {option.values?.map((value) => (
              <div key={value.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`${option.id}-${value.id}`}
                  checked={currentCustomization?.valueId === value.id}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleCustomizationChange(option.id, value.id);
                    } else {
                      setCustomizations((prev) =>
                        prev.filter((c) => c.optionId !== option.id)
                      );
                    }
                  }}
                />
                <Label
                  htmlFor={`${option.id}-${value.id}`}
                  className="flex items-center gap-2"
                >
                  <span>{value.displayName}</span>
                  {value.priceAdjustment !== 0 && (
                    <Badge variant="outline" className="text-xs">
                      {formatPrice(value.priceAdjustment)}
                    </Badge>
                  )}
                </Label>
              </div>
            ))}
          </div>
        );

      default:
        return <div>Unsupported option type: {option.type}</div>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customization Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {optionsWithValues.map((option) => (
          <div key={option.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">
                {option.displayName}
                {option.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
            </div>

            {option.description && (
              <p className="text-sm text-gray-600">{option.description}</p>
            )}

            {renderOption(option)}
          </div>
        ))}

        {customizations.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">
              Selected Customizations:
            </h4>
            <div className="space-y-1">
              {customizations.map((customization) => {
                const option = optionsWithValues.find(
                  (o) => o.id === customization.optionId
                );
                const value = option?.values?.find(
                  (v) => v.id === customization.valueId
                );

                return (
                  <div
                    key={customization.optionId}
                    className="text-sm text-gray-600"
                  >
                    <span className="font-medium">{option?.displayName}:</span>
                    <span className="ml-1">
                      {customization.customValue || value?.displayName}
                    </span>
                    {value?.priceAdjustment !== 0 && (
                      <span className="ml-2 text-blue-600">
                        {formatPrice(value?.priceAdjustment || 0)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
