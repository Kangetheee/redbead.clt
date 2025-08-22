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

export async function clearCartAction(): Promise<ActionResponse<void>> {
  try {
    await cartService.clearCart();
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

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
