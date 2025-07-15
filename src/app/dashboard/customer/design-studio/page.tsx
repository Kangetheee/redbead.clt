/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Folder,
  LayoutDashboard,
  StickyNote,
  Plus,
  Search,
  Loader2,
  Star,
  TrendingUp,
  Clock,
  Image,
  FileText,
  Palette,
  Zap,
  Eye,
  Copy,
  ArrowRight,
  Grid3X3,
  Megaphone,
  Calendar,
  Award,
  Camera,
  Printer,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUseDesignTemplate } from "@/hooks/use-design-studio";
import { useUserDesignsList, useDuplicateDesign } from "@/hooks/use-designs";
import { useFeaturedDesignTemplates } from "@/hooks/use-design-templates";
import { useCategories } from "@/hooks/use-categories";
import type {
  GetDesignsDto,
  DesignResponseDto,
} from "@/lib/designs/dto/designs.dto";
import type {
  GetFeaturedTemplatesDto,
  DesignTemplateResponseDto,
} from "@/lib/designs/dto/design-templates.dto";
import type { CategoryWithRelations } from "@/lib/categories/types/categories.types";

// Featured product categories with proper typing
interface ProductCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  popular?: boolean;
  comingSoon?: boolean;
  productCount?: number;
  slug: string;
}

// Using the proper design template response DTO
type DesignTemplate = DesignTemplateResponseDto;

// Icon mapping for different category types
const getCategoryIcon = (slug: string, name: string) => {
  const iconMap: Record<string, any> = {
    "business-cards": FileText,
    flyers: Image,
    flyer: Image,
    posters: LayoutDashboard,
    poster: LayoutDashboard,
    "social-media": Zap,
    social: Zap,
    brochures: Folder,
    brochure: Folder,
    banners: TrendingUp,
    banner: TrendingUp,
    calendars: Calendar,
    calendar: Calendar,
    certificates: Award,
    certificate: Award,
    invitations: Megaphone,
    invitation: Megaphone,
    photos: Camera,
    photo: Camera,
    prints: Printer,
    print: Printer,
  };

  // Check by slug first, then by name (lowercase)
  return (
    iconMap[slug.toLowerCase()] ||
    iconMap[name.toLowerCase()] ||
    iconMap[name.toLowerCase().replace(/\s+/g, "-")] ||
    Grid3X3
  );
};

// Color mapping for categories
const getCategoryColor = (index: number) => {
  const colors = [
    "bg-blue-100 text-blue-600",
    "bg-green-100 text-green-600",
    "bg-purple-100 text-purple-600",
    "bg-pink-100 text-pink-600",
    "bg-orange-100 text-orange-600",
    "bg-indigo-100 text-indigo-600",
    "bg-red-100 text-red-600",
    "bg-yellow-100 text-yellow-600",
    "bg-teal-100 text-teal-600",
    "bg-cyan-100 text-cyan-600",
  ];
  return colors[index % colors.length];
};

// Determine if category should be marked as popular based on product count
const isPopularCategory = (productCount: number) => {
  return productCount >= 5; // Categories with 5+ products are considered popular
};

// Transform API category data to ProductCategory format
const transformCategoriesToProducts = (
  categories: CategoryWithRelations[]
): ProductCategory[] => {
  return categories
    .filter((category) => category.isActive) // Only show active categories
    .map((category, index) => ({
      id: category.id,
      name: category.name,
      description:
        category.description ||
        `Professional ${category.name.toLowerCase()} designs`,
      icon: getCategoryIcon(category.slug, category.name),
      color: getCategoryColor(index),
      popular: isPopularCategory(category.productCount),
      comingSoon: category.productCount === 0, // Categories with no products are "coming soon"
      productCount: category.productCount,
      slug: category.slug,
    }))
    .sort((a, b) => {
      // Sort by: popular first, then by product count, then alphabetically
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      if (a.productCount !== b.productCount) {
        return (b.productCount || 0) - (a.productCount || 0);
      }
      return a.name.localeCompare(b.name);
    });
};

// Type guard utilities for design templates API responses
const isDesignTemplatesResponse = (
  data: any
): data is { items: DesignTemplate[] } => {
  return data && typeof data === "object" && "items" in data;
};

const getTemplatesFromResponse = (response: any): DesignTemplate[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response.slice(0, 6); // Limit for home page
  if (isDesignTemplatesResponse(response))
    return response.items?.slice(0, 6) || [];
  return [];
};

export default function DesignStudioHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Fetch categories from API
  const { data: categoriesResponse, isLoading: loadingCategories } =
    useCategories({
      page: 1,
      limit: 20, // Get more categories to have good selection
      isActive: true,
    });

  // Transform categories to product format
  const featuredProducts = useMemo(() => {
    if (!categoriesResponse?.items) return [];
    return transformCategoriesToProducts(categoriesResponse.items);
  }, [categoriesResponse]);

  // Fetch recent user designs (limit to 6 for home page)
  const recentDesignsParams: GetDesignsDto = {
    page: 1,
    limit: 6,
    isTemplate: false,
  };

  const { data: recentDesignsResponse, isLoading: loadingRecentDesigns } =
    useUserDesignsList(recentDesignsParams);

  // Fetch featured templates (limit to 6 for home page)
  const featuredTemplatesParams: GetFeaturedTemplatesDto = { limit: 6 };
  const { data: templatesResponse, isLoading: loadingTemplates } =
    useFeaturedDesignTemplates(featuredTemplatesParams);

  // Mutations
  const useTemplate = useUseDesignTemplate();
  const duplicateDesign = useDuplicateDesign();

  // Extract data with proper typing
  const recentDesigns: DesignResponseDto[] = recentDesignsResponse?.items || [];
  const featuredTemplates: DesignTemplate[] =
    getTemplatesFromResponse(templatesResponse);
  const designStats = recentDesignsResponse?.meta;

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(
        `/design-studio/saved-designs?search=${encodeURIComponent(searchQuery)}`
      );
    }
  };

  const handleUseTemplate = async (
    templateId: string,
    templateName: string
  ) => {
    try {
      const result = await useTemplate.mutateAsync(templateId);
      if (result.success) {
        toast.success(`Template "${templateName}" applied successfully!`);
        router.push(`/design-studio/edit/${result.data.id}`);
      }
    } catch (error) {
      console.error("Failed to use template:", error);
      toast.error("Failed to apply template");
    }
  };

  const handleDuplicateDesign = async (
    designId: string,
    originalName: string
  ) => {
    try {
      await duplicateDesign.mutateAsync({
        designId,
        values: {
          name: `${originalName} (Copy)`,
          description: "Duplicated design",
        },
      });
      toast.success("Design duplicated successfully!");
    } catch (error) {
      console.error("Failed to duplicate design:", error);
      toast.error("Failed to duplicate design");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return "text-green-600 bg-green-50 border-green-200";
      case "draft":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "archived":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Design Studio</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create stunning designs for your print products with professional
          tools and templates
        </p>

        {/* Quick Search */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your designs..."
              className="pl-10 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {searchQuery && (
              <Button
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8"
                onClick={handleSearch}
              >
                Search
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/customer/design-studio/saved-designs">
          <Card className="transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer border-2 hover:border-primary">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <Folder className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Your Designs</h3>
                <p className="text-sm text-muted-foreground">
                  {designStats
                    ? `${designStats.totalItems} saved designs`
                    : "Access your saved designs"}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/design-studio/templates">
          <Card className="transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer border-2 hover:border-primary">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                <StickyNote className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Professional design templates
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Card className="border-2 border-dashed border-muted-foreground/25">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <Palette className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Design Tools</h3>
              <p className="text-sm text-muted-foreground">
                Everything you need to create
              </p>
            </div>
            <div className="text-muted-foreground">
              <LayoutDashboard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Categories */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Start a New Design</h2>
            <p className="text-muted-foreground">
              Choose a product category to begin
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Popular choices
          </Badge>
        </div>

        {loadingCategories ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading categories...</span>
          </div>
        ) : featuredProducts.length === 0 ? (
          <Card className="border-2 border-dashed border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Grid3X3 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No categories available
              </h3>
              <p className="text-muted-foreground text-center">
                Product categories will appear here once they&apos;re added
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => {
              const IconComponent = product.icon;
              return (
                <Link
                  key={product.id}
                  href={`/dashboard/customer/browse/${product.slug}`}
                >
                  <Card
                    className={`h-full transition-all hover:scale-[1.02] cursor-pointer border-2 hover:border-primary ${
                      product.comingSoon ? "opacity-60" : ""
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-lg ${product.color}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="flex gap-1">
                          {product.popular && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                          {product.comingSoon && (
                            <Badge variant="outline" className="text-xs">
                              Soon
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-4">
                        {product.description}
                      </p>
                      {product.productCount !== undefined && (
                        <p className="text-xs text-muted-foreground mb-4">
                          {product.productCount} products available
                        </p>
                      )}
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={product.comingSoon}
                      >
                        {product.comingSoon ? "Coming Soon" : "Browse Products"}
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Designs */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Recent Designs</h2>
            <p className="text-muted-foreground">Pick up where you left off</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/customer/design-studio/saved-designs">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {loadingRecentDesigns ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading recent designs...</span>
          </div>
        ) : recentDesigns.length === 0 ? (
          <Card className="border-2 border-dashed border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Folder className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No designs yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start creating your first design to see it here
              </p>
              <Button asChild>
                <Link href="/dashboard/customer/design-studio/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Design
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentDesigns.map((design) => (
              <Card
                key={design.id}
                className="group hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
                  {design.preview ? (
                    <img
                      src={design.preview}
                      alt={design.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <Folder className="h-8 w-8 text-muted-foreground" />
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDuplicateDesign(design.id, design.name);
                      }}
                      disabled={duplicateDesign.isPending}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg truncate">
                      {design.name}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getStatusColor(design.status)}`}
                    >
                      {design.status}
                    </Badge>
                  </div>
                  {design.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {design.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span>{design.product.name}</span>
                    <span>v{design.version}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {new Date(design.updatedAt).toLocaleDateString()}
                    </span>
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/dashboard/customer/design-studio/edit/${design.id}`}
                      >
                        Edit
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Featured Templates */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Featured Templates</h2>
            <p className="text-muted-foreground">
              Get started with professional designs
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/customer/design-studio/templates">
              Browse All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {loadingTemplates ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading templates...</span>
          </div>
        ) : featuredTemplates.length === 0 ? (
          <Card className="border-2 border-dashed border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <StickyNote className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Templates coming soon
              </h3>
              <p className="text-muted-foreground text-center">
                Professional templates will be available here shortly
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTemplates.map((template) => (
              <Card
                key={template.id}
                className="group hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
                  {template.previewImage ? (
                    <img
                      src={template.previewImage}
                      alt={template.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <StickyNote className="h-8 w-8 text-muted-foreground" />
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {template.isFeatured && (
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {template.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Active
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
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span>Template</span>
                    <span className="text-xs">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() =>
                        handleUseTemplate(template.id, template.name)
                      }
                      disabled={useTemplate.isPending}
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
        )}
      </section>

      {/* Statistics */}
      {(recentDesigns.length > 0 || featuredTemplates.length > 0) && (
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-blue-600">
                  {designStats?.totalItems || recentDesigns.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Your Designs
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-green-600">
                  {featuredTemplates.length}
                </div>
                <div className="text-sm text-muted-foreground">Featured</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-purple-600">
                  {featuredProducts.filter((p) => !p.comingSoon).length}
                </div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-orange-600">
                  {recentDesigns.filter((d) => d.status === "published").length}
                </div>
                <div className="text-sm text-muted-foreground">Published</div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
