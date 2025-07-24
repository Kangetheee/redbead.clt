import { Fetcher } from "../api/api.service";
import { PaginatedData } from "../shared/types";
import {
  GetTemplatesDto,
  CreateTemplateDto,
  UpdateTemplateDto,
  CreateSizeVariantDto,
  UpdateSizeVariantDto,
  CalculatePriceDto,
  DuplicateTemplateDto,
  GetTemplatesByProductDto,
  GetTemplateAnalyticsDto,
} from "./dto/design-template.dto";
import {
  DesignTemplate,
  TemplatesListResponse,
  SizeVariant,
  CustomizationOption,
  PriceCalculationResult,
  TemplatePerformanceAnalytics,
} from "./types/design-template.types";

export class DesignTemplatesService {
  constructor(private fetcher = new Fetcher()) {}

  /**
   * Get paginated list of design templates with optional filtering
   * GET /v1/templates
   */
  public async findAll(
    params?: GetTemplatesDto
  ): Promise<PaginatedData<DesignTemplate>> {
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
    if (params?.productId) {
      queryParams.append("productId", params.productId);
    }
    if (params?.categoryId) {
      queryParams.append("categoryId", params.categoryId);
    }
    if (params?.isActive !== undefined) {
      queryParams.append("isActive", params.isActive.toString());
    }
    if (params?.isFeatured !== undefined) {
      queryParams.append("isFeatured", params.isFeatured.toString());
    }

    const queryString = queryParams.toString();
    const url = `/v1/templates${queryString ? `?${queryString}` : ""}`;

    const apiResponse = await this.fetcher.request<TemplatesListResponse>(url);

    return {
      items: apiResponse.items,
      meta: {
        totalItems: apiResponse.meta.totalItems,
        itemsPerPage: apiResponse.meta.itemsPerPage,
        currentPage: apiResponse.meta.currentPage,
        totalPages: apiResponse.meta.totalPages,
      },
    };
  }

  /**
   * Get design template by ID
   * GET /v1/templates/{id}
   */
  public async findById(templateId: string): Promise<DesignTemplate> {
    return this.fetcher.request<DesignTemplate>(`/v1/templates/${templateId}`);
  }

  /**
   * Get design template by slug
   * GET /v1/templates/slug/{slug}
   */
  public async findBySlug(slug: string): Promise<DesignTemplate> {
    return this.fetcher.request<DesignTemplate>(`/v1/templates/slug/${slug}`);
  }

  /**
   * Get all available templates for a specific product type
   * GET /v1/templates/by-product/{productId}
   */
  public async findByProduct(
    productId: string,
    params?: GetTemplatesByProductDto
  ): Promise<DesignTemplate[]> {
    const queryParams = new URLSearchParams();

    if (params?.isActive !== undefined) {
      queryParams.append("isActive", params.isActive.toString());
    }

    const queryString = queryParams.toString();
    const url = `/v1/templates/by-product/${productId}${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<DesignTemplate[]>(url);
  }

  /**
   * Create a new design template
   * POST /v1/templates
   */
  public async create(values: CreateTemplateDto): Promise<DesignTemplate> {
    return this.fetcher.request<DesignTemplate>("/v1/templates", {
      method: "POST",
      data: values,
    });
  }

  /**
   * Update design template information and settings
   * PATCH /v1/templates/{id}
   */
  public async update(
    templateId: string,
    values: UpdateTemplateDto
  ): Promise<DesignTemplate> {
    return this.fetcher.request<DesignTemplate>(`/v1/templates/${templateId}`, {
      method: "PATCH",
      data: values,
    });
  }

  /**
   * Delete design template (must not be used by any orders or designs)
   * DELETE /v1/templates/{id}
   */
  public async delete(templateId: string): Promise<void> {
    return this.fetcher.request<void>(`/v1/templates/${templateId}`, {
      method: "DELETE",
    });
  }

  /**
   * Create a copy of an existing template
   * POST /v1/templates/{templateId}/duplicate
   */
  public async duplicate(
    templateId: string,
    values: DuplicateTemplateDto
  ): Promise<DesignTemplate> {
    return this.fetcher.request<DesignTemplate>(
      `/v1/templates/${templateId}/duplicate`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  // Size Variant Methods

  /**
   * Get all size variants for a template
   * GET /v1/templates/{templateId}/variants
   */
  public async getSizeVariants(templateId: string): Promise<SizeVariant[]> {
    return this.fetcher.request<SizeVariant[]>(
      `/v1/templates/${templateId}/variants`
    );
  }

  /**
   * Create a new size variant for a template
   * POST /v1/templates/{templateId}/variants
   */
  public async createSizeVariant(
    templateId: string,
    values: CreateSizeVariantDto
  ): Promise<SizeVariant> {
    return this.fetcher.request<SizeVariant>(
      `/v1/templates/${templateId}/variants`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  /**
   * Update a template size variant
   * PATCH /v1/templates/{templateId}/variants/{variantId}
   */
  public async updateSizeVariant(
    templateId: string,
    variantId: string,
    values: UpdateSizeVariantDto
  ): Promise<SizeVariant> {
    return this.fetcher.request<SizeVariant>(
      `/v1/templates/${templateId}/variants/${variantId}`,
      {
        method: "PATCH",
        data: values,
      }
    );
  }

  /**
   * Delete a template size variant
   * DELETE /v1/templates/{templateId}/variants/{variantId}
   */
  public async deleteSizeVariant(
    templateId: string,
    variantId: string
  ): Promise<void> {
    return this.fetcher.request<void>(
      `/v1/templates/${templateId}/variants/${variantId}`,
      {
        method: "DELETE",
      }
    );
  }

  // Customization and Pricing Methods

  /**
   * Get available customization options for a template
   * GET /v1/templates/{templateId}/customizations/options
   */
  public async getCustomizationOptions(
    templateId: string
  ): Promise<CustomizationOption[]> {
    return this.fetcher.request<CustomizationOption[]>(
      `/v1/templates/${templateId}/customizations/options`
    );
  }

  /**
   * Calculate total price with customizations and quantity
   * POST /v1/templates/{templateId}/calculate-price
   */
  public async calculatePrice(
    templateId: string,
    values: CalculatePriceDto
  ): Promise<PriceCalculationResult> {
    return this.fetcher.request<PriceCalculationResult>(
      `/v1/templates/${templateId}/calculate-price`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  // Analytics Methods

  /**
   * Get performance analytics for templates
   * GET /v1/templates/analytics/performance
   */
  public async getAnalytics(
    params?: GetTemplateAnalyticsDto
  ): Promise<TemplatePerformanceAnalytics> {
    const queryParams = new URLSearchParams();

    if (params?.includeAnalytics !== undefined) {
      queryParams.append(
        "includeAnalytics",
        params.includeAnalytics.toString()
      );
    }
    if (params?.dateRange) {
      queryParams.append("dateRange", params.dateRange.toString());
    }

    const queryString = queryParams.toString();
    const url = `/v1/templates/analytics/performance${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<TemplatePerformanceAnalytics>(url);
  }
}
