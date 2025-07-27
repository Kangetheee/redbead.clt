/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import { useParams } from "next/navigation";
import DesignStudioComponent from "@/components/designs/design-studio-component";

interface DesignStudioSlugPageProps {
  params: {
    slug: string;
  };
}

export default function DesignStudioSlugPage({
  params,
}: DesignStudioSlugPageProps) {
  const { slug } = params;

  return (
    <div className="min-h-screen">
      <DesignStudioComponent templateSlug={slug} />
    </div>
  );
}
