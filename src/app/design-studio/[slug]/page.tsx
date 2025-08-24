import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import DesignStudioClient from "./design-studio-client";
import { getTemplateAction } from "@/lib/design-templates/design-templates.actions";

interface DesignStudioPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    designId?: string;
    productId?: string;
    categoryId?: string;
  }>;
}

export async function generateMetadata({
  params,
}: DesignStudioPageProps): Promise<Metadata> {
  const resolvedParams = await params;

  // Add validation for the slug parameter
  if (!resolvedParams.slug || resolvedParams.slug === "undefined") {
    return {
      title: "Template Not Found",
      description: "The requested design template could not be found.",
    };
  }

  // Fetch template to generate metadata
  const templateResponse = await getTemplateAction(resolvedParams.slug);

  if (!templateResponse.success) {
    return {
      title: "Template Not Found",
      description: "The requested design template could not be found.",
    };
  }

  const template = templateResponse.data;

  return {
    title: `Design Studio - ${template.name}`,
    description:
      template.description ||
      `Create custom designs with ${template.name} template`,
    openGraph: {
      title: `Design Studio - ${template.name}`,
      description:
        template.description ||
        `Create custom designs with ${template.name} template`,
      images: template.thumbnail ? [template.thumbnail] : [],
    },
  };
}

export default async function DesignStudioPage({
  params,
  searchParams,
}: DesignStudioPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Add comprehensive validation
  if (!resolvedParams.slug) {
    console.error("No slug parameter found");
    notFound();
  }

  if (resolvedParams.slug === "undefined" || resolvedParams.slug === "null") {
    console.error("Invalid slug parameter:", resolvedParams.slug);
    notFound();
  }

  console.log("Design Studio Page - Template slug:", resolvedParams.slug);

  // Fetch template data on the server
  const templateResponse = await getTemplateAction(resolvedParams.slug);

  if (!templateResponse.success) {
    console.error("Template fetch failed:", templateResponse.error);
    notFound();
  }

  const template = templateResponse.data;

  // Additional validation for template data
  if (!template || !template.id) {
    console.error("Template data is invalid:", template);
    notFound();
  }

  console.log("Template loaded successfully:", {
    id: template.id,
    name: template.name,
    slug: resolvedParams.slug,
  });

  return (
    <div className="min-h-screen bg-background">
      <DesignStudioClient
        template={template}
        templateId={template.id}
        templateSlug={resolvedParams.slug} // Pass the slug for debugging
        designId={resolvedSearchParams.designId}
        productId={resolvedSearchParams.productId}
        categoryId={resolvedSearchParams.categoryId}
        showBackToTemplates={true}
      />
    </div>
  );
}
