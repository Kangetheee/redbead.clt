import { Fetcher } from "../api/api.service";
import {
  ConfigureCanvasDto,
  UploadArtworkDto,
  CreateDesignDto,
  UpdateDesignDto,
  ExportDesignDto,
  DesignValidationDto,
  ShareDesignDto,
  UploadAssetDto,
  GetDesignsDto,
  GetFontsDto,
  GetUserAssetsDto,
} from "./dto/design-studio.dto";
import {
  CanvasConfigResponse,
  ArtworkUploadResponse,
  DesignResponse,
  DesignListResponse,
  TemplatePresetsResponse,
  ExportDesignResponse,
  DesignValidationResponse,
  ShareDesignResponse,
  Font,
  AssetResponse,
} from "./types/design-studio.types";

export class DesignStudioService {
  constructor(private fetcher = new Fetcher()) {}

  /**
   * Configure design canvas
   * Uses POST /v1/design-studio/configure
   */
  async configureCanvas(
    values: ConfigureCanvasDto
  ): Promise<CanvasConfigResponse> {
    return this.fetcher.request<CanvasConfigResponse>(
      "/v1/design-studio/configure",
      {
        method: "POST",
        data: values,
      }
    );
  }

  /**
   * Upload artwork file
   * Uses POST /v1/design-studio/upload-artwork
   */
  async uploadArtwork(
    file: File,
    values: UploadArtworkDto
  ): Promise<ArtworkUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("canvasId", values.canvasId);
    if (values.position) {
      formData.append("position", values.position);
    }

    return this.fetcher.request<ArtworkUploadResponse>(
      "/v1/design-studio/upload-artwork",
      {
        method: "POST",
        data: formData,
      }
    );
  }

  /**
   * Create new design
   * Uses POST /v1/design-studio/designs
   */
  async createDesign(values: CreateDesignDto): Promise<DesignResponse> {
    return this.fetcher.request<DesignResponse>(
      "/v1/design-studio/designs",
      {
        method: "POST",
        data: values,
      },
      { auth: false }
    );
  }

  /**
   * Get user designs with filtering
   * Uses GET /v1/design-studio/designs
   */
  async getUserDesigns(params?: GetDesignsDto): Promise<DesignListResponse> {
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
    if (params?.templateId) {
      queryParams.append("templateId", params.templateId);
    }

    const url = `/v1/design-studio/designs${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    return this.fetcher.request<DesignListResponse>(url, {
      method: "GET",
    });
  }

  /**
   * Get design details
   * Uses GET /v1/design-studio/designs/{id}
   */
  async getDesign(designId: string): Promise<DesignResponse> {
    return this.fetcher.request<DesignResponse>(
      `/v1/design-studio/designs/${designId}`,
      { method: "GET" },
      { auth: false }
    );
  }

  /**
   * Update design
   * Uses PATCH /v1/design-studio/designs/{id}
   */
  async updateDesign(
    designId: string,
    values: UpdateDesignDto
  ): Promise<DesignResponse> {
    return this.fetcher.request<DesignResponse>(
      `/v1/design-studio/designs/${designId}`,
      {
        method: "PATCH",
        data: values,
      },
      { auth: false }
    );
  }

  /**
   * Delete design
   * Uses DELETE /v1/design-studio/designs/{id}
   */
  async deleteDesign(designId: string): Promise<void> {
    return this.fetcher.request<void>(`/v1/design-studio/designs/${designId}`, {
      method: "DELETE",
    });
  }

  /**
   * Get template presets
   * Uses GET /v1/design-studio/templates/{templateId}/presets
   */
  async getTemplatePresets(
    templateId: string
  ): Promise<TemplatePresetsResponse> {
    return this.fetcher.request<TemplatePresetsResponse>(
      `/v1/design-studio/templates/${templateId}/presets`,
      { method: "GET" },
      { auth: false }
    );
  }

  /**
   * Export design
   * Uses POST /v1/design-studio/designs/{id}/export
   */
  async exportDesign(
    designId: string,
    values: ExportDesignDto
  ): Promise<ExportDesignResponse> {
    return this.fetcher.request<ExportDesignResponse>(
      `/v1/design-studio/designs/${designId}/export`,
      {
        method: "POST",
        data: values,
      },
      { auth: false }
    );
  }

  /**
   * Validate design
   * Uses POST /v1/design-studio/designs/{id}/validate
   */
  async validateDesign(
    designId: string,
    values: DesignValidationDto
  ): Promise<DesignValidationResponse> {
    return this.fetcher.request<DesignValidationResponse>(
      `/v1/design-studio/designs/${designId}/validate`,
      {
        method: "POST",
        data: values,
      },
      { auth: false }
    );
  }

  /**
   * Share design
   * Uses POST /v1/design-studio/designs/{id}/share
   */
  async shareDesign(
    designId: string,
    values: ShareDesignDto
  ): Promise<ShareDesignResponse> {
    return this.fetcher.request<ShareDesignResponse>(
      `/v1/design-studio/designs/${designId}/share`,
      {
        method: "POST",
        data: values,
      },
      { auth: false }
    );
  }

  /**
   * View shared design
   * Uses GET /v1/design-studio/shared/{token}
   */
  async getSharedDesign(token: string): Promise<DesignResponse> {
    return this.fetcher.request<DesignResponse>(
      `/v1/design-studio/shared/${token}`,
      { method: "GET" },
      { auth: false }
    );
  }

  /**
   * Get available fonts
   * Uses GET /v1/design-studio/fonts
   */
  async getFonts(params?: GetFontsDto): Promise<Font[]> {
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

    const url = `/v1/design-studio/fonts${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    return this.fetcher.request<Font[]>(
      url,
      {
        method: "GET",
      },
      { auth: false }
    );
  }

  /**
   * Upload asset
   * Uses POST /v1/design-studio/assets
   */
  async uploadAsset(
    file: File,
    assetData: UploadAssetDto
  ): Promise<AssetResponse> {
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

    return this.fetcher.request<AssetResponse>(
      "/v1/design-studio/assets",
      {
        method: "POST",
        data: formData,
      },
      { auth: false }
    );
  }

  /**
   * Get user assets
   * Uses GET /v1/design-studio/assets
   */
  async getUserAssets(params?: GetUserAssetsDto): Promise<AssetResponse[]> {
    const queryParams = new URLSearchParams();

    if (params?.type) {
      queryParams.append("type", params.type);
    }
    if (params?.folderId) {
      queryParams.append("folderId", params.folderId);
    }

    const url = `/v1/design-studio/assets${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    return this.fetcher.request<AssetResponse[]>(
      url,
      {
        method: "GET",
      },
      { auth: false }
    );
  }
}
