"use server";

import { getErrorMessage } from "@/lib/get-error-message";
import { ActionResponse } from "@/lib/shared/types";
import { DesignTemplatesService } from "./design-templates.service";
import {
  CreateDesignTemplateDto,
  UpdateDesignTemplateDto,
  GetDesignTemplatesDto,
  GetFeaturedTemplatesDto,
  DesignTemplateResponseDto,
  PaginatedDesignTemplatesResponseDto,
} from "./dto/design-templates.dto";

const templatesService = new DesignTemplatesService();

export async function createDesignTemplateAction(
  values: CreateDesignTemplateDto
): Promise<ActionResponse<DesignTemplateResponseDto>> {
  try {
    const res = await templatesService.createDesignTemplate(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getDesignTemplatesAction(
  params: GetDesignTemplatesDto
): Promise<ActionResponse<PaginatedDesignTemplatesResponseDto>> {
  try {
    const res = await templatesService.getDesignTemplates(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getFeaturedDesignTemplatesAction(
  params: GetFeaturedTemplatesDto
): Promise<ActionResponse<DesignTemplateResponseDto[]>> {
  try {
    const res = await templatesService.getFeaturedDesignTemplates(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getDesignTemplateByIdAction(
  id: string
): Promise<ActionResponse<DesignTemplateResponseDto>> {
  try {
    const res = await templatesService.getDesignTemplateById(id);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateDesignTemplateAction(
  id: string,
  values: UpdateDesignTemplateDto
): Promise<ActionResponse<DesignTemplateResponseDto>> {
  try {
    const res = await templatesService.updateDesignTemplate(id, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteDesignTemplateAction(
  id: string
): Promise<ActionResponse<void>> {
  try {
    await templatesService.deleteDesignTemplate(id);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
