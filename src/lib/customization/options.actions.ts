"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse, PaginatedData } from "../shared/types";
import {
  CreateCustomizationOptionDto,
  UpdateCustomizationOptionDto,
  GetCustomizationOptionsDto,
  AssignOptionToTemplateDto,
  CreateCustomizationValueDto,
  UpdateCustomizationValueDto,
  GetCustomizationValuesDto,
  CalculatePriceAdjustmentDto,
  ValidateCustomizationsDto,
  GetCustomizationValueStatsDto,
} from "@/lib/customization/dto/options.dto";
import {
  CustomizationOption,
  CustomizationOptionDetail,
  CustomizationValue,
  CustomizationValueStats,
  PriceAdjustmentResult,
  CustomizationValidationResult,
} from "@/lib/customization/types/options.types";
import { CustomizationOptionsService } from "./options.service";

const customizationOptionsService = new CustomizationOptionsService();

// ===== Customization Options Actions =====

export async function getCustomizationOptionsAction(
  params?: GetCustomizationOptionsDto
): Promise<ActionResponse<PaginatedData<CustomizationOption>>> {
  try {
    const res = await customizationOptionsService.findAllOptions(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getCustomizationOptionAction(
  optionId: string
): Promise<ActionResponse<CustomizationOptionDetail>> {
  try {
    const res = await customizationOptionsService.findOptionById(optionId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function createCustomizationOptionAction(
  values: CreateCustomizationOptionDto
): Promise<ActionResponse<CustomizationOptionDetail>> {
  try {
    const res = await customizationOptionsService.createOption(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateCustomizationOptionAction(
  optionId: string,
  values: UpdateCustomizationOptionDto
): Promise<ActionResponse<CustomizationOptionDetail>> {
  try {
    const res = await customizationOptionsService.updateOption(
      optionId,
      values
    );
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteCustomizationOptionAction(
  optionId: string
): Promise<ActionResponse<void>> {
  try {
    await customizationOptionsService.deleteOption(optionId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function assignOptionToTemplateAction(
  optionId: string,
  values: AssignOptionToTemplateDto
): Promise<ActionResponse<void>> {
  try {
    await customizationOptionsService.assignOptionToTemplate(optionId, values);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function removeOptionFromTemplateAction(
  optionId: string,
  templateId: string
): Promise<ActionResponse<void>> {
  try {
    await customizationOptionsService.removeOptionFromTemplate(
      optionId,
      templateId
    );
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// ===== Customization Values Actions =====

export async function getCustomizationValuesAction(
  params?: GetCustomizationValuesDto
): Promise<ActionResponse<PaginatedData<CustomizationValue>>> {
  try {
    const res = await customizationOptionsService.findAllValues(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getCustomizationValueAction(
  valueId: string
): Promise<ActionResponse<CustomizationValue>> {
  try {
    const res = await customizationOptionsService.findValueById(valueId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getCustomizationValuesByOptionAction(
  optionId: string
): Promise<ActionResponse<CustomizationValue[]>> {
  try {
    const res = await customizationOptionsService.findValuesByOption(optionId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getCustomizationValuesByTemplateAction(
  templateId: string
): Promise<ActionResponse<CustomizationValue[]>> {
  try {
    const res =
      await customizationOptionsService.findValuesByTemplate(templateId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getCustomizationValueStatsAction(
  params?: GetCustomizationValueStatsDto
): Promise<ActionResponse<CustomizationValueStats>> {
  try {
    const res = await customizationOptionsService.getValueStats(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function calculatePriceAdjustmentAction(
  values: CalculatePriceAdjustmentDto
): Promise<ActionResponse<PriceAdjustmentResult>> {
  try {
    const res =
      await customizationOptionsService.calculatePriceAdjustment(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function validateCustomizationsAction(
  templateId: string,
  values: ValidateCustomizationsDto
): Promise<ActionResponse<CustomizationValidationResult>> {
  try {
    const res = await customizationOptionsService.validateCustomizations(
      templateId,
      values
    );
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function createCustomizationValueAction(
  values: CreateCustomizationValueDto
): Promise<ActionResponse<CustomizationValue>> {
  try {
    const res = await customizationOptionsService.createValue(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateCustomizationValueAction(
  valueId: string,
  values: UpdateCustomizationValueDto
): Promise<ActionResponse<CustomizationValue>> {
  try {
    const res = await customizationOptionsService.updateValue(valueId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteCustomizationValueAction(
  valueId: string
): Promise<ActionResponse<void>> {
  try {
    await customizationOptionsService.deleteValue(valueId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function restoreCustomizationValueAction(
  valueId: string
): Promise<ActionResponse<CustomizationValue>> {
  try {
    const res = await customizationOptionsService.restoreValue(valueId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
