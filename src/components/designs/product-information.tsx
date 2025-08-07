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
  const infoItems = [
    { label: "Template", value: selectedTemplate.name },
    { label: "Size", value: selectedVariant.displayName },
    {
      label: "Base Price",
      value: `$${selectedTemplate.basePrice.toFixed(2)}`,
    },
    {
      label: "Variant Price",
      value: `$${selectedVariant.price.toFixed(2)}`,
    },
    {
      label: "Material",
      value: selectedTemplate.materials.base,
    },
    {
      label: "Lead Time",
      value: selectedTemplate.leadTime,
    },
  ];

  return (
    <div className="border-t pt-4">
      <h3 className="font-medium text-gray-900 mb-3">Product Information</h3>

      <div className="space-y-2 text-sm">
        {infoItems.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-gray-600">{item.label}:</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
