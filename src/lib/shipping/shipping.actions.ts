"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse, PaginatedData4 } from "../shared/types";
import {
  CreateShippingZoneDto,
  GetShippingZonesDto,
  CreateShippingRateDto,
  GetShippingRatesDto,
  CalculateShippingDto,
} from "./dto/shipping.dto";
import {
  ShippingZoneResponse,
  ShippingRateResponse,
  ShippingOptionResponse,
} from "./types/shipping.types";
import { ShippingService } from "./shipping.service";

const shippingService = new ShippingService();

/**
 * Get paginated list of shipping zones
 */
export async function getShippingZonesAction(
  params?: GetShippingZonesDto
): Promise<ActionResponse<PaginatedData4<ShippingZoneResponse>>> {
  try {
    const res = await shippingService.findAllZones(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Create a new shipping zone
 */
export async function createShippingZoneAction(
  values: CreateShippingZoneDto
): Promise<ActionResponse<ShippingZoneResponse>> {
  try {
    const res = await shippingService.createZone(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get shipping rates for a specific zone
 */
export async function getShippingRatesByZoneAction(
  zoneId: string,
  params?: GetShippingRatesDto
): Promise<ActionResponse<PaginatedData4<ShippingRateResponse>>> {
  try {
    const res = await shippingService.findRatesByZone(zoneId, params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Create a new shipping rate for a specific zone
 */
export async function createShippingRateAction(
  zoneId: string,
  values: CreateShippingRateDto
): Promise<ActionResponse<ShippingRateResponse>> {
  try {
    const res = await shippingService.createRate(zoneId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Calculate shipping options and costs for a destination
 */
export async function calculateShippingAction(
  values: CalculateShippingDto
): Promise<ActionResponse<ShippingOptionResponse[]>> {
  try {
    const res = await shippingService.calculateShipping(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
