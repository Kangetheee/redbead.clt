import { Fetcher } from "../api/api.service";
import { CreateCartItemDto, UpdateCartItemDto } from "./dto/cart.dto";
import { CartResponse, CartItemResponse } from "./types/cart.types";

export class CartService {
  constructor(private fetcher = new Fetcher()) {}

  public async getCart() {
    return this.fetcher.request<CartResponse>("/v1/cart");
  }

  public async getCartItem(cartItemId: string) {
    return this.fetcher.request<CartItemResponse>(`/v1/cart/${cartItemId}`);
  }

  public async addToCart(values: CreateCartItemDto) {
    return this.fetcher.request<CartItemResponse>("/v1/cart", {
      method: "POST",
      data: values,
    });
  }

  public async updateCartItem(cartItemId: string, values: UpdateCartItemDto) {
    return this.fetcher.request<CartItemResponse>(`/v1/cart/${cartItemId}`, {
      method: "PATCH",
      data: values,
    });
  }

  public async removeCartItem(cartItemId: string) {
    return this.fetcher.request<void>(`/v1/cart/${cartItemId}`, {
      method: "DELETE",
    });
  }

  public async clearCart() {
    return this.fetcher.request<void>("/v1/cart", {
      method: "DELETE",
    });
  }
}
