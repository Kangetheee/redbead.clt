import { Fetcher } from "../api/api.service";
import {
  CreateDesignTemplateDto,
  UpdateDesignTemplateDto,
  GetDesignTemplatesDto,
  GetFeaturedTemplatesDto,
  DesignTemplateResponseDto,
  PaginatedDesignTemplatesResponseDto,
} from "./dto/design-templates.dto";

export class DesignTemplatesService {
  constructor(private fetcher = new Fetcher()) {}

  async createDesignTemplate(values: CreateDesignTemplateDto) {
    return this.fetcher.request<DesignTemplateResponseDto>(
      "/v1/design-templates",
      {
        method: "POST",
        data: values,
      }
    );
  }

  async getDesignTemplates(params: GetDesignTemplatesDto) {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    if (params.search) query.append("search", params.search);
    if (params.isFeatured !== undefined)
      query.append("isFeatured", params.isFeatured.toString());
    if (params.isActive !== undefined)
      query.append("isActive", params.isActive.toString());

    return this.fetcher.request<PaginatedDesignTemplatesResponseDto>(
      `/v1/design-templates?${query.toString()}`,
      { method: "GET" }
    );
  }

  async getFeaturedDesignTemplates(params: GetFeaturedTemplatesDto) {
    const query = new URLSearchParams();
    query.append("limit", params.limit.toString());

    return this.fetcher.request<DesignTemplateResponseDto[]>(
      `/v1/design-templates/featured?${query.toString()}`,
      { method: "GET" }
    );
  }

  async getDesignTemplateById(id: string) {
    return this.fetcher.request<DesignTemplateResponseDto>(
      `/v1/design-templates/${id}`,
      {
        method: "GET",
      }
    );
  }

  async updateDesignTemplate(id: string, values: UpdateDesignTemplateDto) {
    return this.fetcher.request<DesignTemplateResponseDto>(
      `/v1/design-templates/${id}`,
      {
        method: "PATCH",
        data: values,
      }
    );
  }

  async deleteDesignTemplate(id: string) {
    return this.fetcher.request<void>(`/v1/design-templates/${id}`, {
      method: "DELETE",
    });
  }
}
