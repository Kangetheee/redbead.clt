"use client";

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

// Query Keys
export const cartKeys = {
  all: ["cart"] as const,
  cart: () => [...cartKeys.all, "items"] as const,
  item: (id: string) => [...cartKeys.all, "item", id] as const,
};

// Queries
export function useCart() {
  return useQuery({
    queryKey: cartKeys.cart(),
    queryFn: () => getCartAction(),
    select: (data) => (data.success ? data.data : undefined),
  });
}

export function useCartItem(cartItemId: string, enabled = true) {
  return useQuery({
    queryKey: cartKeys.item(cartItemId),
    queryFn: () => getCartItemAction(cartItemId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!cartItemId,
  });
}

// Mutations
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateCartItemDto) => addToCartAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Item added to cart");
        queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add item to cart");
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cartItemId,
      values,
    }: {
      cartItemId: string;
      values: UpdateCartItemDto;
    }) => updateCartItemAction(cartItemId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Cart item updated");
        queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
        queryClient.invalidateQueries({
          queryKey: cartKeys.item(variables.cartItemId),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update cart item");
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartItemId: string) => removeCartItemAction(cartItemId),
    onSuccess: (data, cartItemId) => {
      if (data.success) {
        toast.success("Item removed from cart");
        queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
        queryClient.removeQueries({ queryKey: cartKeys.item(cartItemId) });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove item from cart");
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clearCartAction(),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Cart cleared");
        queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to clear cart");
    },
  });
}
