/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, ImageIcon } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  createCategorySchema,
  updateCategorySchema,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/lib/categories/dto/categories.dto";
import {
  useCreateCategory,
  useUpdateCategory,
  useCategories,
} from "@/hooks/use-categories";
import { CategoryWithRelations } from "@/lib/categories/types/categories.types";

interface CategoryFormProps {
  category?: CategoryWithRelations;
  mode: "create" | "edit";
}

export default function CategoryForm({ category, mode }: CategoryFormProps) {
  const router = useRouter();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  // Get categories for parent selection (exclude current category if editing)
  const { data: categoriesResponse } = useCategories({ limit: 100 });
  const availableParents =
    categoriesResponse?.items?.filter((cat: CategoryWithRelations) =>
      mode === "edit" ? cat.id !== category?.id : true
    ) || [];

  availableParents.map((cat: CategoryWithRelations) => (
    <SelectItem key={cat.id} value={cat.id}>
      {cat.name}
    </SelectItem>
  ));

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const schema =
    mode === "create" ? createCategorySchema : updateCategorySchema;

  const form = useForm<CreateCategoryDto | UpdateCategoryDto>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "edit" && category
        ? {
            name: category.name,
            slug: category.slug,
            description: category.description || "",
            metaTitle: category.metaTitle || "",
            metaDescription: category.metaDescription || "",
            thumbnailImage: category.thumbnailImage || "",
            bannerImage: category.bannerImage || "",
            isActive: category.isActive,
            sortOrder: category.sortOrder,
            parentId: category.parentId || "",
          }
        : {
            name: "",
            slug: "",
            description: "",
            metaTitle: "",
            metaDescription: "",
            thumbnailImage: "",
            bannerImage: "",
            isActive: true,
            sortOrder: 0,
            parentId: "",
          },
  });

  const onSubmit = async (values: CreateCategoryDto | UpdateCategoryDto) => {
    // Remove empty parentId
    const formData = {
      ...values,
      parentId: values.parentId || undefined,
    };

    if (mode === "create") {
      const result = await createMutation.mutateAsync(
        formData as CreateCategoryDto
      );
      if (result.success) {
        router.push(`/dashboard/admin/categories/${result.data.id}`);
      }
    } else if (mode === "edit" && category) {
      const result = await updateMutation.mutateAsync({
        categoryId: category.id,
        values: formData as UpdateCategoryDto,
      });
      if (result.success) {
        router.push(`/dashboard/admin/categories/${category.id}`);
      }
    }
  };

  // Generate slug from name
  const handleNameChange = (name: string) => {
    form.setValue("name", name);
    if (!form.getValues("slug") || mode === "create") {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      form.setValue("slug", slug);
    }
    // Auto-generate meta title if empty
    if (!form.getValues("metaTitle")) {
      form.setValue("metaTitle", name);
    }
  };

  const watchedThumbnailImage = form.watch("thumbnailImage");
  const watchedBannerImage = form.watch("bannerImage");

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === "create" ? "Create" : "Edit"} Category
          </h1>
          <p className="text-muted-foreground">
            {mode === "create"
              ? "Add a new product category"
              : `Editing "${category?.name}"`}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Configure the basic details of the category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Electronics"
                          {...field}
                          onChange={(e) => handleNameChange(e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>
                        The display name for this category
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
                      <FormLabel>Slug *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="electronics"
                          {...field}
                          className="font-mono"
                        />
                      </FormControl>
                      <FormDescription>
                        URL-friendly identifier (auto-generated from name)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Category description..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Brief description of this category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent category (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">
                          No Parent (Root Category)
                        </SelectItem>
                        {availableParents.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose a parent category to create a subcategory
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>
                Add thumbnail and banner images for the category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="thumbnailImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail Image</FormLabel>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={watchedThumbnailImage}
                          alt="Thumbnail"
                        />
                        <AvatarFallback>
                          <ImageIcon className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="https://example.com/thumbnail.jpg"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Square image displayed in category lists
                        </FormDescription>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bannerImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Image</FormLabel>
                    <div className="space-y-2">
                      <FormControl>
                        <Input
                          placeholder="https://example.com/banner.jpg"
                          {...field}
                        />
                      </FormControl>
                      {watchedBannerImage && (
                        <div className="w-full h-32 border rounded-lg overflow-hidden bg-muted">
                          <img
                            src={watchedBannerImage}
                            alt="Banner preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      <FormDescription>
                        Wide banner image for category pages
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Configure search engine optimization settings
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
                      <Input
                        placeholder="Category Name - Your Store"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Title shown in search results (auto-generated from name)
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
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Description shown in search results (max 500 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Configure category behavior and visibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Category
                        </FormLabel>
                        <FormDescription>
                          Whether this category is visible to customers
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
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="9999"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Lower numbers appear first (0-9999)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {mode === "create" ? "Create Category" : "Update Category"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
