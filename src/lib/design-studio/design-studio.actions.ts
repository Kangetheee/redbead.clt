/* eslint-disable @typescript-eslint/no-explicit-any */

"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse } from "../shared/types";
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
import { DesignStudioService } from "./design-studio.service";

const designStudioService = new DesignStudioService();

// Canvas Actions
export async function createCanvasAction(
  values: CreateCanvasDto
): Promise<ActionResponse<CanvasResponse>> {
  try {
    const res = await designStudioService.createCanvas(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function saveCanvasAction(
  values: SaveCanvasDto
): Promise<ActionResponse<SaveCanvasResponse>> {
  try {
    const res = await designStudioService.saveCanvas(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getCanvasConfigAction(
  productId: string,
  sizePresetId?: string
): Promise<ActionResponse<CanvasConfig>> {
  try {
    const res = await designStudioService.getCanvasConfig(
      productId,
      sizePresetId
    );
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Design Actions
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

export async function saveDesignAction(
  designId: string,
  values: SaveDesignDto
): Promise<ActionResponse<DesignResponse>> {
  try {
    const res = await designStudioService.saveDesign(designId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function createDesignVersionAction(
  designId: string,
  values: VersionDesignDto
): Promise<ActionResponse<DesignResponse>> {
  try {
    const res = await designStudioService.createDesignVersion(designId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getDesignVersionsAction(
  designId: string
): Promise<ActionResponse<DesignResponse[]>> {
  try {
    const res = await designStudioService.getDesignVersions(designId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Asset Actions
export async function uploadDesignAssetAction(
  designId: string,
  file: File,
  assetData: UploadDesignAssetDto
): Promise<ActionResponse<UploadDesignAssetResponse>> {
  try {
    const res = await designStudioService.uploadDesignAsset(
      designId,
      file,
      assetData
    );
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getDesignAssetsAction(
  designId: string
): Promise<ActionResponse<UploadDesignAssetResponse[]>> {
  try {
    const res = await designStudioService.getDesignAssets(designId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function removeDesignAssetAction(
  designId: string,
  assetId: string
): Promise<ActionResponse<void>> {
  try {
    await designStudioService.removeDesignAsset(designId, assetId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Export Actions
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

// Presets and Resources Actions
export async function getDesignPresetsAction(
  productId: string,
  params?: GetPresetsDto
): Promise<ActionResponse<DesignPresetsResponse>> {
  try {
    const res = await designStudioService.getDesignPresets(productId, params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

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

// Template Actions
export async function getDesignTemplatesAction(params?: {
  featured?: boolean;
  categoryId?: string;
  productId?: string;
}): Promise<ActionResponse<any[]>> {
  try {
    const res = await designStudioService.getDesignTemplates(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getTemplateCustomizationAction(
  templateId: string,
  params: {
    templateId: string;
    customizations?: object;
    productVariant?: string;
  }
): Promise<ActionResponse<CustomizeTemplateResponse>> {
  try {
    const res = await designStudioService.getTemplateCustomization(
      templateId,
      params
    );
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function useDesignTemplateAction(
  templateId: string
): Promise<ActionResponse<DesignResponse>> {
  try {
    const res = await designStudioService.useDesignTemplate(templateId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Font Actions
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

// User Asset Actions
export async function uploadAssetAction(
  file: File,
  assetData: UploadAssetDto
): Promise<ActionResponse<UploadAssetResponse>> {
  try {
    const res = await designStudioService.uploadAsset(file, assetData);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getUserAssetsAction(params?: {
  type?: string;
  folderId?: string;
}): Promise<ActionResponse<UploadAssetResponse[]>> {
  try {
    const res = await designStudioService.getUserAssets(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
