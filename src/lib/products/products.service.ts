import { Fetcher } from "../api/api.service";
import { PaginatedData } from "../shared/types";
import {
  CreateProductTypeDto,
  UpdateProductTypeDto,
  GetProductTypesDto,
  GetProductTypesByCategoryDto,
} from "./dto/products.dto";
import { ProductTypeResponse } from "./types/products.types";

export class ProductTypeService {
  constructor(private fetcher = new Fetcher()) {}

  /**
   * Get paginated list of product types with optional filtering and sorting
   */
  public async findAll(
    params?: GetProductTypesDto
  ): Promise<PaginatedData<ProductTypeResponse>> {
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
    if (params?.type) {
      queryParams.append("type", params.type);
    }
    if (params?.material) {
      queryParams.append("material", params.material);
    }
    if (params?.isFeatured !== undefined) {
      queryParams.append("isFeatured", params.isFeatured.toString());
    }
    if (params?.isActive !== undefined) {
      queryParams.append("isActive", params.isActive.toString());
    }
    if (params?.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }
    if (params?.sortDirection) {
      queryParams.append("sortDirection", params.sortDirection);
    }

    const queryString = queryParams.toString();
    const url = `/v1/product${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<PaginatedData<ProductTypeResponse>>(
      url,
      {},
      { auth: false } // Public endpoint
    );
  }

  /**
   * Get featured product types for homepage/marketing display
   */
  public async findFeatured(limit?: number): Promise<ProductTypeResponse[]> {
    const queryParams = new URLSearchParams();
    if (limit) {
      queryParams.append("limit", limit.toString());
    }

    const queryString = queryParams.toString();
    const url = `/v1/product/featured${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<ProductTypeResponse[]>(
      url,
      {},
      { auth: false } // Public endpoint - no authentication required
    );
  }

  /**
   * Get detailed product type information by ID
   */
  public async findById(productTypeId: string): Promise<ProductTypeResponse> {
    return this.fetcher.request<ProductTypeResponse>(
      `/v1/product/${productTypeId}`,
      {},
      { auth: false } // Public endpoint
    );
  }

  /**
   * Get detailed product type information using URL-friendly slug
   */
  public async findBySlug(slug: string): Promise<ProductTypeResponse> {
    return this.fetcher.request<ProductTypeResponse>(
      `/v1/product/slug/${slug}`,
      {},
      { auth: false } // Public endpoint
    );
  }

  /**
   * Get product types for a specific category
   */
  public async findByCategory(
    params: GetProductTypesByCategoryDto
  ): Promise<PaginatedData<ProductTypeResponse>> {
    const { categoryId, ...queryParams } = params;
    const urlParams = new URLSearchParams();

    if (queryParams.page) {
      urlParams.append("page", queryParams.page.toString());
    }
    if (queryParams.limit) {
      urlParams.append("limit", queryParams.limit.toString());
    }
    if (queryParams.search) {
      urlParams.append("search", queryParams.search);
    }
    if (queryParams.type) {
      urlParams.append("type", queryParams.type);
    }
    if (queryParams.material) {
      urlParams.append("material", queryParams.material);
    }
    if (queryParams.isFeatured !== undefined) {
      urlParams.append("isFeatured", queryParams.isFeatured.toString());
    }
    if (queryParams.isActive !== undefined) {
      urlParams.append("isActive", queryParams.isActive.toString());
    }
    if (queryParams.sortBy) {
      urlParams.append("sortBy", queryParams.sortBy);
    }
    if (queryParams.sortDirection) {
      urlParams.append("sortDirection", queryParams.sortDirection);
    }

    const queryString = urlParams.toString();
    const url = `/v1/product/category/${categoryId}${
      queryString ? `?${queryString}` : ""
    }`;

    return this.fetcher.request<PaginatedData<ProductTypeResponse>>(
      url,
      {},
      { auth: false } // Public endpoint
    );
  }

  /**
   * Create a new product type within a category (Admin only)
   */
  public async create(
    values: CreateProductTypeDto
  ): Promise<ProductTypeResponse> {
    return this.fetcher.request<ProductTypeResponse>("/v1/product", {
      method: "POST",
      data: values,
    }); // Requires authentication (default auth: true)
  }

  /**
   * Update product type information (Admin only)
   */
  public async update(
    productTypeId: string,
    values: UpdateProductTypeDto
  ): Promise<ProductTypeResponse> {
    return this.fetcher.request<ProductTypeResponse>(
      `/v1/product/${productTypeId}`,
      {
        method: "PATCH",
        data: values,
      }
    ); // Requires authentication (default auth: true)
  }

  /**
   * Permanently delete a product type (Admin only)
   */
  public async delete(productTypeId: string): Promise<void> {
    return this.fetcher.request<void>(`/v1/product/${productTypeId}`, {
      method: "DELETE",
    }); // Requires authentication (default auth: true)
  }
}
