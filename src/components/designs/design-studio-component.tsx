/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Design Studio hooks and types
import {
  useConfigureCanvas,
  useUploadArtwork,
  useCreateDesign,
  useUpdateDesign,
  useExportDesign,
  useValidateDesign,
  useShareDesign,
  useTemplatePresets,
  useFonts,
  useUploadAsset,
  useDesign,
} from "@/hooks/use-design-studio";
import {
  createDesignSchema,
  updateDesignSchema,
  exportDesignSchema,
  uploadArtworkSchema,
  uploadAssetSchema,
} from "@/lib/design-studio/dto/design-studio.dto";
import {
  DesignResponse,
  CanvasData,
  CanvasElement,
} from "@/lib/design-studio/types/design-studio.types";

// Template hooks
import {
  useDesignTemplateBySlug,
  useCustomizationOptions,
  useSizeVariants,
} from "@/hooks/use-design-templates";
import {
  DesignTemplate,
  SizeVariant,
} from "@/lib/design-templates/types/design-template.types";

// UI Components
import { Button } from "@/components/ui/button";
import TemplateSelectionPage from "@/components/designs/template-selection";

// Refactored Components
import DesignStudioHeader from "./design-studio-header";
import LeftSidebar from "./left-sidebar";
import CanvasArea from "./canvas-area";
import RightSidebar from "./right-sidebar";
import ExportDialog from "./export-dialog";

// Types
interface DesignStudioComponentProps {
  templateSlug?: string;
  template?: DesignTemplate;
  productId?: string;
  categoryId?: string;
  showBackToTemplates?: boolean;
  designId?: string;
  onSave?: (designData: DesignResponse) => void;
  onDownload?: (exportData: any) => void;
  onBack?: () => void;
}

export default function DesignStudioComponent({
  templateSlug,
  template: providedTemplate,
  productId,
  categoryId,
  showBackToTemplates = true,
  designId,
  onSave,
  onDownload,
  onBack,
}: DesignStudioComponentProps) {
  const router = useRouter();

  // State
  const [selectedTemplate, setSelectedTemplate] =
    useState<DesignTemplate | null>(providedTemplate || null);
  const [selectedVariant, setSelectedVariant] = useState<SizeVariant | null>(
    null
  );
  const [isDesigning, setIsDesigning] = useState(!!providedTemplate);
  const [currentDesign, setCurrentDesign] = useState<DesignResponse | null>(
    null
  );
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(
    null
  );
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [canvasId, setCanvasId] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Hooks
  const configureCanvas = useConfigureCanvas();
  const uploadArtwork = useUploadArtwork();
  const createDesign = useCreateDesign();
  const updateDesign = useUpdateDesign();
  const exportDesign = useExportDesign();
  const validateDesign = useValidateDesign();
  const shareDesign = useShareDesign();
  const uploadAsset = useUploadAsset();

  // Data hooks
  const { data: existingDesign, isLoading: designLoading } = useDesign(
    designId || "",
    !!designId
  );
  const {
    data: templateFromSlug,
    isLoading: templateLoading,
    error: templateError,
  } = useDesignTemplateBySlug(
    templateSlug || "",
    !!templateSlug && !providedTemplate
  );

  const templateId = selectedTemplate?.id;
  const { data: sizeVariants } = useSizeVariants(
    templateId || "",
    !!templateId
  );
  const { data: templatePresets } = useTemplatePresets(
    templateId || "",
    !!templateId
  );
  const { data: fonts } = useFonts();
  const { data: customizationOptions } = useCustomizationOptions(
    templateId || "",
    !!templateId
  );

  // Forms
  const designForm = useForm({
    resolver: zodResolver(createDesignSchema),
    defaultValues: {
      name: "",
      description: "",
      templateId: "",
      sizeVariantId: "",
      customizations: {
        width: 800,
        height: 600,
        backgroundColor: "#ffffff",
        elements: [],
        metadata: {},
      },
      status: "DRAFT" as const,
      isTemplate: false,
      isPublic: false,
    },
  });

  const exportForm = useForm({
    resolver: zodResolver(exportDesignSchema),
    defaultValues: {
      format: "png" as const,
      quality: "high" as const,
      showMockup: true,
    },
  });

  const artworkForm = useForm({
    resolver: zodResolver(uploadArtworkSchema),
    defaultValues: {
      canvasId: "",
      position: "center",
    },
  });

  const assetForm = useForm({
    resolver: zodResolver(uploadAssetSchema),
    defaultValues: {
      name: "",
      type: "image" as const,
      description: "",
      tags: [],
    },
  });

  // Effects - Load existing design data
  useEffect(() => {
    if (existingDesign && designId) {
      setCurrentDesign(existingDesign);
      setCanvasElements(existingDesign.customizations.elements || []);

      designForm.setValue("name", existingDesign.name);
      designForm.setValue("description", existingDesign.description || "");
      designForm.setValue("customizations", existingDesign.customizations);
      designForm.setValue("status", existingDesign.status);
      designForm.setValue("isTemplate", existingDesign.isTemplate);
      designForm.setValue("isPublic", existingDesign.isPublic);
    }
  }, [existingDesign, designId, designForm]);

  // Set template from slug fetch
  useEffect(() => {
    if (templateFromSlug && !providedTemplate) {
      setSelectedTemplate(templateFromSlug);
      setIsDesigning(true);
    }
  }, [templateFromSlug, providedTemplate]);

  // Configure canvas when template/variant changes
  useEffect(() => {
    if (
      selectedTemplate &&
      sizeVariants &&
      sizeVariants.length > 0 &&
      !selectedVariant
    ) {
      const defaultVariant =
        sizeVariants.find((v) => v.isDefault) || sizeVariants[0];
      setSelectedVariant(defaultVariant);

      designForm.setValue("templateId", selectedTemplate.id);
      designForm.setValue("sizeVariantId", defaultVariant.id);

      if (!designId) {
        designForm.setValue("name", `Design - ${selectedTemplate.name}`);
      }

      configureCanvas.mutate(
        {
          templateId: selectedTemplate.id,
          sizeVariantId: defaultVariant.id,
          customizations: {},
        },
        {
          onSuccess: (response) => {
            if (response.success) {
              setCanvasId(response.data.canvasId);
              artworkForm.setValue("canvasId", response.data.canvasId);
            }
          },
        }
      );
    }
  }, [
    selectedTemplate,
    sizeVariants,
    selectedVariant,
    designForm,
    configureCanvas,
    artworkForm,
    designId,
  ]);

  // Event Handlers
  const handleTemplateSelect = (template: DesignTemplate) => {
    setSelectedTemplate(template);
    setIsDesigning(true);
  };

  const handleBackToTemplates = () => {
    if (onBack) {
      onBack();
    } else if (templateSlug) {
      router.back();
    } else {
      setSelectedTemplate(null);
      setIsDesigning(false);
    }
  };

  const handleSaveDesign = () => {
    const formData = designForm.getValues();
    const designData = {
      ...formData,
      customizations: {
        ...formData.customizations,
        elements: canvasElements,
      },
    };

    if (currentDesign) {
      updateDesign.mutate(
        { designId: currentDesign.id, values: designData },
        {
          onSuccess: (response) => {
            if (response.success) {
              setCurrentDesign(response.data);
              onSave?.(response.data);
            }
          },
        }
      );
    } else {
      createDesign.mutate(designData, {
        onSuccess: (response) => {
          if (response.success) {
            setCurrentDesign(response.data);
            onSave?.(response.data);
          }
        },
      });
    }
  };

  const handleExportDesign = () => {
    if (!currentDesign) {
      toast.error("Please save your design first");
      return;
    }

    const exportData = exportForm.getValues();
    exportDesign.mutate(
      { designId: currentDesign.id, values: exportData },
      {
        onSuccess: (response) => {
          if (response.success) {
            onDownload?.(response.data);
          }
        },
      }
    );
  };

  const handleValidateDesign = () => {
    if (!currentDesign) {
      toast.error("Please save your design first");
      return;
    }

    validateDesign.mutate({
      designId: currentDesign.id,
      values: {
        checkPrintReadiness: true,
        checkConstraints: true,
        checkAssetQuality: true,
      },
    });
  };

  const handleShareDesign = () => {
    if (!currentDesign) {
      toast.error("Please save your design first");
      return;
    }

    shareDesign.mutate({
      designId: currentDesign.id,
      values: {
        allowDownload: true,
        note: "Shared design from studio",
      },
    });
  };

  const handleUploadArtwork = (file: File) => {
    if (!canvasId) {
      toast.error("Canvas not configured yet");
      return;
    }

    const artworkData = artworkForm.getValues();
    uploadArtwork.mutate(
      { file, values: artworkData },
      {
        onSuccess: (response) => {
          if (response.success) {
            const newElement: CanvasElement = {
              id: `artwork-${Date.now()}`,
              type: "image",
              x: 100,
              y: 100,
              width: 200,
              height: 200,
              mediaId: response.data.mediaId,
            };
            setCanvasElements((prev) => [...prev, newElement]);
            toast.success("Artwork uploaded and added to design");
          }
        },
      }
    );
  };

  const handleUploadAsset = (file: File) => {
    const assetData = assetForm.getValues();
    if (!assetData.name) {
      toast.error("Please enter an asset name");
      return;
    }

    uploadAsset.mutate(
      { file, assetData },
      {
        onSuccess: (response) => {
          if (response.success) {
            toast.success("Asset uploaded successfully");
            assetForm.reset({
              name: "",
              type: "image",
              description: "",
              tags: [],
            });
          }
        },
      }
    );
  };

  // Element Management
  const addTextElement = () => {
    const newElement: CanvasElement = {
      id: `text-${Date.now()}`,
      type: "text",
      x: 100,
      y: 100,
      width: 200,
      height: 40,
      content: "Your Text Here",
      font: "Arial",
      fontSize: 16,
      fontWeight: "normal",
      color: "#000000",
    };

    setCanvasElements((prev) => [...prev, newElement]);
    setSelectedElement(newElement);
  };

  const addImageElement = () => {
    const newElement: CanvasElement = {
      id: `image-${Date.now()}`,
      type: "image",
      x: 100,
      y: 150,
      width: 150,
      height: 150,
      mediaId: "",
    };

    setCanvasElements((prev) => [...prev, newElement]);
    setSelectedElement(newElement);
  };

  const addShapeElement = () => {
    const newElement: CanvasElement = {
      id: `shape-${Date.now()}`,
      type: "shape",
      x: 200,
      y: 200,
      width: 100,
      height: 100,
      shapeType: "rectangle",
      color: "#0066cc",
    };

    setCanvasElements((prev) => [...prev, newElement]);
    setSelectedElement(newElement);
  };

  const updateElement = (
    elementId: string,
    updates: Partial<CanvasElement>
  ) => {
    setCanvasElements((prev) =>
      prev.map((el) => (el.id === elementId ? { ...el, ...updates } : el))
    );

    if (selectedElement?.id === elementId) {
      setSelectedElement((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteElement = (elementId: string) => {
    setCanvasElements((prev) => prev.filter((el) => el.id !== elementId));
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  };

  // Loading state
  if ((templateSlug && templateLoading) || (designId && designLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">
            {templateSlug ? "Loading template..." : "Loading design..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (templateSlug && templateError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Template Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The template you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push("/templates")}>
            Browse Templates
          </Button>
        </div>
      </div>
    );
  }

  // Show template selection
  if (!selectedTemplate || !isDesigning) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TemplateSelectionPage
          productId={productId}
          categoryId={categoryId}
          onTemplateSelect={handleTemplateSelect}
          enableRouterNavigation={false}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DesignStudioHeader
        selectedTemplate={selectedTemplate}
        currentDesign={currentDesign}
        showBackToTemplates={showBackToTemplates}
        isPreviewMode={isPreviewMode}
        onBack={handleBackToTemplates}
        onPreviewToggle={() => setIsPreviewMode(!isPreviewMode)}
        onValidate={handleValidateDesign}
        onShare={handleShareDesign}
        onSave={handleSaveDesign}
        onExport={handleExportDesign}
        isValidating={validateDesign.isPending}
        isSharing={shareDesign.isPending}
        isSaving={createDesign.isPending || updateDesign.isPending}
        exportForm={exportForm}
        isExporting={exportDesign.isPending}
      />

      <div className="flex h-[calc(100vh-73px)]">
        <LeftSidebar
          canvasElements={canvasElements}
          selectedElement={selectedElement}
          templatePresets={templatePresets}
          designForm={designForm}
          artworkForm={artworkForm}
          assetForm={assetForm}
          fonts={fonts}
          sizeVariants={sizeVariants}
          selectedVariant={selectedVariant}
          canvasId={canvasId}
          uploadedFiles={uploadedFiles}
          onAddText={addTextElement}
          onAddImage={addImageElement}
          onAddShape={addShapeElement}
          onSelectElement={setSelectedElement}
          onDeleteElement={deleteElement}
          onUploadArtwork={handleUploadArtwork}
          onUploadAsset={handleUploadAsset}
          onSetUploadedFiles={setUploadedFiles}
          onVariantSelect={(variant) => {
            setSelectedVariant(variant);
            designForm.setValue("sizeVariantId", variant.id);
          }}
          onCanvasElementsChange={setCanvasElements}
          onElementUpdate={updateElement}
          isUploadingArtwork={uploadArtwork.isPending}
          isUploadingAsset={uploadAsset.isPending}
        />

        <CanvasArea
          selectedTemplate={selectedTemplate}
          selectedVariant={selectedVariant}
          currentDesign={currentDesign}
          canvasElements={canvasElements}
          selectedElement={selectedElement}
          designForm={designForm}
          isPreviewMode={isPreviewMode}
          onElementSelect={setSelectedElement}
          onElementUpdate={updateElement}
        />

        <RightSidebar
          selectedElement={selectedElement}
          selectedTemplate={selectedTemplate}
          selectedVariant={selectedVariant}
          currentDesign={currentDesign}
          canvasElements={canvasElements}
          designForm={designForm}
          fonts={fonts}
          onElementUpdate={updateElement}
          onDeleteElement={deleteElement}
          onUploadArtwork={handleUploadArtwork}
          onCanvasElementsChange={setCanvasElements}
        />
      </div>
    </div>
  );
}
