/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fetcher } from "../api/api.service";
import {
  CreateCanvasDto,
  SaveCanvasDto,
  CreateDesignDto,
  UpdateDesignDto,
  SaveDesignDto,
  VersionDesignDto,
  UploadDesignAssetDto,
  ExportDesignDto,
  DesignValidationDto,
  ShareDesignDto,
  UploadAssetDto,
  GetDesignsDto,
  GetPresetsDto,
  GetFontsDto,
} from "./dto/design-studio.dto";
import {
  CanvasResponse,
  SaveCanvasResponse,
  CanvasConfig,
  DesignResponse,
  DesignListResponse,
  UploadDesignAssetResponse,
  ExportDesignResponse,
  DesignPresetsResponse,
  DesignValidationResponse,
  ShareDesignResponse,
  CustomizeTemplateResponse,
  Font,
  UploadAssetResponse,
} from "./types/design-studio.types";

export class DesignStudioService {
  constructor(private fetcher = new Fetcher()) {}

  // Canvas operations
  public async createCanvas(values: CreateCanvasDto) {
    return this.fetcher.request<CanvasResponse>("/v1/design-studio/canvas", {
      method: "POST",
      data: values,
    });
  }

  public async saveCanvas(values: SaveCanvasDto) {
    return this.fetcher.request<SaveCanvasResponse>(
      "/v1/design-studio/canvas/save",
      {
        method: "POST",
        data: values,
      }
    );
  }

  public async getCanvasConfig(productId: string, sizePresetId?: string) {
    const queryParams = new URLSearchParams();
    if (sizePresetId) {
      queryParams.append("sizePresetId", sizePresetId);
    }

    const queryString = queryParams.toString();
    const url = `/v1/design-studio/canvas/config/${productId}${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<CanvasConfig>(url);
  }

  // Design operations
  public async createDesign(values: CreateDesignDto) {
    return this.fetcher.request<DesignResponse>("/v1/design-studio/designs", {
      method: "POST",
      data: values,
    });
  }

  public async getUserDesigns(params?: GetDesignsDto) {
    const queryParams = new URLSearchParams();

    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.isTemplate !== undefined) {
      queryParams.append("isTemplate", params.isTemplate.toString());
    }
    if (params?.status) {
      queryParams.append("status", params.status);
    }
    if (params?.productId) {
      queryParams.append("productId", params.productId);
    }

    const queryString = queryParams.toString();
    const url = `/v1/design-studio/designs${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<DesignListResponse>(url);
  }

  public async getDesign(designId: string) {
    return this.fetcher.request<DesignResponse>(
      `/v1/design-studio/designs/${designId}`
    );
  }

  public async updateDesign(designId: string, values: UpdateDesignDto) {
    return this.fetcher.request<DesignResponse>(
      `/v1/design-studio/designs/${designId}`,
      {
        method: "PUT",
        data: values,
      }
    );
  }

  public async deleteDesign(designId: string) {
    return this.fetcher.request<void>(`/v1/design-studio/designs/${designId}`, {
      method: "DELETE",
    });
  }

  public async saveDesign(designId: string, values: SaveDesignDto) {
    return this.fetcher.request<DesignResponse>(
      `/v1/design-studio/designs/${designId}/save`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  public async createDesignVersion(designId: string, values: VersionDesignDto) {
    return this.fetcher.request<DesignResponse>(
      `/v1/design-studio/designs/${designId}/version`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  public async getDesignVersions(designId: string) {
    return this.fetcher.request<DesignResponse[]>(
      `/v1/design-studio/designs/${designId}/versions`
    );
  }

  // Asset operations
  public async uploadDesignAsset(
    designId: string,
    file: File,
    assetData: UploadDesignAssetDto
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("assetType", assetData.assetType);
    if (assetData.position) {
      formData.append("position", JSON.stringify(assetData.position));
    }
    if (assetData.metadata) {
      formData.append("metadata", JSON.stringify(assetData.metadata));
    }

    return this.fetcher.request<UploadDesignAssetResponse>(
      `/v1/design-studio/designs/${designId}/assets`,
      {
        method: "POST",
        data: formData,
      }
    );
  }

  public async getDesignAssets(designId: string) {
    return this.fetcher.request<UploadDesignAssetResponse[]>(
      `/v1/design-studio/designs/${designId}/assets`
    );
  }

  public async removeDesignAsset(designId: string, assetId: string) {
    return this.fetcher.request<void>(
      `/v1/design-studio/designs/${designId}/assets/${assetId}`,
      {
        method: "DELETE",
      }
    );
  }

  // Export operations
  public async exportDesign(designId: string, values: ExportDesignDto) {
    return this.fetcher.request<ExportDesignResponse>(
      `/v1/design-studio/designs/${designId}/export`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  // Presets and resources
  public async getDesignPresets(productId: string, params?: GetPresetsDto) {
    const queryParams = new URLSearchParams();

    if (params?.type) {
      queryParams.append("type", params.type);
    }
    if (params?.category) {
      queryParams.append("category", params.category);
    }
    if (params?.includePremium !== undefined) {
      queryParams.append("includePremium", params.includePremium.toString());
    }

    const queryString = queryParams.toString();
    const url = `/v1/design-studio/presets/${productId}${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<DesignPresetsResponse>(url);
  }

  public async validateDesign(designId: string, values: DesignValidationDto) {
    return this.fetcher.request<DesignValidationResponse>(
      `/v1/design-studio/designs/${designId}/validate`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  public async shareDesign(designId: string, values: ShareDesignDto) {
    return this.fetcher.request<ShareDesignResponse>(
      `/v1/design-studio/designs/${designId}/share`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  public async getSharedDesign(token: string) {
    return this.fetcher.request<DesignResponse>(
      `/v1/design-studio/shared/${token}`
    );
  }

  // Templates
  public async getDesignTemplates(params?: {
    featured?: boolean;
    categoryId?: string;
    productId?: string;
  }) {
    const queryParams = new URLSearchParams();

    if (params?.featured !== undefined) {
      queryParams.append("featured", params.featured.toString());
    }
    if (params?.categoryId) {
      queryParams.append("categoryId", params.categoryId);
    }
    if (params?.productId) {
      queryParams.append("productId", params.productId);
    }

    const queryString = queryParams.toString();
    const url = `/v1/design-studio/templates${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<any[]>(url);
  }

  public async getTemplateCustomization(
    templateId: string,
    params: {
      templateId: string;
      customizations?: object;
      productVariant?: string;
    }
  ) {
    const queryParams = new URLSearchParams();
    queryParams.append("templateId", params.templateId);

    if (params.customizations) {
      queryParams.append(
        "customizations",
        JSON.stringify(params.customizations)
      );
    }
    if (params.productVariant) {
      queryParams.append("productVariant", params.productVariant);
    }

    const queryString = queryParams.toString();
    const url = `/v1/design-studio/templates/${templateId}?${queryString}`;

    return this.fetcher.request<CustomizeTemplateResponse>(url);
  }

  public async useDesignTemplate(templateId: string) {
    return this.fetcher.request<DesignResponse>(
      `/v1/design-studio/templates/${templateId}/use`,
      {
        method: "POST",
        data: {},
      }
    );
  }

  // Fonts
  public async getFonts(params?: GetFontsDto) {
    const queryParams = new URLSearchParams();

    if (params?.category) {
      queryParams.append("category", params.category);
    }
    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.premium !== undefined) {
      queryParams.append("premium", params.premium.toString());
    }

    const queryString = queryParams.toString();
    const url = `/v1/design-studio/fonts${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<Font[]>(url);
  }

  // User assets
  public async uploadAsset(file: File, assetData: UploadAssetDto) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", assetData.name);
    formData.append("type", assetData.type);
    if (assetData.description) {
      formData.append("description", assetData.description);
    }
    if (assetData.folderId) {
      formData.append("folderId", assetData.folderId);
    }
    if (assetData.tags) {
      formData.append("tags", JSON.stringify(assetData.tags));
    }

    return this.fetcher.request<UploadAssetResponse>(
      "/v1/design-studio/assets",
      {
        method: "POST",
        data: formData,
      }
    );
  }

  public async getUserAssets(params?: { type?: string; folderId?: string }) {
    const queryParams = new URLSearchParams();

    if (params?.type) {
      queryParams.append("type", params.type);
    }
    if (params?.folderId) {
      queryParams.append("folderId", params.folderId);
    }

    const queryString = queryParams.toString();
    const url = `/v1/design-studio/assets${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<UploadAssetResponse[]>(url);
  }
}
