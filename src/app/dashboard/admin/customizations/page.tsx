/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useRouter } from "next/navigation";
import {
  Plus,
  Settings,
  BarChart3,
  Palette,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomizationOptions } from "@/hooks/use-customization";
import { useCategories } from "@/hooks/use-categories";
import { CustomizationOptionType } from "@/lib/customization/dto/options.dto";

const OPTION_TYPE_LABELS: Record<CustomizationOptionType, string> = {
  DROPDOWN: "Dropdown",
  COLOR_PICKER: "Color Picker",
  TEXT_INPUT: "Text Input",
  FILE_UPLOAD: "File Upload",
  NUMBER_INPUT: "Number Input",
  CHECKBOX: "Checkbox",
  RADIO: "Radio",
};

export default function CustomizationDashboardPage() {
  const router = useRouter();

  const { data: optionsResponse, isLoading: optionsLoading } =
    useCustomizationOptions({
      limit: 10,
    });
  const { data: categoriesResponse, isLoading: categoriesLoading } =
    useCategories({
      limit: 5,
    });

  const totalOptions = optionsResponse?.success
    ? optionsResponse.data.meta.totalPages
    : 0;
  const recentOptions = optionsResponse?.success
    ? optionsResponse.data.items
    : [];

  // Handle categories data - useCategories hook already transforms the data via select
  const categoriesData = categoriesResponse || {
    data: [],
    pagination: { total: 0 },
  };
  const totalCategories = categoriesData || 0;
  const recentCategories = Array.isArray(categoriesData) ? categoriesData : [];

  // Debug logging - remove in production
  console.log("Categories Response:", categoriesResponse);
  console.log("Recent Categories:", recentCategories);

  // Calculate type distribution with safe defaults
  const typeStats = recentOptions.reduce(
    (acc, option) => {
      if (option && option.type) {
        acc[option.type] = (acc[option.type] || 0) + 1;
      }
      return acc;
    },
    {} as Record<CustomizationOptionType, number>
  );

  const stats = [
    {
      title: "Total Options",
      value: Number(totalOptions) || 0,
      description: "Customization options",
      icon: Settings,
      href: "/dashboard/admin/customizations/options",
      trend: "+12% from last month",
    },
    {
      title: "Categories",
      value: Number(totalCategories) || 0,
      description: "Product categories",
      icon: BarChart3,
      href: "/dashboard/admin/categories",
      trend: "+3 new categories",
    },
    {
      title: "Active Options",
      value: recentOptions.filter((o) => o && o.required).length || 0,
      description: "Required options",
      icon: Palette,
      href: "/dashboard/admin/customizations/options?required=true",
      trend: `${recentOptions.filter((o) => o && !o.required).length || 0} optional`,
    },
  ];

  const getTypeColor = (type: CustomizationOptionType) => {
    const colorMap = {
      DROPDOWN: "bg-blue-100 text-blue-800",
      COLOR_PICKER: "bg-purple-100 text-purple-800",
      TEXT_INPUT: "bg-green-100 text-green-800",
      FILE_UPLOAD: "bg-orange-100 text-orange-800",
      NUMBER_INPUT: "bg-cyan-100 text-cyan-800",
      CHECKBOX: "bg-pink-100 text-pink-800",
      RADIO: "bg-yellow-100 text-yellow-800",
    };
    return colorMap[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Customization Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage product customization options and monitor system overview
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push("/dashboard/admin/customizations/options")
            }
          >
            <Settings className="mr-2 h-4 w-4" />
            Manage Options
          </Button>
          <Button
            onClick={() =>
              router.push("/dashboard/admin/customizations/options/create")
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Option
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => router.push(stat.href)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{String(stat.value)}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <p className="text-xs text-green-600 mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Options */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Options</CardTitle>
                <CardDescription>
                  Latest customization options ({recentOptions.length})
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push("/dashboard/admin/customizations/options")
                }
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {optionsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : recentOptions.length === 0 ? (
              <div className="text-center py-8">
                <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No options created yet
                </p>
                <Button
                  onClick={() =>
                    router.push(
                      "/dashboard/admin/customizations/options/create"
                    )
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Option
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOptions.slice(0, 5).map((option) => {
                  // Ensure option is a valid object
                  if (!option || typeof option !== "object" || !option.id) {
                    return null;
                  }

                  return (
                    <div
                      key={option.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">
                            {option.displayName || "Unnamed Option"}
                          </p>
                          <Badge
                            className={getTypeColor(option.type)}
                            variant="secondary"
                          >
                            {OPTION_TYPE_LABELS[option.type] || option.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {option.description || "No description"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={option.required ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {option.required ? "Required" : "Optional"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Order: {option.sortOrder || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/dashboard/admin/customizations/options/${option.id}`
                            )
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/dashboard/admin/customizations/options/${option.id}/edit`
                            )
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Option Types Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Option Types</CardTitle>
            <CardDescription>
              Distribution of customization option types
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(typeStats).length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(typeStats).map(([type, count]) => {
                  // Ensure we have valid data
                  if (!type || typeof count !== "number") {
                    return null;
                  }

                  const typedType = type as CustomizationOptionType;
                  const percentage =
                    recentOptions.length > 0
                      ? (count / recentOptions.length) * 100
                      : 0;

                  return (
                    <div
                      key={type}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(typedType)}>
                          {OPTION_TYPE_LABELS[typedType] || type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${Math.max(0, Math.min(100, percentage))}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Categories Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Product categories with customization options
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/admin/categories")}
            >
              Manage Categories
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {categoriesLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : !Array.isArray(recentCategories) ||
            recentCategories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No categories found</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentCategories.map((category) => {
                // Ensure category is an object with expected properties
                if (!category || typeof category !== "object" || !category.id) {
                  return null;
                }

                return (
                  <div key={category.id} className="p-4 border rounded-lg">
                    <h4 className="font-medium">
                      {category.name || "Unnamed Category"}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge
                        variant={category.isActive ? "default" : "secondary"}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/dashboard/admin/categories/${category.id}`
                          )
                        }
                      >
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common customization management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() =>
                router.push("/dashboard/admin/customizations/options/create")
              }
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Plus className="h-4 w-4" />
                  <span className="font-medium">Create Option</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add new customization option
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() =>
                router.push("/dashboard/admin/customizations/options")
              }
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Settings className="h-4 w-4" />
                  <span className="font-medium">Manage Options</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  View and edit all options
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => router.push("/dashboard/admin/categories")}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="h-4 w-4" />
                  <span className="font-medium">Categories</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Manage product categories
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => router.push("/dashboard/admin/products")}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Palette className="h-4 w-4" />
                  <span className="font-medium">Products</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Link options to products
                </p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
