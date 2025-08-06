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
   * POST /v1/design-studio/configure
   */
  public async configureCanvas(
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
   * POST /v1/design-studio/upload-artwork
   */
  public async uploadArtwork(
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
      },
      { auth: false }
    );
  }

  /**
   * Create new design
   * POST /v1/design-studio/designs
   */
  public async createDesign(values: CreateDesignDto): Promise<DesignResponse> {
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
   * Get user designs
   * GET /v1/design-studio/designs
   */
  public async getUserDesigns(
    params?: GetDesignsDto
  ): Promise<DesignListResponse> {
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

    const queryString = queryParams.toString();
    const url = `/v1/design-studio/designs${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<DesignListResponse>(url, {}, { auth: false });
  }

  /**
   * Get design details
   * GET /v1/design-studio/designs/{id}
   */
  public async getDesign(designId: string): Promise<DesignResponse> {
    return this.fetcher.request<DesignResponse>(
      `/v1/design-studio/designs/${designId}`,
      {},
      { auth: false }
    );
  }

  /**
   * Update design
   * PATCH /v1/design-studio/designs/{id}
   */
  public async updateDesign(
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
   * DELETE /v1/design-studio/designs/{id}
   */
  public async deleteDesign(designId: string): Promise<void> {
    return this.fetcher.request<void>(
      `/v1/design-studio/designs/${designId}`,
      {
        method: "DELETE",
      },
      { auth: false }
    );
  }

  /**
   * Get template presets
   * GET /v1/design-studio/templates/{templateId}/presets
   */
  public async getTemplatePresets(
    templateId: string
  ): Promise<TemplatePresetsResponse> {
    return this.fetcher.request<TemplatePresetsResponse>(
      `/v1/design-studio/templates/${templateId}/presets`,
      {},
      { auth: false }
    );
  }

  /**
   * Export design
   * POST /v1/design-studio/designs/{id}/export
   */
  public async exportDesign(
    designId: string,
    values: ExportDesignDto
  ): Promise<ExportDesignResponse> {
    return this.fetcher.request<ExportDesignResponse>(
      `/v1/design-studio/designs/${designId}/export`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  /**
   * Validate design
   * POST /v1/design-studio/designs/{id}/validate
   */
  public async validateDesign(
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
   * POST /v1/design-studio/designs/{id}/share
   */
  public async shareDesign(
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
   * GET /v1/design-studio/shared/{token}
   */
  public async getSharedDesign(token: string): Promise<DesignResponse> {
    return this.fetcher.request<DesignResponse>(
      `/v1/design-studio/shared/${token}`,
      {},
      { auth: false }
    );
  }

  /**
   * Get available fonts
   * GET /v1/design-studio/fonts
   */
  public async getFonts(params?: GetFontsDto): Promise<Font[]> {
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

    return this.fetcher.request<Font[]>(url, {}, { auth: false });
  }

  /**
   * Upload asset
   * POST /v1/design-studio/assets
   */
  public async uploadAsset(
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
   * GET /v1/design-studio/assets
   */
  public async getUserAssets(
    params?: GetUserAssetsDto
  ): Promise<AssetResponse[]> {
    const queryParams = new URLSearchParams();

    if (params?.type) {
      queryParams.append("type", params.type);
    }
    if (params?.folderId) {
      queryParams.append("folderId", params.folderId);
    }

    const queryString = queryParams.toString();
    const url = `/v1/design-studio/assets${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<AssetResponse[]>(url, {}, { auth: false });
  }
}
