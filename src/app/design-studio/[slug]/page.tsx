"use client";

import React from "react";
import DesignStudioComponent from "@/components/designs/design-studio-component";

interface DesignStudioSlugPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function DesignStudioSlugPage({
  params,
}: DesignStudioSlugPageProps) {
  const [resolvedParams, setResolvedParams] = React.useState<{
    slug: string;
  }>({ slug: "" });

  React.useEffect(() => {
    const resolveParams = async () => {
      const resolvedSlugParams = await params;
      setResolvedParams(resolvedSlugParams);
    };
    resolveParams();
  }, [params]);

  if (!resolvedParams.slug) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading design studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DesignStudioComponent templateSlug={resolvedParams.slug} />
    </div>
  );
}
