/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  useAutoSaveDesign,
} from "@/hooks/use-design-studio";
import {
  createDesignSchema,
  updateDesignSchema,
  exportDesignSchema,
  uploadArtworkSchema,
  uploadAssetSchema,
  type CreateDesignDto,
  type UpdateDesignDto,
  type ExportDesignDto,
  type UploadArtworkDto,
  type UploadAssetDto,
} from "@/lib/design-studio/dto/design-studio.dto";
import {
  type DesignResponse,
  type CanvasData,
  type CanvasElement,
  type Font,
  type AssetResponse,
} from "@/lib/design-studio/types/design-studio.types";
import {
  useDesignTemplateBySlug,
  useCustomizationOptions,
  useSizeVariants,
} from "@/hooks/use-design-templates";
import {
  type DesignTemplate,
  type SizeVariant,
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

import {
  getFabricCanvas,
  fabricCanvasUtils,
  canvasUtils,
} from "./canvas-renderer";

// Types
interface DesignStudioComponentProps {
  templateSlug?: string;
  template?: DesignTemplate;
  productId?: string;
  categoryId?: string;
  showBackToTemplates?: boolean;
  designId?: string;
  enableAutoSave?: boolean;
  autoSaveInterval?: number;
  onSave?: (designData: DesignResponse) => void;
  onDownload?: (exportData: any) => void;
  onBack?: () => void;
  onDesignLoad?: (design: DesignResponse) => void;
  onCanvasConfigured?: (canvasId: string) => void;
}

export default function DesignStudioComponent({
  templateSlug,
  template: providedTemplate,
  productId,
  categoryId,
  showBackToTemplates = true,
  designId,
  enableAutoSave = false,
  autoSaveInterval = 5000,
  onSave,
  onDownload,
  onBack,
  onDesignLoad,
  onCanvasConfigured,
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
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [useFabricRenderer, setUseFabricRenderer] = useState(true);

  // Hooks
  const configureCanvas = useConfigureCanvas();
  const uploadArtwork = useUploadArtwork();
  const createDesign = useCreateDesign();
  const updateDesign = useUpdateDesign();
  const exportDesign = useExportDesign();
  const validateDesign = useValidateDesign();
  const shareDesign = useShareDesign();
  const uploadAsset = useUploadAsset();

  // Auto-save hook
  const autoSaveDesign = useAutoSaveDesign(
    currentDesign?.id || "",
    enableAutoSave
  );

  // Data hooks
  const {
    data: existingDesign,
    isLoading: designLoading,
    error: designError,
  } = useDesign(designId || "", !!designId);

  const {
    data: templateFromSlug,
    isLoading: templateLoading,
    error: templateError,
  } = useDesignTemplateBySlug(
    templateSlug || "",
    !!templateSlug && !providedTemplate
  );

  const templateId = selectedTemplate?.id;
  const { data: sizeVariants, isLoading: sizeVariantsLoading } =
    useSizeVariants(templateId || "", !!templateId);

  const { data: templatePresets, isLoading: templatePresetsLoading } =
    useTemplatePresets(templateId || "", !!templateId);

  const { data: fonts, isLoading: fontsLoading } = useFonts();

  const { data: customizationOptions, isLoading: customizationOptionsLoading } =
    useCustomizationOptions(templateId || "", !!templateId);

  // Forms with proper typing
  const designForm = useForm<CreateDesignDto>({
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
      status: "DRAFT",
      isTemplate: false,
      isPublic: false,
    },
  });

  const exportForm = useForm<ExportDesignDto>({
    resolver: zodResolver(exportDesignSchema),
    defaultValues: {
      format: "png",
      quality: "high",
      showMockup: true,
      includeBleed: false,
      includeCropMarks: false,
    },
  });

  const artworkForm = useForm<UploadArtworkDto>({
    resolver: zodResolver(uploadArtworkSchema),
    defaultValues: {
      canvasId: "",
      position: "center",
    },
  });

  const assetForm = useForm<UploadAssetDto>({
    resolver: zodResolver(uploadAssetSchema),
    defaultValues: {
      name: "",
      type: "image",
      description: "",
      tags: [],
    },
  });

  // Auto-save effect
  useEffect(() => {
    if (!enableAutoSave || !currentDesign || !hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      const formData = designForm.getValues();
      const designData: UpdateDesignDto = {
        customizations: {
          ...formData.customizations,
          elements: canvasElements,
        },
      };

      autoSaveDesign(designData);
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date());
    }, autoSaveInterval);

    return () => clearTimeout(autoSaveTimer);
  }, [
    enableAutoSave,
    currentDesign,
    hasUnsavedChanges,
    autoSaveInterval,
    canvasElements,
    designForm,
    autoSaveDesign,
  ]);

  // Track changes for auto-save
  useEffect(() => {
    if (currentDesign) {
      setHasUnsavedChanges(true);
    }
  }, [canvasElements, currentDesign]);

  // Effects - Load existing design data
  useEffect(() => {
    if (existingDesign && designId) {
      setCurrentDesign(existingDesign);
      setCanvasElements(existingDesign.customizations.elements || []);

      // Update form with existing design data
      designForm.reset({
        name: existingDesign.name,
        description: existingDesign.description || "",
        templateId: existingDesign.template?.id || "",
        sizeVariantId: existingDesign.sizeVariant?.id || "",
        customizations: existingDesign.customizations,
        status: existingDesign.status,
        isTemplate: existingDesign.isTemplate,
        isPublic: existingDesign.isPublic,
      });

      setLastSavedAt(new Date(existingDesign.updatedAt));
      setHasUnsavedChanges(false);
      onDesignLoad?.(existingDesign);
    }
  }, [existingDesign, designId, designForm, onDesignLoad]);

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
      !selectedVariant &&
      !designId // Don't auto-configure if loading existing design
    ) {
      const defaultVariant =
        sizeVariants.find((v) => v.isDefault) || sizeVariants[0];
      setSelectedVariant(defaultVariant);

      designForm.setValue("templateId", selectedTemplate.id);
      designForm.setValue("sizeVariantId", defaultVariant.id);

      if (!currentDesign) {
        designForm.setValue("name", `Design - ${selectedTemplate.name}`);
      }

      configureCanvas.mutate(
        {
          templateId: selectedTemplate.id,
          sizeVariantId: defaultVariant.id,
          customizations: currentDesign?.customizations || {},
        },
        {
          onSuccess: (data) => {
            setCanvasId(data.canvasId);
            artworkForm.setValue("canvasId", data.canvasId);
            onCanvasConfigured?.(data.canvasId);

            // Update canvas dimensions from configuration
            if (data.canvasSettings) {
              designForm.setValue(
                "customizations.width",
                data.canvasSettings.width
              );
              designForm.setValue(
                "customizations.height",
                data.canvasSettings.height
              );
            }
          },
          onError: (error) => {
            console.error("Canvas configuration failed:", error);
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
    currentDesign,
    onCanvasConfigured,
  ]);

  // Event Handlers
  const handleTemplateSelect = useCallback((template: DesignTemplate) => {
    setSelectedTemplate(template);
    setIsDesigning(true);
  }, []);

  const handleBackToTemplates = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmLeave) return;
    }

    if (onBack) {
      onBack();
    } else if (templateSlug) {
      router.back();
    } else {
      setSelectedTemplate(null);
      setIsDesigning(false);
    }
  }, [hasUnsavedChanges, onBack, templateSlug, router]);

  const handleSaveDesign = useCallback(() => {
    const formData = designForm.getValues();

    // If using Fabric.js, get the latest canvas state
    let elementsToSave = canvasElements;
    if (useFabricRenderer) {
      const fabricCanvas = getFabricCanvas();
      if (fabricCanvas) {
        // Sync Fabric.js objects back to CanvasElement format
        const fabricObjects = fabricCanvas.getObjects();
        elementsToSave = fabricObjects
          .map((obj) => {
            if (obj.data) {
              // Update the stored element data with current object state
              const element = obj.data as CanvasElement;
              return {
                ...element,
                x: Math.round(obj.left || 0),
                y: Math.round(obj.top || 0),
                width: Math.round((obj.width || 0) * (obj.scaleX || 1)),
                height: Math.round((obj.height || 0) * (obj.scaleY || 1)),
                rotation: Math.round(obj.angle || 0),
                // Update type-specific properties
                ...(element.type === "text" && obj.type === "i-text"
                  ? {
                      content: (obj as any).text,
                      fontSize: (obj as any).fontSize,
                      fontWeight: (obj as any).fontWeight,
                      color: obj.fill as string,
                      font: (obj as any).fontFamily,
                    }
                  : {}),
                ...(element.type === "shape"
                  ? {
                      color: obj.fill as string,
                    }
                  : {}),
              } as CanvasElement; // ✅ Explicit type assertion
            }
            return null; // ✅ Return null instead of undefined obj.data
          })
          .filter((element): element is CanvasElement => element !== null); // ✅ Type-safe filter
      }
    }

    const designData: CreateDesignDto | UpdateDesignDto = {
      ...formData,
      customizations: {
        ...formData.customizations,
        elements: elementsToSave,
      },
    };

    if (currentDesign) {
      updateDesign.mutate(
        { designId: currentDesign.id, values: designData as UpdateDesignDto },
        {
          onSuccess: (data) => {
            setCurrentDesign(data);
            setCanvasElements(elementsToSave);
            setLastSavedAt(new Date());
            setHasUnsavedChanges(false);
            onSave?.(data);
            toast.success("Design saved successfully");
          },
        }
      );
    } else {
      createDesign.mutate(designData as CreateDesignDto, {
        onSuccess: (data) => {
          setCurrentDesign(data);
          setCanvasElements(elementsToSave);
          setLastSavedAt(new Date());
          setHasUnsavedChanges(false);
          onSave?.(data);
          toast.success("Design created successfully");
        },
      });
    }
  }, [
    designForm,
    canvasElements,
    currentDesign,
    updateDesign,
    createDesign,
    onSave,
    useFabricRenderer,
  ]);

  const handleExportDesign = useCallback(() => {
    if (!currentDesign) {
      toast.error("Please save your design first");
      return;
    }

    if (useFabricRenderer) {
      const exportData = exportForm.getValues();
      const dataURL = canvasUtils.exportCanvas(
        exportData.format,
        exportData.quality === "high" ? 1 : 0.8
      );

      if (dataURL) {
        const link = document.createElement("a");
        link.download = `${currentDesign.name}.${exportData.format}`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Design exported successfully");
        onDownload?.({ dataURL, format: exportData.format });
      }
    } else {
      // Use the traditional export method
      const exportData = exportForm.getValues();
      exportDesign.mutate(
        { designId: currentDesign.id, values: exportData },
        {
          onSuccess: (data) => {
            onDownload?.(data);
            toast.success("Design exported successfully");
          },
        }
      );
    }
  }, [currentDesign, exportForm, exportDesign, onDownload, useFabricRenderer]);

  const handleValidateDesign = useCallback(() => {
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
  }, [currentDesign, validateDesign]);

  const handleShareDesign = useCallback(() => {
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
  }, [currentDesign, shareDesign]);

  const handleUploadArtwork = useCallback(
    (file: File) => {
      if (!canvasId) {
        toast.error("Canvas not configured yet");
        return;
      }

      const artworkData = artworkForm.getValues();
      uploadArtwork.mutate(
        { file, values: artworkData },
        {
          onSuccess: (data) => {
            const newElement: CanvasElement = {
              id: `artwork-${Date.now()}`,
              type: "image",
              x: 100,
              y: 100,
              width: 200,
              height: 200,
              mediaId: data.mediaId,
            };

            setCanvasElements((prev) => [...prev, newElement]);
            setSelectedElement(newElement);
            toast.success("Artwork uploaded successfully");
          },
          onError: (error) => {
            toast.error("Failed to upload artwork");
          },
        }
      );
    },
    [canvasId, artworkForm, uploadArtwork]
  );

  // Handle upload asset with the correct signature
  const handleUploadAsset = useCallback(
    (file: File) => {
      const assetData = assetForm.getValues();

      if (!assetData.name) {
        toast.error("Please enter an asset name");
        return;
      }

      uploadAsset.mutate(
        { file, assetData: assetData as UploadAssetDto },
        {
          onSuccess: () => {
            assetForm.reset({
              name: "",
              type: "image",
              description: "",
              tags: [],
            });
            toast.success("Asset uploaded successfully");
          },
          onError: (error) => {
            toast.error("Failed to upload asset");
          },
        }
      );
    },
    [assetForm, uploadAsset]
  );

  // Enhanced Element Management with Fabric.js support
  const addTextElement = useCallback(() => {
    if (useFabricRenderer) {
      // Use Fabric.js to add text
      const textObject = fabricCanvasUtils.addText("Your Text Here");
      if (textObject) {
        const newElement: CanvasElement = {
          id: `text-${Date.now()}`,
          type: "text",
          x: textObject.left || 100,
          y: textObject.top || 100,
          width: textObject.width || 200,
          height: textObject.height || 40,
          content: "Your Text Here",
          font: "Arial",
          fontSize: 20,
          fontWeight: "normal",
          color: "#000000",
        };

        textObject.data = newElement;
        setCanvasElements((prev) => [...prev, newElement]);
        setSelectedElement(newElement);
      }
    } else {
      // Legacy text addition
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
    }
  }, [useFabricRenderer]);

  const addImageElement = useCallback(() => {
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
  }, []);

  const addShapeElement = useCallback(() => {
    if (useFabricRenderer) {
      // Use Fabric.js to add shape
      const shapeObject = fabricCanvasUtils.addShape("rect");
      if (shapeObject) {
        const newElement: CanvasElement = {
          id: `shape-${Date.now()}`,
          type: "shape",
          x: shapeObject.left || 200,
          y: shapeObject.top || 200,
          width: shapeObject.width || 100,
          height: shapeObject.height || 100,
          shapeType: "rectangle",
          color: "#0066cc",
        };

        shapeObject.data = newElement;
        setCanvasElements((prev) => [...prev, newElement]);
        setSelectedElement(newElement);
      }
    } else {
      // Legacy shape addition
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
    }
  }, [useFabricRenderer]);

  const updateElement = useCallback(
    (elementId: string, updates: Partial<CanvasElement>) => {
      setCanvasElements((prev) =>
        prev.map((el) => (el.id === elementId ? { ...el, ...updates } : el))
      );

      if (selectedElement?.id === elementId) {
        setSelectedElement((prev) => (prev ? { ...prev, ...updates } : null));
      }

      // If using Fabric.js, update the corresponding object
      if (useFabricRenderer) {
        const fabricCanvas = getFabricCanvas();
        if (fabricCanvas) {
          const fabricObject = fabricCanvas
            .getObjects()
            .find((obj) => obj.data?.id === elementId);
          if (fabricObject) {
            fabricObject.set(updates);
            fabricObject.data = { ...fabricObject.data, ...updates };
            fabricCanvas.renderAll();
          }
        }
      }
    },
    [selectedElement, useFabricRenderer]
  );

  const deleteElement = useCallback(
    (elementId: string) => {
      setCanvasElements((prev) => prev.filter((el) => el.id !== elementId));
      if (selectedElement?.id === elementId) {
        setSelectedElement(null);
      }

      // If using Fabric.js, remove the corresponding object
      if (useFabricRenderer) {
        const fabricCanvas = getFabricCanvas();
        if (fabricCanvas) {
          const fabricObject = fabricCanvas
            .getObjects()
            .find((obj) => obj.data?.id === elementId);
          if (fabricObject) {
            fabricCanvas.remove(fabricObject);
            fabricCanvas.renderAll();
          }
        }
      }
    },
    [selectedElement, useFabricRenderer]
  );

  const duplicateElement = useCallback(
    (elementId: string) => {
      const elementToDuplicate = canvasElements.find(
        (el) => el.id === elementId
      );
      if (!elementToDuplicate) return;

      const duplicatedElement: CanvasElement = {
        ...elementToDuplicate,
        id: `${elementToDuplicate.type}-${Date.now()}`,
        x: elementToDuplicate.x + 20,
        y: elementToDuplicate.y + 20,
      };

      setCanvasElements((prev) => [...prev, duplicatedElement]);
      setSelectedElement(duplicatedElement);
    },
    [canvasElements]
  );

  // Loading state
  const isLoading =
    (templateSlug && templateLoading) || (designId && designLoading);

  if (isLoading) {
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
  if ((templateSlug && templateError) || (designId && designError)) {
    const error = templateError || designError;
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {templateError ? "Template Not Found" : "Design Not Found"}
          </h2>
          <p className="text-gray-600 mb-4">
            {templateError
              ? "The template you're looking for doesn't exist."
              : "The design you're looking for doesn't exist or has been deleted."}
          </p>
          <Button
            onClick={() =>
              router.push(templateError ? "/templates" : "/designs")
            }
          >
            {templateError ? "Browse Templates" : "Browse Designs"}
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
        lastSavedAt={lastSavedAt}
        hasUnsavedChanges={hasUnsavedChanges}
        enableAutoSave={enableAutoSave}
        // useFabricRenderer={useFabricRenderer}
        onBack={handleBackToTemplates}
        onPreviewToggle={() => setIsPreviewMode(!isPreviewMode)}
        onValidate={handleValidateDesign}
        onShare={handleShareDesign}
        onSave={handleSaveDesign}
        onExport={handleExportDesign}
        // onToggleRenderer={() => setUseFabricRenderer(!useFabricRenderer)}
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
          // useFabricRenderer={useFabricRenderer}
          onAddText={addTextElement}
          onAddImage={addImageElement}
          onAddShape={addShapeElement}
          onSelectElement={setSelectedElement}
          onDeleteElement={deleteElement}
          onDuplicateElement={duplicateElement}
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
          isLoadingPresets={templatePresetsLoading}
          isLoadingFonts={fontsLoading}
        />

        <CanvasArea
          selectedTemplate={selectedTemplate}
          selectedVariant={selectedVariant}
          currentDesign={currentDesign}
          canvasElements={canvasElements}
          selectedElement={selectedElement}
          designForm={designForm}
          isPreviewMode={isPreviewMode}
          canvasId={canvasId}
          // useFabricRenderer={useFabricRenderer}
          onElementSelect={setSelectedElement}
          onElementUpdate={updateElement}
          onElementDuplicate={duplicateElement}
          onElementDelete={deleteElement}
        />

        <RightSidebar
          selectedElement={selectedElement}
          selectedTemplate={selectedTemplate}
          selectedVariant={selectedVariant}
          currentDesign={currentDesign}
          canvasElements={canvasElements}
          designForm={designForm}
          fonts={fonts}
          // useFabricRenderer={useFabricRenderer}
          onElementUpdate={updateElement}
          onDeleteElement={deleteElement}
          onUploadArtwork={handleUploadArtwork}
          onCanvasElementsChange={setCanvasElements}
        />
      </div>
    </div>
  );
}
