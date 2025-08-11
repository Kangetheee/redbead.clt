import { Fetcher } from "../api/api.service";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  GetCategoriesDto,
} from "./dto/categories.dto";
import {
  CategoryResponse,
  CategoryTreeResponse,
  CategoryDetail,
  PaginatedCategoriesResponse,
} from "./types/categories.types";

export class CategoryService {
  constructor(private fetcher = new Fetcher()) {}

  /**
   * Get paginated list of categories with optional filtering and sorting
   * Uses GET /v1/categories
   */
  async findAll(
    params?: GetCategoriesDto
  ): Promise<PaginatedCategoriesResponse> {
    const queryParams = new URLSearchParams();

    // Apply defaults
    const pageIndex = params?.pageIndex ?? 0;
    const pageSize = params?.pageSize ?? 20;

    queryParams.append("pageIndex", pageIndex.toString());
    queryParams.append("pageSize", pageSize.toString());

    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.isActive !== undefined) {
      queryParams.append("isActive", params.isActive.toString());
    }
    if (params?.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }
    if (params?.sortOrder) {
      queryParams.append("sortOrder", params.sortOrder);
    }
    if (params?.parentId) {
      queryParams.append("parentId", params.parentId);
    }

    const url = `/v1/categories?${queryParams.toString()}`;

    return this.fetcher.request<PaginatedCategoriesResponse>(url, {
      method: "GET",
    });
  }

  /**
   * Get all categories in hierarchical tree structure
   * Uses GET /v1/categories/tree
   */
  async findTree(): Promise<CategoryTreeResponse[]> {
    return this.fetcher.request<CategoryTreeResponse[]>("/v1/categories/tree", {
      method: "GET",
    });
  }

  /**
   * Get detailed category information including products by ID
   * Uses GET /v1/categories/{id}
   */
  async findById(categoryId: string): Promise<CategoryDetail> {
    if (!categoryId) {
      throw new Error("Category ID is required");
    }

    return this.fetcher.request<CategoryDetail>(
      `/v1/categories/${categoryId}`,
      {
        method: "GET",
      }
    );
  }

  /**
   * Get category using URL-friendly slug identifier
   * Uses GET /v1/categories/slug/{slug}
   */
  async findBySlug(slug: string): Promise<CategoryDetail> {
    if (!slug) {
      throw new Error("Slug is required");
    }

    return this.fetcher.request<CategoryDetail>(`/v1/categories/slug/${slug}`, {
      method: "GET",
    });
  }

  /**
   * Create a new product category with optional parent relationship
   * Uses POST /v1/categories
   */
  async create(values: CreateCategoryDto): Promise<CategoryResponse> {
    return this.fetcher.request<CategoryResponse>("/v1/categories", {
      method: "POST",
      data: values,
    });
  }

  /**
   * Update category information and settings
   * Uses PATCH /v1/categories/{id}
   */
  async update(
    categoryId: string,
    values: UpdateCategoryDto
  ): Promise<CategoryResponse> {
    if (!categoryId) {
      throw new Error("Category ID is required for update");
    }

    return this.fetcher.request<CategoryResponse>(
      `/v1/categories/${categoryId}`,
      {
        method: "PATCH",
        data: values,
      }
    );
  }

  /**
   * Delete category (must have no products or children)
   * Uses DELETE /v1/categories/{id}
   */
  async delete(categoryId: string): Promise<void> {
    if (!categoryId) {
      throw new Error("Category ID is required for delete");
    }

    return this.fetcher.request<void>(`/v1/categories/${categoryId}`, {
      method: "DELETE",
    });
  }
}
