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
