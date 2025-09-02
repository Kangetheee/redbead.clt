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
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

import { useDesignContext } from "./design-context";
import { useCreateDesign, useUpdateDesign } from "@/hooks/use-design-studio";
import {
  CreateDesignDto,
  UpdateDesignDto,
} from "@/lib/design-studio/dto/design-studio.dto";
import { TemplateResponse } from "@/lib/design-templates/types/design-template.types";
import { CustomizationChoiceDto } from "@/lib/cart/dto/cart.dto";

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
  // Add to cart props
  showAddToCart?: boolean;
  productId?: string;
  variantId?: string;
  cartQuantity?: number;
  cartCustomizations?: CustomizationChoiceDto[];
  onAddToCart?: () => void;
}

export default function DesignHeader({
  templateId,
  templateName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  categoryName,
  productName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sizeVariantName,
  totalPrice,
  onBack,
  showBackButton = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  designId,
  onSave,
  onExport,
  showAddToCart = true,
  productId,
  variantId,
  cartQuantity = 1,
  cartCustomizations = [],
  onAddToCart,
}: DesignHeaderProps) {
  const router = useRouter();
  const {
    design,
    elements,
    canvasSettings,
    isPreviewMode,
    isDirty,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const handleAddToCartSuccess = () => {
    onAddToCart?.();
    toast.success("Design added to cart!");
  };

  return (
    <div className="relative bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-8 -left-8 w-32 h-32 bg-gradient-to-br from-pink-100 to-orange-100 dark:from-pink-900/20 dark:to-orange-900/20 rounded-full blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Left Section */}
          {showBackButton && (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="group hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Back
            </Button>
          )}
          <div className="flex items-center justify-between">
            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Price display with enhanced styling */}
              {totalPrice && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 px-4 py-2.5 rounded-xl shadow-sm">
                  <div className="p-1 bg-emerald-500 rounded-lg">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Total
                    </span>
                    <div className="font-bold text-emerald-700 dark:text-emerald-300">
                      ${totalPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons with enhanced styling */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePreviewMode}
                  className={cn(
                    "group border-2 transition-all duration-200 hover:scale-105",
                    isPreviewMode
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-700 hover:from-green-100 hover:to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 dark:border-green-700 dark:text-green-400"
                      : "hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                  )}
                >
                  <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  {isPreviewMode ? "Edit" : "Preview"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="group border-2 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all duration-200 hover:scale-105"
                >
                  <Share2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Share
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={createDesign.isPending || updateDesign.isPending}
                  className={cn(
                    "group border-2 transition-all duration-200 hover:scale-105",
                    isDirty
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 border-orange-400 text-white shadow-lg"
                      : "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 border-slate-500 text-white"
                  )}
                  size="sm"
                >
                  {createDesign.isPending || updateDesign.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  )}
                  Save Design
                </Button>

                {showAddToCart && (
                  <AddToCartButton
                    productId={productId}
                    variantId={variantId}
                    designId={design?.id}
                    quantity={cartQuantity}
                    customizations={cartCustomizations}
                    disabled={!design || isDirty}
                    size="sm"
                    className="group bg-gradient-to-r  bg-green-500 dark:bg-green text-white shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    onSuccess={handleAddToCartSuccess}
                  >
                    <span className="group-hover:scale-110 transition-transform duration-200 flex items-center">
                      Add to Cart
                    </span>
                  </AddToCartButton>
                )}

                <Button
                  onClick={() => onExport?.({})}
                  className="group bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 border-2 border-emerald-500 text-white shadow-lg transition-all duration-200 hover:scale-105"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
