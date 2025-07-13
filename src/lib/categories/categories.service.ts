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

  public async findAll(params?: GetCategoriesDto) {
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

    return this.fetcher.request<PaginatedData<CategoryWithRelations>>(url);
  }

  public async findTree() {
    return this.fetcher.request<CategoryTreeResponse[]>("/v1/categories/tree");
  }

  public async findById(categoryId: string) {
    return this.fetcher.request<CategoryDetail>(`/v1/categories/${categoryId}`);
  }

  public async findBySlug(slug: string) {
    return this.fetcher.request<CategoryDetail>(`/v1/categories/slug/${slug}`);
  }

  public async create(values: CreateCategoryDto) {
    return this.fetcher.request<CategoryResponse>("/v1/categories", {
      method: "POST",
      data: values,
    });
  }

  public async update(categoryId: string, values: UpdateCategoryDto) {
    return this.fetcher.request<CategoryResponse>(
      `/v1/categories/${categoryId}`,
      {
        method: "PATCH",
        data: values,
      }
    );
  }

  public async delete(categoryId: string) {
    return this.fetcher.request<void>(`/v1/categories/${categoryId}`, {
      method: "DELETE",
    });
  }
}
