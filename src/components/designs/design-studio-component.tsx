"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Rnd } from "react-rnd";
import { toast } from "sonner";
import {
  ArrowLeft,
  Palette,
  Download,
  Save,
  Loader2,
  AlertCircle,
  Upload,
  Eye,
  Share2,
  CheckCircle,
  Type,
  Image as ImageIcon,
  Square,
  Layers,
  Info,
  DollarSign,
  Trash2,
  Grid,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

// Design Studio hooks and types
import {
  useConfigureCanvas,
  useUploadArtwork,
  useCreateDesign,
  useUpdateDesign,
  useExportDesign,
  useValidateDesign,
  useShareDesign,
  useDesign,
  useTemplatePresets,
  useFonts,
  useUploadAsset,
} from "@/hooks/use-design-studio";
import {
  CanvasElement,
  DesignResponse,
  Font,
} from "@/lib/design-studio/types/design-studio.types";
import {
  createDesignSchema,
  // updateDesignSchema,
  exportDesignSchema,
  uploadArtworkSchema,
  uploadAssetSchema,
  ConfigureCanvasDto,
  CreateDesignDto,
  UpdateDesignDto,
  ExportDesignDto,
  UploadArtworkDto,
  UploadAssetDto,
} from "@/lib/design-studio/dto/design-studio.dto";
import {
  useDesignTemplate,
  useSizeVariants,
  useColorPresets,
  useFontPresets,
  useMediaRestrictions,
  useCalculatePrice,
} from "@/hooks/use-design-templates";
import {
  TemplateResponse,
  SizeVariantResponseDto,
  ColorPresetResponseDto,
  FontPresetResponseDto,
  // MediaRestrictionResponseDto,
  PriceCalculationResponseDto,
} from "@/lib/design-templates/types/design-template.types";
import { CalculatePriceDto } from "@/lib/design-templates/dto/design-template.dto";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TemplateDesignStudioProps {
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

export default function TemplateDesignStudio({
  templateId,
  template: providedTemplate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  productId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  categoryId,
  showBackToTemplates = true,
  designId,
  onSave,
  onDownload,
  onBack,
  onError,
}: TemplateDesignStudioProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Template and design state
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateResponse | null>(providedTemplate || null);
  const [selectedVariant, setSelectedVariant] =
    useState<SizeVariantResponseDto | null>(null);
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
  const [priceCalculation, setPriceCalculation] =
    useState<PriceCalculationResponseDto | null>(null);
  const [selectedColorPreset, setSelectedColorPreset] =
    useState<ColorPresetResponseDto | null>(null);
  const [selectedFontPreset, setSelectedFontPreset] =
    useState<FontPresetResponseDto | null>(null);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);

  // Data fetching hooks with proper error handling
  const {
    data: templateFromId,
    isLoading: templateLoading,
    error: templateError,
  } = useDesignTemplate(templateId || "", !!templateId && !providedTemplate);

  const {
    data: existingDesign,
    isLoading: designLoading,
    error: designError,
  } = useDesign(designId || "", !!designId);

  const currentTemplateId = selectedTemplate?.id;
  const { data: sizeVariants, error: variantsError } = useSizeVariants(
    currentTemplateId || "",
    !!currentTemplateId
  );
  const { data: colorPresets, error: colorsError } = useColorPresets(
    currentTemplateId || "",
    !!currentTemplateId
  );
  const { data: fontPresets, error: fontsError } = useFontPresets(
    currentTemplateId || "",
    !!currentTemplateId
  );
  const { data: mediaRestrictions, error: mediaError } = useMediaRestrictions(
    currentTemplateId || "",
    !!currentTemplateId
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: templatePresets } = useTemplatePresets(
    currentTemplateId || "",
    !!currentTemplateId
  );
  const { data: fonts } = useFonts();

  const configureCanvas = useConfigureCanvas();
  const uploadArtwork = useUploadArtwork();
  const createDesign = useCreateDesign();
  const updateDesign = useUpdateDesign();
  const exportDesign = useExportDesign();
  const validateDesign = useValidateDesign();
  const shareDesign = useShareDesign();
  const uploadAsset = useUploadAsset();
  const calculatePrice = useCalculatePrice();

  // Forms with proper validation
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

  // Error handling effect
  useEffect(() => {
    const errors = [
      templateError,
      designError,
      variantsError,
      colorsError,
      fontsError,
      mediaError,
    ].filter(Boolean);
    if (errors.length > 0 && onError) {
      onError(new Error(errors[0]?.message || "Failed to load template data"));
    }
  }, [
    templateError,
    designError,
    variantsError,
    colorsError,
    fontsError,
    mediaError,
    onError,
  ]);

  // Set template from ID fetch
  useEffect(() => {
    if (templateFromId && !providedTemplate) {
      setSelectedTemplate(templateFromId);
      setIsDesigning(true);
    }
  }, [templateFromId, providedTemplate]);

  // Load existing design if editing
  useEffect(() => {
    if (existingDesign) {
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
    }
  }, [existingDesign, designForm]);

  // Set default variant and configure canvas
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

      // Update form with template data
      designForm.setValue("templateId", selectedTemplate.id);
      designForm.setValue("sizeVariantId", defaultVariant.id);
      designForm.setValue("name", `Design - ${selectedTemplate.name}`);

      // Set canvas dimensions based on variant
      if (defaultVariant.dimensions) {
        designForm.setValue(
          "customizations.width",
          defaultVariant.dimensions.width
        );
        designForm.setValue(
          "customizations.height",
          defaultVariant.dimensions.height
        );
      }

      // Configure canvas
      const configData: ConfigureCanvasDto = {
        templateId: selectedTemplate.id,
        sizeVariantId: defaultVariant.id,
        customizations: {},
      };

      configureCanvas.mutate(configData, {
        onSuccess: (response) => {
          setCanvasId(response.canvasId);
          artworkForm.setValue("canvasId", response.canvasId);
        },
        onError: (error) => {
          console.error("Failed to configure canvas:", error);
          onError?.(error as Error);
        },
      });
    }
  }, [
    selectedTemplate,
    sizeVariants,
    selectedVariant,
    designForm,
    configureCanvas,
    artworkForm,
    onError,
  ]);

  // Set default color and font presets
  useEffect(() => {
    if (colorPresets && colorPresets.length > 0) {
      const activeColors = colorPresets.filter((c) => c.isActive);
      if (activeColors.length > 0) {
        setSelectedColorPreset(activeColors[0]);
      }
    }
  }, [colorPresets]);

  useEffect(() => {
    if (fontPresets && fontPresets.length > 0) {
      const activeFonts = fontPresets.filter((f) => f.isActive);
      if (activeFonts.length > 0) {
        setSelectedFontPreset(activeFonts[0]);
      }
    }
  }, [fontPresets]);

  // Calculate price when variant or elements change
  useEffect(() => {
    if (selectedTemplate && selectedVariant && canvasElements.length > 0) {
      const priceData: CalculatePriceDto = {
        sizeVariantId: selectedVariant.id,
        quantity: 1,
        customizations: {
          elementsCount: canvasElements.length,
          hasCustomImages: canvasElements.some((el) => el.type === "image"),
          hasCustomText: canvasElements.some((el) => el.type === "text"),
        },
        urgencyLevel: "NORMAL",
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
  }, [selectedTemplate, selectedVariant, canvasElements, calculatePrice]);

  const handleUploadArtwork = useCallback(
    (file: File) => {
      if (!canvasId) {
        toast.error("Canvas not configured yet");
        return;
      }

      // Check media restrictions
      if (mediaRestrictions && mediaRestrictions.length > 0) {
        const restrictions = mediaRestrictions.find((r) => r.isActive);
        if (restrictions) {
          const fileExtension = file.name.split(".").pop()?.toLowerCase();

          if (file.size > restrictions.maxFileSize) {
            toast.error(
              `File size exceeds maximum allowed: ${restrictions.maxFileSize / 1024 / 1024}MB`
            );
            return;
          }

          if (
            fileExtension &&
            !restrictions.allowedFormats.includes(fileExtension)
          ) {
            toast.error(
              `File format not allowed. Allowed formats: ${restrictions.allowedFormats.join(", ")}`
            );
            return;
          }
        }
      }

      const artworkData = artworkForm.getValues();
      uploadArtwork.mutate(
        { file, values: artworkData },
        {
          onSuccess: (response) => {
            // Add the uploaded artwork as an image element
            const newElement: CanvasElement = {
              id: `artwork-${Date.now()}`,
              type: "image",
              x: 100,
              y: 100,
              width: 200,
              height: 200,
              mediaId: response.mediaId,
            };
            setCanvasElements((prev) => [...prev, newElement]);
            toast.success("Artwork uploaded and added to design");
          },
          onError: (error) => {
            console.error("Failed to upload artwork:", error);
            onError?.(error as Error);
          },
        }
      );
    },
    [canvasId, mediaRestrictions, artworkForm, uploadArtwork, onError]
  );

  const handleUploadAsset = useCallback(
    (file: File) => {
      const assetData = assetForm.getValues();
      if (!assetData.name) {
        toast.error("Please enter an asset name");
        return;
      }

      uploadAsset.mutate(
        { file, assetData },
        {
          onSuccess: () => {
            toast.success("Asset uploaded successfully");
            assetForm.reset();
          },
          onError: (error) => {
            console.error("Failed to upload asset:", error);
            onError?.(error as Error);
          },
        }
      );
    },
    [assetForm, uploadAsset, onError]
  );

  const handleBackToTemplates = useCallback(() => {
    if (onBack) {
      onBack();
    } else if (templateId) {
      router.back();
    } else {
      setSelectedTemplate(null);
      setIsDesigning(false);
    }
  }, [onBack, templateId, router]);

  const handleSaveDesign = useCallback(() => {
    const formData = designForm.getValues();
    const designData: CreateDesignDto | UpdateDesignDto = {
      ...formData,
      customizations: {
        ...formData.customizations,
        elements: canvasElements,
      },
    };

    if (currentDesign) {
      // Update existing design
      updateDesign.mutate(
        { designId: currentDesign.id, values: designData as UpdateDesignDto },
        {
          onSuccess: (response) => {
            setCurrentDesign(response);
            onSave?.(response);
            toast.success("Design saved successfully");
          },
          onError: (error) => {
            console.error("Failed to update design:", error);
            onError?.(error as Error);
          },
        }
      );
    } else {
      // Create new design
      createDesign.mutate(designData as CreateDesignDto, {
        onSuccess: (response) => {
          setCurrentDesign(response);
          onSave?.(response);
          toast.success("Design created successfully");
        },
        onError: (error) => {
          console.error("Failed to create design:", error);
          onError?.(error as Error);
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
    onError,
  ]);

  const handleExportDesign = useCallback(() => {
    if (!currentDesign) {
      toast.error("Please save your design first");
      return;
    }

    const exportData = exportForm.getValues();
    exportDesign.mutate(
      { designId: currentDesign.id, values: exportData },
      {
        onSuccess: (response) => {
          onDownload?.(response);
          toast.success("Design exported successfully");
        },
        onError: (error) => {
          console.error("Failed to export design:", error);
          onError?.(error as Error);
        },
      }
    );
  }, [currentDesign, exportForm, exportDesign, onDownload, onError]);

  // Additional helper functions for element management
  const addTextElement = useCallback(() => {
    const defaultFont = selectedFontPreset?.family || "Arial";
    const defaultColor = selectedColorPreset?.hexCode || "#000000";

    const newElement: CanvasElement = {
      id: `text-${Date.now()}`,
      type: "text",
      x: 100,
      y: 100,
      width: 200,
      height: 40,
      content: "Your Text Here",
      font: defaultFont,
      fontSize: 16,
      fontWeight: "normal",
      color: defaultColor,
    };

    setCanvasElements((prev) => [...prev, newElement]);
    setSelectedElement(newElement);
  }, [selectedFontPreset, selectedColorPreset]);

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
    const defaultColor = selectedColorPreset?.hexCode || "#0066cc";

    const newElement: CanvasElement = {
      id: `shape-${Date.now()}`,
      type: "shape",
      x: 200,
      y: 200,
      width: 100,
      height: 100,
      shapeType: "rectangle",
      color: defaultColor,
    };

    setCanvasElements((prev) => [...prev, newElement]);
    setSelectedElement(newElement);
  }, [selectedColorPreset]);

  const updateElement = useCallback(
    (elementId: string, updates: Partial<CanvasElement>) => {
      setCanvasElements((prev) =>
        prev.map((el) => (el.id === elementId ? { ...el, ...updates } : el))
      );

      if (selectedElement?.id === elementId) {
        setSelectedElement((prev) => (prev ? { ...prev, ...updates } : null));
      }
    },
    [selectedElement]
  );

  const deleteElement = useCallback(
    (elementId: string) => {
      setCanvasElements((prev) => prev.filter((el) => el.id !== elementId));
      if (selectedElement?.id === elementId) {
        setSelectedElement(null);
      }
    },
    [selectedElement]
  );

  // Loading state
  if (templateId && (templateLoading || designLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading template...</p>
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

  // Show template selection if no template selected
  if (!selectedTemplate || !isDesigning) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Select a Template</h2>
            <p className="text-gray-600 mb-6">
              Choose a template to start designing
            </p>
            <Button onClick={() => router.push("/templates")}>
              Browse Templates
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            {showBackToTemplates && (
              <Button variant="ghost" onClick={handleBackToTemplates}>
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Templates
              </Button>
            )}
            <div
              className={cn(
                showBackToTemplates && "border-l border-gray-300 pl-4"
              )}
            >
              <h1 className="text-lg font-semibold text-gray-900">
                {selectedTemplate.name}
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{selectedTemplate.category.name}</span>
                <span>•</span>
                <span>{selectedTemplate.product.name}</span>
                {selectedVariant && (
                  <>
                    <span>•</span>
                    <span>{selectedVariant.displayName}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Price Display */}
            {priceCalculation && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-md">
                <DollarSign className="w-4 h-4" />
                <span className="font-medium">
                  ${priceCalculation.totalPrice.toFixed(2)}
                </span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
            >
              <Grid className="w-4 h-4 mr-2" />
              Grid
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreviewMode ? "Edit" : "Preview"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!currentDesign) {
                  toast.error("Please save your design first");
                  return;
                }
                validateDesign.mutate(
                  {
                    designId: currentDesign.id,
                    values: {
                      checkPrintReadiness: true,
                      checkConstraints: true,
                      checkAssetQuality: true,
                    },
                  },
                  {
                    onError: (error) => {
                      console.error("Failed to validate design:", error);
                      onError?.(error as Error);
                    },
                  }
                );
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Validate
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!currentDesign) {
                  toast.error("Please save your design first");
                  return;
                }
                shareDesign.mutate(
                  {
                    designId: currentDesign.id,
                    values: {
                      allowDownload: true,
                      note: "Shared design from studio",
                    },
                  },
                  {
                    onError: (error) => {
                      console.error("Failed to share design:", error);
                      onError?.(error as Error);
                    },
                  }
                );
              }}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>

            <Button
              variant="outline"
              onClick={handleSaveDesign}
              disabled={createDesign.isPending || updateDesign.isPending}
            >
              {createDesign.isPending || updateDesign.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Design</DialogTitle>
                  <DialogDescription>
                    Choose your export settings
                  </DialogDescription>
                </DialogHeader>
                <Form {...exportForm}>
                  <form
                    onSubmit={exportForm.handleSubmit(handleExportDesign)}
                    className="space-y-4"
                  >
                    <FormField
                      control={exportForm.control}
                      name="format"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Format</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="png">PNG</SelectItem>
                              <SelectItem value="jpg">JPG</SelectItem>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="svg">SVG</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={exportForm.control}
                      name="quality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quality</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="print">
                                Print Quality
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={exportForm.control}
                      name="showMockup"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Include Mockup</FormLabel>
                            <FormDescription>
                              Show the design on the product
                            </FormDescription>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={exportDesign.isPending}
                    >
                      {exportDesign.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        "Export Design"
                      )}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Design Tools */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Design Tools
            </h2>
          </div>

          <Tabs defaultValue="elements" className="flex-1">
            <TabsList className="grid w-full grid-cols-4 mx-4 mt-4">
              <TabsTrigger value="elements">Elements</TabsTrigger>
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="elements" className="p-4 space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Add Elements</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={addTextElement}>
                    <Type className="w-4 h-4 mr-2" />
                    Text
                  </Button>
                  <Button variant="outline" size="sm" onClick={addImageElement}>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Image
                  </Button>
                  <Button variant="outline" size="sm" onClick={addShapeElement}>
                    <Square className="w-4 h-4 mr-2" />
                    Shape
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Artwork</DialogTitle>
                        <DialogDescription>
                          Upload an image to add to your design
                        </DialogDescription>
                      </DialogHeader>

                      <Form {...artworkForm}>
                        <form className="space-y-4">
                          <FormField
                            control={artworkForm.control}
                            name="canvasId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Canvas ID</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Canvas ID will be auto-filled"
                                    readOnly
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <div>
                            <label className="text-sm font-medium">
                              Select Artwork File
                            </label>
                            <input
                              type="file"
                              accept="image/*,application/pdf,.svg"
                              className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setUploadedFiles([file]);
                                }
                              }}
                            />
                            {uploadedFiles.length > 0 && (
                              <p className="mt-1 text-sm text-gray-600">
                                Selected: {uploadedFiles[0].name}
                              </p>
                            )}
                          </div>
                          <FormField
                            control={artworkForm.control}
                            name="position"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Position</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="center">
                                      Center
                                    </SelectItem>
                                    <SelectItem value="top-left">
                                      Top Left
                                    </SelectItem>
                                    <SelectItem value="top-right">
                                      Top Right
                                    </SelectItem>
                                    <SelectItem value="bottom-left">
                                      Bottom Left
                                    </SelectItem>
                                    <SelectItem value="bottom-right">
                                      Bottom Right
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            className="w-full"
                            onClick={() => {
                              if (uploadedFiles.length > 0) {
                                handleUploadArtwork(uploadedFiles[0]);
                              } else {
                                toast.error("Please select a file first");
                              }
                            }}
                            disabled={
                              !canvasId ||
                              uploadedFiles.length === 0 ||
                              uploadArtwork.isPending
                            }
                          >
                            {uploadArtwork.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              "Add to Design"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Elements List */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <Layers className="w-4 h-4 mr-2" />
                  Layers ({canvasElements.length})
                </h3>
                <div className="space-y-1">
                  {canvasElements.map((element) => (
                    <div
                      key={element.id}
                      className={cn(
                        "p-2 rounded border cursor-pointer transition-colors",
                        selectedElement?.id === element.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => setSelectedElement(element)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {element.type}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteElement(element.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      {element.content && (
                        <p className="text-xs text-gray-600 truncate">
                          {element.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="presets" className="p-4 space-y-4">
              {/* Color Presets */}
              {colorPresets && colorPresets.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Color Presets</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {colorPresets
                      .filter((color) => color.isActive)
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((color) => (
                        <button
                          key={color.id}
                          onClick={() => setSelectedColorPreset(color)}
                          className={cn(
                            "w-12 h-12 rounded-lg border-2 transition-all",
                            selectedColorPreset?.id === color.id
                              ? "border-blue-500 scale-110"
                              : "border-gray-300 hover:border-gray-400"
                          )}
                          style={{ backgroundColor: color.hexCode }}
                          title={color.name}
                        />
                      ))}
                  </div>
                  {selectedColorPreset && (
                    <div className="text-xs text-gray-600">
                      <p className="font-medium">{selectedColorPreset.name}</p>
                      <p>{selectedColorPreset.hexCode}</p>
                      {selectedColorPreset.pantoneCode && (
                        <p>Pantone: {selectedColorPreset.pantoneCode}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Font Presets */}
              {fontPresets && fontPresets.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Font Presets</h3>
                  <div className="space-y-2">
                    {fontPresets
                      .filter((font) => font.isActive)
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((font) => (
                        <button
                          key={font.id}
                          onClick={() => setSelectedFontPreset(font)}
                          className={cn(
                            "w-full text-left p-3 rounded-lg border transition-colors",
                            selectedFontPreset?.id === font.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <div className="font-medium text-gray-900">
                            {font.displayName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {font.family} • {font.category}
                            {font.isPremium && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                Premium
                              </Badge>
                            )}
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="assets" className="p-4">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Upload Assets</h3>
                <Form {...assetForm}>
                  <form className="space-y-4">
                    <FormField
                      control={assetForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asset Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter asset name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={assetForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asset Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="logo">Logo</SelectItem>
                              <SelectItem value="background">
                                Background
                              </SelectItem>
                              <SelectItem value="texture">Texture</SelectItem>
                              <SelectItem value="icon">Icon</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <div>
                      <label className="text-sm font-medium">Select File</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedFiles([file]);
                          }
                        }}
                      />
                      {uploadedFiles.length > 0 && (
                        <p className="mt-1 text-sm text-gray-600">
                          Selected: {uploadedFiles[0].name}
                        </p>
                      )}
                    </div>

                    <FormField
                      control={assetForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Asset description"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => {
                        if (uploadedFiles.length > 0) {
                          handleUploadAsset(uploadedFiles[0]);
                        } else {
                          toast.error("Please select a file first");
                        }
                      }}
                      disabled={
                        uploadedFiles.length === 0 ||
                        !assetForm.getValues("name") ||
                        uploadAsset.isPending
                      }
                    >
                      {uploadAsset.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Upload Asset"
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="p-4">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Design Settings</h3>
                <Form {...designForm}>
                  <div className="space-y-4">
                    <FormField
                      control={designForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Design Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={designForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>

                {/* Size Variants */}
                {sizeVariants && sizeVariants.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Size Options</h4>
                    <div className="space-y-2">
                      {sizeVariants
                        .filter((variant) => variant.isActive)
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((variant) => (
                          <button
                            key={variant.id}
                            onClick={() => {
                              setSelectedVariant(variant);
                              designForm.setValue("sizeVariantId", variant.id);

                              // Update canvas dimensions
                              if (variant.dimensions) {
                                designForm.setValue(
                                  "customizations.width",
                                  variant.dimensions.width
                                );
                                designForm.setValue(
                                  "customizations.height",
                                  variant.dimensions.height
                                );
                              }
                            }}
                            className={cn(
                              "w-full text-left p-3 rounded-lg border transition-colors",
                              selectedVariant?.id === variant.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            )}
                          >
                            <div className="font-medium text-gray-900">
                              {variant.displayName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {variant.dimensions && (
                                <span>
                                  {variant.dimensions.width} ×{" "}
                                  {variant.dimensions.height}{" "}
                                  {variant.dimensions.unit} @{" "}
                                  {variant.dimensions.dpi} DPI
                                </span>
                              )}
                              {variant.price > 0 && (
                                <span className="ml-2 font-medium text-green-600">
                                  +${variant.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                            {variant.metadata?.printArea && (
                              <div className="text-xs text-gray-500 mt-1">
                                Print area: {variant.metadata.printArea.width} ×{" "}
                                {variant.metadata.printArea.height}
                              </div>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-hidden">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full mx-4">
            <div className="flex flex-col items-center space-y-4">
              {/* Canvas Controls */}
              <div className="flex items-center space-x-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCanvasZoom(Math.max(0.25, canvasZoom - 0.25))
                  }
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium min-w-[60px] text-center">
                  {Math.round(canvasZoom * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCanvasZoom(Math.min(3, canvasZoom + 0.25))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>

              {/* Canvas */}
              <div
                ref={containerRef}
                className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
                style={{
                  width:
                    (designForm.getValues("customizations.width") || 800) *
                    canvasZoom,
                  height:
                    (designForm.getValues("customizations.height") || 600) *
                    canvasZoom,
                  backgroundImage: showGrid
                    ? `radial-gradient(circle, #e5e5e5 1px, transparent 1px)`
                    : "none",
                  backgroundSize: showGrid
                    ? `${20 * canvasZoom}px ${20 * canvasZoom}px`
                    : "auto",
                }}
              >
                <div
                  ref={canvasRef}
                  className="relative w-full h-full bg-white"
                  style={{
                    backgroundColor:
                      designForm.getValues("customizations.backgroundColor") ||
                      "#ffffff",
                    transform: `scale(${canvasZoom})`,
                    transformOrigin: "top left",
                    width: designForm.getValues("customizations.width") || 800,
                    height:
                      designForm.getValues("customizations.height") || 600,
                  }}
                >
                  {/* Render Canvas Elements */}
                  {canvasElements.map((element) => (
                    <Rnd
                      key={element.id}
                      position={{ x: element.x, y: element.y }}
                      size={{ width: element.width, height: element.height }}
                      onDragStop={(e, data) => {
                        updateElement(element.id, {
                          x: data.x,
                          y: data.y,
                        });
                      }}
                      onResizeStop={(e, direction, ref, delta, position) => {
                        updateElement(element.id, {
                          x: position.x,
                          y: position.y,
                          width: parseInt(ref.style.width),
                          height: parseInt(ref.style.height),
                        });
                      }}
                      disableDragging={isPreviewMode}
                      enableResizing={!isPreviewMode}
                      className={cn(
                        selectedElement?.id === element.id && !isPreviewMode
                          ? "border-2 border-blue-500"
                          : "border-2 border-transparent"
                      )}
                      onClick={() =>
                        !isPreviewMode && setSelectedElement(element)
                      }
                    >
                      <div className="w-full h-full">
                        {element.type === "text" && (
                          <div
                            style={{
                              fontFamily: element.font,
                              fontSize: element.fontSize,
                              fontWeight: element.fontWeight,
                              color: element.color,
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {element.content}
                          </div>
                        )}

                        {element.type === "shape" && (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              backgroundColor: element.color,
                              borderRadius:
                                element.shapeType === "circle" ? "50%" : "0",
                            }}
                          />
                        )}

                        {element.type === "image" && element.mediaId && (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </Rnd>
                  ))}

                  {canvasElements.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Palette className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Start creating your design</p>
                        <p className="text-sm">
                          Add text, images, or shapes from the toolbar
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Template Preview */}
              <div className="text-center">
                <img
                  src={selectedTemplate.thumbnail}
                  alt={selectedTemplate.name}
                  className="max-w-sm max-h-48 mx-auto rounded-lg shadow-sm mb-4"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
                <p className="text-gray-600 text-lg font-medium">
                  {selectedTemplate.name}
                </p>
                {selectedVariant && (
                  <p className="text-gray-500 text-sm mt-1">
                    Size: {selectedVariant.displayName}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties Panel */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
          </div>

          <div className="p-4">
            {selectedElement ? (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 capitalize">
                  {selectedElement.type} Properties
                </h3>

                {/* Common Properties */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600">
                        X Position
                      </label>
                      <Input
                        type="number"
                        value={selectedElement.x}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            x: Number(e.target.value),
                          })
                        }
                        className="h-8"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">
                        Y Position
                      </label>
                      <Input
                        type="number"
                        value={selectedElement.y}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            y: Number(e.target.value),
                          })
                        }
                        className="h-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600">Width</label>
                      <Input
                        type="number"
                        value={selectedElement.width}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            width: Number(e.target.value),
                          })
                        }
                        className="h-8"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Height</label>
                      <Input
                        type="number"
                        value={selectedElement.height}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            height: Number(e.target.value),
                          })
                        }
                        className="h-8"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">
                      Rotation (degrees)
                    </label>
                    <Input
                      type="number"
                      value={selectedElement.rotation || 0}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          rotation: Number(e.target.value),
                        })
                      }
                      className="h-8"
                    />
                  </div>
                </div>

                {/* Text-specific Properties */}
                {selectedElement.type === "text" && (
                  <div className="space-y-3 border-t pt-4">
                    <h4 className="font-medium text-gray-900">
                      Text Properties
                    </h4>

                    <div>
                      <label className="text-xs text-gray-600">Content</label>
                      <Textarea
                        value={selectedElement.content || ""}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            content: e.target.value,
                          })
                        }
                        className="h-20"
                        placeholder="Enter text content"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-600">
                        Font Family
                      </label>
                      <Select
                        value={selectedElement.font}
                        onValueChange={(value) =>
                          updateElement(selectedElement.id, { font: value })
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontPresets
                            ?.filter((f) => f.isActive)
                            .map((font) => (
                              <SelectItem key={font.id} value={font.family}>
                                {font.displayName}
                                {font.isPremium && " (Premium)"}
                              </SelectItem>
                            ))}

                          {fonts?.map((font: Font) => (
                            <SelectItem key={font.id} value={font.family}>
                              {font.displayName}
                            </SelectItem>
                          )) || [
                            <SelectItem key="arial" value="Arial">
                              Arial
                            </SelectItem>,
                            <SelectItem key="helvetica" value="Helvetica">
                              Helvetica
                            </SelectItem>,
                            <SelectItem key="times" value="Times New Roman">
                              Times New Roman
                            </SelectItem>,
                          ]}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600">
                          Font Size
                        </label>
                        <Input
                          type="number"
                          value={selectedElement.fontSize || 16}
                          onChange={(e) =>
                            updateElement(selectedElement.id, {
                              fontSize: Number(e.target.value),
                            })
                          }
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">
                          Font Weight
                        </label>
                        <Select
                          value={selectedElement.fontWeight}
                          onValueChange={(value) =>
                            updateElement(selectedElement.id, {
                              fontWeight: value,
                            })
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="bold">Bold</SelectItem>
                            <SelectItem value="lighter">Light</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-600">
                        Text Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={selectedElement.color || "#000000"}
                          onChange={(e) =>
                            updateElement(selectedElement.id, {
                              color: e.target.value,
                            })
                          }
                          className="h-8 w-16"
                        />
                        <Input
                          type="text"
                          value={selectedElement.color || "#000000"}
                          onChange={(e) =>
                            updateElement(selectedElement.id, {
                              color: e.target.value,
                            })
                          }
                          className="h-8 flex-1"
                          placeholder="#000000"
                        />
                      </div>

                      {/* Color Presets */}
                      {colorPresets && colorPresets.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-600 mb-1">
                            Preset Colors:
                          </div>
                          <div className="grid grid-cols-6 gap-1">
                            {colorPresets
                              .filter((c) => c.isActive)
                              .map((color) => (
                                <button
                                  key={color.id}
                                  onClick={() =>
                                    updateElement(selectedElement.id, {
                                      color: color.hexCode,
                                    })
                                  }
                                  className="w-6 h-6 rounded border border-gray-300"
                                  style={{ backgroundColor: color.hexCode }}
                                  title={color.name}
                                />
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Shape-specific Properties */}
                {selectedElement.type === "shape" && (
                  <div className="space-y-3 border-t pt-4">
                    <h4 className="font-medium text-gray-900">
                      Shape Properties
                    </h4>

                    <div>
                      <label className="text-xs text-gray-600">
                        Shape Type
                      </label>
                      <Select
                        value={selectedElement.shapeType}
                        onValueChange={(value) =>
                          updateElement(selectedElement.id, {
                            shapeType: value,
                          })
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rectangle">Rectangle</SelectItem>
                          <SelectItem value="circle">Circle</SelectItem>
                          <SelectItem value="triangle">Triangle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-600">
                        Fill Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={selectedElement.color || "#0066cc"}
                          onChange={(e) =>
                            updateElement(selectedElement.id, {
                              color: e.target.value,
                            })
                          }
                          className="h-8 w-16"
                        />
                        <Input
                          type="text"
                          value={selectedElement.color || "#0066cc"}
                          onChange={(e) =>
                            updateElement(selectedElement.id, {
                              color: e.target.value,
                            })
                          }
                          className="h-8 flex-1"
                          placeholder="#0066cc"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Image-specific Properties */}
                {selectedElement.type === "image" && (
                  <div className="space-y-3 border-t pt-4">
                    <h4 className="font-medium text-gray-900">
                      Image Properties
                    </h4>

                    <div>
                      <label className="text-xs text-gray-600">
                        Upload Image File
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        className="mt-1 block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleUploadArtwork(file);
                          }
                        }}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Upload an image file to use in this element
                      </p>
                    </div>

                    <div>
                      <label className="text-xs text-gray-600">Media ID</label>
                      <Input
                        type="text"
                        value={selectedElement.mediaId || ""}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            mediaId: e.target.value,
                          })
                        }
                        className="h-8"
                        placeholder="Enter media ID"
                      />
                    </div>
                  </div>
                )}

                {/* Delete Element Button */}
                <div className="border-t pt-4">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteElement(selectedElement.id)}
                    className="w-full"
                  >
                    Delete Element
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <div className="mb-4">
                  <Square className="w-12 h-12 mx-auto text-gray-300" />
                </div>
                <p className="text-sm">
                  Select an element to edit its properties
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Click on any element in the canvas to start editing
                </p>
              </div>
            )}

            {/* Canvas Settings */}
            <div className="mt-6 pt-4 border-t">
              <h3 className="font-medium text-gray-900 mb-3">
                Canvas Settings
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600">
                    Background Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={designForm.getValues(
                        "customizations.backgroundColor"
                      )}
                      onChange={(e) => {
                        designForm.setValue(
                          "customizations.backgroundColor",
                          e.target.value
                        );
                        setCanvasElements([...canvasElements]);
                      }}
                      className="h-8 w-16"
                    />
                    <Input
                      type="text"
                      value={designForm.getValues(
                        "customizations.backgroundColor"
                      )}
                      onChange={(e) => {
                        designForm.setValue(
                          "customizations.backgroundColor",
                          e.target.value
                        );
                        setCanvasElements([...canvasElements]);
                      }}
                      className="h-8 flex-1"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-600">
                      Canvas Width
                    </label>
                    <Input
                      type="number"
                      value={designForm.getValues("customizations.width")}
                      onChange={(e) => {
                        designForm.setValue(
                          "customizations.width",
                          Number(e.target.value)
                        );
                        setCanvasElements([...canvasElements]);
                      }}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">
                      Canvas Height
                    </label>
                    <Input
                      type="number"
                      value={designForm.getValues("customizations.height")}
                      onChange={(e) => {
                        designForm.setValue(
                          "customizations.height",
                          Number(e.target.value)
                        );
                        setCanvasElements([...canvasElements]);
                      }}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Template Information */}
            {selectedTemplate && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Product Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Template:</span>
                    <span className="font-medium">{selectedTemplate.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">
                      {selectedTemplate.category.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product:</span>
                    <span className="font-medium">
                      {selectedTemplate.product.name}
                    </span>
                  </div>
                  {selectedVariant && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span className="font-medium">
                          {selectedVariant.displayName}
                        </span>
                      </div>
                      {selectedVariant.dimensions && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dimensions:</span>
                          <span className="font-medium">
                            {selectedVariant.dimensions.width} ×{" "}
                            {selectedVariant.dimensions.height}{" "}
                            {selectedVariant.dimensions.unit}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price:</span>
                    <span className="font-medium">
                      ${selectedTemplate.basePrice.toFixed(2)}
                    </span>
                  </div>
                  {selectedVariant && selectedVariant.price > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size Adjustment:</span>
                      <span className="font-medium">
                        +${selectedVariant.price.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {priceCalculation && (
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-gray-600 font-medium">
                        Total Price:
                      </span>
                      <span className="font-bold text-green-600">
                        ${priceCalculation.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {selectedTemplate.metadata?.tags &&
                    selectedTemplate.metadata.tags.length > 0 && (
                      <div className="mt-3">
                        <span className="text-gray-600 text-xs">Tags:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedTemplate.metadata.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
