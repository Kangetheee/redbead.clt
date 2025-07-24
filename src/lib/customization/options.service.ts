import { Fetcher } from "../api/api.service";
import { PaginatedData } from "../shared/types";
import {
  CreateCustomizationOptionDto,
  UpdateCustomizationOptionDto,
  GetCustomizationOptionsDto,
  AssignOptionToTemplateDto,
  CreateCustomizationValueDto,
  UpdateCustomizationValueDto,
  GetCustomizationValuesDto,
  CalculatePriceAdjustmentDto,
  ValidateCustomizationsDto,
  GetCustomizationValueStatsDto,
} from "@/lib/customization/dto/options.dto";
import {
  CustomizationOption,
  CustomizationOptionDetail,
  CustomizationValue,
  CustomizationValueStats,
  PriceAdjustmentResult,
  CustomizationValidationResult,
} from "@/lib/customization/types/options.types";

export class CustomizationOptionsService {
  constructor(private fetcher = new Fetcher()) {}

  // ===== Customization Options =====

  public async findAllOptions(params?: GetCustomizationOptionsDto) {
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
    if (params?.type) {
      queryParams.append("type", params.type);
    }

    const queryString = queryParams.toString();
    const url = `/v1/customization-options${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<PaginatedData<CustomizationOption>>(url);
  }

  public async findOptionById(optionId: string) {
    return this.fetcher.request<CustomizationOptionDetail>(
      `/v1/customization-options/${optionId}`
    );
  }

  public async createOption(values: CreateCustomizationOptionDto) {
    return this.fetcher.request<CustomizationOptionDetail>(
      "/v1/customization-options",
      {
        method: "POST",
        data: values,
      }
    );
  }

  public async updateOption(
    optionId: string,
    values: UpdateCustomizationOptionDto
  ) {
    return this.fetcher.request<CustomizationOptionDetail>(
      `/v1/customization-options/${optionId}`,
      {
        method: "PATCH",
        data: values,
      }
    );
  }

  public async deleteOption(optionId: string) {
    return this.fetcher.request<void>(`/v1/customization-options/${optionId}`, {
      method: "DELETE",
    });
  }

  public async assignOptionToTemplate(
    optionId: string,
    values: AssignOptionToTemplateDto
  ) {
    return this.fetcher.request<void>(
      `/v1/customization-options/${optionId}/assign-to-template`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  public async removeOptionFromTemplate(optionId: string, templateId: string) {
    return this.fetcher.request<void>(
      `/v1/customization-options/${optionId}/remove-from-template/${templateId}`,
      {
        method: "DELETE",
      }
    );
  }

  // ===== Customization Values =====

  public async findAllValues(params?: GetCustomizationValuesDto) {
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
    if (params?.optionId) {
      queryParams.append("optionId", params.optionId);
    }
    if (params?.isActive !== undefined) {
      queryParams.append("isActive", params.isActive.toString());
    }

    const queryString = queryParams.toString();
    const url = `/v1/customization-values${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<PaginatedData<CustomizationValue>>(url);
  }

  public async findValueById(valueId: string) {
    return this.fetcher.request<CustomizationValue>(
      `/v1/customization-values/${valueId}`
    );
  }

  public async findValuesByOption(optionId: string) {
    return this.fetcher.request<CustomizationValue[]>(
      `/v1/customization-values/by-option/${optionId}`
    );
  }

  public async findValuesByTemplate(templateId: string) {
    return this.fetcher.request<CustomizationValue[]>(
      `/v1/customization-values/by-template/${templateId}`
    );
  }

  public async getValueStats(params?: GetCustomizationValueStatsDto) {
    const queryParams = new URLSearchParams();

    if (params?.optionId) {
      queryParams.append("optionId", params.optionId);
    }

    const queryString = queryParams.toString();
    const url = `/v1/customization-values/stats${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<CustomizationValueStats>(url);
  }

  public async calculatePriceAdjustment(values: CalculatePriceAdjustmentDto) {
    return this.fetcher.request<PriceAdjustmentResult>(
      "/v1/customization-values/calculate-price-adjustment",
      {
        method: "POST",
        data: values,
      }
    );
  }

  public async validateCustomizations(
    templateId: string,
    values: ValidateCustomizationsDto
  ) {
    return this.fetcher.request<CustomizationValidationResult>(
      `/v1/customization-values/validate-customizations/${templateId}`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  public async createValue(values: CreateCustomizationValueDto) {
    return this.fetcher.request<CustomizationValue>(
      "/v1/customization-values",
      {
        method: "POST",
        data: values,
      }
    );
  }

  public async updateValue(
    valueId: string,
    values: UpdateCustomizationValueDto
  ) {
    return this.fetcher.request<CustomizationValue>(
      `/v1/customization-values/${valueId}`,
      {
        method: "PATCH",
        data: values,
      }
    );
  }

  public async deleteValue(valueId: string) {
    return this.fetcher.request<void>(`/v1/customization-values/${valueId}`, {
      method: "DELETE",
    });
  }

  public async restoreValue(valueId: string) {
    return this.fetcher.request<CustomizationValue>(
      `/v1/customization-values/${valueId}/restore`,
      {
        method: "PATCH",
      }
    );
  }
}
