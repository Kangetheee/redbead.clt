"use server";

import { getErrorMessage } from "@/lib/get-error-message";
import { ActionResponse } from "@/lib/shared/types";
import {
  CreateCartItemDto,
  UpdateCartItemDto,
  GetCartDto,
  GetSavedItemsDto,
  BulkRemoveDto,
  SaveForLaterDto,
  MergeSessionCartDto,
  CleanupExpiredSessionsDto,
} from "./dto/cart.dto";
import {
  CartResponse,
  CartItemResponse,
  MergeSessionCartResponse,
  CleanupExpiredSessionsResponse,
} from "./types/cart.types";
import { CartService } from "./cart.services";

const cartService = new CartService();

/**
 * Get cart with pagination, filtering, and sorting
 * Uses GET /v1/cart
 */
export async function getCartAction(
  params?: GetCartDto
): Promise<ActionResponse<CartResponse>> {
  try {
    const res = await cartService.getCart(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get a specific cart item by ID
 * Uses GET /v1/cart/{id}
 */
export async function getCartItemAction(
  cartItemId: string
): Promise<ActionResponse<CartItemResponse>> {
  try {
    const res = await cartService.getCartItem(cartItemId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Add a new item to the cart with product customizations
 * Uses POST /v1/cart
 */
export async function addToCartAction(
  values: CreateCartItemDto
): Promise<ActionResponse<CartItemResponse>> {
  try {
    const res = await cartService.addToCart(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Update quantity, variant, or customizations of a specific cart item
 * Uses PATCH /v1/cart/{id}
 */
export async function updateCartItemAction(
  cartItemId: string,
  values: UpdateCartItemDto
): Promise<ActionResponse<CartItemResponse>> {
  try {
    const res = await cartService.updateCartItem(cartItemId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Remove a specific item from the cart
 * Uses DELETE /v1/cart/{id}
 */
export async function removeCartItemAction(
  cartItemId: string
): Promise<ActionResponse<void>> {
  try {
    await cartService.removeCartItem(cartItemId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Remove all items from the current user's cart
 * Uses DELETE /v1/cart
 */
export async function clearCartAction(): Promise<ActionResponse<void>> {
  try {
    await cartService.clearCart();
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get saved for later items with pagination
 * Uses GET /v1/cart/saved
 * Requires authentication
 */
export async function getSavedItemsAction(
  params?: GetSavedItemsDto
): Promise<ActionResponse<CartResponse>> {
  try {
    const res = await cartService.getSavedItems(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Remove multiple items from the cart at once
 * Uses POST /v1/cart/bulk-remove
 */
export async function bulkRemoveAction(
  values: BulkRemoveDto
): Promise<ActionResponse<void>> {
  try {
    await cartService.bulkRemove(values);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Move items between cart and saved for later
 * Uses POST /v1/cart/save-for-later
 * Requires authentication
 */
export async function saveForLaterAction(
  values: SaveForLaterDto
): Promise<ActionResponse<void>> {
  try {
    await cartService.saveForLater(values);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * NEW: Merge guest session cart with user cart
 * Uses POST /v1/cart/merge-session
 * Requires authentication
 */
export async function mergeSessionCartAction(
  values: MergeSessionCartDto
): Promise<ActionResponse<MergeSessionCartResponse>> {
  try {
    const res = await cartService.mergeSessionCart(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * NEW: Cleanup expired session carts (Admin only)
 * Uses POST /v1/cart/cleanup-expired-sessions
 * Requires authentication with admin role
 */
export async function cleanupExpiredSessionsAction(
  params: CleanupExpiredSessionsDto
): Promise<ActionResponse<CleanupExpiredSessionsResponse>> {
  try {
    const res = await cartService.cleanupExpiredSessions(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
