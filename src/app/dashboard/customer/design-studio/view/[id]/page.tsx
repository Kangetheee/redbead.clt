/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Edit,
  Copy,
  Share2,
  Download,
  MoreHorizontal,
  Eye,
  Trash2,
  Loader2,
  Calendar,
  User,
  Layers,
  Palette,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  useDesign,
  useDeleteDesign,
  useExportDesign,
  useShareDesign,
} from "@/hooks/use-design-studio";
import { useDuplicateDesign } from "@/hooks/use-designs";
import type {
  ExportDesignDto,
  ShareDesignDto,
} from "@/lib/design-studio/dto/design-studio.dto";

export default function DesignDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  // Fetch design data using design-studio hook
  const { data: design, isLoading, error } = useDesign(id as string);

  // Mutations
  const deleteDesign = useDeleteDesign();
  const duplicateDesign = useDuplicateDesign();
  const exportDesign = useExportDesign();
  const shareDesign = useShareDesign();

  const handleEdit = () => {
    router.push(`/dashboard/customer/design-studio/edit/${id}`);
  };

  const handleDuplicate = async () => {
    if (!design) return;

    try {
      await duplicateDesign.mutateAsync({
        designId: design.id,
        values: {
          name: `${design.name} (Copy)`,
          description: "Duplicated design",
        },
      });
      toast.success("Design duplicated successfully!");
    } catch (error) {
      console.error("Failed to duplicate design:", error);
      toast.error("Failed to duplicate design");
    }
  };

  const handleExport = async (format: "png" | "jpg" | "pdf" | "svg") => {
    if (!design) return;

    try {
      const exportData: ExportDesignDto = {
        format,
        quality: "high",
        includeBleed: false,
        includeCropMarks: false,
      };

      await exportDesign.mutateAsync({
        designId: design.id,
        values: exportData,
      });
      toast.success(`Design exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Failed to export design:", error);
      toast.error("Failed to export design");
    }
  };

  const handleShare = async () => {
    if (!design) return;

    try {
      const shareData: ShareDesignDto = {
        allowDownload: false,
        note: "Shared design for review",
      };

      const result = await shareDesign.mutateAsync({
        designId: design.id,
        values: shareData,
      });

      if (result.success) {
        navigator.clipboard.writeText(result.data.url);
        toast.success("Share link copied to clipboard!");
      }
    } catch (error) {
      console.error("Failed to share design:", error);
      toast.error("Failed to share design");
    }
  };

  const handleDelete = async () => {
    if (!design) return;

    if (
      window.confirm(
        "Are you sure you want to delete this design? This action cannot be undone."
      )
    ) {
      try {
        await deleteDesign.mutateAsync(design.id);
        toast.success("Design deleted successfully");
        router.push("/dashboard/customer/design-studio/saved-designs");
      } catch (error) {
        console.error("Failed to delete design:", error);
        toast.error("Failed to delete design");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading design...</span>
        </div>
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Design Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The design you&apos;re looking for doesn&apos;t exist or has been
            deleted.
          </p>
          <Button asChild>
            <Link href="/dashboard/customer/design-studio/saved-designs">
              Back to Designs
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/customer/design-studio/saved-designs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Designs
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{design.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className={getStatusColor(design.status)}
              >
                {design.status}
              </Badge>
              {design.isTemplate && <Badge variant="secondary">Template</Badge>}
              {design.isPublic && <Badge variant="default">Public</Badge>}
              <span className="text-sm text-muted-foreground">
                Version {design.version}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Design
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleDuplicate}
                disabled={duplicateDesign.isPending}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleShare}
                disabled={shareDesign.isPending}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport("png")}
                disabled={exportDesign.isPending}
              >
                <Download className="h-4 w-4 mr-2" />
                Export PNG
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport("pdf")}
                disabled={exportDesign.isPending}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={deleteDesign.isPending}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Design Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Design Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border">
                {design.preview ? (
                  <img
                    src={design.preview}
                    alt={design.name}
                    className="max-w-full max-h-full object-contain rounded"
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Palette className="h-12 w-12 mx-auto mb-4" />
                    <p>No preview available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Design Information */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Design Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {design.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {design.description}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Product</h4>
                <p className="text-sm text-muted-foreground">
                  {typeof design.product === "object" && design.product !== null
                    ? (design.product as any).name || "Unknown Product"
                    : "Unknown Product"}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Canvas Size</h4>
                <p className="text-sm text-muted-foreground">
                  {design.customizations.width} × {design.customizations.height}
                  px
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Layers</h4>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {design.customizations.layers?.length || 0} layers
                  </span>
                </div>
              </div>

              {design.estimatedCost && (
                <div>
                  <h4 className="font-medium mb-2">Estimated Cost</h4>
                  <p className="text-sm text-muted-foreground">
                    ${design.estimatedCost.toFixed(2)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(design.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(design.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Design ID</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {design.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Print Specifications */}
          {design.printSpecifications && (
            <Card>
              <CardHeader>
                <CardTitle>Print Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Material:</span>
                  <span className="text-sm font-medium">
                    {design.printSpecifications.material}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Color Mode:</span>
                  <span className="text-sm font-medium">
                    {design.printSpecifications.colorMode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">DPI:</span>
                  <span className="text-sm font-medium">
                    {design.printSpecifications.dpi}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Finish:</span>
                  <span className="text-sm font-medium">
                    {design.printSpecifications.finish}
                  </span>
                </div>
                {design.printSpecifications.estimatedProductionTime && (
                  <div className="flex justify-between">
                    <span className="text-sm">Production Time:</span>
                    <span className="text-sm font-medium">
                      {design.printSpecifications.estimatedProductionTime} days
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
