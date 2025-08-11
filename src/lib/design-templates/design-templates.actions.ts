/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getErrorMessage } from "@/lib/get-error-message";
import { ActionResponse, PaginatedData2 } from "@/lib/shared/types";
import { DesignTemplatesService } from "./design-templates.service";
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
  GetTemplateAnalyticsDto,
} from "./dto/design-template.dto";
import {
  SizeVariantResponseDto,
  ColorPresetResponseDto,
  FontPresetResponseDto,
  MediaRestrictionResponseDto,
  PriceCalculationResponseDto,
  TemplateResponse,
} from "./types/design-template.types";

const templatesService = new DesignTemplatesService();

// Template CRUD Actions
export async function createTemplateAction(
  values: CreateTemplateDto
): Promise<ActionResponse<TemplateResponse>> {
  try {
    const res = await templatesService.createTemplate(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getTemplatesAction(
  params: GetTemplatesDto = {}
): Promise<ActionResponse<PaginatedData2<TemplateResponse>>> {
  try {
    const res = await templatesService.getTemplates(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getTemplatesByProductAction(
  productId: string,
  params?: GetTemplatesByProductDto
): Promise<ActionResponse<PaginatedData2<TemplateResponse>>> {
  try {
    const res = await templatesService.getTemplatesByProduct(productId, params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getTemplateAction(
  id: string
): Promise<ActionResponse<TemplateResponse>> {
  try {
    const res = await templatesService.getTemplateById(id);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getTemplateBySlugAction(
  slug: string
): Promise<ActionResponse<TemplateResponse>> {
  try {
    const res = await templatesService.getTemplateBySlug(slug);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateTemplateAction(
  id: string,
  values: UpdateTemplateDto
): Promise<ActionResponse<TemplateResponse>> {
  try {
    const res = await templatesService.updateTemplate(id, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteTemplateAction(
  id: string
): Promise<ActionResponse<void>> {
  try {
    await templatesService.deleteTemplate(id);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function duplicateTemplateAction(
  templateId: string,
  values: DuplicateTemplateDto
): Promise<ActionResponse<TemplateResponse>> {
  try {
    const res = await templatesService.duplicateTemplate(templateId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Size Variant Actions
export async function createSizeVariantAction(
  templateId: string,
  values: CreateSizeVariantDto
): Promise<ActionResponse<SizeVariantResponseDto>> {
  try {
    const res = await templatesService.createSizeVariant(templateId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getSizeVariantsAction(
  templateId: string
): Promise<ActionResponse<SizeVariantResponseDto[]>> {
  try {
    const res = await templatesService.getSizeVariants(templateId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateSizeVariantAction(
  templateId: string,
  variantId: string,
  values: UpdateSizeVariantDto
): Promise<ActionResponse<SizeVariantResponseDto>> {
  try {
    const res = await templatesService.updateSizeVariant(
      templateId,
      variantId,
      values
    );
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteSizeVariantAction(
  templateId: string,
  variantId: string
): Promise<ActionResponse<void>> {
  try {
    await templatesService.deleteSizeVariant(templateId, variantId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Color Preset Actions
export async function createColorPresetAction(
  templateId: string,
  values: CreateColorPresetDto
): Promise<ActionResponse<ColorPresetResponseDto>> {
  try {
    const res = await templatesService.createColorPreset(templateId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getColorPresetsAction(
  templateId: string
): Promise<ActionResponse<ColorPresetResponseDto[]>> {
  try {
    const res = await templatesService.getColorPresets(templateId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateColorPresetAction(
  templateId: string,
  presetId: string,
  values: UpdateColorPresetDto
): Promise<ActionResponse<ColorPresetResponseDto>> {
  try {
    const res = await templatesService.updateColorPreset(
      templateId,
      presetId,
      values
    );
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteColorPresetAction(
  templateId: string,
  presetId: string
): Promise<ActionResponse<void>> {
  try {
    await templatesService.deleteColorPreset(templateId, presetId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Font Preset Actions
export async function createFontPresetAction(
  templateId: string,
  values: CreateFontPresetDto
): Promise<ActionResponse<FontPresetResponseDto>> {
  try {
    const res = await templatesService.createFontPreset(templateId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getFontPresetsAction(
  templateId: string
): Promise<ActionResponse<FontPresetResponseDto[]>> {
  try {
    const res = await templatesService.getFontPresets(templateId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateFontPresetAction(
  templateId: string,
  presetId: string,
  values: UpdateFontPresetDto
): Promise<ActionResponse<FontPresetResponseDto>> {
  try {
    const res = await templatesService.updateFontPreset(
      templateId,
      presetId,
      values
    );
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteFontPresetAction(
  templateId: string,
  presetId: string
): Promise<ActionResponse<void>> {
  try {
    await templatesService.deleteFontPreset(templateId, presetId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Media Restriction Actions
export async function createMediaRestrictionAction(
  templateId: string,
  values: CreateMediaRestrictionDto
): Promise<ActionResponse<MediaRestrictionResponseDto>> {
  try {
    const res = await templatesService.createMediaRestriction(
      templateId,
      values
    );
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getMediaRestrictionsAction(
  templateId: string
): Promise<ActionResponse<MediaRestrictionResponseDto[]>> {
  try {
    const res = await templatesService.getMediaRestrictions(templateId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateMediaRestrictionAction(
  templateId: string,
  restrictionId: string,
  values: UpdateMediaRestrictionDto
): Promise<ActionResponse<MediaRestrictionResponseDto>> {
  try {
    const res = await templatesService.updateMediaRestriction(
      templateId,
      restrictionId,
      values
    );
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteMediaRestrictionAction(
  templateId: string,
  restrictionId: string
): Promise<ActionResponse<void>> {
  try {
    await templatesService.deleteMediaRestriction(templateId, restrictionId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Price Calculation Action
export async function calculatePriceAction(
  templateId: string,
  values: CalculatePriceDto
): Promise<ActionResponse<PriceCalculationResponseDto>> {
  try {
    const res = await templatesService.calculatePrice(templateId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Analytics Actions
export async function getTemplateAnalyticsAction(
  params?: GetTemplateAnalyticsDto
): Promise<ActionResponse<any>> {
  try {
    const res = await templatesService.getTemplateAnalytics(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Customization Options Action
export async function getCustomizationOptionsAction(
  templateId: string
): Promise<ActionResponse<any>> {
  try {
    const res = await templatesService.getCustomizationOptions(templateId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
