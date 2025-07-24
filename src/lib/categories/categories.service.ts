import { Fetcher } from "../api/api.service";
import { PaginatedData } from "../shared/types";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  GetCategoriesDto,
} from "./dto/categories.dto";
import {
  CategoryResponse,
  CategoryWithRelations,
  CategoryTreeResponse,
  CategoryDetail,
} from "./types/categories.types";

export class CategoryService {
  constructor(private fetcher = new Fetcher()) {}

  /**
   * Get paginated list of categories with optional filtering
   */
  public async findAll(
    params?: GetCategoriesDto
  ): Promise<PaginatedData<CategoryWithRelations>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page) {
        queryParams.append("page", params.page.toString());
      }
      if (params?.limit) {
        queryParams.append("limit", params.limit.toString());
      }
      if (params?.search) {
        queryParams.append("search", params.search);
      }
      if (params?.isActive !== undefined) {
        queryParams.append("isActive", params.isActive.toString());
      }

      const queryString = queryParams.toString();
      const url = `/v1/categories${queryString ? `?${queryString}` : ""}`;

      const result =
        await this.fetcher.request<PaginatedData<CategoryWithRelations>>(url);

      // Validate the response structure
      if (!result || typeof result !== "object") {
        throw new Error(
          "Invalid response structure: response is not an object"
        );
      }

      if (!result.items || !Array.isArray(result.items)) {
        throw new Error(
          "Invalid response structure: missing or invalid 'items' array"
        );
      }

      if (!result.meta || typeof result.meta !== "object") {
        throw new Error(
          "Invalid response structure: missing or invalid 'meta' object"
        );
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all categories in hierarchical tree structure
   */
  public async findTree(): Promise<CategoryTreeResponse[]> {
    try {
      const url = "/v1/categories/tree";
      const result = await this.fetcher.request<CategoryTreeResponse[]>(url);

      // Validate the response structure
      if (!Array.isArray(result)) {
        throw new Error(
          "Invalid response structure: tree response is not an array"
        );
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get detailed category information including products and options by ID
   */
  public async findById(categoryId: string): Promise<CategoryDetail> {
    try {
      if (!categoryId) {
        throw new Error("Category ID is required");
      }

      const url = `/v1/categories/${categoryId}`;
      const result = await this.fetcher.request<CategoryDetail>(url);

      // Validate the response structure
      if (!result || typeof result !== "object") {
        throw new Error(
          "Invalid response structure: category response is not an object"
        );
      }

      if (!result.id) {
        throw new Error("Invalid response structure: missing category ID");
      }

      return result;
    } catch (error) {
      // Check if this is a 404 error specifically
      if (error instanceof Error && error.message.includes("404")) {
        throw new Error(`Category not found with ID: ${categoryId}`);
      }
      throw error;
    }
  }

  /**
   * Get category using URL-friendly slug identifier
   */
  public async findBySlug(slug: string): Promise<CategoryDetail> {
    try {
      if (!slug) {
        throw new Error("Slug is required");
      }

      const url = `/v1/categories/slug/${slug}`;
      const result = await this.fetcher.request<CategoryDetail>(url);

      // Validate the response structure
      if (!result || typeof result !== "object") {
        throw new Error(
          "Invalid response structure: category response is not an object"
        );
      }

      if (!result.id) {
        throw new Error("Invalid response structure: missing category ID");
      }

      return result;
    } catch (error) {
      // Check if this is a 404 error specifically
      if (error instanceof Error && error.message.includes("404")) {
        throw new Error(`Category not found with slug: ${slug}`);
      }
      throw error;
    }
  }

  /**
   * Create a new product category with optional parent relationship
   */
  public async create(values: CreateCategoryDto): Promise<CategoryResponse> {
    try {
      const url = "/v1/categories";
      const result = await this.fetcher.request<CategoryResponse>(url, {
        method: "POST",
        data: values,
      });

      // Validate the response structure
      if (!result || typeof result !== "object") {
        throw new Error(
          "Invalid response structure: create response is not an object"
        );
      }

      if (!result.id) {
        throw new Error(
          "Invalid response structure: missing category ID in create response"
        );
      }

      return result;
    } catch (error) {
      // Handle specific errors
      if (error instanceof Error && error.message.includes("409")) {
        throw new Error("Category with this slug already exists");
      }
      throw error;
    }
  }

  /**
   * Update category information and settings
   */
  public async update(
    categoryId: string,
    values: UpdateCategoryDto
  ): Promise<CategoryResponse> {
    try {
      if (!categoryId) {
        throw new Error("Category ID is required for update");
      }

      const url = `/v1/categories/${categoryId}`;
      const result = await this.fetcher.request<CategoryResponse>(url, {
        method: "PATCH",
        data: values,
      });

      // Validate the response structure
      if (!result || typeof result !== "object") {
        throw new Error(
          "Invalid response structure: update response is not an object"
        );
      }

      if (!result.id) {
        throw new Error(
          "Invalid response structure: missing category ID in update response"
        );
      }

      return result;
    } catch (error) {
      // Check if this is a 404 error specifically
      if (error instanceof Error && error.message.includes("404")) {
        throw new Error(`Category not found for update with ID: ${categoryId}`);
      }
      throw error;
    }
  }

  /**
   * Delete category (must have no products or children)
   */
  public async delete(categoryId: string): Promise<void> {
    try {
      if (!categoryId) {
        throw new Error("Category ID is required for delete");
      }

      const url = `/v1/categories/${categoryId}`;
      await this.fetcher.request<void>(url, {
        method: "DELETE",
      });
    } catch (error) {
      // Handle specific errors
      if (error instanceof Error) {
        if (error.message.includes("404")) {
          throw new Error(
            `Category not found for deletion with ID: ${categoryId}`
          );
        }
        if (error.message.includes("400")) {
          throw new Error(
            "Cannot delete category: it has products or subcategories"
          );
        }
      }
      throw error;
    }
  }
}
