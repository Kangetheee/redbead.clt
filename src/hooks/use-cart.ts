"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCallback } from "react";
import {
  getCartAction,
  getCartItemAction,
  addToCartAction,
  updateCartItemAction,
  removeCartItemAction,
  clearCartAction,
  getSavedItemsAction,
  bulkRemoveAction,
  saveForLaterAction,
  mergeSessionCartAction,
  cleanupExpiredSessionsAction,
} from "@/lib/cart/cart.actions";
import {
  CreateCartItemDto,
  UpdateCartItemDto,
  GetCartDto,
  GetSavedItemsDto,
  BulkRemoveDto,
  SaveForLaterDto,
  MergeSessionCartDto,
  CleanupExpiredSessionsDto,
} from "@/lib/cart/dto/cart.dto";

// Query Keys
export const cartKeys = {
  all: ["cart"] as const,
  lists: () => [...cartKeys.all, "list"] as const,
  list: (params?: GetCartDto) => [...cartKeys.lists(), params] as const,
  details: () => [...cartKeys.all, "detail"] as const,
  detail: (id: string) => [...cartKeys.details(), id] as const,
  saved: () => [...cartKeys.all, "saved"] as const,
  savedList: (params?: GetSavedItemsDto) =>
    [...cartKeys.saved(), params] as const,
  summary: () => [...cartKeys.all, "summary"] as const,
  mergeSession: () => [...cartKeys.all, "merge-session"] as const,
  cleanup: () => [...cartKeys.all, "cleanup"] as const,
};

// Query Hooks

/**
 * Get cart with pagination, filtering, and sorting
 * Uses GET /v1/cart
 */
export function useCart(params?: GetCartDto) {
  return useQuery({
    queryKey: cartKeys.list(params),
    queryFn: async () => {
      const result = await getCartAction(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true, // Refresh cart when user returns to tab
  });
}

/**
 * Get a specific cart item by ID
 * Uses GET /v1/cart/{id}
 */
export function useCartItem(cartItemId: string, enabled = true) {
  return useQuery({
    queryKey: cartKeys.detail(cartItemId),
    queryFn: async () => {
      const result = await getCartItemAction(cartItemId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!cartItemId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get saved for later items with pagination
 * Uses GET /v1/cart/saved
 * Requires authentication
 */
export function useSavedItems(params?: GetSavedItemsDto, enabled = true) {
  return useQuery({
    queryKey: cartKeys.savedList(params),
    queryFn: async () => {
      const result = await getSavedItemsAction(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutation Hooks

/**
 * Add items to cart
 * Uses POST /v1/cart
 */
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateCartItemDto) => {
      const result = await addToCartAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      // Invalidate all cart-related queries
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      // queryClient.invalidateQueries({ queryKey: cartKeys.summary() });

      // Set the created cart item in cache
      queryClient.setQueryData(cartKeys.detail(data.id), data);

      toast.success("Item added to cart successfully");
    },
    onError: (error: Error) => {
      if (error.message.includes("insufficient stock")) {
        toast.error("Not enough items in stock", {
          description: "Please reduce the quantity and try again.",
          duration: 6000,
        });
      } else if (error.message.includes("404")) {
        toast.error("Product or variant not found", {
          description: "The selected item may no longer be available.",
          duration: 6000,
        });
      } else {
        toast.error(`Failed to add item to cart: ${error.message}`);
      }
    },
  });
}

/**
 * Update cart items
 * Uses PATCH /v1/cart/{id}
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cartItemId,
      values,
    }: {
      cartItemId: string;
      values: UpdateCartItemDto;
    }) => {
      const result = await updateCartItemAction(cartItemId, values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Update specific cart item cache
      queryClient.setQueryData(cartKeys.detail(variables.cartItemId), data);

      // Invalidate cart lists and summary
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      // queryClient.invalidateQueries({ queryKey: cartKeys.summary() });

      toast.success("Cart item updated successfully");
    },
    onError: (error: Error) => {
      if (error.message.includes("insufficient stock")) {
        toast.error("Not enough items in stock", {
          description: "Please reduce the quantity and try again.",
          duration: 6000,
        });
      } else if (error.message.includes("404")) {
        toast.error("Cart item or variant not found", {
          description:
            "The item may have been removed or is no longer available.",
          duration: 6000,
        });
      } else {
        toast.error(`Failed to update cart item: ${error.message}`);
      }
    },
  });
}

/**
 * Remove single item from cart
 * Uses DELETE /v1/cart/{id}
 */
export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartItemId: string) => {
      const result = await removeCartItemAction(cartItemId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return cartItemId;
    },
    onSuccess: (cartItemId) => {
      // Remove specific cart item from cache
      queryClient.removeQueries({
        queryKey: cartKeys.detail(cartItemId),
      });

      // Invalidate cart lists and summary
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      // queryClient.invalidateQueries({ queryKey: cartKeys.summary() });

      toast.success("Item removed from cart");
    },
    onError: (error: Error) => {
      if (error.message.includes("404")) {
        toast.error("Cart item not found", {
          description: "The item may have already been removed.",
          duration: 6000,
        });
      } else {
        toast.error(`Failed to remove item from cart: ${error.message}`);
      }
    },
  });
}

/**
 * Remove multiple items from cart
 * Uses POST /v1/cart/bulk-remove
 */
export function useBulkRemove() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: BulkRemoveDto) => {
      const result = await bulkRemoveAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return values.cartItemIds;
    },
    onSuccess: (cartItemIds) => {
      // Remove specific cart items from cache
      cartItemIds.forEach((cartItemId) => {
        queryClient.removeQueries({
          queryKey: cartKeys.detail(cartItemId),
        });
      });

      // Invalidate cart lists and summary
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      // queryClient.invalidateQueries({ queryKey: cartKeys.summary() });

      toast.success(
        `${cartItemIds.length} item${cartItemIds.length !== 1 ? "s" : ""} removed from cart`
      );
    },
    onError: (error: Error) => {
      if (error.message.includes("400")) {
        toast.error("Invalid cart items", {
          description:
            "Some items may not belong to your cart or no longer exist.",
          duration: 6000,
        });
      } else {
        toast.error(`Failed to remove items from cart: ${error.message}`);
      }
    },
  });
}

/**
 * Clear entire cart
 * Uses DELETE /v1/cart
 */
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await clearCartAction();
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      // Invalidate all cart-related queries
      queryClient.invalidateQueries({ queryKey: cartKeys.all });

      toast.success("Cart cleared successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to clear cart: ${error.message}`);
    },
  });
}

/**
 * Save items for later or move back to cart
 * Uses POST /v1/cart/save-for-later
 * Requires authentication
 */
export function useSaveForLater() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: SaveForLaterDto) => {
      const result = await saveForLaterAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return values;
    },
    onSuccess: (values) => {
      // Invalidate cart and saved items
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      // queryClient.invalidateQueries({ queryKey: cartKeys.saved() });
      // queryClient.invalidateQueries({ queryKey: cartKeys.summary() });

      const action = values.saveForLater ? "saved for later" : "moved to cart";
      const count = values.cartItemIds.length;
      toast.success(
        `${count} item${count !== 1 ? "s" : ""} ${action} successfully`
      );
    },
    onError: (error: Error) => {
      if (error.message.includes("400")) {
        toast.error("Invalid cart items", {
          description:
            "Some items may not belong to your cart or no longer exist.",
          duration: 6000,
        });
      } else if (error.message.includes("401")) {
        toast.error("Authentication required", {
          description: "Please log in to save items for later.",
          duration: 6000,
        });
      } else {
        toast.error(`Failed to save items: ${error.message}`);
      }
    },
  });
}

/**
 * NEW: Merge guest session cart with user cart
 * Uses POST /v1/cart/merge-session
 * Requires authentication
 */
export function useMergeSessionCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: MergeSessionCartDto) => {
      const result = await mergeSessionCartAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      // Invalidate all cart-related queries to refresh with merged data
      queryClient.invalidateQueries({ queryKey: cartKeys.all });

      if (data.mergedItemsCount > 0) {
        toast.success(
          `Successfully merged ${data.mergedItemsCount} item${
            data.mergedItemsCount !== 1 ? "s" : ""
          } from your guest session`
        );
      } else {
        toast.success("Cart session merged successfully");
      }
    },
    onError: (error: Error) => {
      if (error.message.includes("400")) {
        toast.error("Invalid session ID", {
          description: "The guest session may have expired or is invalid.",
          duration: 6000,
        });
      } else if (error.message.includes("401")) {
        toast.error("Authentication required", {
          description: "Please log in to merge your cart session.",
          duration: 6000,
        });
      } else {
        toast.error(`Failed to merge cart session: ${error.message}`);
      }
    },
  });
}

/**
 * NEW: Cleanup expired session carts (Admin only)
 * Uses POST /v1/cart/cleanup-expired-sessions
 * Requires authentication with admin role
 */
export function useCleanupExpiredSessions() {
  return useMutation({
    mutationFn: async (params: CleanupExpiredSessionsDto) => {
      const result = await cleanupExpiredSessionsAction(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success(
        `Successfully cleaned up ${data.deletedCount} expired cart session${
          data.deletedCount !== 1 ? "s" : ""
        }`
      );
    },
    onError: (error: Error) => {
      if (error.message.includes("401")) {
        toast.error("Admin access required", {
          description: "You need admin privileges to perform this action.",
          duration: 6000,
        });
      } else {
        toast.error(`Failed to cleanup expired sessions: ${error.message}`);
      }
    },
  });
}

// Utility Hooks

/**
 * Get cart items (simplified access to cart.items)
 */
export function useCartItems(params?: GetCartDto) {
  const { data: cart, ...rest } = useCart(params);

  return {
    ...rest,
    data: cart?.items ?? [],
  };
}

/**
 * Get cart summary (simplified access to cart.summary)
 */
export function useCartSummary(params?: GetCartDto) {
  const { data: cart, ...rest } = useCart(params);

  return {
    ...rest,
    data: cart?.summary ?? {
      itemCount: 0,
      totalQuantity: 0,
      subtotal: 0,
      total: 0,
    },
  };
}

/**
 * Get cart pagination meta (simplified access to cart.meta)
 */
export function useCartMeta(params?: GetCartDto) {
  const { data: cart, ...rest } = useCart(params);

  return {
    ...rest,
    data: cart?.meta,
  };
}

/**
 * Get cart item count
 */
export function useCartItemCount() {
  const { data: summary } = useCartSummary();
  return summary.itemCount;
}

/**
 * Get cart total quantity
 */
export function useCartTotalQuantity() {
  const { data: summary } = useCartSummary();
  return summary.totalQuantity;
}

/**
 * Get cart subtotal
 */
export function useCartSubtotal() {
  const { data: summary } = useCartSummary();
  return summary.subtotal;
}

/**
 * Get cart total
 */
export function useCartTotal() {
  const { data: summary } = useCartSummary();
  return summary.total;
}

/**
 * Check if a product and variant combination is in cart
 */
export function useIsInCart(productId: string, variantId: string) {
  const { data: items } = useCartItems();

  return items.some(
    (item) => item.productId === productId && item.variantId === variantId
  );
}

/**
 * Get cart item by product and variant
 */
export function useCartItemByProduct(productId: string, variantId: string) {
  const { data: items } = useCartItems();

  return items.find(
    (item) => item.productId === productId && item.variantId === variantId
  );
}

/**
 * Manual refetch hook for cart
 */
export function useRefetchCart() {
  const queryClient = useQueryClient();

  return useCallback(
    (params?: GetCartDto) => {
      queryClient.invalidateQueries({
        queryKey: params ? cartKeys.list(params) : cartKeys.lists(),
      });
    },
    [queryClient]
  );
}

/**
 * Manual refetch hook for saved items
 */
export function useRefetchSavedItems() {
  const queryClient = useQueryClient();

  return useCallback(
    (params?: GetSavedItemsDto) => {
      queryClient.invalidateQueries({
        queryKey: cartKeys.savedList(params),
      });
    },
    [queryClient]
  );
}

/**
 * Get cart data from cache without triggering network request
 */
export function useCartFromCache(params?: GetCartDto) {
  const queryClient = useQueryClient();
  return queryClient.getQueryData(cartKeys.list(params));
}

/**
 * Prefetch cart data
 */
export function usePrefetchCart() {
  const queryClient = useQueryClient();

  return useCallback(
    (params?: GetCartDto) => {
      queryClient.prefetchQuery({
        queryKey: cartKeys.list(params),
        queryFn: async () => {
          const result = await getCartAction(params);
          if (!result.success) {
            throw new Error(result.error);
          }
          return result.data;
        },
        staleTime: 2 * 60 * 1000,
      });
    },
    [queryClient]
  );
}

/**
 * Get cart items by category
 */
export function useCartItemsByCategory(categorySlug?: string) {
  const params = categorySlug ? { categorySlug } : undefined;
  return useCartItems(params);
}

/**
 * Search cart items
 */
export function useSearchCartItems(
  search?: string,
  params?: Omit<GetCartDto, "search">
) {
  const searchParams = search ? { ...params, search } : params;
  return useCartItems(searchParams);
}

/**
 * NEW: Check if user has access to saved items (authentication check)
 */
export function useHasSavedItemsAccess() {
  const { error } = useSavedItems({ pageSize: 1 }, true);
  return !error?.message.includes("401");
}

/**
 * NEW: Get saved items count
 */
export function useSavedItemsCount() {
  const { data: savedItems } = useSavedItems({ pageSize: 1 });
  return savedItems?.summary.itemCount ?? 0;
}

/**
 * NEW: Hook for handling login-related cart merging
 */
export function useLoginCartMerge() {
  const mergeSessionCart = useMergeSessionCart();

  return useCallback(
    (guestSessionId?: string) => {
      if (guestSessionId) {
        mergeSessionCart.mutate({ sessionId: guestSessionId });
      }
    },
    [mergeSessionCart]
  );
}
