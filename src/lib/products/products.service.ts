import { Fetcher } from "../api/api.service";
import { PaginatedData } from "../shared/types";
import {
  CreateProductDto,
  UpdateProductDto,
  GetProductsDto,
  PriceCalculationDto,
} from "./dto/products.dto";
import { ProductResponse, PriceBreakdown } from "./types/products.types";

export class ProductService {
  constructor(private fetcher = new Fetcher()) {}

  public async findAll(params?: GetProductsDto) {
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
    if (params?.minPrice) {
      queryParams.append("minPrice", params.minPrice.toString());
    }
    if (params?.maxPrice) {
      queryParams.append("maxPrice", params.maxPrice.toString());
    }
    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.isFeatured !== undefined) {
      queryParams.append("isFeatured", params.isFeatured.toString());
    }
    if (params?.isActive !== undefined) {
      queryParams.append("isActive", params.isActive.toString());
    }
    if (params?.templateId) {
      queryParams.append("templateId", params.templateId);
    }
    if (params?.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }
    if (params?.sortDirection) {
      queryParams.append("sortDirection", params.sortDirection);
    }

    const queryString = queryParams.toString();
    const url = `/v1/products${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<PaginatedData<ProductResponse>>(url);
  }

  public async findFeatured(limit?: number) {
    const queryParams = new URLSearchParams();
    if (limit) {
      queryParams.append("limit", limit.toString());
    }

    const queryString = queryParams.toString();
    const url = `/v1/products/featured${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<ProductResponse[]>(url);
  }

  public async findById(productId: string) {
    return this.fetcher.request<ProductResponse>(`/v1/products/${productId}`);
  }

  public async findBySlug(slug: string) {
    return this.fetcher.request<ProductResponse>(`/v1/products/slug/${slug}`);
  }

  public async create(values: CreateProductDto) {
    return this.fetcher.request<ProductResponse>("/v1/products", {
      method: "POST",
      data: values,
    });
  }

  public async update(productId: string, values: UpdateProductDto) {
    return this.fetcher.request<ProductResponse>(`/v1/products/${productId}`, {
      method: "PATCH",
      data: values,
    });
  }

  public async delete(productId: string) {
    return this.fetcher.request<void>(`/v1/products/${productId}`, {
      method: "DELETE",
    });
  }

  public async calculatePrice(productId: string, values: PriceCalculationDto) {
    return this.fetcher.request<PriceBreakdown>(
      `/v1/products/${productId}/calculate-price`,
      {
        method: "POST",
        data: values,
      }
    );
  }
}
