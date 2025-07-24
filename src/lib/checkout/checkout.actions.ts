"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse } from "../shared/types";
import {
  InitCheckoutDto,
  GuestInitCheckoutDto,
  ShippingCalculationDto,
  ValidateCheckoutDto,
  CompleteCheckoutDto,
  GuestCompleteCheckoutDto,
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

/**
 * Initialize checkout process from cart items (authenticated users)
 */
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

/**
 * Initialize checkout for guest users with custom items
 */
export async function initializeGuestCheckoutAction(
  values: GuestInitCheckoutDto
): Promise<ActionResponse<CheckoutSession>> {
  try {
    const res = await checkoutService.initializeGuestCheckout(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Calculate available shipping options and costs for checkout
 */
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

/**
 * Validate all checkout information before completing the order
 */
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

/**
 * Complete the checkout process and create the order (authenticated users)
 */
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

/**
 * Complete the checkout process for guest users
 */
export async function completeGuestCheckoutAction(
  values: GuestCompleteCheckoutDto
): Promise<ActionResponse<CheckoutResponse>> {
  try {
    const res = await checkoutService.completeGuestCheckout(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Retrieve checkout session details (no authentication required)
 */
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

/**
 * Get order confirmation details after successful checkout
 */
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
