"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse, PaginatedData } from "../shared/types";
import {
  CreateProductTypeDto,
  UpdateProductTypeDto,
  GetProductTypesDto,
  GetProductTypesByCategoryDto,
} from "./dto/products.dto";
import { ProductTypeResponse } from "./types/products.types";
import { ProductTypeService } from "./products.service";

const productTypeService = new ProductTypeService();

export async function getProductTypesAction(
  params?: GetProductTypesDto
): Promise<ActionResponse<PaginatedData<ProductTypeResponse>>> {
  try {
    const res = await productTypeService.findAll(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getFeaturedProductTypesAction(
  limit?: number
): Promise<ActionResponse<ProductTypeResponse[]>> {
  try {
    const res = await productTypeService.findFeatured(limit);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getProductTypeAction(
  productTypeId: string
): Promise<ActionResponse<ProductTypeResponse>> {
  try {
    const res = await productTypeService.findById(productTypeId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getProductTypeBySlugAction(
  slug: string
): Promise<ActionResponse<ProductTypeResponse>> {
  try {
    const res = await productTypeService.findBySlug(slug);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getProductTypesByCategoryAction(
  params: GetProductTypesByCategoryDto
): Promise<ActionResponse<PaginatedData<ProductTypeResponse>>> {
  try {
    const res = await productTypeService.findByCategory(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function createProductTypeAction(
  values: CreateProductTypeDto
): Promise<ActionResponse<ProductTypeResponse>> {
  try {
    const res = await productTypeService.create(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateProductTypeAction(
  productTypeId: string,
  values: UpdateProductTypeDto
): Promise<ActionResponse<ProductTypeResponse>> {
  try {
    const res = await productTypeService.update(productTypeId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteProductTypeAction(
  productTypeId: string
): Promise<ActionResponse<void>> {
  try {
    await productTypeService.delete(productTypeId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
