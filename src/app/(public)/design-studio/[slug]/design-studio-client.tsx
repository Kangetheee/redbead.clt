"use client";

import React, { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import TemplateDesignStudio from "@/components/designs/design-studio-component";
import { TemplateResponse } from "@/lib/design-templates/types/design-template.types";
import { DesignResponse } from "@/lib/design-studio/types/design-studio.types";

interface DesignStudioClientProps {
  template: TemplateResponse;
  templateId: string;
  templateSlug?: string;
  designId?: string;
  productId?: string;
  categoryId?: string;
  showBackToTemplates?: boolean;
}

export default function DesignStudioClient({
  template,
  templateId,
  templateSlug,
  designId,
  productId,
  categoryId,
  showBackToTemplates = true,
}: DesignStudioClientProps) {
  const router = useRouter();

  // Validate that we have proper template data
  useEffect(() => {
    if (!template || !templateId) {
      console.error("Missing template data:", {
        template: !!template,
        templateId,
      });
      toast.error("Template data is missing");
      router.push("/design-studio");
      return;
    }

    // Check for undefined values that might cause the undefinedundefined issue
    if (templateId === "undefined" || templateSlug === "undefined") {
      console.error("Template ID or slug is undefined:", {
        templateId,
        templateSlug,
      });
      toast.error("Invalid template identifier");
      router.push("/design-studio");
      return;
    }
  }, [template, templateId, templateSlug, router]);

  const handleSaveDesign = useCallback(
    (designData: DesignResponse) => {
      try {
        toast.success("Design saved successfully!");

        // Update URL if this was a new design
        if (designData.id && !designId) {
          const url = new URL(window.location.href);
          url.searchParams.set("designId", designData.id);
          window.history.replaceState({}, "", url.toString());
        }

        console.log("Design saved:", designData);
      } catch (error) {
        console.error("Error handling design save:", error);
        toast.error("Failed to process design save");
      }
    },
    [designId]
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDownloadDesign = useCallback((exportData: any) => {
    try {
      toast.success("Design exported successfully!");

      if (exportData.downloadUrl) {
        const link = document.createElement("a");
        link.href = exportData.downloadUrl;
        link.download =
          exportData.filename ||
          `design-${Date.now()}.${exportData.format || "png"}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (exportData.blob) {
        const url = URL.createObjectURL(exportData.blob);
        const link = document.createElement("a");
        link.href = url;
        link.download =
          exportData.filename ||
          `design-${Date.now()}.${exportData.format || "png"}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      console.log("Design downloaded:", exportData);
    } catch (error) {
      console.error("Error handling design download:", error);
      toast.error("Failed to download design");
    }
  }, []);

  const handleBackToTemplates = useCallback(() => {
    try {
      // Navigate back to templates with appropriate context
      if (categoryId) {
        router.push(`/design-studio?categoryId=${categoryId}`);
      } else if (productId) {
        router.push(`/design-studio?productId=${productId}`);
      } else {
        router.push("/design-studio");
      }
    } catch (error) {
      console.error("Error navigating back:", error);
      router.push("/design-studio"); // Fallback navigation
    }
  }, [router, categoryId, productId]);

  const handleError = useCallback((error: Error) => {
    console.error("Design studio error:", error);
    toast.error(error.message || "An error occurred in the design studio");
  }, []);

  // Don't render if we don't have valid template data
  if (!template || !templateId || templateId === "undefined") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <TemplateDesignStudio
        template={template}
        templateId={templateId}
        designId={designId}
        productId={productId}
        categoryId={categoryId}
        showBackToTemplates={showBackToTemplates}
        onSave={handleSaveDesign}
        onDownload={handleDownloadDesign}
        onBack={handleBackToTemplates}
        onError={handleError}
      />
    </div>
  );
}
