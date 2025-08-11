"use server";

import { getErrorMessage } from "@/lib/get-error-message";
import { ActionResponse } from "@/lib/shared/types";
import {
  CreateShippingZoneDto,
  UpdateShippingZoneDto,
  GetShippingZonesDto,
  CreateShippingRateDto,
  UpdateShippingRateDto,
  GetShippingRatesDto,
  CalculateShippingDto,
} from "./dto/shipping.dto";
import {
  ShippingZoneResponse,
  ShippingRateResponse,
  ShippingOptionResponse,
  PaginatedZonesResponse,
  PaginatedRatesResponse,
} from "./types/shipping.types";
import { ShippingService } from "./shipping.service";

const shippingService = new ShippingService();

// Shipping Zone Actions

/**
 * Get paginated list of shipping zones
 * Uses GET /v1/shipping/zones
 */
export async function getShippingZonesAction(
  params?: GetShippingZonesDto
): Promise<ActionResponse<PaginatedZonesResponse>> {
  try {
    const res = await shippingService.findAllZones(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get shipping zone by ID
 * Uses GET /v1/shipping/zones/{id}
 */
export async function getShippingZoneByIdAction(
  zoneId: string
): Promise<ActionResponse<ShippingZoneResponse>> {
  try {
    const res = await shippingService.findZoneById(zoneId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Create a new shipping zone
 * Uses POST /v1/shipping/zones
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
 * Update an existing shipping zone
 * Uses PUT /v1/shipping/zones/{id}
 */
export async function updateShippingZoneAction(
  zoneId: string,
  values: UpdateShippingZoneDto
): Promise<ActionResponse<ShippingZoneResponse>> {
  try {
    const res = await shippingService.updateZone(zoneId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Delete a shipping zone
 * Uses DELETE /v1/shipping/zones/{id}
 */
export async function deleteShippingZoneAction(
  zoneId: string
): Promise<ActionResponse<void>> {
  try {
    await shippingService.deleteZone(zoneId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Shipping Rate Actions

/**
 * Get shipping rates for a specific zone
 * Uses GET /v1/shipping/zones/{id}/rates
 */
export async function getShippingRatesByZoneAction(
  zoneId: string,
  params?: GetShippingRatesDto
): Promise<ActionResponse<PaginatedRatesResponse>> {
  try {
    const res = await shippingService.findRatesByZone(zoneId, params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get shipping rate by ID
 * Uses GET /v1/shipping/rates/{id}
 */
export async function getShippingRateByIdAction(
  rateId: string
): Promise<ActionResponse<ShippingRateResponse>> {
  try {
    const res = await shippingService.findRateById(rateId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Create a new shipping rate for a specific zone
 * Uses POST /v1/shipping/zones/{id}/rates
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
 * Update an existing shipping rate
 * Uses PUT /v1/shipping/rates/{id}
 */
export async function updateShippingRateAction(
  rateId: string,
  values: UpdateShippingRateDto
): Promise<ActionResponse<ShippingRateResponse>> {
  try {
    const res = await shippingService.updateRate(rateId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Delete a shipping rate
 * Uses DELETE /v1/shipping/rates/{id}
 */
export async function deleteShippingRateAction(
  rateId: string
): Promise<ActionResponse<void>> {
  try {
    await shippingService.deleteRate(rateId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Shipping Calculation Action

/**
 * Calculate shipping options and costs for a destination
 * Uses POST /v1/shipping/calculate
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
