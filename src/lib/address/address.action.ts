"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse } from "../shared/types";
import {
  CreateAddressDto,
  UpdateAddressDto,
  GetAddressesDto,
} from "./dto/address.dto";
import { AddressResponse, AddressType } from "./types/address.types";
import { PaginatedData4 } from "../shared/types";
import { AddressService } from "./addresses.service";

const addressService = new AddressService();

export async function getAddressesAction(
  params?: GetAddressesDto
): Promise<ActionResponse<PaginatedData4<AddressResponse>>> {
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
    const res = await addressService.delete(addressId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function setDefaultAddressAction(
  addressId: string
): Promise<ActionResponse<AddressResponse>> {
  try {
    const res = await addressService.setDefault(addressId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
