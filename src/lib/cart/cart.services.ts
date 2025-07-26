import { Fetcher } from "../api/api.service";
import { CreateCartItemDto, UpdateCartItemDto } from "./dto/cart.dto";
import { CartResponse, CartItemResponse } from "./types/cart.types";

export class CartService {
  constructor(private fetcher = new Fetcher()) {}

  /**
   * Get the current user's cart with all items and totals
   */
  public async getCart(): Promise<CartResponse> {
    return this.fetcher.request<CartResponse>("/v1/cart");
  }

  /**
   * Get a specific cart item by ID
   */
  public async getCartItem(cartItemId: string): Promise<CartItemResponse> {
    return this.fetcher.request<CartItemResponse>(`/v1/cart/${cartItemId}`);
  }

  /**
   * Add a new item to the cart with template customizations
   */
  public async addToCart(values: CreateCartItemDto): Promise<CartItemResponse> {
    return this.fetcher.request<CartItemResponse>("/v1/cart", {
      method: "POST",
      data: values,
    });
  }

  /**
   * Update quantity, size variant, or customizations of a specific cart item
   */
  public async updateCartItem(
    cartItemId: string,
    values: UpdateCartItemDto
  ): Promise<CartItemResponse> {
    return this.fetcher.request<CartItemResponse>(`/v1/cart/${cartItemId}`, {
      method: "PATCH",
      data: values,
    });
  }

  /**
   * Remove a specific item from the cart
   */
  public async removeCartItem(cartItemId: string): Promise<void> {
    return this.fetcher.request<void>(`/v1/cart/${cartItemId}`, {
      method: "DELETE",
    });
  }

  /**
   * Remove all items from the current user's cart
   */
  public async clearCart(): Promise<void> {
    return this.fetcher.request<void>("/v1/cart", {
      method: "DELETE",
    });
  }
}
