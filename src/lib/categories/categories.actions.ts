"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse, PaginatedData } from "../shared/types";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  GetCategoriesDto,
} from "./dto/categories.dto";
import {
  CategoryResponse,
  CategoryWithRelations,
  CategoryTreeResponse,
  CategoryDetail,
} from "./types/categories.types";
import { CategoryService } from "./categories.service";

const categoryService = new CategoryService();

export async function getCategoriesAction(
  params?: GetCategoriesDto
): Promise<ActionResponse<PaginatedData<CategoryWithRelations>>> {
  try {
    const res = await categoryService.findAll(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getCategoriesTreeAction(): Promise<
  ActionResponse<CategoryTreeResponse[]>
> {
  try {
    const res = await categoryService.findTree();
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getCategoryAction(
  categoryId: string
): Promise<ActionResponse<CategoryDetail>> {
  try {
    const res = await categoryService.findById(categoryId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getCategoryBySlugAction(
  slug: string
): Promise<ActionResponse<CategoryDetail>> {
  try {
    const res = await categoryService.findBySlug(slug);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function createCategoryAction(
  values: CreateCategoryDto
): Promise<ActionResponse<CategoryResponse>> {
  try {
    const res = await categoryService.create(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateCategoryAction(
  categoryId: string,
  values: UpdateCategoryDto
): Promise<ActionResponse<CategoryResponse>> {
  try {
    const res = await categoryService.update(categoryId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteCategoryAction(
  categoryId: string
): Promise<ActionResponse<void>> {
  try {
    await categoryService.delete(categoryId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
