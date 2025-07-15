/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Loader2,
  FileText,
  Image,
  LayoutDashboard,
  Zap,
  Folder,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useCreateDesign } from "@/hooks/use-design-studio";
import type { CreateDesignDto } from "@/lib/design-studio/dto/design-studio.dto";
import type { CanvasData } from "@/lib/design-studio/types/design-studio.types";

// Mock product categories (in real app, fetch from API)
const productCategories = [
  {
    id: "business-cards",
    name: "Business Cards",
    icon: FileText,
    defaultDimensions: { width: 800, height: 600 },
  },
  {
    id: "flyers",
    name: "Flyers",
    icon: Image,
    defaultDimensions: { width: 1200, height: 800 },
  },
  {
    id: "posters",
    name: "Posters",
    icon: LayoutDashboard,
    defaultDimensions: { width: 1600, height: 1200 },
  },
  {
    id: "social-media",
    name: "Social Media",
    icon: Zap,
    defaultDimensions: { width: 1080, height: 1080 },
  },
  {
    id: "brochures",
    name: "Brochures",
    icon: Folder,
    defaultDimensions: { width: 1400, height: 1000 },
  },
];

export default function CreateDesignPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    productId: "",
    isTemplate: false,
    isPublic: false,
  });

  const createDesign = useCreateDesign();

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a design name");
      return;
    }

    if (!formData.productId) {
      toast.error("Please select a product category");
      return;
    }

    try {
      const selectedProduct = productCategories.find(
        (p) => p.id === formData.productId
      );

      const canvasData: CanvasData = {
        width: selectedProduct?.defaultDimensions.width || 800,
        height: selectedProduct?.defaultDimensions.height || 600,
        backgroundColor: "#ffffff",
        layers: [],
        metadata: {},
      };

      const designData: CreateDesignDto = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        productId: formData.productId,
        customizations: canvasData,
        isTemplate: formData.isTemplate,
        isPublic: formData.isPublic,
      };

      const result = await createDesign.mutateAsync(designData);

      if (result.success) {
        toast.success("Design created successfully!");
        router.push(`/dashboard/customer/design-studio/edit/${result.data.id}`);
      }
    } catch (error) {
      console.error("Failed to create design:", error);
      toast.error("Failed to create design");
    }
  };

  const selectedProduct = productCategories.find(
    (p) => p.id === formData.productId
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/customer/design-studio">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Design Studio
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Design</h1>
          <p className="text-muted-foreground">
            Start a new design project from scratch
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Design Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter design name..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Enter design description (optional)..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Category */}
        <Card>
          <CardHeader>
            <CardTitle>Product Category *</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productCategories.map((product) => {
                const IconComponent = product.icon;
                const isSelected = formData.productId === product.id;

                return (
                  <Card
                    key={product.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handleInputChange("productId", product.id)}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.defaultDimensions.width} ×{" "}
                          {product.defaultDimensions.height}px
                        </p>
                      </div>
                      {isSelected && (
                        <Badge variant="default" className="ml-auto">
                          Selected
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Design Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Design Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isTemplate">Save as Template</Label>
                <p className="text-sm text-muted-foreground">
                  Make this design available as a template for future use
                </p>
              </div>
              <Button
                type="button"
                variant={formData.isTemplate ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  handleInputChange("isTemplate", !formData.isTemplate)
                }
              >
                {formData.isTemplate ? "Template" : "Regular Design"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isPublic">Make Public</Label>
                <p className="text-sm text-muted-foreground">
                  Allow other users to view and use this design
                </p>
              </div>
              <Button
                type="button"
                variant={formData.isPublic ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  handleInputChange("isPublic", !formData.isPublic)
                }
              >
                {formData.isPublic ? "Public" : "Private"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Canvas Preview */}
        {selectedProduct && (
          <Card>
            <CardHeader>
              <CardTitle>Canvas Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
                <div
                  className="bg-white border-2 border-dashed border-border flex items-center justify-center"
                  style={{
                    width: Math.min(
                      selectedProduct.defaultDimensions.width / 4,
                      200
                    ),
                    height: Math.min(
                      selectedProduct.defaultDimensions.height / 4,
                      150
                    ),
                  }}
                >
                  <div className="text-center text-muted-foreground">
                    <selectedProduct.icon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">
                      {selectedProduct.defaultDimensions.width} ×{" "}
                      {selectedProduct.defaultDimensions.height}px
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              createDesign.isPending ||
              !formData.name.trim() ||
              !formData.productId
            }
            className="flex-1"
          >
            {createDesign.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Create Design
          </Button>
        </div>
      </form>
    </div>
  );
}
