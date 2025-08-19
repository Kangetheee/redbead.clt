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

  async getCartItem(cartItemId: string): Promise<CartItemResponse> {
    return this.fetcher.request<CartItemResponse>(
      `/v1/cart/${cartItemId}`,
      { method: "GET" },
      { auth: false }
    );
  }

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

  async removeCartItem(cartItemId: string): Promise<void> {
    return this.fetcher.request<void>(
      `/v1/cart/${cartItemId}`,
      { method: "DELETE" },
      { auth: false }
    );
  }

  async clearCart(): Promise<void> {
    return this.fetcher.request<void>(
      "/v1/cart",
      { method: "DELETE" },
      { auth: false }
    );
  }

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return { count: 0, totalQuantity: 0 };
    }
  }

  async isInCart(productId: string, variantId: string): Promise<boolean> {
    try {
      const cart = await this.getCart();
      return cart.items.some(
        (item) => item.productId === productId && item.variantId === variantId
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false;
    }
  }

  async getCartTotal(): Promise<number> {
    try {
      const cart = await this.getCart();
      return cart.summary.total;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return 0;
    }
  }

  async getCartSummary(): Promise<{
    itemCount: number;
    totalQuantity: number;
    subtotal: number;
    total: number;
  }> {
    try {
      const cart = await this.getCart();
      return cart.summary;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return { itemCount: 0, totalQuantity: 0, subtotal: 0, total: 0 };
    }
  }

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return null;
    }
  }

  async hasSavedItemsAccess(): Promise<boolean> {
    try {
      await this.getSavedItems({ pageSize: 1 });
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false;
    }
  }
}
