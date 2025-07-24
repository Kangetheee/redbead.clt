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
    queryFn: () => getProductTypesAction(params),
    select: (data) => (data.success ? data.data : undefined),
  });
}

export function useFeaturedProductTypes(limit?: number) {
  return useQuery({
    queryKey: productTypeKeys.featured(limit),
    queryFn: () => getFeaturedProductTypesAction(limit),
    select: (data) => (data.success ? data.data : undefined),
  });
}

export function useProductType(productTypeId: string, enabled = true) {
  return useQuery({
    queryKey: productTypeKeys.detail(productTypeId),
    queryFn: () => getProductTypeAction(productTypeId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!productTypeId,
  });
}

export function useProductTypeBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: productTypeKeys.bySlug(slug),
    queryFn: () => getProductTypeBySlugAction(slug),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!slug,
  });
}

export function useProductTypesByCategory(
  params: GetProductTypesByCategoryDto,
  enabled = true
) {
  return useQuery({
    queryKey: productTypeKeys.byCategory(params),
    queryFn: () => getProductTypesByCategoryAction(params),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!params.categoryId,
  });
}

// Mutations
export function useCreateProductType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateProductTypeDto) =>
      createProductTypeAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Product type created successfully");
        queryClient.invalidateQueries({ queryKey: productTypeKeys.all });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create product type");
    },
  });
}

export function useUpdateProductType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productTypeId,
      values,
    }: {
      productTypeId: string;
      values: UpdateProductTypeDto;
    }) => updateProductTypeAction(productTypeId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Product type updated successfully");
        queryClient.invalidateQueries({ queryKey: productTypeKeys.all });
        queryClient.invalidateQueries({
          queryKey: productTypeKeys.detail(variables.productTypeId),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update product type");
    },
  });
}

export function useDeleteProductType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productTypeId: string) =>
      deleteProductTypeAction(productTypeId),
    onSuccess: (data, productTypeId) => {
      if (data.success) {
        toast.success("Product type deleted successfully");
        queryClient.invalidateQueries({ queryKey: productTypeKeys.all });
        queryClient.removeQueries({
          queryKey: productTypeKeys.detail(productTypeId),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete product type");
    },
  });
}
