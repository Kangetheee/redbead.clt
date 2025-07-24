"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse } from "../shared/types";
import { CreateCartItemDto, UpdateCartItemDto } from "./dto/cart.dto";
import { CartResponse, CartItemResponse } from "./types/cart.types";
import { CartService } from "./cart.services";

const cartService = new CartService();

/**
 * Get the current user's cart with all items and totals
 */
export async function getCartAction(): Promise<ActionResponse<CartResponse>> {
  try {
    const res = await cartService.getCart();
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get a specific cart item by ID
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
 * Add a new item to the cart with template customizations
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
 * Update quantity, size variant, or customizations of a specific cart item
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
 */
export async function clearCartAction(): Promise<ActionResponse<void>> {
  try {
    await cartService.clearCart();
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
