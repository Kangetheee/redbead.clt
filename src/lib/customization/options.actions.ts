"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse, PaginatedData } from "../shared/types";
import {
  CreateCustomizationOptionDto,
  UpdateCustomizationOptionDto,
  GetCustomizationOptionsDto,
  CreateCustomizationValueDto,
  UpdateCustomizationValueDto,
  GetCustomizationValuesDto,
} from "@/lib/customization/dto/options.dto";
import {
  CustomizationOption,
  CustomizationOptionDetail,
  CustomizationValue,
} from "@/lib/customization/types/options.types";
import { CustomizationOptionsService } from "./options.service";

const customizationOptionsService = new CustomizationOptionsService();

// Customization Options
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

export async function getCustomizationOptionsByCategoryAction(
  categoryId: string
): Promise<ActionResponse<CustomizationOption[]>> {
  try {
    const res =
      await customizationOptionsService.findOptionsByCategory(categoryId);
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
): Promise<ActionResponse<{ message: string }>> {
  try {
    const res = await customizationOptionsService.deleteOption(optionId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Customization Values
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
): Promise<ActionResponse<{ message: string }>> {
  try {
    const res = await customizationOptionsService.deleteValue(valueId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
