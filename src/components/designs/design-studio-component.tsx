/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
} from "lucide-react";
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

// Original template hooks
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
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
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
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TemplateSelectionPage from "@/components/designs/template-selection";

interface DesignStudioComponentProps {
  templateSlug?: string;
  template?: DesignTemplate;
  productId?: string;
  categoryId?: string;
  showBackToTemplates?: boolean;
  designId?: string; // For editing existing designs
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

  // Design Studio hooks
  const configureCanvas = useConfigureCanvas();
  const uploadArtwork = useUploadArtwork();
  const createDesign = useCreateDesign();
  const updateDesign = useUpdateDesign();
  const exportDesign = useExportDesign();
  const validateDesign = useValidateDesign();
  const shareDesign = useShareDesign();
  const uploadAsset = useUploadAsset();

  // Template data hooks
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

  // Set template from slug fetch
  useEffect(() => {
    if (templateFromSlug && !providedTemplate) {
      setSelectedTemplate(templateFromSlug);
      setIsDesigning(true);
    }
  }, [templateFromSlug, providedTemplate]);

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

      // Configure canvas
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
  ]);

  const handleUploadArtwork = (file: File) => {
    if (!canvasId) {
      toast.error("Canvas not configured yet");
      return;
    }

    const artworkData = artworkForm.getValues();
    uploadArtwork.mutate(
      {
        file,
        values: artworkData,
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            // Add the uploaded artwork as an image element
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
      {
        file,
        assetData,
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            toast.success("Asset uploaded successfully");
            // Reset form
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
      // Update existing design
      updateDesign.mutate(
        {
          designId: currentDesign.id,
          values: designData,
        },
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
      // Create new design
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
      {
        designId: currentDesign.id,
        values: exportData,
      },
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
  if (templateSlug && templateLoading) {
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
              className={`${showBackToTemplates ? "border-l border-gray-300 pl-4" : ""}`}
            >
              <h1 className="text-lg font-semibold text-gray-900">
                {selectedTemplate.name}
              </h1>
              <p className="text-sm text-gray-500">
                {selectedTemplate.category.name} •{" "}
                {selectedTemplate.product.name}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreviewMode ? "Edit" : "Preview"}
            </Button>

            <Button variant="outline" size="sm" onClick={handleValidateDesign}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Validate
            </Button>

            <Button variant="outline" size="sm" onClick={handleShareDesign}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>

            <Button variant="outline" onClick={handleSaveDesign}>
              <Save className="w-4 h-4 mr-2" />
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

                    <Button type="submit" className="w-full">
                      Export Design
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
            <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
              <TabsTrigger value="elements">Elements</TabsTrigger>
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
                            disabled={!canvasId || uploadedFiles.length === 0}
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
                      className={`p-2 rounded border cursor-pointer transition-colors ${
                        selectedElement?.id === element.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
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
                          ×
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
                        !assetForm.getValues("name")
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
                        .map((variant) => (
                          <button
                            key={variant.id}
                            onClick={() => setSelectedVariant(variant)}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                              selectedVariant?.id === variant.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="font-medium text-gray-900">
                              {variant.displayName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {variant.dimensions && (
                                <span>
                                  {variant.dimensions.width} ×{" "}
                                  {variant.dimensions.height}{" "}
                                  {variant.dimensions.unit}
                                </span>
                              )}
                              {variant.price > 0 && (
                                <span className="ml-2 font-medium">
                                  ${variant.price.toFixed(2)}
                                </span>
                              )}
                            </div>
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
              {/* Canvas */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative bg-white overflow-hidden"
                style={{
                  backgroundColor: designForm.getValues(
                    "customizations.backgroundColor"
                  ),
                  width: `${designForm.getValues("customizations.width")}px`,
                  height: `${designForm.getValues("customizations.height")}px`,
                  maxWidth: "800px",
                  maxHeight: "600px",
                }}
              >
                {/* Render Canvas Elements */}
                {canvasElements.map((element) => (
                  <div
                    key={element.id}
                    className={`absolute cursor-pointer border-2 ${
                      selectedElement?.id === element.id
                        ? "border-blue-500"
                        : "border-transparent hover:border-gray-300"
                    }`}
                    style={{
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                      transform: element.rotation
                        ? `rotate(${element.rotation}deg)`
                        : undefined,
                    }}
                    onClick={() => setSelectedElement(element)}
                  >
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
                ))}

                {canvasElements.length === 0 && (
                  <div className="text-center text-gray-500">
                    <Palette className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Start creating your design</p>
                    <p className="text-sm">
                      Add text, images, or shapes from the toolbar
                    </p>
                  </div>
                )}
              </div>

              {/* Template Preview */}
              <div className="text-center">
                <img
                  src={selectedTemplate.previewImage}
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
                          {fonts?.map((font) => (
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
                            // Upload file and update element with media ID
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
                        // Force re-render
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
            {selectedVariant && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-medium text-gray-900 mb-3">
                  Product Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Template:</span>
                    <span className="font-medium">{selectedTemplate.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">
                      {selectedVariant.displayName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price:</span>
                    <span className="font-medium">
                      ${selectedTemplate.basePrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Variant Price:</span>
                    <span className="font-medium">
                      ${selectedVariant.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Material:</span>
                    <span className="font-medium">
                      {selectedTemplate.materials.base}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lead Time:</span>
                    <span className="font-medium">
                      {selectedTemplate.leadTime}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
