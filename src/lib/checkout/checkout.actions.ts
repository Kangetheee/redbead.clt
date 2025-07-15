"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse } from "../shared/types";
import {
  InitCheckoutDto,
  ShippingCalculationDto,
  ValidateCheckoutDto,
  CompleteCheckoutDto,
} from "./dto/checkout.dto";
import {
  CheckoutSession,
  ShippingOptionsResponse,
  CheckoutValidation,
  CheckoutResponse,
  OrderConfirmation,
} from "./types/checkout.types";
import { CheckoutService } from "./checkout.service";

const checkoutService = new CheckoutService();

export async function initializeCheckoutAction(
  values: InitCheckoutDto
): Promise<ActionResponse<CheckoutSession>> {
  try {
    const res = await checkoutService.initializeCheckout(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function calculateShippingAction(
  values: ShippingCalculationDto
): Promise<ActionResponse<ShippingOptionsResponse>> {
  try {
    const res = await checkoutService.calculateShipping(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function validateCheckoutAction(
  values: ValidateCheckoutDto
): Promise<ActionResponse<CheckoutValidation>> {
  try {
    const res = await checkoutService.validateCheckout(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function completeCheckoutAction(
  values: CompleteCheckoutDto
): Promise<ActionResponse<CheckoutResponse>> {
  try {
    const res = await checkoutService.completeCheckout(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getCheckoutSessionAction(
  sessionId: string
): Promise<ActionResponse<CheckoutSession>> {
  try {
    const res = await checkoutService.getCheckoutSession(sessionId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getOrderConfirmationAction(
  orderId: string
): Promise<ActionResponse<OrderConfirmation>> {
  try {
    const res = await checkoutService.getOrderConfirmation(orderId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
