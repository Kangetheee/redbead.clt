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
