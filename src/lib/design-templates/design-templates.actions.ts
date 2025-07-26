"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse, PaginatedData } from "../shared/types";
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
  SizeVariant,
  CustomizationOption,
  PriceCalculationResult,
  TemplatePerformanceAnalytics,
} from "./types/design-template.types";
import { DesignTemplatesService } from "./design-templates.service";

const designTemplatesService = new DesignTemplatesService();

// Template CRUD actions

/**
 * Get paginated list of design templates with optional filtering
 * GET /v1/templates
 */
export async function getTemplatesAction(
  params?: GetTemplatesDto
): Promise<ActionResponse<PaginatedData<DesignTemplate>>> {
  try {
    const res = await designTemplatesService.findAll(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get design template by ID
 * GET /v1/templates/{id}
 */
export async function getTemplateAction(
  templateId: string
): Promise<ActionResponse<DesignTemplate>> {
  try {
    const res = await designTemplatesService.findById(templateId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get design template by slug
 * GET /v1/templates/slug/{slug}
 */
export async function getTemplateBySlugAction(
  slug: string
): Promise<ActionResponse<DesignTemplate>> {
  try {
    const res = await designTemplatesService.findBySlug(slug);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get all available templates for a specific product type
 * GET /v1/templates/by-product/{productId}
 */
export async function getTemplatesByProductAction(
  productId: string,
  params?: GetTemplatesByProductDto
): Promise<ActionResponse<DesignTemplate[]>> {
  try {
    const res = await designTemplatesService.findByProduct(productId, params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Create a new design template
 * POST /v1/templates
 */
export async function createTemplateAction(
  values: CreateTemplateDto
): Promise<ActionResponse<DesignTemplate>> {
  try {
    const res = await designTemplatesService.create(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Update design template information and settings
 * PATCH /v1/templates/{id}
 */
export async function updateTemplateAction(
  templateId: string,
  values: UpdateTemplateDto
): Promise<ActionResponse<DesignTemplate>> {
  try {
    const res = await designTemplatesService.update(templateId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Delete design template (must not be used by any orders or designs)
 * DELETE /v1/templates/{id}
 */
export async function deleteTemplateAction(
  templateId: string
): Promise<ActionResponse<void>> {
  try {
    await designTemplatesService.delete(templateId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Create a copy of an existing template
 * POST /v1/templates/{templateId}/duplicate
 */
export async function duplicateTemplateAction(
  templateId: string,
  values: DuplicateTemplateDto
): Promise<ActionResponse<DesignTemplate>> {
  try {
    const res = await designTemplatesService.duplicate(templateId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Size Variant actions

/**
 * Get all size variants for a template
 * GET /v1/templates/{templateId}/variants
 */
export async function getSizeVariantsAction(
  templateId: string
): Promise<ActionResponse<SizeVariant[]>> {
  try {
    const res = await designTemplatesService.getSizeVariants(templateId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Create a new size variant for a template
 * POST /v1/templates/{templateId}/variants
 */
export async function createSizeVariantAction(
  templateId: string,
  values: CreateSizeVariantDto
): Promise<ActionResponse<SizeVariant>> {
  try {
    const res = await designTemplatesService.createSizeVariant(
      templateId,
      values
    );
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Update a template size variant
 * PATCH /v1/templates/{templateId}/variants/{variantId}
 */
export async function updateSizeVariantAction(
  templateId: string,
  variantId: string,
  values: UpdateSizeVariantDto
): Promise<ActionResponse<SizeVariant>> {
  try {
    const res = await designTemplatesService.updateSizeVariant(
      templateId,
      variantId,
      values
    );
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Delete a template size variant
 * DELETE /v1/templates/{templateId}/variants/{variantId}
 */
export async function deleteSizeVariantAction(
  templateId: string,
  variantId: string
): Promise<ActionResponse<void>> {
  try {
    await designTemplatesService.deleteSizeVariant(templateId, variantId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Customization and Pricing actions

/**
 * Get available customization options for a template
 * GET /v1/templates/{templateId}/customizations/options
 */
export async function getCustomizationOptionsAction(
  templateId: string
): Promise<ActionResponse<CustomizationOption[]>> {
  try {
    const res =
      await designTemplatesService.getCustomizationOptions(templateId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Calculate total price with customizations and quantity
 * POST /v1/templates/{templateId}/calculate-price
 */
export async function calculatePriceAction(
  templateId: string,
  values: CalculatePriceDto
): Promise<ActionResponse<PriceCalculationResult>> {
  try {
    const res = await designTemplatesService.calculatePrice(templateId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Analytics actions

/**
 * Get performance analytics for templates
 * GET /v1/templates/analytics/performance
 */
export async function getTemplateAnalyticsAction(
  params?: GetTemplateAnalyticsDto
): Promise<ActionResponse<TemplatePerformanceAnalytics>> {
  try {
    const res = await designTemplatesService.getAnalytics(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
