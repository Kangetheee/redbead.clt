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
  UpdateOrderItemStatusDto,
  BulkUpdateOrderItemStatusDto,
  CalculateTimelineDto,
} from "./dto/orders.dto";
import {
  OrderResponse,
  OrderListItem,
  OrderNote,
  DesignApproval,
  OrderItem,
  PaymentStatus,
  ProductionRequirements,
  TimelineCalculation,
} from "./types/orders.types";
import { OrderService } from "./orders.service";

const orderService = new OrderService();

// Orders CRUD actions
export async function getOrdersAction(
  params?: GetOrdersDto
): Promise<ActionResponse<PaginatedData<OrderListItem>>> {
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

// Order notes actions
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

// Design approval actions
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

export async function completeDesignApprovalAction(
  orderId: string
): Promise<ActionResponse<void>> {
  try {
    await orderService.completeDesignApproval(orderId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Payment actions
export async function getPaymentStatusAction(
  orderId: string
): Promise<ActionResponse<PaymentStatus>> {
  try {
    const res = await orderService.getPaymentStatus(orderId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Order items actions
export async function getOrderItemsAction(
  orderId: string
): Promise<ActionResponse<OrderItem[]>> {
  try {
    const res = await orderService.getOrderItems(orderId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateOrderItemStatusAction(
  orderItemId: string,
  values: UpdateOrderItemStatusDto
): Promise<ActionResponse<void>> {
  try {
    await orderService.updateOrderItemStatus(orderItemId, values);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function bulkUpdateOrderItemStatusAction(
  values: BulkUpdateOrderItemStatusDto
): Promise<ActionResponse<void>> {
  try {
    await orderService.bulkUpdateOrderItemStatus(values);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getOrderItemsByStatusAction(
  status: string,
  templateId: string
): Promise<ActionResponse<OrderItem[]>> {
  try {
    const res = await orderService.getOrderItemsByStatus(status, templateId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Production and timeline actions
export async function getProductionRequirementsAction(
  orderId: string
): Promise<ActionResponse<ProductionRequirements>> {
  try {
    const res = await orderService.getProductionRequirements(orderId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function calculateTimelineAction(
  orderId: string,
  values: CalculateTimelineDto
): Promise<ActionResponse<TimelineCalculation>> {
  try {
    const res = await orderService.calculateTimeline(orderId, values.startDate);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
