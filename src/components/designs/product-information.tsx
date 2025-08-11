/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import {
  DesignTemplate,
  SizeVariant,
} from "@/lib/design-templates/types/design-template.types";

interface ProductInformationProps {
  selectedTemplate: DesignTemplate;
  selectedVariant: SizeVariant;
}

export default function ProductInformation({
  selectedTemplate,
  selectedVariant,
}: ProductInformationProps) {
  // Safely access template properties with fallbacks
  const templateWithDefaults = selectedTemplate as any;

  const infoItems = [
    { label: "Template", value: selectedTemplate.name },
    { label: "Category", value: selectedTemplate.category.name },
    { label: "Size", value: selectedVariant.displayName },
    {
      label: "Dimensions",
      value: selectedVariant.dimensions
        ? `${selectedVariant.dimensions.width} × ${selectedVariant.dimensions.height} ${selectedVariant.dimensions.unit}`
        : "Custom",
    },
    {
      label: "Base Price",
      value: `$${selectedTemplate.basePrice.toFixed(2)}`,
    },
    {
      label: "Variant Price",
      value: `$${selectedVariant.price.toFixed(2)}`,
    },
    {
      label: "Total Price",
      value: `$${(selectedTemplate.basePrice + selectedVariant.price).toFixed(2)}`,
    },
    {
      label: "Material",
      value:
        templateWithDefaults.materials?.base ||
        templateWithDefaults.material ||
        "Standard",
    },
    {
      label: "Lead Time",
      value:
        templateWithDefaults.leadTime ||
        templateWithDefaults.processingTime ||
        "3-5 business days",
    },
  ].filter((item) => item.value); // Filter out items with empty values

  return (
    <div className="border-t pt-4">
      <h3 className="font-medium text-gray-900 mb-3">Product Information</h3>

      <div className="space-y-2 text-sm">
        {infoItems.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-gray-600">{item.label}:</span>
            <span className="font-medium text-right">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Additional template details if available */}
      {selectedTemplate.description && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <h4 className="font-medium text-gray-900 mb-2">Description</h4>
          <p className="text-sm text-gray-600">
            {selectedTemplate.description}
          </p>
        </div>
      )}

      {/* Template tags/features if available */}
      {templateWithDefaults.tags && templateWithDefaults.tags.length > 0 && (
        <div className="mt-3">
          <h4 className="font-medium text-gray-900 mb-2">Features</h4>
          <div className="flex flex-wrap gap-1">
            {templateWithDefaults.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Variant specifications if available */}
      {(selectedVariant as any).specifications && (
        <div className="mt-3">
          <h4 className="font-medium text-gray-900 mb-2">Specifications</h4>
          <div className="space-y-1 text-xs text-gray-600">
            {Object.entries((selectedVariant as any).specifications).map(
              ([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}:
                  </span>
                  <span>{String(value)}</span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
