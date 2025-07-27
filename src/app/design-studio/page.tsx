"use client";

import React from "react";
import TemplateSelectionPage from "@/components/designs/template-selection";

interface DesignStudioPageProps {
  productId?: string;
  categoryId?: string;
}

export default function DesignStudioPage({
  productId,
  categoryId,
}: DesignStudioPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TemplateSelectionPage
        productId={productId}
        categoryId={categoryId}
        enableRouterNavigation={true}
      />
    </div>
  );
}
