"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse } from "../shared/types";
import {
  CreateCustomerTagDto,
  UpdateCustomerTagDto,
} from "./dto/customer-tag.dto";
import { CustomerTag } from "./types/customer-tags.types";
import { CustomerTagsService } from "./customer-tags.service";

const customerTagsService = new CustomerTagsService();

export async function getCustomerTagsAction(): Promise<
  ActionResponse<CustomerTag[]>
> {
  try {
    const res = await customerTagsService.findAll();
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getCustomerTagAction(
  tagId: string
): Promise<ActionResponse<CustomerTag>> {
  try {
    const res = await customerTagsService.findById(tagId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function createCustomerTagAction(
  values: CreateCustomerTagDto
): Promise<ActionResponse<CustomerTag>> {
  try {
    const res = await customerTagsService.create(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateCustomerTagAction(
  tagId: string,
  values: UpdateCustomerTagDto
): Promise<ActionResponse<CustomerTag>> {
  try {
    const res = await customerTagsService.update(tagId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteCustomerTagAction(
  tagId: string
): Promise<ActionResponse<{ message: string }>> {
  try {
    const res = await customerTagsService.delete(tagId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
