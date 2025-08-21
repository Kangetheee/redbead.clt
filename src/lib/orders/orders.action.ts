"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse } from "../shared/types";
import {
  GetOrdersDto,
  CustomerInstructionsDto,
  ReorderDto,
} from "./dto/orders.dto";
import {
  OrderResponse,
  PaginatedOrdersResponse,
  OrderTrackingResponse,
  DesignApproval,
  CustomerNote,
  ReorderResponse,
  DesignApprovalActionResponse,
} from "./types/orders.types";
import { OrderService } from "./orders.service";

const orderService = new OrderService();

export async function getOrdersAction(
  params?: GetOrdersDto
): Promise<ActionResponse<PaginatedOrdersResponse>> {
  try {
    const res = await orderService.findAll(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getOrderAction(
  orderId: string
): Promise<ActionResponse<OrderResponse>> {
  try {
    const res = await orderService.findById(orderId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function trackOrderAction(
  orderId: string
): Promise<ActionResponse<OrderTrackingResponse>> {
  try {
    const res = await orderService.trackOrder(orderId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getDesignApprovalAction(
  orderId: string
): Promise<ActionResponse<DesignApproval>> {
  try {
    const res = await orderService.getDesignApproval(orderId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function addCustomerInstructionsAction(
  orderId: string,
  instructions: CustomerInstructionsDto
): Promise<ActionResponse<CustomerNote>> {
  try {
    const res = await orderService.addCustomerInstructions(
      orderId,
      instructions
    );
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getCustomerNotesAction(
  orderId: string
): Promise<ActionResponse<CustomerNote[]>> {
  try {
    const res = await orderService.getCustomerNotes(orderId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function reorderAction(
  data: ReorderDto
): Promise<ActionResponse<ReorderResponse>> {
  try {
    const res = await orderService.reorder(data);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function approveDesignViaTokenAction(
  token: string
): Promise<ActionResponse<DesignApprovalActionResponse>> {
  try {
    const res = await orderService.approveDesignViaToken(token);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function rejectDesignViaTokenAction(
  token: string,
  reason?: string
): Promise<ActionResponse<DesignApprovalActionResponse>> {
  try {
    const res = await orderService.rejectDesignViaToken(token, reason);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
