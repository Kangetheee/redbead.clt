import { Fetcher } from "../api/api.service";
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  GetTemplatesDto,
  GetTemplatesByProductDto,
  DuplicateTemplateDto,
  CreateSizeVariantDto,
  UpdateSizeVariantDto,
  CreateColorPresetDto,
  UpdateColorPresetDto,
  CreateFontPresetDto,
  UpdateFontPresetDto,
  CreateMediaRestrictionDto,
  UpdateMediaRestrictionDto,
  CalculatePriceDto,
} from "./dto/design-template.dto";
import {
  SizeVariantResponseDto,
  ColorPresetResponseDto,
  FontPresetResponseDto,
  MediaRestrictionResponseDto,
  PriceCalculationResponseDto,
  TemplateResponse,
  TemplateListResponse,
} from "./types/design-template.types";

export class DesignTemplatesService {
  constructor(private fetcher = new Fetcher()) {}

  // Template CRUD Operations
  async createTemplate(values: CreateTemplateDto) {
    return this.fetcher.request<TemplateResponse>("/v1/templates", {
      method: "POST",
      data: values,
    });
  }

  async getTemplates(params: GetTemplatesDto) {
    const query = new URLSearchParams();

    // Use correct parameter names as per API documentation
    if (params.pageIndex !== undefined)
      query.append("pageIndex", params.pageIndex.toString());
    if (params.pageSize !== undefined)
      query.append("pageSize", params.pageSize.toString());
    if (params.search) query.append("search", params.search);
    if (params.productId) query.append("productId", params.productId);
    if (params.categoryId) query.append("categoryId", params.categoryId);
    if (params.isActive !== undefined)
      query.append("isActive", params.isActive.toString());

    return this.fetcher.request<TemplateListResponse>(
      `/v1/templates?${query.toString()}`,
      { method: "GET" },
      { auth: false }
    );
  }

  async getTemplatesByProduct(
    productId: string,
    params?: GetTemplatesByProductDto
  ) {
    const query = new URLSearchParams();
    if (params?.isActive !== undefined)
      query.append("isActive", params.isActive.toString());

    return this.fetcher.request<TemplateResponse[]>(
      `/v1/templates/by-product/${productId}?${query.toString()}`,
      { method: "GET" },
      { auth: false }
    );
  }

  async getTemplateById(id: string) {
    return this.fetcher.request<TemplateResponse>(
      `/v1/templates/${id}`,
      {
        method: "GET",
      },
      { auth: false }
    );
  }

  async updateTemplate(id: string, values: UpdateTemplateDto) {
    return this.fetcher.request<TemplateResponse>(`/v1/templates/${id}`, {
      method: "PATCH",
      data: values,
    });
  }

  async deleteTemplate(id: string) {
    return this.fetcher.request<void>(`/v1/templates/${id}`, {
      method: "DELETE",
    });
  }

  async duplicateTemplate(templateId: string, values: DuplicateTemplateDto) {
    return this.fetcher.request<TemplateResponse>(
      `/v1/templates/${templateId}/duplicate`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  // Size Variant Operations
  async createSizeVariant(templateId: string, values: CreateSizeVariantDto) {
    return this.fetcher.request<SizeVariantResponseDto>(
      `/v1/templates/${templateId}/size-variants`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  async getSizeVariants(templateId: string) {
    return this.fetcher.request<SizeVariantResponseDto[]>(
      `/v1/templates/${templateId}/size-variants`,
      { method: "GET" },
      { auth: false }
    );
  }

  async updateSizeVariant(
    templateId: string,
    variantId: string,
    values: UpdateSizeVariantDto
  ) {
    return this.fetcher.request<SizeVariantResponseDto>(
      `/v1/templates/${templateId}/size-variants/${variantId}`,
      {
        method: "PATCH",
        data: values,
      }
    );
  }

  async deleteSizeVariant(templateId: string, variantId: string) {
    return this.fetcher.request<void>(
      `/v1/templates/${templateId}/size-variants/${variantId}`,
      { method: "DELETE" }
    );
  }

  // Color Preset Operations
  async createColorPreset(templateId: string, values: CreateColorPresetDto) {
    return this.fetcher.request<ColorPresetResponseDto>(
      `/v1/templates/${templateId}/color-presets`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  async getColorPresets(templateId: string) {
    return this.fetcher.request<ColorPresetResponseDto[]>(
      `/v1/templates/${templateId}/color-presets`,
      { method: "GET" },
      { auth: false }
    );
  }

  async updateColorPreset(
    templateId: string,
    presetId: string,
    values: UpdateColorPresetDto
  ) {
    return this.fetcher.request<ColorPresetResponseDto>(
      `/v1/templates/${templateId}/color-presets/${presetId}`,
      {
        method: "PATCH",
        data: values,
      }
    );
  }

  async deleteColorPreset(templateId: string, presetId: string) {
    return this.fetcher.request<void>(
      `/v1/templates/${templateId}/color-presets/${presetId}`,
      { method: "DELETE" }
    );
  }

  // Font Preset Operations
  async createFontPreset(templateId: string, values: CreateFontPresetDto) {
    return this.fetcher.request<FontPresetResponseDto>(
      `/v1/templates/${templateId}/font-presets`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  async getFontPresets(templateId: string) {
    return this.fetcher.request<FontPresetResponseDto[]>(
      `/v1/templates/${templateId}/font-presets`,
      { method: "GET" },
      { auth: false }
    );
  }

  async updateFontPreset(
    templateId: string,
    presetId: string,
    values: UpdateFontPresetDto
  ) {
    return this.fetcher.request<FontPresetResponseDto>(
      `/v1/templates/${templateId}/font-presets/${presetId}`,
      {
        method: "PATCH",
        data: values,
      }
    );
  }

  async deleteFontPreset(templateId: string, presetId: string) {
    return this.fetcher.request<void>(
      `/v1/templates/${templateId}/font-presets/${presetId}`,
      { method: "DELETE" }
    );
  }

  // Media Restriction Operations
  async createMediaRestriction(
    templateId: string,
    values: CreateMediaRestrictionDto
  ) {
    return this.fetcher.request<MediaRestrictionResponseDto>(
      `/v1/templates/${templateId}/media-restrictions`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  async getMediaRestrictions(templateId: string) {
    return this.fetcher.request<MediaRestrictionResponseDto[]>(
      `/v1/templates/${templateId}/media-restrictions`,
      { method: "GET" },
      { auth: false }
    );
  }

  async updateMediaRestriction(
    templateId: string,
    restrictionId: string,
    values: UpdateMediaRestrictionDto
  ) {
    return this.fetcher.request<MediaRestrictionResponseDto>(
      `/v1/templates/${templateId}/media-restrictions/${restrictionId}`,
      {
        method: "PATCH",
        data: values,
      }
    );
  }

  async deleteMediaRestriction(templateId: string, restrictionId: string) {
    return this.fetcher.request<void>(
      `/v1/templates/${templateId}/media-restrictions/${restrictionId}`,
      { method: "DELETE" }
    );
  }

  // Price Calculation
  async calculatePrice(templateId: string, values: CalculatePriceDto) {
    return this.fetcher.request<PriceCalculationResponseDto>(
      `/v1/templates/${templateId}/calculate-price`,
      {
        method: "POST",
        data: values,
      }
    );
  }
}
