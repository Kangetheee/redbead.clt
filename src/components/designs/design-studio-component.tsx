"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { DesignProvider } from "./design-context";
import DesignHeader from "./design-header";
import ToolsPanel from "./tools-panel";
import Canvas from "./canvas";
import PropertiesPanel from "./properties-panel";
import {
  useConfigureCanvas,
  useDesign,
  useTemplatePresets,
} from "@/hooks/use-design-studio";
import {
  useDesignTemplate,
  useSizeVariants,
  useColorPresets,
  useFontPresets,
  useCalculatePrice,
} from "@/hooks/use-design-templates";
import { TemplateResponse } from "@/lib/design-templates/types/design-template.types";
import { DesignResponse } from "@/lib/design-studio/types/design-studio.types";

interface DesignStudioProps {
  templateId?: string;
  template?: TemplateResponse;
  productId?: string;
  categoryId?: string;
  showBackToTemplates?: boolean;
  designId?: string;
  onSave?: (designData: DesignResponse) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDownload?: (exportData: any) => void;
  onBack?: () => void;
  onError?: (error: Error) => void;
}

function DesignStudioContent({
  templateId,
  template: providedTemplate,
  designId,
  onSave,
  onDownload,
  onBack,
  onError,
  showBackToTemplates = true,
}: DesignStudioProps) {
  // Template and design state
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateResponse | null>(providedTemplate || null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [priceCalculation, setPriceCalculation] = useState<any>(null);

  // Data fetching hooks
  const {
    data: templateFromId,
    isLoading: templateLoading,
    error: templateError,
  } = useDesignTemplate(templateId || "", !!templateId && !providedTemplate);

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: existingDesign,
    isLoading: designLoading,
    error: designError,
  } = useDesign(designId || "", !!designId);

  // Template-related data
  const currentTemplateId = selectedTemplate?.id;
  const { data: sizeVariants } = useSizeVariants(
    currentTemplateId || "",
    !!currentTemplateId
  );
  const { data: colorPresets } = useColorPresets(
    currentTemplateId || "",
    !!currentTemplateId
  );
  const { data: fontPresets } = useFontPresets(
    currentTemplateId || "",
    !!currentTemplateId
  );
  const { data: templatePresets } = useTemplatePresets(
    currentTemplateId || "",
    !!currentTemplateId
  );

  // Canvas configuration
  const configureCanvas = useConfigureCanvas();
  const calculatePrice = useCalculatePrice();

  // Error handling
  useEffect(() => {
    if (templateError || designError) {
      const error = templateError || designError;
      console.error("Design Studio Error:", error);
      onError?.(new Error(error?.message || "Failed to load data"));
    }
  }, [templateError, designError, onError]);

  // Set template from ID fetch
  useEffect(() => {
    if (templateFromId && !providedTemplate) {
      setSelectedTemplate(templateFromId);
    }
  }, [templateFromId, providedTemplate]);

  // Configure canvas when template is selected
  useEffect(() => {
    if (selectedTemplate && sizeVariants && sizeVariants.length > 0) {
      const defaultVariant =
        sizeVariants.find((v) => v.isDefault) || sizeVariants[0];
      setSelectedVariant(defaultVariant);

      const configData = {
        templateId: selectedTemplate.id,
        sizeVariantId: defaultVariant.id,
        customizations: {
          width: defaultVariant.dimensions?.width || 190,
          height: defaultVariant.dimensions?.height || 15,
        },
      };

      configureCanvas.mutate(configData, {
        onSuccess: (response) => {
          console.log("Canvas configured:", response);
        },
        onError: (error) => {
          console.error("Failed to configure canvas:", error);
          toast.error("Failed to configure canvas");
          onError?.(error as Error);
        },
      });
    }
  }, [selectedTemplate, sizeVariants, configureCanvas, onError]);

  // Calculate price when template/variant changes
  useEffect(() => {
    if (selectedTemplate && selectedVariant) {
      const priceData = {
        sizeVariantId: selectedVariant.id,
        quantity: 1,
        customizations: {
          elementsCount: 0,
          hasCustomImages: false,
          hasCustomText: false,
        },
        urgencyLevel: "NORMAL" as const,
      };

      calculatePrice.mutate(
        {
          templateId: selectedTemplate.id,
          values: priceData,
        },
        {
          onSuccess: (response) => {
            if (response.success) {
              setPriceCalculation(response.data);
            }
          },
          onError: (error) => {
            console.error("Failed to calculate price:", error);
          },
        }
      );
    }
  }, [selectedTemplate, selectedVariant, calculatePrice]);

  // Loading state
  if (templateId && (templateLoading || designLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading design studio...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (templateId && templateError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to Load Template
          </h2>
          <p className="text-gray-600 mb-4">
            The template you&apos;re looking for couldn&apos;t be loaded.
          </p>
        </div>
      </div>
    );
  }

  // Template selection state
  if (!selectedTemplate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Select a Template</h2>
            <p className="text-gray-600 mb-6">
              Choose a template to start designing
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DesignHeader
        templateId={templateId}
        templateName={selectedTemplate.name}
        categoryName={selectedTemplate.category?.name || "Unknown Category"}
        productName={selectedTemplate.product?.name || "Unknown Product"}
        sizeVariantName={selectedVariant?.displayName}
        totalPrice={priceCalculation?.totalPrice}
        onBack={onBack}
        showBackButton={showBackToTemplates}
        designId={designId}
        onSave={onSave}
        onExport={onDownload}
      />

      {/* Main Content - Three Column Layout */}
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Tools & Controls */}
            <div className="lg:col-span-1">
              <ToolsPanel
                colorPresets={colorPresets?.filter((c) => c.isActive) || []}
                fontPresets={fontPresets?.filter((f) => f.isActive) || []}
                fonts={templatePresets?.fonts || []}
                templateInfo={
                  selectedTemplate
                    ? {
                        name: selectedTemplate.name,
                        category: {
                          name: selectedTemplate.category?.name || "Unknown",
                        },
                        product: {
                          name: selectedTemplate.product?.name || "Unknown",
                        },
                        basePrice: selectedTemplate.basePrice || 0,
                      }
                    : undefined
                }
                sizeVariantInfo={
                  selectedVariant
                    ? {
                        displayName: selectedVariant.displayName,
                        dimensions: selectedVariant.dimensions || {
                          width: 190,
                          height: 15,
                          unit: "mm",
                        },
                        price: selectedVariant.price || 0,
                      }
                    : undefined
                }
                priceCalculation={priceCalculation}
              />
            </div>

            {/* Main Canvas Area */}
            <div className="lg:col-span-2">
              <Canvas />
            </div>

            {/* Right Sidebar - Element Properties */}
            <div className="lg:col-span-1">
              <PropertiesPanel
                templateInfo={
                  selectedTemplate
                    ? {
                        name: selectedTemplate.name,
                        category: {
                          name: selectedTemplate.category?.name || "Unknown",
                        },
                        product: {
                          name: selectedTemplate.product?.name || "Unknown",
                        },
                        basePrice: selectedTemplate.basePrice || 0,
                      }
                    : undefined
                }
                sizeVariantInfo={
                  selectedVariant
                    ? {
                        displayName: selectedVariant.displayName,
                        dimensions: selectedVariant.dimensions || {
                          width: 190,
                          height: 15,
                          unit: "mm",
                        },
                        price: selectedVariant.price || 0,
                      }
                    : undefined
                }
                priceCalculation={priceCalculation}
                colorPresets={colorPresets?.filter((c) => c.isActive) || []}
                fontPresets={fontPresets?.filter((f) => f.isActive) || []}
                fonts={templatePresets?.fonts || []}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DesignStudio(props: DesignStudioProps) {
  return (
    <DesignProvider designId={props.designId} autoSaveInterval={10000}>
      <DesignStudioContent {...props} />
    </DesignProvider>
  );
}
