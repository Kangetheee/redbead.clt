"use client";

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

// Queries
export function useCategories(params?: GetCategoriesDto) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => getCategoriesAction(params),
    select: (data) => (data.success ? data.data : undefined),
  });
}

export function useCategoriesTree() {
  return useQuery({
    queryKey: categoryKeys.tree(),
    queryFn: () => getCategoriesTreeAction(),
    select: (data) => (data.success ? data.data : undefined),
  });
}

export function useCategory(categoryId: string, enabled = true) {
  return useQuery({
    queryKey: categoryKeys.detail(categoryId),
    queryFn: () => getCategoryAction(categoryId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!categoryId,
  });
}

export function useCategoryBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: categoryKeys.bySlug(slug),
    queryFn: () => getCategoryBySlugAction(slug),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!slug,
  });
}

// Mutations
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateCategoryDto) => createCategoryAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Category created successfully");
        queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create category");
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      values,
    }: {
      categoryId: string;
      values: UpdateCategoryDto;
    }) => updateCategoryAction(categoryId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Category updated successfully");
        queryClient.invalidateQueries({ queryKey: categoryKeys.all });
        queryClient.invalidateQueries({
          queryKey: categoryKeys.detail(variables.categoryId),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update category");
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => deleteCategoryAction(categoryId),
    onSuccess: (data, categoryId) => {
      if (data.success) {
        toast.success("Category deleted successfully");
        queryClient.invalidateQueries({ queryKey: categoryKeys.all });
        queryClient.removeQueries({
          queryKey: categoryKeys.detail(categoryId),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete category");
    },
  });
}
