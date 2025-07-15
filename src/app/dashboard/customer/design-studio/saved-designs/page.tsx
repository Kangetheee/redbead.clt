/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder, Plus, Search, Trash2, Copy, Loader2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  useUserDesignsList,
  useDeleteDesign,
  useDuplicateDesign,
} from "@/hooks/use-designs";
import { toast } from "sonner";
import type {
  GetDesignsDto,
  DuplicateDesignDto,
  DesignResponseDto,
  PaginatedDesignsResponseDto,
} from "@/lib/designs/dto/designs.dto";

export default function SavedDesignsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Fetch user designs with proper types using the correct hook
  const queryParams: GetDesignsDto = {
    page,
    limit: 12,
    search: searchQuery || undefined,
    isTemplate: false, // Only user designs, not templates
  };

  const { data: designsResponse, isLoading } = useUserDesignsList(queryParams);

  // Mutations with proper types
  const deleteDesign = useDeleteDesign();
  const duplicateDesign = useDuplicateDesign();

  // Now using the correct response structure
  const designs: DesignResponseDto[] = designsResponse?.items || [];
  const meta = designsResponse?.meta;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return "text-green-600 bg-green-50";
      case "draft":
        return "text-yellow-600 bg-yellow-50";
      case "archived":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  const handleDuplicate = async (designId: string, originalName: string) => {
    try {
      const duplicateData: DuplicateDesignDto = {
        name: `${originalName} (Copy)`,
        description: "Duplicated design",
      };

      await duplicateDesign.mutateAsync({
        designId,
        values: duplicateData,
      });
    } catch (error) {
      console.error("Failed to duplicate design:", error);
    }
  };

  const handleDelete = async (designId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this design? This action cannot be undone."
      )
    ) {
      try {
        await deleteDesign.mutateAsync(designId);
      } catch (error) {
        console.error("Failed to delete design:", error);
      }
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page when searching
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Designs</h1>
          <p className="text-muted-foreground mt-2">
            All your saved designs in one place
            {meta && ` (${meta.totalItems} designs)`}
          </p>
        </div>
        <Button asChild>
          <Link href="/design-studio">
            <Plus className="h-4 w-4 mr-2" />
            New Design
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search designs..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading designs...</span>
        </div>
      ) : designs.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No designs found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Try adjusting your search terms"
              : "Start creating your first design"}
          </p>
          <Button asChild>
            <Link href="/design-studio">
              <Plus className="h-4 w-4 mr-2" />
              Create New Design
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design) => (
            <Card
              key={design.id}
              className="h-full transition-transform hover:scale-[1.02] group"
            >
              <div className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
                {design.preview ? (
                  <img
                    src={design.preview}
                    alt={design.name}
                    className="object-contain max-h-48"
                  />
                ) : (
                  <div className="flex items-center justify-center text-muted-foreground">
                    <Folder className="h-8 w-8" />
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDuplicate(design.id, design.name);
                      }}
                      disabled={duplicateDesign.isPending}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(design.id);
                      }}
                      disabled={deleteDesign.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg truncate">
                  {design.name}
                </CardTitle>
                {design.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {design.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Folder className="h-4 w-4" />
                  <span>Version {design.version}</span>
                  <span
                    className={`ml-auto px-2 py-1 rounded-full text-xs capitalize ${getStatusColor(design.status)}`}
                  >
                    {design.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{design.product.name}</span>
                  {design.estimatedCost && (
                    <span className="ml-auto font-medium">
                      ${design.estimatedCost.toFixed(2)}
                    </span>
                  )}
                </div>
                {/* Template and Public indicators */}
                <div className="flex items-center gap-1">
                  {design.isTemplate && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Template
                    </span>
                  )}
                  {design.isPublic && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Public
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm">
                    {new Date(design.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/design-studio/edit/${design.id}`}>
                        Edit
                      </Link>
                    </Button>
                    {design.isTemplate && (
                      <Button asChild variant="default" size="sm">
                        <Link href={`/design-studio/template/${design.id}`}>
                          Use
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Page {meta.currentPage} of {meta.totalPages}
              </span>
              <span className="text-xs text-muted-foreground">
                ({meta.totalItems} total items)
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page >= meta.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Design Stats */}
      {designs.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {designs.length}
            </div>
            <div className="text-sm text-muted-foreground">Designs</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {designs.filter((d) => d.status === "published").length}
            </div>
            <div className="text-sm text-muted-foreground">Published</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {designs.filter((d) => d.status === "draft").length}
            </div>
            <div className="text-sm text-muted-foreground">Drafts</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {designs.filter((d) => d.isTemplate).length}
            </div>
            <div className="text-sm text-muted-foreground">Templates</div>
          </div>
        </div>
      )}
    </div>
  );
}
