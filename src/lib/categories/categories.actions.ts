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

/**
 * Get paginated list of categories with optional filtering
 */
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

/**
 * Get all categories in hierarchical tree structure
 */
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

/**
 * Get detailed category information including products and options by ID
 */
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

/**
 * Get category using URL-friendly slug identifier
 */
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

/**
 * Create a new product category with optional parent relationship
 */
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

/**
 * Update category information and settings
 */
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

/**
 * Delete category (must have no products or children)
 */
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
