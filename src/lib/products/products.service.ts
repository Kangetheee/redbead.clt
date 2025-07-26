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

  public async findAll(params?: GetProductTypesDto) {
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
    const url = `/v1/product-types${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<PaginatedData<ProductTypeResponse>>(url);
  }

  public async findFeatured(limit?: number) {
    const queryParams = new URLSearchParams();
    if (limit) {
      queryParams.append("limit", limit.toString());
    }

    const queryString = queryParams.toString();
    const url = `/v1/product-types/featured${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<ProductTypeResponse[]>(url);
  }

  public async findById(productTypeId: string) {
    return this.fetcher.request<ProductTypeResponse>(
      `/v1/product-types/${productTypeId}`
    );
  }

  public async findBySlug(slug: string) {
    return this.fetcher.request<ProductTypeResponse>(
      `/v1/product-types/slug/${slug}`
    );
  }

  public async findByCategory(params: GetProductTypesByCategoryDto) {
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
    const url = `/v1/product-types/category/${categoryId}${
      queryString ? `?${queryString}` : ""
    }`;

    return this.fetcher.request<PaginatedData<ProductTypeResponse>>(url);
  }

  public async create(values: CreateProductTypeDto) {
    return this.fetcher.request<ProductTypeResponse>("/v1/product-types", {
      method: "POST",
      data: values,
    });
  }

  public async update(productTypeId: string, values: UpdateProductTypeDto) {
    return this.fetcher.request<ProductTypeResponse>(
      `/v1/product-types/${productTypeId}`,
      {
        method: "PATCH",
        data: values,
      }
    );
  }

  public async delete(productTypeId: string) {
    return this.fetcher.request<void>(`/v1/product-types/${productTypeId}`, {
      method: "DELETE",
    });
  }
}
