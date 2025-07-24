"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse, PaginatedData } from "../shared/types";
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  GetCustomersDto,
  GetCustomerRecentOrdersDto,
} from "./dto/customers.dto";
import {
  Customer,
  CustomerDashboard,
  CustomerOrder,
  CustomerDesign,
  CustomerQuickAction,
  CustomerOrderTracking,
} from "./types/customers.types";
import { CustomersService } from "./customers.service";

const customersService = new CustomersService();

/**
 * Get customers with pagination and optional search
 * GET /v1/customers
 */
export async function getCustomersAction(
  params?: GetCustomersDto
): Promise<ActionResponse<PaginatedData<Customer>>> {
  try {
    const res = await customersService.findAll(params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get customer dashboard data
 * GET /v1/customers/dashboard
 */
export async function getCustomersDashboardAction(): Promise<
  ActionResponse<CustomerDashboard>
> {
  try {
    const res = await customersService.getDashboard();
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get customer by ID
 * GET /v1/customers/{id}
 */
export async function getCustomerAction(
  customerId: string
): Promise<ActionResponse<Customer>> {
  try {
    const res = await customersService.findById(customerId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Create a new customer record
 * POST /v1/customers
 */
export async function createCustomerAction(
  values: CreateCustomerDto
): Promise<ActionResponse<Customer>> {
  try {
    const res = await customersService.create(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Update customer information
 * PATCH /v1/customers/{id}
 */
export async function updateCustomerAction(
  customerId: string,
  values: UpdateCustomerDto
): Promise<ActionResponse<Customer>> {
  try {
    const res = await customersService.update(customerId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Delete a customer record
 * DELETE /v1/customers/{id}
 */
export async function deleteCustomerAction(
  customerId: string
): Promise<ActionResponse<void>> {
  try {
    await customersService.delete(customerId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get customer recent orders
 * GET /v1/customers/{id}/recent-orders
 */
export async function getCustomerRecentOrdersAction(
  customerId: string,
  params?: GetCustomerRecentOrdersDto
): Promise<ActionResponse<CustomerOrder[]>> {
  try {
    const res = await customersService.getRecentOrders(customerId, params);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get designs saved by a specific customer
 * GET /v1/customers/{id}/saved-designs
 */
export async function getCustomerSavedDesignsAction(
  customerId: string
): Promise<ActionResponse<CustomerDesign[]>> {
  try {
    const res = await customersService.getSavedDesigns(customerId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get available quick actions for a specific customer
 * GET /v1/customers/{id}/quick-actions
 */
export async function getCustomerQuickActionsAction(
  customerId: string
): Promise<ActionResponse<CustomerQuickAction[]>> {
  try {
    const res = await customersService.getQuickActions(customerId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get active orders for a specific customer
 * GET /v1/customers/{id}/orders/active
 */
export async function getCustomerActiveOrdersAction(
  customerId: string
): Promise<ActionResponse<CustomerOrder[]>> {
  try {
    const res = await customersService.getActiveOrders(customerId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get detailed tracking information for a customer order
 * GET /v1/customers/{id}/orders/{orderId}/tracking
 */
export async function getCustomerOrderTrackingAction(
  customerId: string,
  orderId: string
): Promise<ActionResponse<CustomerOrderTracking>> {
  try {
    const res = await customersService.getOrderTracking(customerId, orderId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
