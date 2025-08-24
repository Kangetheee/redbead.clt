"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Copy,
  Share2,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  Tag,
  Layers,
  Palette,
  Type,
  Image as ImageIcon,
  Settings,
  Loader2,
  ExternalLink,
  ShoppingCart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

import {
  useDesign,
  useDeleteDesign,
  useExportDesign,
  useShareDesign,
  useValidateDesign,
  useCreateOrderFromDesign,
} from "@/hooks/use-design-studio";
import { DesignStatus } from "@/lib/design-studio/types/design-studio.types";

const statusColors: Record<DesignStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING_REVIEW: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  PUBLISHED: "bg-blue-100 text-blue-800",
  ARCHIVED: "bg-gray-100 text-gray-600",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  TEMPLATE: "bg-purple-100 text-purple-800",
};

const statusLabels: Record<DesignStatus, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
  COMPLETED: "Completed",
  TEMPLATE: "Template",
};

export default function DesignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const designId = params.id as string;

  // State
  const [previewMode, setPreviewMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  // Hooks
  const { data: design, isLoading, error } = useDesign(designId);
  const deleteDesign = useDeleteDesign();
  const exportDesign = useExportDesign();
  const shareDesign = useShareDesign();
  const validateDesign = useValidateDesign();
  //   TODO: Implement create order from design functionality
  //   eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createOrder = useCreateOrderFromDesign();

  // Handlers
  const handleEdit = () => {
    if (design) {
      router.push(`/design-studio/${design.template.id}?designId=${design.id}`);
    }
  };

  const handleDuplicate = () => {
    if (design) {
      const queryParams = new URLSearchParams({
        duplicate: design.id,
        name: `${design.name} (Copy)`,
      });
      router.push(
        `/design-studio/${design.template.id}?${queryParams.toString()}`
      );
    }
  };

  const handleExport = () => {
    if (design) {
      exportDesign.mutate({
        designId: design.id,
        values: {
          format: "png",
          quality: "high",
          dpi: 300,
          includeBleed: false,
          includeCropMarks: false,
          showMockup: false,
        },
      });
    }
  };

  const handleShare = () => {
    if (design) {
      shareDesign.mutate({
        designId: design.id,
        values: {
          allowDownload: false,
          expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(), // 7 days
        },
      });
    }
  };

  const handleValidate = () => {
    if (design) {
      validateDesign.mutate({
        designId: design.id,
        values: {
          checkPrintReadiness: true,
          checkConstraints: true,
          checkAssetQuality: true,
        },
      });
    }
  };

  const handleDelete = () => {
    deleteDesign.mutate(designId, {
      onSuccess: () => {
        toast.success("Design deleted successfully");
        router.push("/designs");
      },
    });
  };

  const handleCreateOrder = () => {
    // This would typically open a modal or redirect to checkout
    // For now, we'll show a placeholder
    setOrderDialogOpen(true);
  };

  if (isLoading) {
    return <DesignDetailSkeleton />;
  }

  if (error || !design) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Design Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error?.message ||
              "The design you're looking for doesn't exist or has been deleted."}
          </p>
          <Button onClick={() => router.push("/designs")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Designs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/designs")}
                className="mr-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Designs
              </Button>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {design.name}
                </h1>
                <p className="text-gray-600">
                  {design.template.name} • {design.template.category}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? (
                  <EyeOff className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                {previewMode ? "Exit Preview" : "Preview"}
              </Button>

              <Button variant="outline" size="sm" onClick={handleValidate}>
                <Settings className="w-4 h-4 mr-2" />
                Validate
              </Button>

              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>

              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>

              <Button size="sm" onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Design
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Design Preview */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center relative">
                  {design.preview ? (
                    <img
                      src={design.preview}
                      alt={design.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                      <p>No preview available</p>
                    </div>
                  )}

                  {/* Preview Mode Overlay */}
                  {previewMode && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="bg-white rounded-lg p-6 text-center">
                        <Eye className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                        <p className="text-gray-900 font-medium">
                          Preview Mode
                        </p>
                        <p className="text-gray-600 text-sm">
                          Design view without editing tools
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Design Elements Analysis */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Layers className="w-5 h-5 mr-2" />
                  Design Elements ({design.customizations.elements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {design.customizations.elements.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {design.customizations.elements.map((element, index) => (
                      <div
                        key={element.id}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          {element.type === "text" && (
                            <Type className="w-4 h-4 text-blue-600" />
                          )}
                          {element.type === "image" && (
                            <ImageIcon className="w-4 h-4 text-green-600" />
                          )}
                          {element.type === "logo" && (
                            <Tag className="w-4 h-4 text-purple-600" />
                          )}
                          {element.type === "shape" && (
                            <Palette className="w-4 h-4 text-orange-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {element.type} {index + 1}
                          </p>
                          {element.content && (
                            <p className="text-xs text-gray-500 truncate">
                              &quot;{element.content}&quot;
                            </p>
                          )}
                          {element.color && (
                            <div className="flex items-center mt-1">
                              <div
                                className="w-3 h-3 rounded-full mr-1 border border-gray-300"
                                style={{ backgroundColor: element.color }}
                              />
                              <span className="text-xs text-gray-500">
                                {element.color}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No design elements</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Design Info */}
          <div className="space-y-6">
            {/* Design Status */}
            <Card>
              <CardHeader>
                <CardTitle>Design Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge className={statusColors[design.status]}>
                    {statusLabels[design.status]}
                  </Badge>
                </div>

                {design.isTemplate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Type</span>
                    <Badge variant="outline">
                      <Tag className="w-3 h-3 mr-1" />
                      Template
                    </Badge>
                  </div>
                )}

                {design.isPublic && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Visibility</span>
                    <Badge variant="outline">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Public
                    </Badge>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Version</span>
                  <span className="text-sm font-medium">v{design.version}</span>
                </div>

                {design.estimatedCost && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Estimated Cost
                    </span>
                    <span className="text-sm font-medium">
                      ${design.estimatedCost.toFixed(2)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Template Information */}
            <Card>
              <CardHeader>
                <CardTitle>Template Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Template</p>
                  <p className="font-medium">{design.template.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium">{design.template.category}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Base Price</p>
                  <p className="font-medium">
                    ${design.template.basePrice.toFixed(2)}
                  </p>
                </div>

                {design.sizeVariant && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-gray-600">Size Variant</p>
                      <p className="font-medium">
                        {design.sizeVariant.displayName}
                      </p>
                      <p className="text-xs text-gray-500">
                        +${design.sizeVariant.price.toFixed(2)}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Canvas Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Canvas Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Dimensions</p>
                  <p className="font-medium">
                    {design.customizations.width}×{design.customizations.height}
                    px
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Background</p>
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded border border-gray-300 mr-2"
                      style={{
                        backgroundColor:
                          design.customizations.backgroundColor || "#ffffff",
                      }}
                    />
                    <p className="font-medium">
                      {design.customizations.backgroundColor || "#ffffff"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Elements</p>
                  <p className="font-medium">
                    {design.customizations.elements.length}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="text-sm font-medium">
                      {new Date(design.createdAt).toLocaleDateString()} at{" "}
                      {new Date(design.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="text-sm font-medium">
                      {new Date(design.updatedAt).toLocaleDateString()} at{" "}
                      {new Date(design.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  onClick={handleCreateOrder}
                  disabled={design.status === "DRAFT"}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Create Order
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDuplicate}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate Design
                </Button>

                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Design
                </Button>
              </CardContent>
            </Card>

            {/* Description */}
            {design.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {design.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Design</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{design.name}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteDesign.isPending}
            >
              {deleteDesign.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Order Dialog */}
      <AlertDialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Order</AlertDialogTitle>
            <AlertDialogDescription>
              This feature will redirect you to the checkout process where you
              can specify quantity, shipping details, and complete your order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setOrderDialogOpen(false);
                toast.info("Checkout process would start here");
              }}
            >
              Continue to Checkout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Loading Skeleton
function DesignDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-32" />
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <Skeleton className="aspect-[4/3] w-full" />
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }, (_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {Array.from({ length: 5 }, (_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
