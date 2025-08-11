"use server";

import { getErrorMessage } from "@/lib/get-error-message";
import { ActionResponse } from "@/lib/shared/types";
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
import { DesignStudioService } from "./design-studio.service";

const designStudioService = new DesignStudioService();

/**
 * Configure design canvas
 * Uses POST /v1/design-studio/configure
 */
export async function configureCanvasAction(
  values: ConfigureCanvasDto
): Promise<ActionResponse<CanvasConfigResponse>> {
  try {
    const res = await designStudioService.configureCanvas(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Upload artwork file
 * Uses POST /v1/design-studio/upload-artwork
 */
export async function uploadArtworkAction(
  file: File,
  values: UploadArtworkDto
): Promise<ActionResponse<ArtworkUploadResponse>> {
  try {
    const res = await designStudioService.uploadArtwork(file, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Create new design
 * Uses POST /v1/design-studio/designs
 */
export async function createDesignAction(
  values: CreateDesignDto
): Promise<ActionResponse<DesignResponse>> {
  try {
    const res = await designStudioService.createDesign(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get user designs
 * Uses GET /v1/design-studio/designs
 */
export async function getUserDesignsAction(
  params?: GetDesignsDto
): Promise<ActionResponse<DesignListResponse>> {
  try {
    const res = await designStudioService.getUserDesigns(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get design details
 * Uses GET /v1/design-studio/designs/{id}
 */
export async function getDesignAction(
  designId: string
): Promise<ActionResponse<DesignResponse>> {
  try {
    const res = await designStudioService.getDesign(designId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Update design
 * Uses PATCH /v1/design-studio/designs/{id}
 */
export async function updateDesignAction(
  designId: string,
  values: UpdateDesignDto
): Promise<ActionResponse<DesignResponse>> {
  try {
    const res = await designStudioService.updateDesign(designId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Delete design
 * Uses DELETE /v1/design-studio/designs/{id}
 */
export async function deleteDesignAction(
  designId: string
): Promise<ActionResponse<void>> {
  try {
    await designStudioService.deleteDesign(designId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get template presets
 * Uses GET /v1/design-studio/templates/{templateId}/presets
 */
export async function getTemplatePresetsAction(
  templateId: string
): Promise<ActionResponse<TemplatePresetsResponse>> {
  try {
    const res = await designStudioService.getTemplatePresets(templateId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Export design
 * Uses POST /v1/design-studio/designs/{id}/export
 */
export async function exportDesignAction(
  designId: string,
  values: ExportDesignDto
): Promise<ActionResponse<ExportDesignResponse>> {
  try {
    const res = await designStudioService.exportDesign(designId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Validate design
 * Uses POST /v1/design-studio/designs/{id}/validate
 */
export async function validateDesignAction(
  designId: string,
  values: DesignValidationDto
): Promise<ActionResponse<DesignValidationResponse>> {
  try {
    const res = await designStudioService.validateDesign(designId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Share design
 * Uses POST /v1/design-studio/designs/{id}/share
 */
export async function shareDesignAction(
  designId: string,
  values: ShareDesignDto
): Promise<ActionResponse<ShareDesignResponse>> {
  try {
    const res = await designStudioService.shareDesign(designId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * View shared design
 * Uses GET /v1/design-studio/shared/{token}
 */
export async function getSharedDesignAction(
  token: string
): Promise<ActionResponse<DesignResponse>> {
  try {
    const res = await designStudioService.getSharedDesign(token);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get available fonts
 * Uses GET /v1/design-studio/fonts
 */
export async function getFontsAction(
  params?: GetFontsDto
): Promise<ActionResponse<Font[]>> {
  try {
    const res = await designStudioService.getFonts(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Upload asset
 * Uses POST /v1/design-studio/assets
 */
export async function uploadAssetAction(
  file: File,
  assetData: UploadAssetDto
): Promise<ActionResponse<AssetResponse>> {
  try {
    const res = await designStudioService.uploadAsset(file, assetData);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get user assets
 * Uses GET /v1/design-studio/assets
 */
export async function getUserAssetsAction(
  params?: GetUserAssetsDto
): Promise<ActionResponse<AssetResponse[]>> {
  try {
    const res = await designStudioService.getUserAssets(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
