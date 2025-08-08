"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse, PaginatedData } from "../shared/types";
import {
  CreateProductDto,
  UpdateProductDto,
  GetProductsDto,
  SearchProductsDto,
  CalculatePriceDto,
} from "./dto/products.dto";
import {
  ProductResponse,
  ProductPriceCalculation,
} from "./types/products.types";
import { ProductService } from "./products.service";

const productService = new ProductService();

/**
 * Get paginated list of products with optional filtering and sorting
 */
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

/**
 * Create a new product
 */
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

/**
 * Quick product search by name or description
 */
export async function searchProductsAction(
  params: SearchProductsDto
): Promise<ActionResponse<ProductResponse[]>> {
  try {
    const res = await productService.search(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get featured products for homepage/marketing display
 */
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

/**
 * Get detailed product information using URL-friendly slug
 */
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

/**
 * Calculate product price with variants and customizations
 */
export async function calculateProductPriceAction(
  productId: string,
  params: CalculatePriceDto
): Promise<ActionResponse<ProductPriceCalculation>> {
  try {
    const res = await productService.calculatePrice(productId, params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get detailed product information by ID
 */
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

/**
 * Update product information
 */
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

/**
 * Permanently delete a product (only if not used in orders or carts)
 */
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

/**
 * Toggle product featured status
 */
export async function toggleProductFeaturedAction(
  productId: string
): Promise<ActionResponse<ProductResponse>> {
  try {
    const res = await productService.toggleFeatured(productId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
