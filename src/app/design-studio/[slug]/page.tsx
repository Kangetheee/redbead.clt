/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import { useParams } from "next/navigation";
import DesignStudioComponent from "@/components/designs/design-studio-component";

interface DesignStudioSlugPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function DesignStudioSlugPage({
  params,
}: DesignStudioSlugPageProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen">
      <DesignStudioComponent templateSlug={slug} />
    </div>
  );
}
