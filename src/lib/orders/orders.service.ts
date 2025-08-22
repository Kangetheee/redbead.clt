import { Fetcher } from "../api/api.service";
import {
  GetOrdersDto,
  CustomerInstructionsDto,
  ReorderDto,
} from "./dto/orders.dto";
import {
  OrderResponse,
  PaginatedOrdersResponse,
  OrderTrackingResponse,
  DesignApproval,
  CustomerNote,
  ReorderResponse,
  DesignApprovalActionResponse,
} from "./types/orders.types";

export class OrderService {
  constructor(private fetcher = new Fetcher()) {}

  public async findAll(
    params?: GetOrdersDto
  ): Promise<PaginatedOrdersResponse> {
    const queryParams = new URLSearchParams();

    if (params?.status) {
      queryParams.append("status", params.status);
    }
    if (params?.minTotal) {
      queryParams.append("minTotal", params.minTotal.toString());
    }
    if (params?.maxTotal) {
      queryParams.append("maxTotal", params.maxTotal.toString());
    }
    if (params?.startDate) {
      queryParams.append("startDate", params.startDate);
    }
    if (params?.endDate) {
      queryParams.append("endDate", params.endDate);
    }
    if (params?.search) {
      queryParams.append("search", params.search);
    }

    const queryString = queryParams.toString();
    const url = `/v1/orders${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<PaginatedOrdersResponse>(
      url,
      { method: "GET" },
      { auth: true }
    );
  }

  public async findById(orderId: string): Promise<OrderResponse> {
    return this.fetcher.request<OrderResponse>(
      `/v1/orders/${orderId}`,
      { method: "GET" },
      { auth: true }
    );
  }

  public async trackOrder(orderId: string): Promise<OrderTrackingResponse> {
    return this.fetcher.request<OrderTrackingResponse>(
      `/v1/orders/${orderId}/track`,
      { method: "GET" },
      { auth: true }
    );
  }

  public async getDesignApproval(orderId: string): Promise<DesignApproval> {
    return this.fetcher.request<DesignApproval>(
      `/v1/orders/${orderId}/design-approval`,
      { method: "GET" },
      { auth: true }
    );
  }

  public async addCustomerInstructions(
    orderId: string,
    instructions: CustomerInstructionsDto
  ): Promise<CustomerNote> {
    return this.fetcher.request<CustomerNote>(
      `/v1/orders/${orderId}/customer-instructions`,
      {
        method: "POST",
        data: instructions,
      },
      { auth: true }
    );
  }

  public async getCustomerNotes(orderId: string): Promise<CustomerNote[]> {
    return this.fetcher.request<CustomerNote[]>(
      `/v1/orders/${orderId}/customer-notes`,
      { method: "GET" },
      { auth: true }
    );
  }

  public async reorder(data: ReorderDto): Promise<ReorderResponse> {
    return this.fetcher.request<ReorderResponse>(
      "/v1/orders/reorder",
      {
        method: "POST",
        data,
      },
      { auth: true }
    );
  }

  public async approveDesignViaToken(
    token: string
  ): Promise<DesignApprovalActionResponse> {
    return this.fetcher.request<DesignApprovalActionResponse>(
      `/v1/design-approvals/approve/${token}`,
      { method: "GET" },
      { auth: false }
    );
  }

  public async rejectDesignViaToken(
    token: string,
    reason?: string
  ): Promise<DesignApprovalActionResponse> {
    const queryParams = new URLSearchParams();
    if (reason) {
      queryParams.append("reason", reason);
    }
    const queryString = queryParams.toString();
    const url = `/v1/design-approvals/reject/${token}${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<DesignApprovalActionResponse>(
      url,
      { method: "GET" },
      { auth: false }
    );
  }
}
