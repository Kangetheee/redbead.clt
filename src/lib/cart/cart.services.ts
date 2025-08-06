/* eslint-disable @typescript-eslint/no-unused-vars */

import { Fetcher } from "../api/api.service";
import { PaginatedData1 } from "../shared/types";
import { CreateCartItemDto, UpdateCartItemDto } from "./dto/cart.dto";
import { CartItemResponse } from "./types/cart.types";

export class CartService {
  constructor(private fetcher = new Fetcher()) {}

  /**
   * Get the current user's cart with all items and totals
   * Accessible without authentication for guest users
   */
  public async getCart(): Promise<PaginatedData1<CartItemResponse>> {
    return this.fetcher.request<PaginatedData1<CartItemResponse>>(
      "/v1/cart",
      {},
      { auth: false }
    );
  }

  /**
   * Get a specific cart item by ID
   * Accessible without authentication for guest users
   */
  public async getCartItem(cartItemId: string): Promise<CartItemResponse> {
    return this.fetcher.request<CartItemResponse>(
      `/v1/cart/${cartItemId}`,
      {},
      { auth: false }
    );
  }

  /**
   * Add a new item to the cart with template customizations
   * Accessible without authentication for guest users
   */
  public async addToCart(values: CreateCartItemDto): Promise<CartItemResponse> {
    return this.fetcher.request<CartItemResponse>(
      "/v1/cart",
      {
        method: "POST",
        data: values,
      },
      { auth: false }
    );
  }

  /**
   * Update quantity, size variant, or customizations of a specific cart item
   * Accessible without authentication for guest users
   */
  public async updateCartItem(
    cartItemId: string,
    values: UpdateCartItemDto
  ): Promise<CartItemResponse> {
    return this.fetcher.request<CartItemResponse>(
      `/v1/cart/${cartItemId}`,
      {
        method: "PATCH",
        data: values,
      },
      { auth: false }
    );
  }

  /**
   * Remove a specific item from the cart
   * Accessible without authentication for guest users
   */
  public async removeCartItem(cartItemId: string): Promise<void> {
    return this.fetcher.request<void>(
      `/v1/cart/${cartItemId}`,
      {
        method: "DELETE",
      },
      { auth: false }
    );
  }

  /**
   * Remove all items from the current user's cart
   * Accessible without authentication for guest users
   */
  public async clearCart(): Promise<void> {
    return this.fetcher.request<void>(
      "/v1/cart",
      {
        method: "DELETE",
      },
      { auth: false }
    );
  }

  /**
   * Get cart item count for display purposes
   * Accessible without authentication for guest users
   */
  public async getCartItemCount(): Promise<{
    count: number;
    totalQuantity: number;
  }> {
    try {
      const cart = await this.getCart();
      return {
        count: cart.meta.itemCount,
        totalQuantity: cart.meta.totalQuantity,
      };
    } catch (error) {
      // Return zero counts if cart is empty or error occurs
      return {
        count: 0,
        totalQuantity: 0,
      };
    }
  }

  /**
   * Check if a specific template and size variant combination exists in cart
   * Useful for UI state management
   * Accessible without authentication for guest users
   */
  public async isInCart(
    templateId: string,
    sizeVariantId: string
  ): Promise<boolean> {
    try {
      const cart = await this.getCart();
      return cart.summary.some(
        (item) =>
          item.template.id === templateId &&
          item.sizeVariant.id === sizeVariantId
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Get cart total for quick display
   * Accessible without authentication for guest users
   */
  public async getCartTotal(): Promise<number> {
    try {
      const cart = await this.getCart();
      return cart.meta.total;
    } catch (error) {
      return 0;
    }
  }
}
