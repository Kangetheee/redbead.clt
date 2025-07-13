"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse } from "../shared/types";
import { CreateCartItemDto, UpdateCartItemDto } from "./dto/cart.dto";
import { CartResponse, CartItemResponse } from "./types/cart.types";
import { CartService } from "./cart.services";

const cartService = new CartService();

export async function getCartAction(): Promise<ActionResponse<CartResponse>> {
  try {
    const res = await cartService.getCart();
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
