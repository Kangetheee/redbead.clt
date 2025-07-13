import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getProductsAction,
  getFeaturedProductsAction,
  getProductAction,
  getProductBySlugAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
  calculateProductPriceAction,
} from "@/lib/products/products.actions";
import {
  CreateProductDto,
  UpdateProductDto,
  GetProductsDto,
  PriceCalculationDto,
} from "@/lib/products/dto/products.dto";

// Query Keys
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params?: GetProductsDto) => [...productKeys.lists(), params] as const,
  featured: (limit?: number) =>
    [...productKeys.all, "featured", limit] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  bySlug: (slug: string) => [...productKeys.all, "slug", slug] as const,
  priceCalculation: (productId: string, params: PriceCalculationDto) =>
    [...productKeys.all, "price", productId, params] as const,
};

// Queries
export function useProducts(params?: GetProductsDto) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => getProductsAction(params),
    select: (data) => (data.success ? data.data : undefined),
  });
}

export function useFeaturedProducts(limit?: number) {
  return useQuery({
    queryKey: productKeys.featured(limit),
    queryFn: () => getFeaturedProductsAction(limit),
    select: (data) => (data.success ? data.data : undefined),
  });
}

export function useProduct(productId: string, enabled = true) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => getProductAction(productId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!productId,
  });
}

export function useProductBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: productKeys.bySlug(slug),
    queryFn: () => getProductBySlugAction(slug),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!slug,
  });
}

export function useProductPriceCalculation(
  productId: string,
  params: PriceCalculationDto,
  enabled = true
) {
  return useQuery({
    queryKey: productKeys.priceCalculation(productId, params),
    queryFn: () => calculateProductPriceAction(productId, params),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!productId && params.quantity > 0,
  });
}

// Mutations
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateProductDto) => createProductAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Product created successfully");
        queryClient.invalidateQueries({ queryKey: productKeys.all });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create product");
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      values,
    }: {
      productId: string;
      values: UpdateProductDto;
    }) => updateProductAction(productId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Product updated successfully");
        queryClient.invalidateQueries({ queryKey: productKeys.all });
        queryClient.invalidateQueries({
          queryKey: productKeys.detail(variables.productId),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update product");
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => deleteProductAction(productId),
    onSuccess: (data, productId) => {
      if (data.success) {
        toast.success("Product deleted successfully");
        queryClient.invalidateQueries({ queryKey: productKeys.all });
        queryClient.removeQueries({ queryKey: productKeys.detail(productId) });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete product");
    },
  });
}
