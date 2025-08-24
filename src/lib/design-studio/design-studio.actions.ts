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
  GuestExportDesignDto,
  CreateOrderDto,
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
  SharedDesignResponse,
  Font,
  AssetResponse,
  OrderResponse,
} from "./types/design-studio.types";
import { DesignStudioService } from "./design-studio.service";

const designStudioService = new DesignStudioService();

export async function exportGuestDesignAction(
  values: GuestExportDesignDto
): Promise<ActionResponse<ExportDesignResponse>> {
  try {
    const res = await designStudioService.exportGuestDesign(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

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

export async function getSharedDesignAction(
  token: string
): Promise<ActionResponse<SharedDesignResponse>> {
  try {
    const res = await designStudioService.getSharedDesign(token);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

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

export async function createOrderFromDesignAction(
  designId: string,
  values: CreateOrderDto
): Promise<ActionResponse<OrderResponse>> {
  try {
    const res = await designStudioService.createOrderFromDesign(
      designId,
      values
    );
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

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
