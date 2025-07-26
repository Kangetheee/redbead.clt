/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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

export const CATEGORIES_QUERY_KEYS = {
  categories: (params?: GetCategoriesDto) => ["categories", params] as const,
  categoriesTree: () => ["categories", "tree"] as const,
  category: (id: string) => ["categories", "detail", id] as const,
  categoryBySlug: (slug: string) => ["categories", "slug", slug] as const,
};

/**
 * Hook to get paginated categories with optional filtering
 */
export function useCategories(params?: GetCategoriesDto) {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEYS.categories(params),
    queryFn: async () => {
      const result = await getCategoriesAction(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

/**
 * Hook to get categories in tree structure
 */
export function useCategoriesTree() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEYS.categoriesTree(),
    queryFn: async () => {
      const result = await getCategoriesTreeAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

/**
 * Hook to get category by ID with full details
 */
export function useCategory(categoryId: string) {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEYS.category(categoryId),
    queryFn: async () => {
      const result = await getCategoryAction(categoryId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!categoryId,
  });
}

/**
 * Hook to get category by slug with full details
 */
export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEYS.categoryBySlug(slug),
    queryFn: async () => {
      const result = await getCategoryBySlugAction(slug);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!slug,
  });
}

/**
 * Hook to create categories
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
      // Invalidate categories queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create category: ${error.message}`);
    },
  });
}

/**
 * Hook to update categories
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
      // Invalidate categories queries and specific category
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({
        queryKey: CATEGORIES_QUERY_KEYS.category(variables.categoryId),
      });
      // Also invalidate by slug if we have the updated data
      if (data.slug) {
        queryClient.invalidateQueries({
          queryKey: CATEGORIES_QUERY_KEYS.categoryBySlug(data.slug),
        });
      }
      toast.success("Category updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update category: ${error.message}`);
    },
  });
}

/**
 * Hook to delete categories
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const result = await deleteCategoryAction(categoryId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (_, categoryId) => {
      // Invalidate categories queries and remove specific category from cache
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.removeQueries({
        queryKey: CATEGORIES_QUERY_KEYS.category(categoryId),
      });
      toast.success("Category deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete category: ${error.message}`);
    },
  });
}

/**
 * Hook to get category options for dropdowns/selects
 */
export function useCategoryOptions(includeInactive: boolean = false) {
  const { data: categories, ...rest } = useCategories();

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
 * Hook to get category tree options for hierarchical selects
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
