"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse } from "../shared/types";
import { InitiatePaymentDto, RefundRequestDto } from "./dto/payments.dto";
import {
  PaymentMethod,
  PaymentDetails,
  PaymentInitiationResponse,
  PaymentStatus,
  RefundResponse,
} from "./types/payments.types";
import { PaymentsService } from "./payments.service";

const paymentsService = new PaymentsService();

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
 * GET /v1/payments/{orderId}
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
  callbackData: object
): Promise<ActionResponse<void>> {
  try {
    await paymentsService.handleSqroolCallback(callbackData);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
