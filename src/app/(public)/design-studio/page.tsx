"use client";

import React from "react";
import TemplateSelectionPage from "@/components/designs/template-selection";

interface DesignStudioPageProps {
  searchParams?: Promise<{
    productId?: string;
    categoryId?: string;
  }>;
}

export default function DesignStudioPage({
  searchParams,
}: DesignStudioPageProps) {
  const [resolvedParams, setResolvedParams] = React.useState<{
    productId?: string;
    categoryId?: string;
  }>({});

  React.useEffect(() => {
    const resolveParams = async () => {
      if (searchParams) {
        const params = await searchParams;
        setResolvedParams(params);
      }
    };
    resolveParams();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <TemplateSelectionPage
        productId={resolvedParams.productId}
        categoryId={resolvedParams.categoryId}
        enableRouterNavigation={true}
      />
    </div>
  );
}
