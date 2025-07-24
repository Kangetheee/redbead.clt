import { Fetcher } from "../api/api.service";
import { PaginatedData } from "../shared/types";
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  GetCustomersDto,
  GetCustomerRecentOrdersDto,
} from "./dto/customers.dto";
import {
  Customer,
  CustomersListResponse,
  CustomerDashboard,
  CustomerOrder,
  CustomerDesign,
  CustomerQuickAction,
  CustomerOrderTracking,
} from "./types/customers.types";

export class CustomersService {
  constructor(private fetcher = new Fetcher()) {}

  /**
   * Get customers with pagination and optional search
   * GET /v1/customers
   */
  public async findAll(
    params?: GetCustomersDto
  ): Promise<PaginatedData<Customer>> {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params?.search) {
      queryParams.append("search", params.search);
    }

    const queryString = queryParams.toString();
    const url = `/v1/customers${queryString ? `?${queryString}` : ""}`;

    // Get the raw API response
    const apiResponse = await this.fetcher.request<CustomersListResponse>(url);

    // Transform to match PaginatedData structure
    return {
      items: apiResponse.data,
      meta: {
        totalItems: apiResponse.meta.total,
        itemsPerPage: apiResponse.meta.limit,
        currentPage: apiResponse.meta.page,
        totalPages: apiResponse.meta.lastPage,
      },
    };
  }

  /**
   * Get customer dashboard data
   * GET /v1/customers/dashboard
   */
  public async getDashboard(): Promise<CustomerDashboard> {
    return this.fetcher.request<CustomerDashboard>("/v1/customers/dashboard");
  }

  /**
   * Get customer by ID
   * GET /v1/customers/{id}
   */
  public async findById(customerId: string): Promise<Customer> {
    return this.fetcher.request<Customer>(`/v1/customers/${customerId}`);
  }

  /**
   * Create a new customer record
   * POST /v1/customers
   */
  public async create(values: CreateCustomerDto): Promise<Customer> {
    return this.fetcher.request<Customer>("/v1/customers", {
      method: "POST",
      data: values,
    });
  }

  /**
   * Update customer information
   * PATCH /v1/customers/{id}
   */
  public async update(
    customerId: string,
    values: UpdateCustomerDto
  ): Promise<Customer> {
    return this.fetcher.request<Customer>(`/v1/customers/${customerId}`, {
      method: "PATCH",
      data: values,
    });
  }

  /**
   * Delete a customer record
   * DELETE /v1/customers/{id}
   */
  public async delete(customerId: string): Promise<void> {
    return this.fetcher.request<void>(`/v1/customers/${customerId}`, {
      method: "DELETE",
    });
  }

  /**
   * Get customer recent orders
   * GET /v1/customers/{id}/recent-orders
   */
  public async getRecentOrders(
    customerId: string,
    params?: GetCustomerRecentOrdersDto
  ): Promise<CustomerOrder[]> {
    const queryParams = new URLSearchParams();

    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }

    const queryString = queryParams.toString();
    const url = `/v1/customers/${customerId}/recent-orders${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<CustomerOrder[]>(url);
  }

  /**
   * Get designs saved by a specific customer
   * GET /v1/customers/{id}/saved-designs
   */
  public async getSavedDesigns(customerId: string): Promise<CustomerDesign[]> {
    return this.fetcher.request<CustomerDesign[]>(
      `/v1/customers/${customerId}/saved-designs`
    );
  }

  /**
   * Get available quick actions for a specific customer
   * GET /v1/customers/{id}/quick-actions
   */
  public async getQuickActions(
    customerId: string
  ): Promise<CustomerQuickAction[]> {
    return this.fetcher.request<CustomerQuickAction[]>(
      `/v1/customers/${customerId}/quick-actions`
    );
  }

  /**
   * Get active orders for a specific customer
   * GET /v1/customers/{id}/orders/active
   */
  public async getActiveOrders(customerId: string): Promise<CustomerOrder[]> {
    return this.fetcher.request<CustomerOrder[]>(
      `/v1/customers/${customerId}/orders/active`
    );
  }

  /**
   * Get detailed tracking information for a customer order
   * GET /v1/customers/{id}/orders/{orderId}/tracking
   */
  public async getOrderTracking(
    customerId: string,
    orderId: string
  ): Promise<CustomerOrderTracking> {
    return this.fetcher.request<CustomerOrderTracking>(
      `/v1/customers/${customerId}/orders/${orderId}/tracking`
    );
  }
}
