"use server";

import { getErrorMessage } from "@/lib/get-error-message";
import { ActionResponse } from "@/lib/shared/types";
import { DesignsService } from "./designs.service";
import {
  CreateDesignDto,
  UpdateDesignDto,
  GetDesignsDto,
  DuplicateDesignDto,
  PaginatedDesignsResponseDto,
  DesignResponseDto,
} from "./dto/designs.dto";

const designsService = new DesignsService();

export async function createDesignAction(
  values: CreateDesignDto
): Promise<ActionResponse<DesignResponseDto>> {
  try {
    const res = await designsService.createDesign(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getDesignsAction(
  params: GetDesignsDto
): Promise<ActionResponse<PaginatedDesignsResponseDto>> {
  try {
    const res = await designsService.getDesigns(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getUserDesignsAction(
  params: GetDesignsDto
): Promise<ActionResponse<PaginatedDesignsResponseDto>> {
  try {
    const res = await designsService.getUserDesigns(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getDesignByIdAction(
  id: string
): Promise<ActionResponse<DesignResponseDto>> {
  try {
    const res = await designsService.getDesignById(id);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateDesignAction(
  id: string,
  values: UpdateDesignDto
): Promise<ActionResponse<DesignResponseDto>> {
  try {
    const res = await designsService.updateDesign(id, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteDesignAction(
  id: string
): Promise<ActionResponse<void>> {
  try {
    await designsService.deleteDesign(id);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function duplicateDesignAction(
  id: string,
  values?: DuplicateDesignDto
): Promise<ActionResponse<DesignResponseDto>> {
  try {
    const res = await designsService.duplicateDesign(id, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
