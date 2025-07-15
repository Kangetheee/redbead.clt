/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Download,
  Loader2,
  Eye,
  Palette,
  Star,
  Calendar,
  FileText,
  Play,
  Copy,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useDesignTemplate } from "@/hooks/use-design-templates";
import { useUseDesignTemplate } from "@/hooks/use-design-studio";

export default function TemplatePreviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("preview");

  // Fetch template data
  const { data: template, isLoading, error } = useDesignTemplate(id as string);

  // Mutation for using the template
  const useTemplate = useUseDesignTemplate();

  const handleUseTemplate = async () => {
    if (!template) return;

    try {
      const result = await useTemplate.mutateAsync(template.id);
      if (result.success) {
        toast.success(`Template "${template.name}" applied successfully!`);
        router.push(`/dashboard/customer/design-studio/edit/${result.data.id}`);
      }
    } catch (error) {
      console.error("Failed to use template:", error);
      toast.error("Failed to apply template");
    }
  };

  const handleBack = () => {
    router.push("/dashboard/customer/design-studio/templates");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading template...</span>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Template Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The template you&apos;re looking for doesn&apos;t exist or is no
            longer available.
          </p>
          <Button asChild>
            <Link href="/dashboard/customer/design-studio/templates">
              Back to Templates
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
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{template.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {template.isFeatured && (
                <Badge className="bg-primary text-primary-foreground">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {template.isActive ? (
                <Badge variant="default">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleUseTemplate}
            disabled={useTemplate.isPending || !template.isActive}
            size="lg"
          >
            {useTemplate.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Use This Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Template Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Template Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                {template.previewImage ? (
                  <img
                    src={template.previewImage}
                    alt={template.name}
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

          {/* Template Details Tabs */}
          <div className="mt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="customizations">Customizations</TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>How to Use This Template</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium">
                          Click &quot;Use This Template&quot;
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          This will create a new design based on this template
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium">Customize Your Design</h4>
                        <p className="text-sm text-muted-foreground">
                          Edit text, colors, images, and layouts to match your
                          needs
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium">Export & Print</h4>
                        <p className="text-sm text-muted-foreground">
                          Download your design in various formats or send it to
                          print
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Template Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {template.description && (
                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2">Product Type</h4>
                      <p className="text-sm text-muted-foreground">
                        {template.productId}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Template ID</h4>
                      <p className="text-sm text-muted-foreground font-mono">
                        {template.id}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Created</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Last Updated</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(template.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="customizations" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Customization Options</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Canvas Information</h4>
                        <p className="text-sm text-muted-foreground">
                          This template includes a pre-designed canvas with
                          layers and elements that you can modify in the design
                          editor.
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Editable Elements</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Text content and fonts</li>
                          <li>• Colors and backgrounds</li>
                          <li>• Images and graphics</li>
                          <li>• Layout and positioning</li>
                        </ul>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Template Data</h4>
                        <p className="text-sm text-muted-foreground">
                          Customizations:{" "}
                          {template.customizations
                            ? "Available"
                            : "Not configured"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={handleUseTemplate}
                disabled={useTemplate.isPending || !template.isActive}
              >
                {useTemplate.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Use This Template
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/customer/design-studio/templates">
                  Browse More Templates
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Template Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={template.isActive ? "default" : "secondary"}>
                  {template.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Featured:</span>
                <span className="text-sm">
                  {template.isFeatured ? "Yes" : "No"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Product:</span>
                <span className="text-sm font-medium">
                  {template.productId}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Having trouble with this template? Here are some resources:
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Tutorial
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Share2 className="h-4 w-4 mr-2" />
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
