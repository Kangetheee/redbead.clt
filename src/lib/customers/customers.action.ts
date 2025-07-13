"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse, PaginatedData } from "../shared/types";
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  GetCustomersDto,
} from "./dto/customers.dto";
import {
  CustomerResponse,
  CustomerDashboard,
  CustomerOrder,
  CustomerDesign,
  CustomerQuickAction,
  CustomerOrderTracking,
} from "./types/customers.types";
import { CustomerService } from "./customers.service";

const customerService = new CustomerService();

export async function getCustomersAction(
  params?: GetCustomersDto
): Promise<ActionResponse<PaginatedData<CustomerResponse>>> {
  try {
    const res = await customerService.findAll(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getCustomersDashboardAction(): Promise<
  ActionResponse<CustomerDashboard>
> {
  try {
    const res = await customerService.getDashboard();
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getCustomerAction(
  customerId: string
): Promise<ActionResponse<CustomerResponse>> {
  try {
    const res = await customerService.findById(customerId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function createCustomerAction(
  values: CreateCustomerDto
): Promise<ActionResponse<CustomerResponse>> {
  try {
    const res = await customerService.create(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateCustomerAction(
  customerId: string,
  values: UpdateCustomerDto
): Promise<ActionResponse<CustomerResponse>> {
  try {
    const res = await customerService.update(customerId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteCustomerAction(
  customerId: string
): Promise<ActionResponse<void>> {
  try {
    await customerService.delete(customerId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getCustomerRecentOrdersAction(
  customerId: string,
  limit?: number
): Promise<ActionResponse<CustomerOrder[]>> {
  try {
    const res = await customerService.getRecentOrders(customerId, limit);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getCustomerSavedDesignsAction(
  customerId: string
): Promise<ActionResponse<CustomerDesign[]>> {
  try {
    const res = await customerService.getSavedDesigns(customerId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getCustomerQuickActionsAction(
  customerId: string
): Promise<ActionResponse<CustomerQuickAction[]>> {
  try {
    const res = await customerService.getQuickActions(customerId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getCustomerActiveOrdersAction(
  customerId: string
): Promise<ActionResponse<CustomerOrder[]>> {
  try {
    const res = await customerService.getActiveOrders(customerId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getCustomerOrderTrackingAction(
  customerId: string,
  orderId: string
): Promise<ActionResponse<CustomerOrderTracking>> {
  try {
    const res = await customerService.getOrderTracking(customerId, orderId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
