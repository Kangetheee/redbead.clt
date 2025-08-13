import { Fetcher } from "../api/api.service";
import { CreateFaqDto, UpdateFaqDto } from "./dto/faq.dto";
import { Faq, FaqsQueryParams, PaginatedFaqsResponse } from "./types/faq.types";

export class FaqsService {
  constructor(private fetcher = new Fetcher()) {}

  async getAll(params?: FaqsQueryParams): Promise<PaginatedFaqsResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `/v1/faqs?${queryString}` : "/v1/faqs";

    return await this.fetcher.request<PaginatedFaqsResponse>(url);
  }

  async getById(id: string): Promise<Faq> {
    return await this.fetcher.request<Faq>(`/v1/faqs/${id}`);
  }

  async create(data: CreateFaqDto): Promise<{ id: string }> {
    return await this.fetcher.request<{ id: string }>("/v1/faqs", {
      method: "POST",
      data,
    });
  }

  async update(id: string, data: UpdateFaqDto): Promise<{ id: string }> {
    return await this.fetcher.request<{ id: string }>(`/v1/faqs/${id}`, {
      method: "PATCH",
      data,
    });
  }

  async delete(id: string): Promise<{ id: string }> {
    return await this.fetcher.request<{ id: string }>(`/v1/faqs/${id}`, {
      method: "DELETE",
    });
  }
}
