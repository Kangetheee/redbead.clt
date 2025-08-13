import { Fetcher } from "../api/api.service";
import { CreateFaqDto } from "./dto/faq.dto";
import { Faq } from "./types/faq.types";

export class FaqsService {
  constructor(private fetcher = new Fetcher()) {}

  async find(query?: string) {
    return await this.fetcher.request<Faq[]>(
      `/v1/faqs${query ? `?${query}` : ""}`
    );
  }

  async create(data: CreateFaqDto) {
    return await this.fetcher.request<{ id: string }>("/v1/faqs", {
      method: "POST",
      data,
    });
  }

  async update(id: string, data: CreateFaqDto) {
    return await this.fetcher.request<{ id: string }>(`/v1/faqs/${id}`, {
      method: "PATCH",
      data,
    });
  }

  async delete(id: string) {
    return await this.fetcher.request<{ id: string }>(`/v1/faqs/${id}`, {
      method: "DELETE",
    });
  }
}
