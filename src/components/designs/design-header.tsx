"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Download,
  Share2,
  Eye,
  Loader2,
  Clock,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { useDesignContext } from "./design-context";
import { useCreateDesign, useUpdateDesign } from "@/hooks/use-design-studio";
import {
  CreateDesignDto,
  UpdateDesignDto,
} from "@/lib/design-studio/dto/design-studio.dto";
import { TemplateResponse } from "@/lib/design-templates/types/design-template.types";

interface DesignHeaderProps {
  templateId?: string;
  template?: TemplateResponse;
  templateName: string;
  categoryName: string;
  productName: string;
  sizeVariantName?: string;
  totalPrice?: number;
  onBack?: () => void;
  showBackButton?: boolean;
  designId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave?: (design: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onExport?: (data: any) => void;
}

export default function DesignHeader({
  templateId,
  templateName,
  categoryName,
  productName,
  sizeVariantName,
  totalPrice,
  onBack,
  showBackButton = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  designId,
  onSave,
  onExport,
}: DesignHeaderProps) {
  const router = useRouter();
  const {
    design,
    elements,
    canvasSettings,
    isPreviewMode,
    isDirty,
    lastSaved,
    dispatch,
  } = useDesignContext();

  const createDesign = useCreateDesign();
  const updateDesign = useUpdateDesign();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleSave = async () => {
    if (!templateId) {
      toast.error("Template ID not found");
      return;
    }

    if (!design) {
      const createData: CreateDesignDto = {
        name: `Design - ${templateName}`,
        description: `Custom design for ${productName}`,
        templateId: templateId,
        customizations: {
          width: canvasSettings.width,
          height: canvasSettings.height,
          backgroundColor: canvasSettings.backgroundColor,
          elements,
        },
        status: "DRAFT",
        isTemplate: false,
        isPublic: false,
      };

      createDesign.mutate(createData, {
        onSuccess: (response) => {
          dispatch({ type: "SET_DESIGN", payload: response });
          onSave?.(response);
          toast.success("Design saved successfully");
        },
        onError: (error) => {
          toast.error(`Failed to save design: ${error.message}`);
        },
      });
    } else {
      const updateData: UpdateDesignDto = {
        customizations: {
          width: canvasSettings.width,
          height: canvasSettings.height,
          backgroundColor: canvasSettings.backgroundColor,
          elements,
        },
      };

      updateDesign.mutate(
        { designId: design.id, values: updateData },
        {
          onSuccess: (response) => {
            dispatch({ type: "SET_DESIGN", payload: response });
            onSave?.(response);
            toast.success("Design updated successfully");
          },
          onError: (error) => {
            toast.error(`Failed to update design: ${error.message}`);
          },
        }
      );
    }
  };

  const togglePreviewMode = () => {
    dispatch({ type: "SET_PREVIEW_MODE", payload: !isPreviewMode });
  };

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            )}

            <div
              className={cn(showBackButton && "border-l border-border pl-4")}
            >
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Design Studio
              </h1>
              <p className="text-muted-foreground">
                Design your custom template with text, images, and graphics
              </p>

              <div className="flex items-center space-x-2 mt-2">
                <span className="text-sm text-muted-foreground">
                  {templateName}
                </span>
                <span className="text-sm text-muted-foreground/60">•</span>
                <span className="text-sm text-muted-foreground">
                  {categoryName}
                </span>
                <span className="text-sm text-muted-foreground/60">•</span>
                <span className="text-sm text-muted-foreground">
                  {productName}
                </span>
                {sizeVariantName && (
                  <>
                    <span className="text-sm text-muted-foreground/60">•</span>
                    <span className="text-sm text-muted-foreground">
                      {sizeVariantName}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-2 mt-2">
                {isDirty && (
                  <Badge
                    variant="outline"
                    className="text-xs border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-300"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Unsaved Changes
                  </Badge>
                )}

                {lastSaved && (
                  <Badge variant="secondary" className="text-xs">
                    Saved {new Date(lastSaved).toLocaleTimeString()}
                  </Badge>
                )}

                {elements.length > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-green-200 text-green-700 dark:border-green-800 dark:text-green-300"
                  >
                    {elements.length} Element{elements.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {totalPrice && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                <DollarSign className="w-4 h-4" />
                <span className="font-medium">${totalPrice.toFixed(2)}</span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePreviewMode}
                className={cn(
                  isPreviewMode &&
                    "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-950/50"
                )}
              >
                <Eye className="w-4 h-4 mr-2" />
                {isPreviewMode ? "Edit" : "Preview"}
              </Button>

              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>

              <Button
                variant="outline"
                onClick={handleSave}
                disabled={createDesign.isPending || updateDesign.isPending}
                className={cn(
                  isDirty &&
                    "border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-950/30"
                )}
              >
                {createDesign.isPending || updateDesign.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save
              </Button>

              <Button
                onClick={() => onExport?.({})}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
