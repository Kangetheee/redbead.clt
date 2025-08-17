"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import TemplateDesignStudio from "@/components/designs/design-studio-component";
import { TemplateResponse } from "@/lib/design-templates/types/design-template.types";
import { DesignResponse } from "@/lib/design-studio/types/design-studio.types";

interface DesignStudioClientProps {
  template: TemplateResponse;
  templateId: string;
  designId?: string;
  productId?: string;
  categoryId?: string;
  showBackToTemplates?: boolean;
}

export default function DesignStudioClient({
  template,
  templateId,
  designId,
  productId,
  categoryId,
  showBackToTemplates = true,
}: DesignStudioClientProps) {
  const router = useRouter();

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

        // Analytics tracking could go here
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

      // Handle the download logic
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
        // Handle blob downloads
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
        router.push(`/templates?category=${categoryId}`);
      } else if (productId) {
        router.push(`/templates?product=${productId}`);
      } else {
        router.push("/templates");
      }
    } catch (error) {
      console.error("Error navigating back:", error);
      router.push("/templates"); // Fallback navigation
    }
  }, [router, categoryId, productId]);

  const handleError = useCallback((error: Error) => {
    console.error("Design studio error:", error);
    toast.error(error.message || "An error occurred in the design studio");
  }, []);

  // Validate props
  if (!template) {
    toast.error("Template data is missing");
    router.push("/templates");
    return null;
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
