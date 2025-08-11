"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse } from "../shared/types";
import {
  InitiatePaymentDto,
  RefundRequestDto,
  CreatePaymentDto,
  ListPaymentsDto,
  SqroolCallbackDto,
} from "./dto/payments.dto";
import {
  PaymentMethod,
  PaymentDetails,
  PaymentInitiationResponse,
  PaymentStatus,
  RefundResponse,
  PaymentListResponse,
  PaymentSummary,
} from "./types/payments.types";
import { PaymentsService } from "./payments.service";

const paymentsService = new PaymentsService();

/**
 * Get list of payments with pagination and filtering
 * GET /v1/payments
 */
export async function listPaymentsAction(
  params?: ListPaymentsDto
): Promise<ActionResponse<PaymentListResponse>> {
  try {
    const res = await paymentsService.listPayments(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Create a new payment record
 * POST /v1/payments
 */
export async function createPaymentAction(
  values: CreatePaymentDto
): Promise<ActionResponse<PaymentDetails>> {
  try {
    const res = await paymentsService.createPayment(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get payment summary statistics
 * GET /v1/payments/summary
 */
export async function getPaymentSummaryAction(
  orderId?: string
): Promise<ActionResponse<PaymentSummary>> {
  try {
    const res = await paymentsService.getPaymentSummary(orderId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get allowed payment methods
 * GET /v1/payments/methods
 */
export async function getPaymentMethodsAction(): Promise<
  ActionResponse<PaymentMethod[]>
> {
  try {
    const res = await paymentsService.getPaymentMethods();
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get payment by ID
 * GET /v1/payments/{id}
 */
export async function getPaymentByIdAction(
  id: string
): Promise<ActionResponse<PaymentDetails>> {
  try {
    const res = await paymentsService.getPaymentById(id);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Initiate payment for an order
 * POST /v1/payments/initiate/{orderId}
 */
export async function initiatePaymentAction(
  orderId: string,
  values?: InitiatePaymentDto
): Promise<ActionResponse<PaymentInitiationResponse>> {
  try {
    const res = await paymentsService.initiatePayment(orderId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Query payment status for an order
 * GET /v1/payments/status/{orderId}
 */
export async function getPaymentStatusAction(
  orderId: string
): Promise<ActionResponse<PaymentStatus>> {
  try {
    const res = await paymentsService.getPaymentStatus(orderId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get payment details for an order
 * GET /v1/payments/order/{orderId}
 */
export async function getPaymentDetailsAction(
  orderId: string
): Promise<ActionResponse<PaymentDetails>> {
  try {
    const res = await paymentsService.getPaymentDetails(orderId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Initiate refund for an order
 * POST /v1/payments/refund/{orderId}
 */
export async function initiateRefundAction(
  orderId: string,
  values: RefundRequestDto
): Promise<ActionResponse<RefundResponse>> {
  try {
    const res = await paymentsService.initiateRefund(orderId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Handle Sqrool payment callback
 * POST /v1/payments/callbacks/sqrool
 *
 * Note: This is typically used for webhook processing and should not be called directly from client code
 */
export async function handleSqroolCallbackAction(
  callbackData: SqroolCallbackDto
): Promise<ActionResponse<void>> {
  try {
    await paymentsService.handleSqroolCallback(callbackData);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
