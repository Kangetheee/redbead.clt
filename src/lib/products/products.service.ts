import { Fetcher } from "../api/api.service";
import { PaginatedData } from "../shared/types";
import {
  CreateProductDto,
  UpdateProductDto,
  GetProductsDto,
  SearchProductsDto,
  CalculatePriceDto,
} from "./dto/products.dto";
import {
  ProductResponse,
  ProductPriceCalculation,
} from "./types/products.types";

export class ProductService {
  constructor(private fetcher = new Fetcher()) {}

  public async findAll(
    params?: GetProductsDto
  ): Promise<PaginatedData<ProductResponse>> {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params?.categoryId) {
      queryParams.append("categoryId", params.categoryId);
    }
    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.minPrice !== undefined) {
      queryParams.append("minPrice", params.minPrice.toString());
    }
    if (params?.maxPrice !== undefined) {
      queryParams.append("maxPrice", params.maxPrice.toString());
    }
    if (params?.isActive !== undefined) {
      queryParams.append("isActive", params.isActive.toString());
    }
    if (params?.isFeatured !== undefined) {
      queryParams.append("isFeatured", params.isFeatured.toString());
    }
    if (params?.relatedTo) {
      queryParams.append("relatedTo", params.relatedTo);
    }
    if (params?.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }
    if (params?.sortDirection) {
      queryParams.append("sortDirection", params.sortDirection);
    }

    const queryString = queryParams.toString();
    const url = `/v1/product${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<PaginatedData<ProductResponse>>(
      url,
      {},
      { auth: false }
    );
  }

  public async create(values: CreateProductDto): Promise<ProductResponse> {
    return this.fetcher.request<ProductResponse>("/v1/product", {
      method: "POST",
      data: values,
    });
  }

  public async search(params: SearchProductsDto): Promise<ProductResponse[]> {
    const queryParams = new URLSearchParams();

    queryParams.append("q", params.q);
    if (params.limit) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params.categoryId) {
      queryParams.append("categoryId", params.categoryId);
    }

    const queryString = queryParams.toString();
    const url = `/v1/product/search?${queryString}`;

    return this.fetcher.request<ProductResponse[]>(url, {}, { auth: false });
  }

  public async findFeatured(limit?: number): Promise<ProductResponse[]> {
    const queryParams = new URLSearchParams();
    if (limit) {
      queryParams.append("limit", limit.toString());
    }

    const queryString = queryParams.toString();
    const url = `/v1/product/featured${queryString ? `?${queryString}` : ""}`;

    return await this.fetcher.request<ProductResponse[]>(
      url,
      {},
      { auth: false }
    );
  }

  public async findBySlug(slug: string): Promise<ProductResponse> {
    return this.fetcher.request<ProductResponse>(
      `/v1/product/by-slug/${slug}`,
      {},
      { auth: false } // Public endpoint
    );
  }

  /**
   * Calculate product price with variants and customizations
   */
  public async calculatePrice(
    productId: string,
    params: CalculatePriceDto
  ): Promise<ProductPriceCalculation> {
    return this.fetcher.request<ProductPriceCalculation>(
      `/v1/product/${productId}/calculate-price`,
      {
        method: "POST",
        data: params,
      },
      { auth: false } // Public endpoint - anyone can calculate prices
    );
  }

  /**
   * Get detailed product information by ID
   */
  public async findById(productId: string): Promise<ProductResponse> {
    return this.fetcher.request<ProductResponse>(
      `/v1/product/${productId}`,
      {},
      { auth: false } // Public endpoint
    );
  }

  /**
   * Update product information (Admin only)
   */
  public async update(
    productId: string,
    values: UpdateProductDto
  ): Promise<ProductResponse> {
    return this.fetcher.request<ProductResponse>(`/v1/product/${productId}`, {
      method: "PATCH",
      data: values,
    }); // Requires authentication (default auth: true)
  }

  /**
   * Permanently delete a product (Admin only)
   */
  public async delete(productId: string): Promise<void> {
    return this.fetcher.request<void>(`/v1/product/${productId}`, {
      method: "DELETE",
    }); // Requires authentication (default auth: true)
  }

  /**
   * Toggle product featured status (Admin only)
   */
  public async toggleFeatured(productId: string): Promise<ProductResponse> {
    return this.fetcher.request<ProductResponse>(
      `/v1/product/${productId}/toggle-featured`,
      {
        method: "PATCH",
      }
    ); // Requires authentication (default auth: true)
  }
}
