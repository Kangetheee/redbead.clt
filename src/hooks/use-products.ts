import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getProductsAction,
  getFeaturedProductsAction,
  getProductAction,
  getProductBySlugAction,
  searchProductsAction,
  calculateProductPriceAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
  toggleProductFeaturedAction,
} from "@/lib/products/products.actions";
import {
  CreateProductDto,
  UpdateProductDto,
  GetProductsDto,
  SearchProductsDto,
  CalculatePriceDto,
} from "@/lib/products/dto/products.dto";

// Query Keys
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params?: GetProductsDto) => [...productKeys.lists(), params] as const,
  search: (params: SearchProductsDto) =>
    [...productKeys.all, "search", params] as const,
  featured: (limit?: number) =>
    [...productKeys.all, "featured", limit] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  bySlug: (slug: string) => [...productKeys.all, "slug", slug] as const,
  priceCalculation: (productId: string, params: CalculatePriceDto) =>
    [...productKeys.all, "price", productId, params] as const,
};

// Queries
export function useProducts(params?: GetProductsDto) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: async () => {
      const result = await getProductsAction(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

export function useSearchProducts(params: SearchProductsDto, enabled = true) {
  return useQuery({
    queryKey: productKeys.search(params),
    queryFn: async () => {
      const result = await searchProductsAction(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!params.q,
  });
}

export function useFeaturedProducts(limit?: number) {
  return useQuery({
    queryKey: productKeys.featured(limit),
    queryFn: async () => {
      const result = await getFeaturedProductsAction(limit);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

export function useProduct(productId: string, enabled = true) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: async () => {
      const result = await getProductAction(productId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!productId,
  });
}

export function useProductBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: productKeys.bySlug(slug),
    queryFn: async () => {
      const result = await getProductBySlugAction(slug);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!slug,
  });
}

export function useCalculateProductPrice(
  productId: string,
  params: CalculatePriceDto,
  enabled = true
) {
  return useQuery({
    queryKey: productKeys.priceCalculation(productId, params),
    queryFn: async () => {
      const result = await calculateProductPriceAction(productId, params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!productId && params.quantity > 0,
  });
}

// Mutations
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateProductDto) => {
      const result = await createProductAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success("Product created successfully");
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create product: ${error.message}`);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      values,
    }: {
      productId: string;
      values: UpdateProductDto;
    }) => {
      const result = await updateProductAction(productId, values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Product updated successfully");
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
      // Also invalidate by slug if we have the updated data
      if (data.slug) {
        queryClient.invalidateQueries({
          queryKey: productKeys.bySlug(data.slug),
        });
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const result = await deleteProductAction(productId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (_, productId) => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.removeQueries({
        queryKey: productKeys.detail(productId),
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete product: ${error.message}`);
    },
  });
}

export function useToggleProductFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const result = await toggleProductFeaturedAction(productId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, productId) => {
      const status = data.isFeatured ? "featured" : "unfeatured";
      toast.success(`Product ${status} successfully`);
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(productId),
      });
      // Also invalidate by slug
      if (data.slug) {
        queryClient.invalidateQueries({
          queryKey: productKeys.bySlug(data.slug),
        });
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to toggle product featured status: ${error.message}`);
    },
  });
}
