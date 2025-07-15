/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, Layout, Star, Eye } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useUseDesignTemplate } from "@/hooks/use-design-studio";
import { useDesignTemplatesList } from "@/hooks/use-design-templates";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type {
  GetDesignTemplatesDto,
  DesignTemplateResponseDto,
  PaginatedDesignTemplatesResponseDto,
} from "@/lib/designs/dto/design-templates.dto";

// Using the proper design template response DTO
type DesignTemplate = DesignTemplateResponseDto;

// Type guard utility functions
const isDesignTemplatesResponse = (
  data: any
): data is PaginatedDesignTemplatesResponseDto => {
  return (
    data &&
    typeof data === "object" &&
    "items" in data &&
    Array.isArray(data.items)
  );
};

const getTemplatesFromResponse = (response: any): DesignTemplate[] => {
  if (!response) return [];
  if (isDesignTemplatesResponse(response)) return response.items || [];
  return [];
};

const getMetaFromResponse = (response: any) => {
  if (!response) return null;
  if (isDesignTemplatesResponse(response)) return response.meta || null;
  return null;
};

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);
  const [page, setPage] = useState(1);
  const router = useRouter();

  // Build query parameters
  const queryParams: GetDesignTemplatesDto = {
    page,
    limit: 12,
    search: searchQuery || undefined,
    isFeatured: featuredOnly || undefined,
    isActive: activeOnly || undefined,
  };

  // Fetch design templates with proper parameters
  const { data: templatesResponse, isLoading } =
    useDesignTemplatesList(queryParams);

  // Mutation for using a template
  const useTemplate = useUseDesignTemplate();

  // Handle the response structure with type-safe utility functions
  const templates: DesignTemplate[] =
    getTemplatesFromResponse(templatesResponse);
  const meta = getMetaFromResponse(templatesResponse);

  const handleUseTemplate = async (
    templateId: string,
    templateName: string
  ) => {
    try {
      const result = await useTemplate.mutateAsync(templateId);
      if (result.success) {
        toast.success(`Template "${templateName}" applied successfully!`);
        // Navigate to the design studio with the new design
        router.push(`/dashboard/customer/design-studio/edit/${result.data.id}`);
      }
    } catch (error) {
      console.error("Failed to use template:", error);
      toast.error("Failed to apply template");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page when searching
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFilterChange = (filterType: "featured" | "active") => {
    if (filterType === "featured") {
      setFeaturedOnly(!featuredOnly);
    } else {
      setActiveOnly(!activeOnly);
    }
    setPage(1); // Reset to first page when filtering
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Design Templates</h1>
        <p className="text-muted-foreground mt-2">
          Start with professionally designed templates
          {meta && ` (${meta.totalItems} available)`}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates by name or description..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={featuredOnly ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("featured")}
          >
            <Star className="h-4 w-4 mr-2" />
            Featured Only
          </Button>

          <Button
            variant={activeOnly ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("active")}
          >
            Active Only
          </Button>

          {/* Reset filters */}
          {(featuredOnly || !activeOnly || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFeaturedOnly(false);
                setActiveOnly(true);
                setSearchQuery("");
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading templates...</span>
        </div>
      ) : templates.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12">
          <Layout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || featuredOnly
              ? "Try adjusting your search criteria"
              : "Templates are being added soon"}
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard/customer/design-studio">
              Start from Scratch
            </Link>
          </Button>
        </div>
      ) : (
        /* Templates Grid */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((template: DesignTemplate) => (
              <Card
                key={template.id}
                className="h-full group hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
                  {template.previewImage ? (
                    <img
                      src={template.previewImage}
                      alt={template.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="flex items-center justify-center text-muted-foreground">
                      <Layout className="h-8 w-8" />
                    </div>
                  )}

                  {/* Overlay badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {template.isFeatured && (
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {!template.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg truncate">
                    {template.name}
                  </CardTitle>
                  {template.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Template metadata */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Template ID: {template.id.slice(-8)}</span>
                      <span>
                        {new Date(template.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Product: {template.productId}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Updated:{" "}
                      {new Date(template.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() =>
                        handleUseTemplate(template.id, template.name)
                      }
                      disabled={useTemplate.isPending || !template.isActive}
                    >
                      {useTemplate.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Use Template
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/dashboard/customer/design-studio/templates/${template.id}/preview`}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {meta.currentPage} of {meta.totalPages}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({meta.totalItems} total templates)
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= meta.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Template Statistics */}
      {templates.length > 0 && meta && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {meta.totalItems}
            </div>
            <div className="text-sm text-muted-foreground">Total Templates</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {templates.filter((t) => t.isFeatured).length}
            </div>
            <div className="text-sm text-muted-foreground">Featured</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {templates.filter((t) => t.isActive).length}
            </div>
            <div className="text-sm text-muted-foreground">Active</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {meta.currentPage}
            </div>
            <div className="text-sm text-muted-foreground">Current Page</div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 flex justify-center">
        <Button asChild variant="outline">
          <Link href="/dashboard/customer/design-studio">
            Create New Design from Scratch
          </Link>
        </Button>
      </div>
    </div>
  );
}
