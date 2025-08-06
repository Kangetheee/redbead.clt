/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getCartAction,
  getCartItemAction,
  addToCartAction,
  updateCartItemAction,
  removeCartItemAction,
  clearCartAction,
} from "@/lib/cart/cart.actions";
import { CreateCartItemDto, UpdateCartItemDto } from "@/lib/cart/dto/cart.dto";

export const CART_QUERY_KEYS = {
  cart: () => ["cart"] as const,
  cartItem: (id: string) => ["cart", "item", id] as const,
};

/**
 * Hook to get the current user's cart
 */
export function useCart() {
  return useQuery({
    queryKey: CART_QUERY_KEYS.cart(),
    queryFn: async () => {
      const result = await getCartAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

/**
 * Hook to get a specific cart item
 */
export function useCartItem(cartItemId: string) {
  return useQuery({
    queryKey: CART_QUERY_KEYS.cartItem(cartItemId),
    queryFn: async () => {
      const result = await getCartItemAction(cartItemId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!cartItemId,
  });
}

/**
 * Hook to add items to cart
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
      // Invalidate and refetch cart data
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart() });
      toast.success("Item added to cart successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add item to cart: ${error.message}`);
    },
  });
}

/**
 * Hook to update cart items
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
      // Invalidate cart and specific cart item queries
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart() });
      queryClient.invalidateQueries({
        queryKey: CART_QUERY_KEYS.cartItem(variables.cartItemId),
      });
      toast.success("Cart item updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update cart item: ${error.message}`);
    },
  });
}

/**
 * Hook to remove items from cart
 */
export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartItemId: string) => {
      const result = await removeCartItemAction(cartItemId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (_, cartItemId) => {
      // Invalidate cart data and remove specific cart item from cache
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart() });
      queryClient.removeQueries({
        queryKey: CART_QUERY_KEYS.cartItem(cartItemId),
      });
      toast.success("Item removed from cart");
    },
    onError: (error) => {
      toast.error(`Failed to remove item from cart: ${error.message}`);
    },
  });
}

/**
 * Hook to clear entire cart
 */
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await clearCartAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate all cart-related queries
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart() });
      queryClient.removeQueries({ queryKey: ["cart", "item"] });
      toast.success("Cart cleared successfully");
    },
    onError: (error) => {
      toast.error(`Failed to clear cart: ${error.message}`);
    },
  });
}

/**
 * Hook to get cart summary info (item count, total, etc.)
 */
export function useCartSummary() {
  const { data: cart, ...rest } = useCart();

  return {
    ...rest,
    data: cart?.meta,
  };
}

/**
 * Hook to get cart items
 */
export function useCartItems() {
  const { data: cart, ...rest } = useCart();

  return {
    ...rest,
    data: cart?.summary ?? [],
  };
}

/**
 * Hook to get cart item count
 */
export function useCartItemCount() {
  const { data: cart } = useCart();
  return cart?.meta.itemCount ?? 0;
}

/**
 * Hook to get cart total quantity
 */
export function useCartTotalQuantity() {
  const { data: cart } = useCart();
  return cart?.meta.totalQuantity ?? 0;
}

/**
 * Hook to get cart subtotal
 */
export function useCartSubtotal() {
  const { data: cart } = useCart();
  return cart?.meta.subtotal ?? 0;
}

/**
 * Hook to get cart customization adjustments
 */
export function useCartCustomizationAdjustments() {
  const { data: cart } = useCart();
  return cart?.meta.customizationAdjustments ?? 0;
}

/**
 * Hook to get cart total
 */
export function useCartTotal() {
  const { data: cart } = useCart();
  return cart?.meta.total ?? 0;
}
