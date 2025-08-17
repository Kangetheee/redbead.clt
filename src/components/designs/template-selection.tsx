"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDesignTemplates } from "@/hooks/use-design-templates";
import { GetTemplatesDto } from "@/lib/design-templates/dto/design-template.dto";
import {
  DesignTemplate,
  // TemplateListResponse
} from "@/lib/design-templates/types/design-template.types";
import {
  Loader2,
  Search,
  Filter,
  ArrowLeft,
  Star,
  Package,
} from "lucide-react";
import { formatAmount } from "@/lib/utils";

interface TemplateSelectionPageProps {
  productId?: string;
  categoryId?: string;
  onTemplateSelect?: (template: DesignTemplate) => void;
  enableRouterNavigation?: boolean;
  showBackButton?: boolean;
  backButtonUrl?: string;
}

const TemplateSelectionPage: React.FC<TemplateSelectionPageProps> = ({
  productId,
  categoryId,
  onTemplateSelect,
  enableRouterNavigation = true,
  showBackButton = true,
  backButtonUrl = "/",
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<GetTemplatesDto>({
    pageIndex: 0,
    pageSize: 12,
    productId,
    categoryId,
    isActive: true,
  });

  const {
    data: templatesResponse,
    isLoading,
    error,
  } = useDesignTemplates({
    ...filters,
    search: searchQuery || undefined,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (newFilters: Partial<GetTemplatesDto>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      pageIndex: 0, // Reset to first page when filters change
    }));
  };

  const handleTemplateSelect = (template: DesignTemplate) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    } else if (enableRouterNavigation) {
      // Navigate using template ID
      router.push(`/design-studio/${template.id}`);
    }
  };

  const handlePageChange = (pageIndex: number) => {
    setFilters((prev) => ({ ...prev, pageIndex }));
  };

  const handleBackClick = () => {
    if (enableRouterNavigation) router.push(backButtonUrl);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-red-500 dark:text-red-400 mb-2">
          Error loading templates
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Please try again later
        </p>
      </div>
    );
  }

  // Extract data based on the actual hook response structure
  const templates = templatesResponse?.success
    ? templatesResponse.data.items
    : [];
  const meta = templatesResponse?.success ? templatesResponse.data.meta : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-white dark:bg-gray-900 min-h-screen">
      {/* Back Button */}
      {showBackButton && (
        <div className="mb-6">
          <button
            onClick={handleBackClick}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Select a Design Template
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose from our collection of professionally designed templates
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() =>
                handleFilterChange({
                  isActive:
                    filters.isActive === undefined ? true : !filters.isActive,
                })
              }
              className="px-4 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Filter className="w-4 h-4 inline mr-2" />
              {filters.isActive === false ? "Show Active" : "Show All"}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 dark:text-blue-400" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            Loading templates...
          </span>
        </div>
      )}

      {/* Templates Grid */}
      {!isLoading && templates.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => handleTemplateSelect(template)}
              />
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.pageCount > 1 && (
            <Pagination
              currentPage={meta.currentPage}
              totalPages={meta.pageCount}
              onPageChange={(page) => handlePageChange(page - 1)} // Convert to 0-based index
            />
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && templates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No templates found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

// Template Card Component (Updated to match actual DesignTemplate interface)
interface TemplateCardProps {
  template: DesignTemplate;
  onSelect: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  // Helper functions based on actual DesignTemplate interface
  const getLeadTime = () => {
    return template.metadata?.leadTime || "3-5 days";
  };

  const isFeatured = () => {
    return template.metadata?.featured === true;
  };

  const getDefaultPrice = () => {
    // Get default variant price or fall back to base price
    const defaultVariant = template.sizeVariants?.find(
      (v) => v.isDefault && v.isActive
    );
    return defaultVariant?.price || template.basePrice;
  };

  const getActiveVariantsCount = () => {
    return template.sizeVariants?.filter((v) => v.isActive).length || 0;
  };

  const getActiveFontsCount = () => {
    return template.fontPresets?.filter((f) => f.isActive).length || 0;
  };

  const getActiveColorsCount = () => {
    return template.colorPresets?.filter((c) => c.isActive).length || 0;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md dark:hover:shadow-lg transition-shadow group">
      {/* Template Image */}
      <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
        <img
          src={template.thumbnail}
          alt={template.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder-template.png"; // Fallback image
          }}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          {isFeatured() && (
            <span className="bg-blue-500 dark:bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3" />
              Featured
            </span>
          )}
          {getActiveVariantsCount() > 0 && (
            <span className="bg-green-500 dark:bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Package className="w-3 h-3" />
              {getActiveVariantsCount()} sizes
            </span>
          )}
        </div>

        {/* Quick Info Overlay */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-85 text-white text-xs px-2 py-1 rounded">
          {getLeadTime()}
        </div>
      </div>

      {/* Template Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
          {template.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {template.description || "Professional design template"}
        </p>

        {/* Template Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatAmount(getDefaultPrice())}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {template.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {getActiveVariantsCount()} size
              {getActiveVariantsCount() !== 1 ? "s" : ""}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {getActiveColorsCount()} color
              {getActiveColorsCount() !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Available Options */}
          <div className="flex flex-wrap gap-1 mt-2">
            {getActiveFontsCount() > 0 && (
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                {getActiveFontsCount()} fonts
              </span>
            )}
            {template.mediaRestrictions &&
              template.mediaRestrictions.length > 0 && (
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                  Custom uploads
                </span>
              )}
          </div>

          {/* Category and Product Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>{template.category?.name}</span>
            <span>{template.product?.name}</span>
          </div>

          {/* Tags */}
          {template.metadata?.tags && template.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {template.metadata.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
              {template.metadata.tags.length > 2 && (
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                  +{template.metadata.tags.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Select Button */}
        <button
          onClick={onSelect}
          className="w-full bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          disabled={!template.isActive}
        >
          {template.isActive ? "Select Template" : "Template Unavailable"}
        </button>
      </div>
    </div>
  );
};

// Pagination Component (Updated to work with the actual meta structure)
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (page) =>
      page === 1 ||
      page === totalPages ||
      (page >= currentPage - 1 && page <= currentPage + 1)
  );

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      {/* Page Numbers */}
      {visiblePages.map((page, index) => {
        const prevPage = visiblePages[index - 1];
        const showEllipsis = prevPage && page - prevPage > 1;

        return (
          <React.Fragment key={page}>
            {showEllipsis && (
              <span className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                ...
              </span>
            )}
            <button
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                currentPage === page
                  ? "bg-blue-500 dark:bg-blue-600 text-white"
                  : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {page}
            </button>
          </React.Fragment>
        );
      })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

export default TemplateSelectionPage;
