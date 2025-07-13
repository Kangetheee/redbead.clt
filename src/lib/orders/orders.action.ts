"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse, PaginatedData } from "../shared/types";
import {
  GetOrdersDto,
  CreateOrderDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
  CreateOrderNoteDto,
  RequestDesignApprovalDto,
  UpdateDesignApprovalDto,
} from "./dto/orders.dto";
import { OrderResponse, OrderNote, DesignApproval } from "./types/orders.types";
import { OrderService } from "./orders.service";

const orderService = new OrderService();

export async function getOrdersAction(
  params?: GetOrdersDto
): Promise<ActionResponse<PaginatedData<OrderResponse>>> {
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

export async function createOrderAction(
  values: CreateOrderDto
): Promise<ActionResponse<OrderResponse>> {
  try {
    const res = await orderService.create(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateOrderAction(
  orderId: string,
  values: UpdateOrderDto
): Promise<ActionResponse<OrderResponse>> {
  try {
    const res = await orderService.update(orderId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  values: UpdateOrderStatusDto
): Promise<ActionResponse<OrderResponse>> {
  try {
    const res = await orderService.updateStatus(orderId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getOrderNotesAction(
  orderId: string
): Promise<ActionResponse<OrderNote[]>> {
  try {
    const res = await orderService.getNotes(orderId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function addOrderNoteAction(
  orderId: string,
  values: CreateOrderNoteDto
): Promise<ActionResponse<OrderNote>> {
  try {
    const res = await orderService.addNote(orderId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function requestDesignApprovalAction(
  orderId: string,
  values: RequestDesignApprovalDto
): Promise<ActionResponse<DesignApproval>> {
  try {
    const res = await orderService.requestDesignApproval(orderId, values);
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

export async function updateDesignApprovalAction(
  orderId: string,
  values: UpdateDesignApprovalDto
): Promise<ActionResponse<DesignApproval>> {
  try {
    const res = await orderService.updateDesignApproval(orderId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
