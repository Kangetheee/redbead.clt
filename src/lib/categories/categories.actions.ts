"use server";

import { getErrorMessage } from "@/lib/get-error-message";
import { ActionResponse } from "@/lib/shared/types";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  GetCategoriesDto,
} from "./dto/categories.dto";
import {
  CategoryResponse,
  CategoryTreeResponse,
  CategoryDetail,
  PaginatedCategoriesResponse,
} from "./types/categories.types";
import { CategoryService } from "./categories.service";

const categoryService = new CategoryService();

/**
 * Get paginated list of categories with optional filtering and sorting
 * Uses GET /v1/categories
 */
export async function getCategoriesAction(
  params?: GetCategoriesDto
): Promise<ActionResponse<PaginatedCategoriesResponse>> {
  try {
    const res = await categoryService.findAll(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get all categories in hierarchical tree structure
 * Uses GET /v1/categories/tree
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
 * Get detailed category information including products by ID
 * Uses GET /v1/categories/{id}
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
 * Uses GET /v1/categories/slug/{slug}
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
 * Uses POST /v1/categories
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
 * Uses PATCH /v1/categories/{id}
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
 * Uses DELETE /v1/categories/{id}
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
