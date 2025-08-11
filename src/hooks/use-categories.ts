/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCallback } from "react";
import {
  getCategoriesAction,
  getCategoriesTreeAction,
  getCategoryAction,
  getCategoryBySlugAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/lib/categories/categories.actions";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  GetCategoriesDto,
} from "@/lib/categories/dto/categories.dto";

// Query Keys
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (params?: GetCategoriesDto) =>
    [...categoryKeys.lists(), params] as const,
  tree: () => [...categoryKeys.all, "tree"] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  bySlug: (slug: string) => [...categoryKeys.all, "slug", slug] as const,
};

// Query Hooks

/**
 * Get paginated categories with optional filtering and sorting
 * Uses GET /v1/categories
 */
export function useCategories(params?: GetCategoriesDto) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: async () => {
      const result = await getCategoriesAction(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
  });
}

/**
 * Get categories in hierarchical tree structure
 * Uses GET /v1/categories/tree
 */
export function useCategoriesTree() {
  return useQuery({
    queryKey: categoryKeys.tree(),
    queryFn: async () => {
      const result = await getCategoriesTreeAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - tree structure changes rarely
  });
}

/**
 * Get category by ID with full details including products
 * Uses GET /v1/categories/{id}
 */
export function useCategory(categoryId: string, enabled = true) {
  return useQuery({
    queryKey: categoryKeys.detail(categoryId),
    queryFn: async () => {
      const result = await getCategoryAction(categoryId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!categoryId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 (category not found)
      if (error?.status === 404) return false;
      return failureCount < 3;
    },
  });
}

/**
 * Get category by slug with full details including products
 * Uses GET /v1/categories/slug/{slug}
 */
export function useCategoryBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: categoryKeys.bySlug(slug),
    queryFn: async () => {
      const result = await getCategoryBySlugAction(slug);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 (category not found)
      if (error?.status === 404) return false;
      return failureCount < 3;
    },
  });
}

// Mutation Hooks

/**
 * Create a new category
 * Uses POST /v1/categories
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateCategoryDto) => {
      const result = await createCategoryAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success("Category created successfully");

      // Invalidate category lists and tree
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });

      // Set the created category in cache
      queryClient.setQueryData(categoryKeys.detail(data.id), data);
      queryClient.setQueryData(categoryKeys.bySlug(data.slug), data);

      toast.info(`Category "${data.name}" created with slug: ${data.slug}`, {
        duration: 6000,
      });
    },
    onError: (error: Error) => {
      if (error.message.includes("409")) {
        toast.error("Category slug already exists", {
          description: "Please choose a different slug and try again.",
          duration: 8000,
        });
      } else if (error.message.includes("400")) {
        toast.error("Invalid category data", {
          description: "Please check all fields and try again.",
          duration: 6000,
        });
      } else {
        toast.error(`Failed to create category: ${error.message}`);
      }
    },
  });
}

/**
 * Update an existing category
 * Uses PATCH /v1/categories/{id}
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      values,
    }: {
      categoryId: string;
      values: UpdateCategoryDto;
    }) => {
      const result = await updateCategoryAction(categoryId, values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Category updated successfully");

      // Update specific category cache
      queryClient.setQueryData(categoryKeys.detail(variables.categoryId), data);
      queryClient.setQueryData(categoryKeys.bySlug(data.slug), data);

      // Invalidate lists and tree to reflect changes
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
    },
    onError: (error: Error) => {
      if (error.message.includes("409")) {
        toast.error("Category slug already exists", {
          description: "Please choose a different slug and try again.",
          duration: 8000,
        });
      } else if (error.message.includes("400")) {
        toast.error("Invalid update data or circular reference", {
          description: "Please check all fields and hierarchy.",
          duration: 8000,
        });
      } else if (error.message.includes("404")) {
        toast.error("Category not found", {
          description: "The category may have been deleted.",
          duration: 6000,
        });
      } else {
        toast.error(`Failed to update category: ${error.message}`);
      }
    },
  });
}

/**
 * Delete a category
 * Uses DELETE /v1/categories/{id}
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const result = await deleteCategoryAction(categoryId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return categoryId;
    },
    onSuccess: (categoryId) => {
      toast.success("Category deleted successfully");

      // Remove from cache
      queryClient.removeQueries({
        queryKey: categoryKeys.detail(categoryId),
      });

      // Invalidate lists and tree
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
    },
    onError: (error: Error) => {
      if (error.message.includes("400")) {
        toast.error("Cannot delete category", {
          description: "Category has products assigned or child categories.",
          duration: 8000,
        });
      } else if (error.message.includes("404")) {
        toast.error("Category not found", {
          description: "The category may have already been deleted.",
          duration: 6000,
        });
      } else if (error.message.includes("409")) {
        toast.error("Category has child categories", {
          description: "Please remove all child categories first.",
          duration: 8000,
        });
      } else {
        toast.error(`Failed to delete category: ${error.message}`);
      }
    },
  });
}

// Utility Hooks

/**
 * Get category options for dropdowns/selects
 */
export function useCategoryOptions(includeInactive = false) {
  const { data: categories, ...rest } = useCategories({
    isActive: includeInactive ? undefined : true,
  });

  const options =
    categories?.items.map((category) => ({
      value: category.id,
      label: category.name,
      slug: category.slug,
      isActive: category.isActive,
      parentId: category.parentId,
    })) || [];

  return {
    ...rest,
    data: options,
  };
}

/**
 * Get category tree options for hierarchical selects
 */
export function useCategoryTreeOptions() {
  const { data: tree, ...rest } = useCategoriesTree();

  const flattenTree = (
    categories: typeof tree
  ): Array<{
    value: string;
    label: string;
    slug: string;
    level: number;
    parentId?: string;
  }> => {
    if (!categories) return [];

    const result: Array<{
      value: string;
      label: string;
      slug: string;
      level: number;
      parentId?: string;
    }> = [];

    const traverse = (cats: typeof categories, level = 0) => {
      for (const cat of cats) {
        result.push({
          value: cat.id,
          label: "  ".repeat(level) + cat.name,
          slug: cat.slug,
          level,
          parentId: cat.parentId,
        });
        if (cat.children && cat.children.length > 0) {
          traverse(cat.children, level + 1);
        }
      }
    };

    traverse(categories);
    return result;
  };

  return {
    ...rest,
    data: flattenTree(tree),
  };
}

/**
 * Get categories by parent ID
 */
export function useCategoriesByParent(parentId?: string) {
  return useCategories({ parentId });
}

/**
 * Get active categories only
 */
export function useActiveCategories(
  params?: Omit<GetCategoriesDto, "isActive">
) {
  return useCategories({ ...params, isActive: true });
}

/**
 * Search categories
 */
export function useSearchCategories(
  search?: string,
  params?: Omit<GetCategoriesDto, "search">
) {
  const searchParams = search ? { ...params, search } : params;
  return useCategories(searchParams);
}

/**
 * Manual refetch hook for categories
 */
export function useRefetchCategories() {
  const queryClient = useQueryClient();

  return useCallback(
    (params?: GetCategoriesDto) => {
      queryClient.invalidateQueries({
        queryKey: params ? categoryKeys.list(params) : categoryKeys.lists(),
      });
    },
    [queryClient]
  );
}

/**
 * Manual refetch hook for category tree
 */
export function useRefetchCategoriesTree() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
  }, [queryClient]);
}

/**
 * Get category from cache without triggering network request
 */
export function useCategoryFromCache(categoryId: string) {
  const queryClient = useQueryClient();
  return queryClient.getQueryData(categoryKeys.detail(categoryId));
}

/**
 * Prefetch category data
 */
export function usePrefetchCategory() {
  const queryClient = useQueryClient();

  return useCallback(
    (categoryId: string) => {
      queryClient.prefetchQuery({
        queryKey: categoryKeys.detail(categoryId),
        queryFn: async () => {
          const result = await getCategoryAction(categoryId);
          if (!result.success) {
            throw new Error(result.error);
          }
          return result.data;
        },
        staleTime: 10 * 60 * 1000,
      });
    },
    [queryClient]
  );
}

/**
 * Check if category can be deleted (useful for UI state)
 */
export function useCanDeleteCategory(categoryId: string) {
  const { data: category } = useCategory(categoryId);

  return {
    canDelete:
      !!category &&
      category.productCount === 0 &&
      category.children.length === 0,
    reason: !category
      ? "Category not found"
      : category.productCount > 0
        ? "Category has products assigned"
        : category.children.length > 0
          ? "Category has child categories"
          : undefined,
  };
}
