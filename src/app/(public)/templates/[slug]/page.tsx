"use client";

import React, { use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Package,
  Loader2,
  Clock,
  Palette,
  Star,
  Info,
  Type,
  Upload,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useDesignTemplate,
  useColorPresets,
  useFontPresets,
  useMediaRestrictions,
  useSizeVariants,
} from "@/hooks/use-design-templates";
import type {
  ColorPresetResponseDto,
  FontPresetResponseDto,
  MediaRestrictionResponseDto,
  SizeVariantResponseDto,
} from "@/lib/design-templates/types/design-template.types";

interface TemplateDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function ColorPresetsSection({
  colorPresets,
  isLoading,
}: {
  colorPresets?: ColorPresetResponseDto[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Available Colors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!colorPresets?.length) return null;

  const activeColors = colorPresets
    .filter((preset) => preset.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Available Colors ({activeColors.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-2">
          {activeColors.slice(0, 18).map((color) => (
            <div
              key={color.id}
              className="group relative"
              title={`${color.name} - ${color.hexCode}`}
            >
              <div
                className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform shadow-sm"
                style={{ backgroundColor: color.hexCode }}
              />
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {color.name}
              </div>
            </div>
          ))}
        </div>
        {activeColors.length > 18 && (
          <p className="text-xs text-muted-foreground mt-3">
            +{activeColors.length - 18} more colors available in customization
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function FontPresetsSection({
  fontPresets,
  isLoading,
}: {
  fontPresets?: FontPresetResponseDto[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Font Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!fontPresets?.length) return null;

  const activeFonts = fontPresets
    .filter((font) => font.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          Font Options ({activeFonts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeFonts.slice(0, 5).map((font) => (
            <div key={font.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{font.displayName}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {font.category}
                  </Badge>
                  {font.isPremium && (
                    <Badge variant="secondary" className="text-xs">
                      Premium
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                <p>
                  {font.weights.length} weight
                  {font.weights.length !== 1 ? "s" : ""}
                </p>
                <p>
                  {font.styles.length} style
                  {font.styles.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          ))}
          {activeFonts.length > 5 && (
            <p className="text-xs text-muted-foreground">
              +{activeFonts.length - 5} more fonts available in customization
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MediaRestrictionsSection({
  mediaRestrictions,
  isLoading,
}: {
  mediaRestrictions?: MediaRestrictionResponseDto[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!mediaRestrictions?.length) return null;

  const activeRestrictions = mediaRestrictions.filter(
    (restriction) => restriction.isActive
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Requirements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeRestrictions.map((restriction, index) => (
          <div key={restriction.id} className="space-y-2">
            {index > 0 && <Separator className="my-3" />}
            <div className="text-sm space-y-2">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between">
                  <span className="font-medium">Max file size:</span>
                  <span>
                    {(restriction.maxFileSize / (1024 * 1024)).toFixed(1)}MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Formats:</span>
                  <span className="text-right">
                    {restriction.allowedFormats.join(", ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Types:</span>
                  <span className="text-right">
                    {restriction.allowedTypes.join(", ")}
                  </span>
                </div>
                {restriction.requiredDPI && (
                  <div className="flex justify-between">
                    <span className="font-medium">Min DPI:</span>
                    <span>{restriction.requiredDPI}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SizeVariantsSection({
  sizeVariants,
  isLoading,
}: {
  sizeVariants?: SizeVariantResponseDto[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Available Sizes & Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sizeVariants?.length) return null;

  const activeVariants = sizeVariants
    .filter((variant) => variant.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>
          Available Sizes & Pricing ({activeVariants.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeVariants.map((variant) => (
            <div
              key={variant.id}
              className={`border rounded-lg p-4 hover:bg-muted/50 transition-colors ${
                variant.isDefault
                  ? "border-green-200 bg-green-50/30 dark:border-green-800 dark:bg-green-950/20"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{variant.displayName}</h4>
                {variant.isDefault && (
                  <Badge variant="secondary" className="text-xs">
                    Default
                  </Badge>
                )}
              </div>
              <div className="space-y-1 mb-3">
                <p className="text-sm text-muted-foreground">
                  {variant.dimensions.width} × {variant.dimensions.height}{" "}
                  {variant.dimensions.unit}
                </p>
                {variant.metadata?.printArea && (
                  <p className="text-xs text-muted-foreground">
                    Print area: {variant.metadata.printArea.width} ×{" "}
                    {variant.metadata.printArea.height}{" "}
                    {variant.dimensions.unit}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Resolution: {variant.dimensions.dpi} DPI
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  KES {variant.price.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function TemplateDetailPage({
  params,
}: TemplateDetailPageProps) {
  const resolvedParams = use(params);
  const templateId = resolvedParams.slug;

  const {
    data: template,
    isLoading: templateLoading,
    error: templateError,
  } = useDesignTemplate(templateId);

  const { data: sizeVariants, isLoading: variantsLoading } = useSizeVariants(
    templateId,
    !!template
  );

  const { data: colorPresets, isLoading: colorsLoading } = useColorPresets(
    templateId,
    !!template
  );

  const { data: fontPresets, isLoading: fontsLoading } = useFontPresets(
    templateId,
    !!template
  );

  const { data: mediaRestrictions, isLoading: mediaLoading } =
    useMediaRestrictions(templateId, !!template);

  // Loading state
  if (templateLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  if (templateError || !template) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Template Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The template you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Button asChild>
            <Link href="/templates">Browse All Templates</Link>
          </Button>
        </div>
      </div>
    );
  }

  const defaultVariant =
    sizeVariants?.find((v) => v.isDefault && v.isActive) ||
    sizeVariants?.find((v) => v.isActive);

  const activeVariantsCount =
    sizeVariants?.filter((v) => v.isActive).length || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/templates">
              <ArrowLeft className="h-4 w-4" />
              Back to Templates
            </Link>
          </Button>
        </div>

        {/* Template Status Alert */}
        {!template.isActive && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This template is currently inactive and may not be available for
              customization.
            </AlertDescription>
          </Alert>
        )}

        {/* Template Header */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Template Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted border">
              {template.thumbnail ? (
                <Image
                  src={template.thumbnail}
                  alt={template.name}
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Eye className="h-16 w-16" />
                </div>
              )}
            </div>

            {/* Product Images */}
            {template.product.images && template.product.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {template.product.images.slice(0, 3).map((imageUrl, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-md overflow-hidden bg-muted border"
                  >
                    <Image
                      src={imageUrl}
                      alt={`${template.product.name} view ${index + 1}`}
                      width={200}
                      height={200}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Template Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="secondary">{template.category.name}</Badge>
                <Badge variant="outline">{template.product.name}</Badge>
                {template.metadata?.tags?.includes("featured") && (
                  <Badge variant="default" className="bg-green-600 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                <Badge variant={template.isActive ? "default" : "secondary"}>
                  {template.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {template.name}
              </h1>
              {template.description && (
                <p className="text-lg text-muted-foreground mb-4">
                  {template.description}
                </p>
              )}
              {template.product.description && (
                <p className="text-muted-foreground">
                  {template.product.description}
                </p>
              )}
            </div>

            {/* Price and CTA */}
            <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Starting from
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      KES {template.basePrice.toLocaleString()}
                    </p>
                    {defaultVariant &&
                      defaultVariant.price !== template.basePrice && (
                        <p className="text-sm text-muted-foreground">
                          Default size: KES{" "}
                          {defaultVariant.price.toLocaleString()}
                        </p>
                      )}
                  </div>
                  <div className="text-right">
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {template.metadata?.leadTime || "Contact us"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activeVariantsCount} size
                        {activeVariantsCount !== 1 ? "s" : ""} available
                      </p>
                    </div>
                  </div>
                </div>
                {template.isActive ? (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    asChild
                  >
                    <Link href={`/design-studio/${templateId}`}>
                      Get Started with This Template
                    </Link>
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    Template Currently Unavailable
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Template Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Default Dimensions */}
              {defaultVariant && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Default Size
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium">{defaultVariant.displayName}</p>
                    <p>
                      {defaultVariant.dimensions.width} ×{" "}
                      {defaultVariant.dimensions.height}{" "}
                      {defaultVariant.dimensions.unit}
                    </p>
                    <p className="text-xs">
                      {defaultVariant.dimensions.dpi} DPI
                    </p>
                  </div>
                </div>
              )}

              {/* Template Info */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Template Info
                </h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    Created: {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    Updated: {new Date(template.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {template.metadata?.tags && template.metadata.tags.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {template.metadata.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Template Options & Details */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <ColorPresetsSection
            colorPresets={colorPresets}
            isLoading={colorsLoading}
          />
          <FontPresetsSection
            fontPresets={fontPresets}
            isLoading={fontsLoading}
          />
          <MediaRestrictionsSection
            mediaRestrictions={mediaRestrictions}
            isLoading={mediaLoading}
          />
        </div>

        {/* Size Variants */}
        <SizeVariantsSection
          sizeVariants={sizeVariants}
          isLoading={variantsLoading}
        />

        {/* Call to Action */}
        {template.isActive && (
          <div className="text-center">
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-950/30 dark:to-emerald-950/30">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Ready to Create Something Amazing?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start customizing this template with your own design, colors,
                  and content. Our design tools make it easy to create
                  professional results.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    asChild
                  >
                    <Link href={`/design-studio/${templateId}`}>
                      Start Customization
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
