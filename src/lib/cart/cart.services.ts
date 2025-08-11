/* eslint-disable @typescript-eslint/no-unused-vars */
import { Fetcher } from "../api/api.service";
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

export class CartService {
  constructor(private fetcher = new Fetcher()) {}

  /**
   * Get cart with pagination, filtering, and sorting
   * Uses GET /v1/cart
   * No authentication required (works for both guest and authenticated users)
   */
  async getCart(params?: GetCartDto): Promise<CartResponse> {
    const queryParams = new URLSearchParams();

    if (params?.pageIndex !== undefined) {
      queryParams.append("pageIndex", params.pageIndex.toString());
    }
    if (params?.pageSize !== undefined) {
      queryParams.append("pageSize", params.pageSize.toString());
    }
    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.categorySlug) {
      queryParams.append("categorySlug", params.categorySlug);
    }
    if (params?.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }
    if (params?.sortOrder) {
      queryParams.append("sortOrder", params.sortOrder);
    }

    const queryString = queryParams.toString();
    const url = `/v1/cart${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<CartResponse>(
      url,
      {
        method: "GET",
      },
      { auth: false }
    );
  }

  /**
   * Get a specific cart item by ID
   * Uses GET /v1/cart/{id}
   * No authentication required
   */
  async getCartItem(cartItemId: string): Promise<CartItemResponse> {
    return this.fetcher.request<CartItemResponse>(
      `/v1/cart/${cartItemId}`,
      { method: "GET" },
      { auth: false }
    );
  }

  /**
   * Add a new item to the cart with product customizations
   * Uses POST /v1/cart
   * No authentication required (works for both guest and authenticated users)
   */
  async addToCart(values: CreateCartItemDto): Promise<CartItemResponse> {
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
   * Update quantity, variant, or customizations of a specific cart item
   * Uses PATCH /v1/cart/{id}
   * No authentication required
   */
  async updateCartItem(
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
   * Uses DELETE /v1/cart/{id}
   * No authentication required
   */
  async removeCartItem(cartItemId: string): Promise<void> {
    return this.fetcher.request<void>(
      `/v1/cart/${cartItemId}`,
      { method: "DELETE" },
      { auth: false }
    );
  }

  /**
   * Remove all items from the current user's cart
   * Uses DELETE /v1/cart
   * No authentication required
   */
  async clearCart(): Promise<void> {
    return this.fetcher.request<void>(
      "/v1/cart",
      { method: "DELETE" },
      { auth: false }
    );
  }

  /**
   * Get saved for later items with pagination
   * Uses GET /v1/cart/saved
   * Requires authentication
   */
  async getSavedItems(params?: GetSavedItemsDto): Promise<CartResponse> {
    const queryParams = new URLSearchParams();

    if (params?.pageIndex !== undefined) {
      queryParams.append("pageIndex", params.pageIndex.toString());
    }
    if (params?.pageSize !== undefined) {
      queryParams.append("pageSize", params.pageSize.toString());
    }
    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.categorySlug) {
      queryParams.append("categorySlug", params.categorySlug);
    }
    if (params?.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }
    if (params?.sortOrder) {
      queryParams.append("sortOrder", params.sortOrder);
    }

    const queryString = queryParams.toString();
    const url = `/v1/cart/saved${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<CartResponse>(
      url,
      {
        method: "GET",
      },
      { auth: true }
    );
  }

  /**
   * Remove multiple items from the cart at once
   * Uses POST /v1/cart/bulk-remove
   * No authentication required
   */
  async bulkRemove(values: BulkRemoveDto): Promise<void> {
    return this.fetcher.request<void>(
      "/v1/cart/bulk-remove",
      {
        method: "POST",
        data: values,
      },
      { auth: false }
    );
  }

  /**
   * Move items between cart and saved for later
   * Uses POST /v1/cart/save-for-later
   * Requires authentication
   */
  async saveForLater(values: SaveForLaterDto): Promise<void> {
    return this.fetcher.request<void>(
      "/v1/cart/save-for-later",
      {
        method: "POST",
        data: values,
      },
      { auth: true }
    );
  }

  /**
   * NEW: Merge guest session cart with user cart
   * Uses POST /v1/cart/merge-session
   * Requires authentication
   */
  async mergeSessionCart(
    values: MergeSessionCartDto
  ): Promise<MergeSessionCartResponse> {
    return this.fetcher.request<MergeSessionCartResponse>(
      "/v1/cart/merge-session",
      {
        method: "POST",
        data: values,
      },
      { auth: true }
    );
  }

  /**
   * NEW: Cleanup expired session carts (Admin only)
   * Uses POST /v1/cart/cleanup-expired-sessions
   * Requires authentication (admin role)
   */
  async cleanupExpiredSessions(
    params: CleanupExpiredSessionsDto
  ): Promise<CleanupExpiredSessionsResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append("daysOld", params.daysOld.toString());

    return this.fetcher.request<CleanupExpiredSessionsResponse>(
      `/v1/cart/cleanup-expired-sessions?${queryParams.toString()}`,
      { method: "POST" },
      { auth: true }
    );
  }

  // Utility Methods

  /**
   * Get cart item count for display purposes
   */
  async getCartItemCount(): Promise<{
    count: number;
    totalQuantity: number;
  }> {
    try {
      const cart = await this.getCart();
      return {
        count: cart.summary.itemCount,
        totalQuantity: cart.summary.totalQuantity,
      };
    } catch (error) {
      return { count: 0, totalQuantity: 0 };
    }
  }

  /**
   * Check if a specific product and variant combination exists in cart
   */
  async isInCart(productId: string, variantId: string): Promise<boolean> {
    try {
      const cart = await this.getCart();
      return cart.items.some(
        (item) => item.productId === productId && item.variantId === variantId
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Get cart total for quick display
   */
  async getCartTotal(): Promise<number> {
    try {
      const cart = await this.getCart();
      return cart.summary.total;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get cart summary without full cart data
   */
  async getCartSummary(): Promise<{
    itemCount: number;
    totalQuantity: number;
    subtotal: number;
    total: number;
  }> {
    try {
      const cart = await this.getCart();
      return cart.summary;
    } catch (error) {
      return { itemCount: 0, totalQuantity: 0, subtotal: 0, total: 0 };
    }
  }

  /**
   * NEW: Get cart item by product and variant
   */
  async getCartItemByProduct(
    productId: string,
    variantId: string
  ): Promise<CartItemResponse | null> {
    try {
      const cart = await this.getCart();
      return (
        cart.items.find(
          (item) => item.productId === productId && item.variantId === variantId
        ) || null
      );
    } catch (error) {
      return null;
    }
  }

  /**
   * NEW: Check if saved items feature is available (requires auth)
   */
  async hasSavedItemsAccess(): Promise<boolean> {
    try {
      await this.getSavedItems({ pageSize: 1 });
      return true;
    } catch (error) {
      return false;
    }
  }
}
