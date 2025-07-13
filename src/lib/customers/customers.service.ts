import { Fetcher } from "../api/api.service";
import { PaginatedData } from "../shared/types";
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

export class CustomerService {
  constructor(private fetcher = new Fetcher()) {}

  public async findAll(params?: GetCustomersDto) {
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

    return this.fetcher.request<PaginatedData<CustomerResponse>>(url);
  }

  public async getDashboard() {
    return this.fetcher.request<CustomerDashboard>("/v1/customers/dashboard");
  }

  public async findById(customerId: string) {
    return this.fetcher.request<CustomerResponse>(
      `/v1/customers/${customerId}`
    );
  }

  public async create(values: CreateCustomerDto) {
    return this.fetcher.request<CustomerResponse>("/v1/customers", {
      method: "POST",
      data: values,
    });
  }

  public async update(customerId: string, values: UpdateCustomerDto) {
    return this.fetcher.request<CustomerResponse>(
      `/v1/customers/${customerId}`,
      {
        method: "PATCH",
        data: values,
      }
    );
  }

  public async delete(customerId: string) {
    return this.fetcher.request<void>(`/v1/customers/${customerId}`, {
      method: "DELETE",
    });
  }

  public async getRecentOrders(customerId: string, limit?: number) {
    const queryParams = new URLSearchParams();
    if (limit) {
      queryParams.append("limit", limit.toString());
    }

    const queryString = queryParams.toString();
    const url = `/v1/customers/${customerId}/recent-orders${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<CustomerOrder[]>(url);
  }

  public async getSavedDesigns(customerId: string) {
    return this.fetcher.request<CustomerDesign[]>(
      `/v1/customers/${customerId}/saved-designs`
    );
  }

  public async getQuickActions(customerId: string) {
    return this.fetcher.request<CustomerQuickAction[]>(
      `/v1/customers/${customerId}/quick-actions`
    );
  }

  public async getActiveOrders(customerId: string) {
    return this.fetcher.request<CustomerOrder[]>(
      `/v1/customers/${customerId}/orders/active`
    );
  }

  public async getOrderTracking(customerId: string, orderId: string) {
    return this.fetcher.request<CustomerOrderTracking>(
      `/v1/customers/${customerId}/orders/${orderId}/tracking`
    );
  }
}
