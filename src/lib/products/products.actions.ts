"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse, PaginatedData } from "../shared/types";
import {
  CreateProductDto,
  UpdateProductDto,
  GetProductsDto,
  PriceCalculationDto,
} from "./dto/products.dto";
import { ProductResponse, PriceBreakdown } from "./types/products.types";
import { ProductService } from "./products.service";

const productService = new ProductService();

export async function getProductsAction(
  params?: GetProductsDto
): Promise<ActionResponse<PaginatedData<ProductResponse>>> {
  try {
    const res = await productService.findAll(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getFeaturedProductsAction(
  limit?: number
): Promise<ActionResponse<ProductResponse[]>> {
  try {
    const res = await productService.findFeatured(limit);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getProductAction(
  productId: string
): Promise<ActionResponse<ProductResponse>> {
  try {
    const res = await productService.findById(productId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getProductBySlugAction(
  slug: string
): Promise<ActionResponse<ProductResponse>> {
  try {
    const res = await productService.findBySlug(slug);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function createProductAction(
  values: CreateProductDto
): Promise<ActionResponse<ProductResponse>> {
  try {
    const res = await productService.create(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateProductAction(
  productId: string,
  values: UpdateProductDto
): Promise<ActionResponse<ProductResponse>> {
  try {
    const res = await productService.update(productId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteProductAction(
  productId: string
): Promise<ActionResponse<void>> {
  try {
    await productService.delete(productId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function calculateProductPriceAction(
  productId: string,
  values: PriceCalculationDto
): Promise<ActionResponse<PriceBreakdown>> {
  try {
    const res = await productService.calculatePrice(productId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
