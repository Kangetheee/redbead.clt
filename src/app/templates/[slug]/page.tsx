"use client";

import React, { use } from "react";
import { notFound } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  useDesignTemplateBySlug,
  useColorPresets,
  useFontPresets,
  useMediaRestrictions,
} from "@/hooks/use-design-templates";

interface TemplateDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function TemplateDetailPage({
  params,
}: TemplateDetailPageProps) {
  // Await the params Promise
  const resolvedParams = use(params);

  const {
    data: template,
    isLoading,
    error,
  } = useDesignTemplateBySlug(resolvedParams.slug);

  // Get additional template data
  const { data: colorPresets } = useColorPresets(
    template?.id || "",
    !!template?.id
  );
  const { data: fontPresets } = useFontPresets(
    template?.id || "",
    !!template?.id
  );
  const { data: mediaRestrictions } = useMediaRestrictions(
    template?.id || "",
    !!template?.id
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  if (error || !template) {
    notFound();
  }

  // Get default size variant or first available
  const defaultVariant =
    template.sizeVariants.find((v) => v.isDefault && v.isActive) ||
    template.sizeVariants.find((v) => v.isActive);

  // Calculate total variants count
  const activeVariantsCount = template.sizeVariants.filter(
    (v) => v.isActive
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/templates">
              <ArrowLeft className="h-4 w-4" />
              Back to Templates
            </Link>
          </Button>
        </div>

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
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{template.category.name}</Badge>
                <Badge variant="outline">{template.product.name}</Badge>
                {template.metadata?.featured && (
                  <Badge variant="default" className="bg-green-600 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
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
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  asChild
                >
                  <Link href={`/design-studio/${resolvedParams.slug}`}>
                    Get Started with This Template
                  </Link>
                </Button>
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
                  <div className="text-sm text-muted-foreground">
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
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">
                    Created: {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    Updated: {new Date(template.updatedAt).toLocaleDateString()}
                  </p>
                  <p>
                    Status:{" "}
                    <Badge
                      variant={template.isActive ? "default" : "secondary"}
                      className="text-xs ml-1"
                    >
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
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
          {/* Color Presets */}
          {colorPresets && colorPresets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Available Colors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-2">
                  {colorPresets
                    .filter((preset) => preset.isActive)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .slice(0, 18)
                    .map((color) => (
                      <div
                        key={color.id}
                        className="group relative"
                        title={`${color.name} - ${color.hexCode}`}
                      >
                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: color.hexCode }}
                        />
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {color.name}
                        </div>
                      </div>
                    ))}
                </div>
                {colorPresets.length > 18 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    +{colorPresets.length - 18} more colors available
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Font Options */}
          {fontPresets && fontPresets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Font Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fontPresets
                    .filter((font) => font.isActive)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .slice(0, 5)
                    .map((font) => (
                      <div
                        key={font.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {font.displayName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {font.category} {font.isPremium && "• Premium"}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {font.weights.length} weight
                          {font.weights.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    ))}
                  {fontPresets.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      +{fontPresets.length - 5} more fonts available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Media Requirements */}
          {mediaRestrictions && mediaRestrictions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {mediaRestrictions
                  .filter((restriction) => restriction.isActive)
                  .map((restriction, index) => (
                    <div key={restriction.id} className="space-y-2">
                      {index > 0 && <Separator className="my-3" />}
                      <div className="text-sm">
                        <p className="font-medium mb-1">File Requirements:</p>
                        <ul className="text-muted-foreground space-y-1">
                          <li>
                            • Max size:{" "}
                            {(restriction.maxFileSize / (1024 * 1024)).toFixed(
                              1
                            )}
                            MB
                          </li>
                          <li>
                            • Formats: {restriction.allowedFormats.join(", ")}
                          </li>
                          <li>
                            • Types: {restriction.allowedTypes.join(", ")}
                          </li>
                          {restriction.requiredDPI && (
                            <li>• Min DPI: {restriction.requiredDPI}</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Size Variants */}
        {template.sizeVariants && template.sizeVariants.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Available Sizes & Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {template.sizeVariants
                  .filter((variant) => variant.isActive)
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((variant) => (
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
                      <p className="text-sm text-muted-foreground mb-1">
                        {variant.dimensions.width} × {variant.dimensions.height}{" "}
                        {variant.dimensions.unit}
                      </p>
                      {variant.metadata?.printArea && (
                        <p className="text-xs text-muted-foreground mb-2">
                          Print area: {variant.metadata.printArea.width} ×{" "}
                          {variant.metadata.printArea.height}{" "}
                          {variant.dimensions.unit}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                          KES {variant.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {variant.dimensions.dpi} DPI
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
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
                  <Link href={`/design-studio/${resolvedParams.slug}`}>
                    Start Customization
                  </Link>
                </Button>
                <Button variant="outline" size="lg">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
