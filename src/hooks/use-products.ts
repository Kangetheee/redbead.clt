import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getProductTypesAction,
  getFeaturedProductTypesAction,
  getProductTypeAction,
  getProductTypeBySlugAction,
  getProductTypesByCategoryAction,
  createProductTypeAction,
  updateProductTypeAction,
  deleteProductTypeAction,
} from "@/lib/products/products.actions";
import {
  CreateProductTypeDto,
  UpdateProductTypeDto,
  GetProductTypesDto,
  GetProductTypesByCategoryDto,
} from "@/lib/products/dto/products.dto";

// Query Keys
export const productTypeKeys = {
  all: ["product-types"] as const,
  lists: () => [...productTypeKeys.all, "list"] as const,
  list: (params?: GetProductTypesDto) =>
    [...productTypeKeys.lists(), params] as const,
  featured: (limit?: number) =>
    [...productTypeKeys.all, "featured", limit] as const,
  byCategory: (params: GetProductTypesByCategoryDto) =>
    [...productTypeKeys.all, "category", params] as const,
  details: () => [...productTypeKeys.all, "detail"] as const,
  detail: (id: string) => [...productTypeKeys.details(), id] as const,
  bySlug: (slug: string) => [...productTypeKeys.all, "slug", slug] as const,
};

// Queries
export function useProductTypes(params?: GetProductTypesDto) {
  return useQuery({
    queryKey: productTypeKeys.list(params),
    queryFn: async () => {
      const result = await getProductTypesAction(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

export function useFeaturedProductTypes(limit?: number) {
  return useQuery({
    queryKey: productTypeKeys.featured(limit),
    queryFn: async () => {
      const result = await getFeaturedProductTypesAction(limit);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

export function useProductType(productTypeId: string, enabled = true) {
  return useQuery({
    queryKey: productTypeKeys.detail(productTypeId),
    queryFn: async () => {
      const result = await getProductTypeAction(productTypeId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!productTypeId,
  });
}

export function useProductTypeBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: productTypeKeys.bySlug(slug),
    queryFn: async () => {
      const result = await getProductTypeBySlugAction(slug);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!slug,
  });
}

export function useProductTypesByCategory(
  params: GetProductTypesByCategoryDto,
  enabled = true
) {
  return useQuery({
    queryKey: productTypeKeys.byCategory(params),
    queryFn: async () => {
      const result = await getProductTypesByCategoryAction(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!params.categoryId,
  });
}

// Mutations
export function useCreateProductType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateProductTypeDto) => {
      const result = await createProductTypeAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success("Product type created successfully");
      queryClient.invalidateQueries({ queryKey: productTypeKeys.all });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create product type: ${error.message}`);
    },
  });
}

export function useUpdateProductType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productTypeId,
      values,
    }: {
      productTypeId: string;
      values: UpdateProductTypeDto;
    }) => {
      const result = await updateProductTypeAction(productTypeId, values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Product type updated successfully");
      queryClient.invalidateQueries({ queryKey: productTypeKeys.all });
      queryClient.invalidateQueries({
        queryKey: productTypeKeys.detail(variables.productTypeId),
      });
      // Also invalidate by slug if we have the updated data
      if (data.slug) {
        queryClient.invalidateQueries({
          queryKey: productTypeKeys.bySlug(data.slug),
        });
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to update product type: ${error.message}`);
    },
  });
}

export function useDeleteProductType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productTypeId: string) => {
      const result = await deleteProductTypeAction(productTypeId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (_, productTypeId) => {
      toast.success("Product type deleted successfully");
      queryClient.invalidateQueries({ queryKey: productTypeKeys.all });
      queryClient.removeQueries({
        queryKey: productTypeKeys.detail(productTypeId),
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete product type: ${error.message}`);
    },
  });
}
