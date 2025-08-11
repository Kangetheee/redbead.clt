"use server";

import { getErrorMessage } from "@/lib/get-error-message";
import { ActionResponse } from "@/lib/shared/types";
import {
  CreateAddressDto,
  UpdateAddressDto,
  GetAddressesDto,
} from "./dto/address.dto";
import {
  AddressResponse,
  AddressType,
  PaginatedAddressesResponse,
} from "./types/address.types";
import { AddressService } from "./addresses.service";

const addressService = new AddressService();

/**
 * Get paginated list of user addresses
 * Uses GET /v1/addresses
 */
export async function getAddressesAction(
  params?: GetAddressesDto
): Promise<ActionResponse<PaginatedAddressesResponse>> {
  try {
    const res = await addressService.findAll(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get address by ID
 * Uses GET /v1/addresses/{id}
 */
export async function getAddressByIdAction(
  addressId: string
): Promise<ActionResponse<AddressResponse>> {
  try {
    const res = await addressService.findById(addressId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get default address by type
 * Uses GET /v1/addresses/default/{type}
 */
export async function getDefaultAddressByTypeAction(
  type: AddressType
): Promise<ActionResponse<AddressResponse>> {
  try {
    const res = await addressService.findDefaultByType(type);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Create a new address
 * Uses POST /v1/addresses
 */
export async function createAddressAction(
  values: CreateAddressDto
): Promise<ActionResponse<AddressResponse>> {
  try {
    const res = await addressService.create(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Update an existing address
 * Uses PATCH /v1/addresses/{id}
 */
export async function updateAddressAction(
  addressId: string,
  values: UpdateAddressDto
): Promise<ActionResponse<AddressResponse>> {
  try {
    const res = await addressService.update(addressId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Delete an address
 * Uses DELETE /v1/addresses/{id}
 */
export async function deleteAddressAction(
  addressId: string
): Promise<ActionResponse<void>> {
  try {
    await addressService.delete(addressId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Set address as default for its type
 * Uses PATCH /v1/addresses/{id}/set-default
 */
export async function setDefaultAddressAction(
  addressId: string
): Promise<ActionResponse<AddressResponse>> {
  try {
    const res = await addressService.setAsDefault(addressId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
