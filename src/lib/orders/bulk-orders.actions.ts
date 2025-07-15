"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse, PaginatedData } from "../shared/types";
import {
  CreateBulkOrderDto,
  UpdateBulkOrderDto,
  GetBulkOrdersDto,
} from "./dto/bulk-order.dto";
import { BulkOrderDetail, BulkOrderResponse } from "./types/bulk-orders.types";
import { BulkOrderService } from "./bulk-orders.service";
import { CreateBulkOrderQuoteDto } from "./dto/bulk-quote.dto";
import { BulkOrderConversionDto } from "./dto/bulk-convert.dto";

const bulkOrderService = new BulkOrderService();

export async function getBulkOrdersAction(
  params?: GetBulkOrdersDto
): Promise<ActionResponse<PaginatedData<BulkOrderResponse>>> {
  try {
    const res = await bulkOrderService.findAll(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getBulkOrderAction(
  bulkOrderId: string
): Promise<ActionResponse<BulkOrderDetail>> {
  try {
    const res = await bulkOrderService.findById(bulkOrderId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function createBulkOrderAction(
  values: CreateBulkOrderDto
): Promise<ActionResponse<BulkOrderDetail>> {
  try {
    const res = await bulkOrderService.create(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateBulkOrderAction(
  bulkOrderId: string,
  values: UpdateBulkOrderDto
): Promise<ActionResponse<BulkOrderDetail>> {
  try {
    const res = await bulkOrderService.update(bulkOrderId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteBulkOrderAction(
  bulkOrderId: string
): Promise<ActionResponse<{ message: string }>> {
  try {
    const res = await bulkOrderService.delete(bulkOrderId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function createBulkOrderQuoteAction(
  bulkOrderId: string,
  values: CreateBulkOrderQuoteDto
): Promise<ActionResponse<BulkOrderDetail>> {
  try {
    const res = await bulkOrderService.createQuote(bulkOrderId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function acceptBulkOrderQuoteAction(
  bulkOrderId: string
): Promise<ActionResponse<BulkOrderDetail>> {
  try {
    const res = await bulkOrderService.acceptQuote(bulkOrderId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function convertBulkOrderToOrderAction(
  bulkOrderId: string,
  values: BulkOrderConversionDto
): Promise<ActionResponse<BulkOrderDetail>> {
  try {
    const res = await bulkOrderService.convertToOrder(bulkOrderId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
