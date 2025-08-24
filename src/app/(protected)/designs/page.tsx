"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Share2,
  Download,
  Trash2,
  Calendar,
  Clock,
  Tag,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";

import {
  useUserDesigns,
  useDeleteDesign,
  useExportDesign,
  useShareDesign,
} from "@/hooks/use-design-studio";
import { GetDesignsDto } from "@/lib/design-studio/dto/design-studio.dto";
import {
  DesignResponse,
  DesignStatus,
} from "@/lib/design-studio/types/design-studio.types";

type ViewMode = "grid" | "list";

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

export default function DesignsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<DesignStatus | "all">(
    "all"
  );
  const [showTemplatesOnly, setShowTemplatesOnly] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [designToDelete, setDesignToDelete] = useState<string | null>(null);

  // Get initial page from URL params
  const initialPage = parseInt(searchParams.get("page") || "1");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const pageSize = 12;

  // Build query parameters
  const queryParams: GetDesignsDto = {
    page: currentPage,
    limit: pageSize,
    status: selectedStatus === "all" ? undefined : selectedStatus,
    isTemplate: showTemplatesOnly || undefined,
  };

  // Hooks
  const { data: designsData, isLoading, error } = useUserDesigns(queryParams);
  const deleteDesign = useDeleteDesign();
  const exportDesign = useExportDesign();
  const shareDesign = useShareDesign();

  // Handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, you'd debounce this and add search to the API
  };

  const handleStatusFilter = (status: DesignStatus | "all") => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Update URL
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleEditDesign = (design: DesignResponse) => {
    router.push(`/design-studio/${design.template.id}?designId=${design.id}`);
  };

  const handleViewDesign = (design: DesignResponse) => {
    router.push(`/designs/${design.id}`);
  };

  const handleDuplicateDesign = (design: DesignResponse) => {
    // Navigate to design studio with the design data for duplication
    const queryParams = new URLSearchParams({
      duplicate: design.id,
      name: `${design.name} (Copy)`,
    });
    router.push(
      `/design-studio/${design.template.id}?${queryParams.toString()}`
    );
  };

  const handleExportDesign = (design: DesignResponse) => {
    exportDesign.mutate({
      designId: design.id,
      values: {
        format: "png",
        quality: "high",
        dpi: 300,
      },
    });
  };

  const handleShareDesign = (design: DesignResponse) => {
    shareDesign.mutate({
      designId: design.id,
      values: {
        allowDownload: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      },
    });
  };

  const handleDeleteDesign = (designId: string) => {
    setDesignToDelete(designId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (designToDelete) {
      deleteDesign.mutate(designToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setDesignToDelete(null);
        },
      });
    }
  };

  // Filter designs based on search query (client-side filtering)
  const filteredDesigns =
    designsData?.designs?.filter(
      (design) =>
        design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        design.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Failed to Load Designs
          </h2>
          <p className="text-gray-600 mb-4">
            {error.message || "An error occurred while loading your designs."}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Designs</h1>
          <p className="text-gray-600 mt-1">
            Manage and organize your custom designs
          </p>
        </div>
        <Button onClick={() => router.push("/templates")} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Create New Design
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search designs..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <Select value={selectedStatus} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Template Filter */}
          <Select
            value={showTemplatesOnly ? "templates" : "designs"}
            onValueChange={(value) =>
              setShowTemplatesOnly(value === "templates")
            }
          >
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="designs">All Designs</SelectItem>
              <SelectItem value="templates">Templates Only</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-200 rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="w-10 h-8"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="w-10 h-8"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <DesignsSkeleton viewMode={viewMode} />
      ) : filteredDesigns.length === 0 ? (
        <EmptyState searchQuery={searchQuery} />
      ) : viewMode === "grid" ? (
        <GridView
          designs={filteredDesigns}
          onView={handleViewDesign}
          onEdit={handleEditDesign}
          onDuplicate={handleDuplicateDesign}
          onExport={handleExportDesign}
          onShare={handleShareDesign}
          onDelete={handleDeleteDesign}
          isExporting={exportDesign.isPending}
          isSharing={shareDesign.isPending}
        />
      ) : (
        <ListView
          designs={filteredDesigns}
          onView={handleViewDesign}
          onEdit={handleEditDesign}
          onDuplicate={handleDuplicateDesign}
          onExport={handleExportDesign}
          onShare={handleShareDesign}
          onDelete={handleDeleteDesign}
          isExporting={exportDesign.isPending}
          isSharing={shareDesign.isPending}
        />
      )}

      {/* Pagination */}
      {designsData?.meta && designsData.meta.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={designsData.meta.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Design</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this design? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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
    </div>
  );
}

// Grid View Component
function GridView({
  designs,
  onView,
  onEdit,
  onDuplicate,
  onExport,
  onShare,
  onDelete,
  isExporting,
  isSharing,
}: {
  designs: DesignResponse[];
  onView: (design: DesignResponse) => void;
  onEdit: (design: DesignResponse) => void;
  onDuplicate: (design: DesignResponse) => void;
  onExport: (design: DesignResponse) => void;
  onShare: (design: DesignResponse) => void;
  onDelete: (designId: string) => void;
  isExporting: boolean;
  isSharing: boolean;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {designs.map((design) => (
        <Card
          key={design.id}
          className="group hover:shadow-lg transition-shadow"
        >
          <CardHeader className="p-4">
            <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden mb-3">
              {design.preview ? (
                <img
                  src={design.preview}
                  alt={design.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => onView(design)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Eye className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {design.name}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {design.template.name}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(design)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(design)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(design)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onShare(design)}
                    disabled={isSharing}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onExport(design)}
                    disabled={isExporting}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(design.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardFooter className="px-4 pb-4 pt-0">
            <div className="flex items-center justify-between w-full">
              <Badge
                variant="secondary"
                className={statusColors[design.status]}
              >
                {statusLabels[design.status]}
              </Badge>

              <div className="flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(design.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

// List View Component
function ListView({
  designs,
  onView,
  onEdit,
  onDuplicate,
  onExport,
  onShare,
  onDelete,
  isExporting,
  isSharing,
}: {
  designs: DesignResponse[];
  onView: (design: DesignResponse) => void;
  onEdit: (design: DesignResponse) => void;
  onDuplicate: (design: DesignResponse) => void;
  onExport: (design: DesignResponse) => void;
  onShare: (design: DesignResponse) => void;
  onDelete: (designId: string) => void;
  isExporting: boolean;
  isSharing: boolean;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Design
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Template
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Elements
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {designs.map((design) => (
              <tr key={design.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden mr-4">
                      {design.preview ? (
                        <img
                          src={design.preview}
                          alt={design.name}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => onView(design)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Eye className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {design.name}
                      </div>
                      {design.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {design.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {design.template.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {design.template.category}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <Badge
                    variant="secondary"
                    className={statusColors[design.status]}
                  >
                    {statusLabels[design.status]}
                  </Badge>
                  {design.isTemplate && (
                    <Badge variant="outline" className="ml-2">
                      <Tag className="w-3 h-3 mr-1" />
                      Template
                    </Badge>
                  )}
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(design.updatedAt).toLocaleDateString()}
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  {design.customizations.elements.length} element
                  {design.customizations.elements.length !== 1 ? "s" : ""}
                </td>

                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(design)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(design)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicate(design)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onShare(design)}
                        disabled={isSharing}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onExport(design)}
                        disabled={isExporting}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(design.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ searchQuery }: { searchQuery: string }) {
  const router = useRouter();

  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Grid3X3 className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {searchQuery ? "No designs found" : "No designs yet"}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {searchQuery
          ? `No designs match "${searchQuery}". Try adjusting your search terms or filters.`
          : "Start creating beautiful designs with our easy-to-use design studio."}
      </p>
      <Button onClick={() => router.push("/templates")} size="lg">
        <Plus className="w-5 h-5 mr-2" />
        Create Your First Design
      </Button>
    </div>
  );
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const maxVisiblePages = 5;

  let visiblePages = pages;
  if (totalPages > maxVisiblePages) {
    const start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const end = Math.min(totalPages, start + maxVisiblePages - 1);
    visiblePages = pages.slice(start - 1, end);
  }

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>

      {visiblePages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
          className="w-10"
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
}

// Loading Skeleton
function DesignsSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }, (_, i) => (
          <Card key={i}>
            <CardHeader className="p-4">
              <Skeleton className="aspect-[4/3] w-full rounded-lg mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardFooter className="px-4 pb-4 pt-0">
              <div className="flex justify-between w-full">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Design
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Template
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Updated
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Elements
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: 5 }, (_, i) => (
            <tr key={i}>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <Skeleton className="w-12 h-12 rounded-lg mr-4" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-6 w-16 rounded-full" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="px-6 py-4 text-right">
                <Skeleton className="h-8 w-8 rounded" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
