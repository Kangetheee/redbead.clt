"use client";

import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Package,
  Loader2,
  Clock,
  Truck,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDesignTemplateBySlug } from "@/hooks/use-design-templates";
// import type { DesignTemplate } from '@/lib/design-templates/types/design-template.types'

interface TemplateDetailPageProps {
  params: {
    slug: string;
  };
}

export default function TemplateDetailPage({
  params,
}: TemplateDetailPageProps) {
  const {
    data: template,
    isLoading,
    error,
  } = useDesignTemplateBySlug(params.slug);

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
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {template.previewImage ? (
                <Image
                  src={template.previewImage}
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

            {/* Additional Images */}
            {template.images && template.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {template.images.slice(0, 3).map((imageUrl, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-md overflow-hidden bg-muted"
                  >
                    <Image
                      src={imageUrl}
                      alt={`${template.name} view ${index + 1}`}
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
                <Badge variant="secondary">
                  {template.category?.name || "General"}
                </Badge>
                <Badge variant="outline">
                  {template.product?.name || "Product"}
                </Badge>
                {template.isFeatured && (
                  <Badge variant="default" className="bg-green-600 text-white">
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {template.name}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {template.description}
              </p>
              {template.metaDescription && (
                <p className="text-muted-foreground">
                  {template.metaDescription}
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
                    <p className="text-xs text-muted-foreground">
                      SKU: {template.sku}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {template.leadTime}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {template.productionDays +
                          template.designDays +
                          template.shippingDays}{" "}
                        total days
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  asChild
                >
                  <Link href={`/design-studio/${template.slug}`}>
                    Get Started with This Template
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Template Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dimensions */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Dimensions
                </h3>
                <div className="text-sm text-muted-foreground">
                  <p>
                    {template.dimensions.width} × {template.dimensions.height}{" "}
                    {template.dimensions.unit}
                  </p>
                </div>
              </div>

              {/* Materials */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Materials
                </h3>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">Base: {template.materials.base}</p>
                  {template.materials.options.length > 0 && (
                    <div className="mt-1">
                      <p className="text-xs">
                        Options: {template.materials.options.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stock & Order Info */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">
                Stock & Ordering
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">In Stock</p>
                  <p className="font-medium">{template.stock} units</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Min Order</p>
                  <p className="font-medium">{template.minOrderQuantity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Max Order</p>
                  <p className="font-medium">{template.maxOrderQuantity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge
                    variant={template.isActive ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {template.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Template Details & Options */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Print Options */}
          {template.printOptions && template.printOptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Print Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {template.printOptions.map((option, index) => (
                    <Badge key={index} variant="outline">
                      {option}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Design Constraints */}
          <Card>
            <CardHeader>
              <CardTitle>Design Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${template.designConstraints.allowText ? "bg-green-600" : "bg-gray-400"}`}
                ></div>
                <span>
                  Text{" "}
                  {template.designConstraints.allowText
                    ? "Allowed"
                    : "Not Allowed"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${template.designConstraints.allowLogos ? "bg-green-600" : "bg-gray-400"}`}
                ></div>
                <span>
                  Logos{" "}
                  {template.designConstraints.allowLogos
                    ? "Allowed"
                    : "Not Allowed"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${template.designConstraints.allowCustomColors ? "bg-green-600" : "bg-gray-400"}`}
                ></div>
                <span>
                  Custom Colors{" "}
                  {template.designConstraints.allowCustomColors
                    ? "Allowed"
                    : "Not Allowed"}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                <span>Max Colors: {template.designConstraints.maxColors}</span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Production Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Design</span>
                <span className="font-medium">{template.designDays} days</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Production</span>
                <span className="font-medium">
                  {template.productionDays} days
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {template.shippingDays} days
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span>Total Lead Time</span>
                  <span>{template.leadTime}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Size Variants */}
        {template.sizeVariants && template.sizeVariants.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Available Sizes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {template.sizeVariants
                  .filter((variant) => variant.isActive)
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map((variant) => (
                    <div
                      key={variant.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{variant.displayName}</h4>
                        {variant.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      {variant.dimensions && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {variant.dimensions.width} ×{" "}
                          {variant.dimensions.height} {variant.dimensions.unit}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                          KES {variant.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Stock: {variant.stock || 0}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-950/30 dark:to-emerald-950/30">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Ready to Transform Your Space?
              </h3>
              <p className="text-muted-foreground mb-4">
                Our design experts will work with you to customize this template
                to your specific needs and preferences.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  asChild
                >
                  <Link href={`/design-studio/${template.slug}`}>
                    Start Customization
                  </Link>
                </Button>
                <Button variant="outline" size="lg">
                  Request Quote
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
