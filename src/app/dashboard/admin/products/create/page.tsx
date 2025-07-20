/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Loader2,
  Save,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  DollarSign,
} from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import FormMedia from "@/components/ui/form-media";
import {
  createProductSchema,
  type CreateProductDto,
} from "@/lib/products/dto/products.dto";
import { useCreateProduct } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import {
  useCustomizationOptionsByCategory,
  useCustomizationValues,
} from "@/hooks/use-customization";
import type { CategoryResponse } from "@/lib/categories/types/categories.types";
import type {
  CustomizationOption,
  CustomizationValue,
} from "@/lib/customization/types/options.types";
import type { MediaFileType } from "@/lib/uploads/dto/create-upload.dto";

// Create a form schema that extends the base product schema
const createProductFormSchema = createProductSchema.extend({
  mediaFiles: z
    .array(
      z.object({
        id: z.string(),
        src: z.string(),
        type: z.enum([
          "IMAGE",
          "VIDEO",
          "AUDIO",
          "DOCUMENT",
          "STICKER",
          "VOICE",
        ]),
      })
    )
    .default([]),
});

type CreateProductFormData = z.infer<typeof createProductFormSchema>;

// Utility function to safely extract arrays from API responses
function extractArrayFromResponse<T>(response: any): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;

  // Check common nested array properties
  const arrayKeys = ["data", "items", "results", "content", "list"];
  for (const key of arrayKeys) {
    if (response[key] && Array.isArray(response[key])) {
      return response[key];
    }
  }

  return [];
}

// Component to display customization option with its values
function CustomizationOptionCard({ option }: { option: CustomizationOption }) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: valuesData, isLoading: valuesLoading } = useCustomizationValues(
    {
      optionId: option.id,
    }
  );

  const values = useMemo(
    () => extractArrayFromResponse<CustomizationValue>(valuesData),
    [valuesData]
  );

  const formatPriceAdjustment = (adjustment: number) => {
    if (adjustment === 0) return "No additional cost";
    if (adjustment > 0) return `+${adjustment.toFixed(2)}`;
    return `-${Math.abs(adjustment).toFixed(2)}`;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">{option.displayName}</h4>
                {option.required && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {option.type}
                </Badge>
              </div>
              {option.description && (
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>
                  {values.length} {values.length === 1 ? "option" : "options"}
                </span>
                {values.length > 0 && (
                  <span>
                    Price range: $
                    {Math.min(
                      ...values.map(
                        (v: CustomizationValue) => v.priceAdjustment || 0
                      )
                    ).toFixed(2)}{" "}
                    - $
                    {Math.max(
                      ...values.map(
                        (v: CustomizationValue) => v.priceAdjustment || 0
                      )
                    ).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t px-4 pb-4">
            {valuesLoading ? (
              <div className="space-y-2 pt-4">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : values.length > 0 ? (
              <div className="pt-4">
                <h5 className="text-sm font-medium mb-3 text-muted-foreground">
                  Available Options:
                </h5>
                <div className="grid gap-2">
                  {values.map((value: CustomizationValue) => (
                    <div
                      key={value.id}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/30"
                    >
                      <div>
                        <span className="font-medium text-sm">
                          {value.displayName}
                        </span>
                        {value.value !== value.displayName && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({value.value})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="h-3 w-3" />
                        <span
                          className={
                            (value.priceAdjustment || 0) > 0
                              ? "text-red-600"
                              : (value.priceAdjustment || 0) < 0
                                ? "text-green-600"
                                : "text-muted-foreground"
                          }
                        >
                          {formatPriceAdjustment(value.priceAdjustment || 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No values configured for this option
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export default function CreateProductPage() {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Use the hooks
  const createProductMutation = useCreateProduct();
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const { data: customizationData, isLoading: customizationLoading } =
    useCustomizationOptionsByCategory(selectedCategoryId);

  // Safely extract arrays from API responses
  const categories = useMemo(
    () => extractArrayFromResponse<CategoryResponse>(categoriesData),
    [categoriesData]
  );

  const customizationOptions = useMemo(
    () => extractArrayFromResponse<CustomizationOption>(customizationData),
    [customizationData]
  );

  const form = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      basePrice: 0,
      sku: "",
      stock: 0,
      images: [],
      thumbnailImage: "",
      minOrderQuantity: 1,
      maxOrderQuantity: undefined,
      customizableAreas: {},
      metaTitle: "",
      metaDescription: "",
      isFeatured: false,
      isActive: true,
      categoryId: "",
      mediaFiles: [],
    },
  });

  const onSubmit = async (data: CreateProductFormData) => {
    try {
      // Extract image URLs from MediaFileType array
      const imageUrls = data.mediaFiles?.map((file) => file.src) || [];

      const formData: CreateProductDto = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        basePrice: data.basePrice,
        sku: data.sku,
        stock: data.stock,
        images: imageUrls,
        thumbnailImage: imageUrls.length > 0 ? imageUrls[0] : undefined, // Use first image as thumbnail
        minOrderQuantity: data.minOrderQuantity,
        maxOrderQuantity: data.maxOrderQuantity,
        customizableAreas: data.customizableAreas,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        categoryId: data.categoryId,
      };

      await createProductMutation.mutateAsync(formData);
      router.push("/dashboard/admin/products");
    } catch (error) {
      // Error handling is done in the mutation's onError
      console.error("Error creating product:", error);
    }
  };

  // Generate slug from name
  const generateSlug = () => {
    const name = form.getValues("name");
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      form.setValue("slug", slug);
    }
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    form.setValue("categoryId", categoryId);
    setSelectedCategoryId(categoryId);
  };

  // Error state
  if (categoriesError) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load categories. Please refresh the page.
            <Link href="/dashboard/admin/products" className="ml-2 underline">
              Return to products
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/admin/products">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">
              Create Product
            </h1>
          </div>
          <p className="text-muted-foreground">
            Add a new product to your catalog
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/admin/products">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={createProductMutation.isPending}
          >
            {createProductMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Product
              </>
            )}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid grid-cols-2 md:grid-cols-7 lg:w-[700px]">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="customization">Customization</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Enter the basic details about your product.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter product name"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              if (!form.getValues("slug")) {
                                setTimeout(generateSlug, 500);
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          The name of your product as it will appear to
                          customers.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder="product-slug" {...field} />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={generateSlug}
                          >
                            Generate
                          </Button>
                        </div>
                        <FormDescription>
                          The URL-friendly version of the product name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your product..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed description of the product, including
                          features and benefits.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={handleCategoryChange}
                          defaultValue={field.value}
                          disabled={categoriesLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  categoriesLoading
                                    ? "Loading categories..."
                                    : "Select a category"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoriesLoading ? (
                              <div className="p-2">
                                <Skeleton className="h-4 w-full" />
                              </div>
                            ) : categories.length > 0 ? (
                              categories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.name}
                                  {!category.isActive && " (Inactive)"}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-sm text-muted-foreground">
                                No categories found. Please create a category
                                first.
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The category this product belongs to.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Information</CardTitle>
                  <CardDescription>
                    Set the pricing details for your product.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          The base price of the product before any
                          customizations.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="minOrderQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Order Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="1"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 1)
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            The minimum quantity that can be ordered.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxOrderQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Order Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="Optional"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => {
                                const value =
                                  e.target.value === ""
                                    ? undefined
                                    : parseInt(e.target.value);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            The maximum quantity that can be ordered (optional).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inventory Tab */}
            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Information</CardTitle>
                  <CardDescription>
                    Manage inventory and stock for your product.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
                        <FormControl>
                          <Input placeholder="SKU-001" {...field} />
                        </FormControl>
                        <FormDescription>
                          A unique identifier for your product.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          The current stock level for this product.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images">
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>
                    Upload images for your product. The first image will be used
                    as the default thumbnail.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormMedia
                    name="mediaFiles"
                    control={form.control}
                    label="Product Images"
                    multiple={true}
                  />
                  <div className="text-sm text-muted-foreground">
                    <p>
                      • The first image will automatically be used as the
                      thumbnail
                    </p>
                    <p>• You can reorder images by using the arrow buttons</p>
                    <p>• Recommended image size: 1200x1200px or larger</p>
                    <p>• Supported formats: JPG, PNG, WebP</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Customization Tab */}
            <TabsContent value="customization">
              <Card>
                <CardHeader>
                  <CardTitle>Customization Options</CardTitle>
                  <CardDescription>
                    Configure customization options available for this product.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedCategoryId ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>
                        Please select a category first to see available
                        customization options.
                      </p>
                    </div>
                  ) : customizationLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : customizationOptions.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Available customization options for the selected
                        category:
                      </p>
                      <div className="grid gap-3">
                        {customizationOptions.map((option) => (
                          <CustomizationOptionCard
                            key={option.id}
                            option={option}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>
                        No customization options available for this category.
                      </p>
                      <p className="text-sm mt-2">
                        You can add customization options in the Categories
                        section.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo">
              <Card>
                <CardHeader>
                  <CardTitle>SEO Information</CardTitle>
                  <CardDescription>
                    Optimize your product for search engines.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title</FormLabel>
                        <FormControl>
                          <Input placeholder="SEO Title" {...field} />
                        </FormControl>
                        <FormDescription>
                          The title that appears in search engine results
                          (defaults to product name if left empty).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description for search engines..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A short description that appears in search engine
                          results.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Product Settings</CardTitle>
                  <CardDescription>
                    Configure additional settings for your product.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Active Status
                          </FormLabel>
                          <FormDescription>
                            When active, the product will be visible to
                            customers.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Featured Product
                          </FormLabel>
                          <FormDescription>
                            Featured products are displayed prominently on your
                            store.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
            <Link href="/dashboard/admin/products">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={createProductMutation.isPending}>
              {createProductMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Product
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
