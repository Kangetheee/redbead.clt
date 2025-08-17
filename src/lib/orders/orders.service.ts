/* eslint-disable @typescript-eslint/no-unused-vars */

import { Fetcher } from "../api/api.service";
import { PaginatedData2 } from "../shared/types";
import {
  GetOrdersDto,
  CreateOrderDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
  CreateOrderNoteDto,
  RequestDesignApprovalDto,
  UpdateDesignApprovalDto,
  UpdateOrderItemStatusDto,
  BulkUpdateOrderItemStatusDto,
  CalculateTimelineDto,
  ApproveDesignViaTokenDto,
  RejectDesignViaTokenDto,
  ResendDesignApprovalEmailDto,
} from "./dto/orders.dto";
import {
  OrderResponse,
  OrderListItem,
  OrderNote,
  DesignApproval,
  OrderItem,
  PaymentStatus,
  ProductionRequirements,
  TimelineCalculation,
  DesignApprovalTokenResponse,
  DesignApprovalActionResponse,
  DesignApprovalResendResponse,
} from "./types/orders.types";

export class OrderService {
  constructor(private fetcher = new Fetcher()) {}

  public async findAll(
    params?: GetOrdersDto
  ): Promise<PaginatedData2<OrderResponse>> {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }
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
    if (params?.designApprovalStatus) {
      queryParams.append("designApprovalStatus", params.designApprovalStatus);
    }
    if (params?.urgencyLevel) {
      queryParams.append("urgencyLevel", params.urgencyLevel);
    }
    if (params?.templateId) {
      queryParams.append("templateId", params.templateId);
    }

    const queryString = queryParams.toString();
    const url = `/v1/orders${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<PaginatedData2<OrderResponse>>(
      url,
      { method: "GET" },
      { auth: true }
    );
  }

  public async findById(orderId: string): Promise<OrderResponse> {
    return this.fetcher.request<OrderResponse>(`/v1/orders/${orderId}`);
  }

  public async create(values: CreateOrderDto): Promise<OrderResponse> {
    return this.fetcher.request<OrderResponse>("/v1/orders", {
      method: "POST",
      data: values,
    });
  }

  public async update(
    orderId: string,
    values: UpdateOrderDto
  ): Promise<OrderResponse> {
    return this.fetcher.request<OrderResponse>(`/v1/orders/${orderId}`, {
      method: "PATCH",
      data: values,
    });
  }

  public async updateStatus(
    orderId: string,
    values: UpdateOrderStatusDto
  ): Promise<OrderResponse> {
    return this.fetcher.request<OrderResponse>(`/v1/orders/${orderId}/status`, {
      method: "PATCH",
      data: values,
    });
  }

  public async getNotes(orderId: string): Promise<OrderNote[]> {
    return this.fetcher.request<OrderNote[]>(`/v1/orders/${orderId}/notes`);
  }

  public async addNote(
    orderId: string,
    values: CreateOrderNoteDto
  ): Promise<OrderNote> {
    return this.fetcher.request<OrderNote>(`/v1/orders/${orderId}/notes`, {
      method: "POST",
      data: values,
    });
  }

  public async requestDesignApproval(
    orderId: string,
    values: RequestDesignApprovalDto
  ): Promise<DesignApprovalTokenResponse> {
    return this.fetcher.request<DesignApprovalTokenResponse>(
      `/v1/orders/${orderId}/request-design-approval`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  public async getDesignApproval(orderId: string): Promise<DesignApproval> {
    return this.fetcher.request<DesignApproval>(
      `/v1/orders/${orderId}/design-approval`
    );
  }

  public async updateDesignApproval(
    orderId: string,
    values: UpdateDesignApprovalDto
  ): Promise<DesignApproval> {
    return this.fetcher.request<DesignApproval>(
      `/v1/orders/${orderId}/design-approval`,
      {
        method: "PATCH",
        data: values,
      }
    );
  }

  public async completeDesignApproval(
    orderId: string
  ): Promise<{ success: boolean; message: string }> {
    return this.fetcher.request<{ success: boolean; message: string }>(
      `/v1/orders/${orderId}/complete-design-approval`,
      {
        method: "POST",
        data: {},
      }
    );
  }

  // Design approval token-based operations (no auth required)
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

  public async resendDesignApprovalEmail(
    designApprovalId: string
  ): Promise<DesignApprovalResendResponse> {
    return this.fetcher.request<DesignApprovalResendResponse>(
      `/v1/design-approvals/${designApprovalId}/resend`,
      {
        method: "POST",
        data: {},
      }
    );
  }

  public async getPaymentStatus(orderId: string): Promise<PaymentStatus> {
    return this.fetcher.request<PaymentStatus>(
      `/v1/orders/${orderId}/payment-status`
    );
  }

  public async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return this.fetcher.request<OrderItem[]>(`/v1/orders/${orderId}/items`);
  }

  public async getProductionRequirements(
    orderId: string
  ): Promise<ProductionRequirements> {
    return this.fetcher.request<ProductionRequirements>(
      `/v1/orders/${orderId}/production-requirements`
    );
  }

  public async calculateTimeline(
    orderId: string,
    startDate: string
  ): Promise<TimelineCalculation> {
    const queryParams = new URLSearchParams();
    queryParams.append("startDate", startDate);

    return this.fetcher.request<TimelineCalculation>(
      `/v1/orders/${orderId}/calculate-timeline?${queryParams.toString()}`,
      {
        method: "POST",
        data: {},
      }
    );
  }

  // Order Items operations
  public async updateOrderItemStatus(
    orderItemId: string,
    values: UpdateOrderItemStatusDto
  ): Promise<void> {
    return this.fetcher.request<void>(`/v1/order-items/${orderItemId}/status`, {
      method: "PATCH",
      data: values,
    });
  }

  public async bulkUpdateOrderItemStatus(
    values: BulkUpdateOrderItemStatusDto
  ): Promise<void> {
    return this.fetcher.request<void>("/v1/order-items/bulk-update-status", {
      method: "POST",
      data: values,
    });
  }

  // Updated to use productId instead of templateId
  public async getOrderItemsByStatus(
    status: string,
    productId: string
  ): Promise<OrderItem[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("productId", productId);

    return this.fetcher.request<OrderItem[]>(
      `/v1/order-items/by-status/${status}?${queryParams.toString()}`
    );
  }
}
