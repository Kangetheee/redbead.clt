"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse } from "../shared/types";
import {
  CreateShippingZoneDto,
  CreateShippingRateDto,
  ShippingCalculationDto,
} from "./dto/shipping.dto";
import {
  ShippingZone,
  ShippingRate,
  ShippingOption,
} from "./types/shipping.types";
import { ShippingService } from "./shipping.service";

const shippingService = new ShippingService();

/**
 * Get all active shipping zones with their countries
 * GET /v1/shipping/zones
 */
export async function getShippingZonesAction(): Promise<
  ActionResponse<ShippingZone[]>
> {
  try {
    const res = await shippingService.getZones();
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Create a new shipping zone with countries
 * POST /v1/shipping/zones
 */
export async function createShippingZoneAction(
  values: CreateShippingZoneDto
): Promise<ActionResponse<ShippingZone>> {
  try {
    const res = await shippingService.createZone(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get all shipping rates for a specific zone
 * GET /v1/shipping/zones/{id}/rates
 */
export async function getZoneRatesAction(
  zoneId: string
): Promise<ActionResponse<ShippingRate[]>> {
  try {
    const res = await shippingService.getZoneRates(zoneId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Create a new shipping rate for a specific zone
 * POST /v1/shipping/zones/{id}/rates
 */
export async function createShippingRateAction(
  zoneId: string,
  values: CreateShippingRateDto
): Promise<ActionResponse<ShippingRate>> {
  try {
    const res = await shippingService.createRate(zoneId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Calculate available shipping options and costs for a destination
 * POST /v1/shipping/calculate
 */
export async function calculateShippingAction(
  values: ShippingCalculationDto
): Promise<ActionResponse<ShippingOption[]>> {
  try {
    const res = await shippingService.calculateShipping(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
