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
import { useCartSessionManager } from "./useCartSessionManager";

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
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

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
    staleTime: 5 * 60 * 1000,
  });
}

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
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { storeGuestSessionId } = useCartSessionManager();

  return useMutation({
    mutationFn: async (values: CreateCartItemDto) => {
      const result = await addToCartAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.all });
      const previousCart = queryClient.getQueryData(cartKeys.list());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueryData(cartKeys.list(), (old: any) => {
        if (!old) return { items: [values] };
        return { ...old, items: [...old.items, { ...values, id: "temp-id" }] };
      });
      return { previousCart };
    },
    onError: (error: Error, _values, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.list(), context.previousCart);
      }
      toast.error(`Failed to add item to cart: ${error.message}`);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.detail(data.id), data);

      // FIXED: Store session ID if returned (for guest users)
      if (data.sessionId) {
        storeGuestSessionId(data.sessionId);
      }

      toast.success("Item added to cart successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

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
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onMutate: async ({ cartItemId, values }) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.all });

      const previousCart = queryClient.getQueryData(cartKeys.list());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueryData(cartKeys.list(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items: old.items.map((item: any) =>
            item.id === cartItemId ? { ...item, ...values } : item
          ),
        };
      });

      return { previousCart };
    },
    onError: (error, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.list(), context.previousCart);
      }
      toast.error(`Failed to update cart item: ${error.message}`);
    },
    onSuccess: (data, { cartItemId }) => {
      queryClient.setQueryData(cartKeys.detail(cartItemId), data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: cartKeys.lists(),
        refetchType: "active",
      });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartItemId: string) => {
      const result = await removeCartItemAction(cartItemId);
      if (!result.success) throw new Error(result.error);
      return cartItemId;
    },
    onMutate: async (cartItemId) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.all });
      const previousCart = queryClient.getQueryData(cartKeys.list());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueryData(cartKeys.list(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items: old.items.filter((item: any) => item.id !== cartItemId),
        };
      });

      return { previousCart };
    },
    onError: (error, _id, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.list(), context.previousCart);
      }
      toast.error(`Failed to remove item from cart: ${error.message}`);
    },
    onSuccess: () => {
      toast.success("Item removed from cart");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: cartKeys.lists(),
        refetchType: "active",
      });
    },
  });
}

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
      cartItemIds.forEach((cartItemId) => {
        queryClient.removeQueries({
          queryKey: cartKeys.detail(cartItemId),
        });
      });
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
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
      queryClient.invalidateQueries({ queryKey: cartKeys.all });

      toast.success("Cart cleared successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to clear cart: ${error.message}`);
    },
  });
}

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
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
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

export function useCartItems(params?: GetCartDto) {
  const { data: cart, ...rest } = useCart(params);

  return {
    ...rest,
    data: cart?.items ?? [],
  };
}

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

export function useCartMeta(params?: GetCartDto) {
  const { data: cart, ...rest } = useCart(params);

  return {
    ...rest,
    data: cart?.meta,
  };
}

export function useCartItemCount() {
  const { data: summary } = useCartSummary();
  return summary.itemCount;
}

export function useCartTotalQuantity() {
  const { data: summary } = useCartSummary();
  return summary.totalQuantity;
}

export function useCartSubtotal() {
  const { data: summary } = useCartSummary();
  return summary.subtotal;
}

export function useCartTotal() {
  const { data: summary } = useCartSummary();
  return summary.total;
}

export function useIsInCart(productId: string, variantId: string) {
  const { data: items } = useCartItems();

  return items.some(
    (item) => item.productId === productId && item.variantId === variantId
  );
}

export function useCartItemByProduct(productId: string, variantId: string) {
  const { data: items } = useCartItems();

  return items.find(
    (item) => item.productId === productId && item.variantId === variantId
  );
}

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

export function useCartFromCache(params?: GetCartDto) {
  const queryClient = useQueryClient();
  return queryClient.getQueryData(cartKeys.list(params));
}

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

export function useCartItemsByCategory(categorySlug?: string) {
  const params = categorySlug ? { categorySlug } : undefined;
  return useCartItems(params);
}

export function useSearchCartItems(
  search?: string,
  params?: Omit<GetCartDto, "search">
) {
  const searchParams = search ? { ...params, search } : params;
  return useCartItems(searchParams);
}

export function useHasSavedItemsAccess() {
  const { error } = useSavedItems({ pageSize: 1 }, true);
  return !error?.message.includes("401");
}

export function useSavedItemsCount() {
  const { data: savedItems } = useSavedItems({ pageSize: 1 });
  return savedItems?.summary.itemCount ?? 0;
}

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
