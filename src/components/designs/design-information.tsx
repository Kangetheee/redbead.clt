import React from "react";
import { DesignResponse } from "@/lib/design-studio/types/design-studio.types";

interface DesignInformationProps {
  currentDesign: DesignResponse;
}

export default function DesignInformation({
  currentDesign,
}: DesignInformationProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const infoItems = [
    {
      label: "Status",
      value: (
        <span
          className={`px-2 py-1 text-xs rounded ${getStatusColor(currentDesign.status)}`}
        >
          {currentDesign.status}
        </span>
      ),
    },
    {
      label: "Version",
      value: `v${currentDesign.version}`,
    },
    {
      label: "Created",
      value: new Date(currentDesign.createdAt).toLocaleDateString(),
    },
    {
      label: "Updated",
      value: new Date(currentDesign.updatedAt).toLocaleDateString(),
    },
  ];

  // Add estimated cost if available
  if (currentDesign.estimatedCost) {
    infoItems.push({
      label: "Estimated Cost",
      value: `$${currentDesign.estimatedCost.toFixed(2)}`,
    });
  }

  return (
    <div className="border-t pt-4">
      <h3 className="font-medium text-gray-900 mb-3">Design Information</h3>

      <div className="space-y-2 text-sm">
        {infoItems.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-600">{item.label}:</span>
            <span className="font-medium">
              {typeof item.value === "string" ? item.value : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
