import { Fetcher } from "../api/api.service";
import {
  CreateDesignDto,
  UpdateDesignDto,
  GetDesignsDto,
  DuplicateDesignDto,
  PaginatedDesignsResponseDto,
  DesignResponseDto,
} from "./dto/designs.dto";

export class DesignsService {
  constructor(private fetcher = new Fetcher()) {}

  async createDesign(values: CreateDesignDto) {
    return this.fetcher.request<DesignResponseDto>("/v1/designs", {
      method: "POST",
      data: values,
    });
  }

  async getDesigns(params: GetDesignsDto) {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    if (params.search) query.append("search", params.search);
    if (params.isTemplate !== undefined)
      query.append("isTemplate", params.isTemplate.toString());

    return this.fetcher.request<PaginatedDesignsResponseDto>(
      `/v1/designs?${query.toString()}`,
      { method: "GET" }
    );
  }

  async getUserDesigns(params: GetDesignsDto) {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    if (params.search) query.append("search", params.search);
    if (params.isTemplate !== undefined)
      query.append("isTemplate", params.isTemplate.toString());

    return this.fetcher.request<PaginatedDesignsResponseDto>(
      `/v1/designs/my-designs?${query.toString()}`,
      { method: "GET" }
    );
  }

  async getDesignById(id: string) {
    return this.fetcher.request<DesignResponseDto>(`/v1/designs/${id}`, {
      method: "GET",
    });
  }

  async updateDesign(id: string, values: UpdateDesignDto) {
    return this.fetcher.request<DesignResponseDto>(`/v1/designs/${id}`, {
      method: "PATCH",
      data: values,
    });
  }

  async deleteDesign(id: string) {
    return this.fetcher.request<void>(`/v1/designs/${id}`, {
      method: "DELETE",
    });
  }

  async duplicateDesign(id: string, values?: DuplicateDesignDto) {
    return this.fetcher.request<DesignResponseDto>(
      `/v1/designs/${id}/duplicate`,
      {
        method: "POST",
        data: values || {},
      }
    );
  }
}
