"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse } from "../shared/types";
import {
  CreateShippingZoneDto,
  UpdateShippingZoneDto,
  CreateShippingRateDto,
  UpdateShippingRateDto,
  ShippingCalculationDto,
} from "./dto/shipping.dto";
import {
  ShippingZone,
  ShippingRate,
  ShippingOption,
} from "./types/shipping.types";
import { ShippingService } from "./shipping.service";

const shippingService = new ShippingService();

// Zone Actions
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

export async function updateShippingZoneAction(
  zoneId: string,
  values: UpdateShippingZoneDto
): Promise<ActionResponse<ShippingZone>> {
  try {
    const res = await shippingService.updateZone(zoneId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

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

// Rate Actions
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

export async function updateShippingRateAction(
  rateId: string,
  values: UpdateShippingRateDto
): Promise<ActionResponse<ShippingRate>> {
  try {
    const res = await shippingService.updateRate(rateId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

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

// Calculation Actions
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
