import { Fetcher } from "../api/api.service";
import { PaginatedData } from "../shared/types";
import {
  GetOrdersDto,
  CreateOrderDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
  CreateOrderNoteDto,
  RequestDesignApprovalDto,
  UpdateDesignApprovalDto,
} from "./dto/orders.dto";
import { OrderResponse, OrderNote, DesignApproval } from "./types/orders.types";

export class OrderService {
  constructor(private fetcher = new Fetcher()) {}

  public async findAll(params?: GetOrdersDto) {
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
    if (params?.designApprovalStatus) {
      queryParams.append("designApprovalStatus", params.designApprovalStatus);
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
    if (params?.urgencyLevel) {
      queryParams.append("urgencyLevel", params.urgencyLevel);
    }

    const queryString = queryParams.toString();
    const url = `/v1/orders${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<PaginatedData<OrderResponse>>(url);
  }

  public async findById(orderId: string) {
    return this.fetcher.request<OrderResponse>(`/v1/orders/${orderId}`);
  }

  public async create(values: CreateOrderDto) {
    return this.fetcher.request<OrderResponse>("/v1/orders", {
      method: "POST",
      data: values,
    });
  }

  public async update(orderId: string, values: UpdateOrderDto) {
    return this.fetcher.request<OrderResponse>(`/v1/orders/${orderId}`, {
      method: "PATCH",
      data: values,
    });
  }

  public async updateStatus(orderId: string, values: UpdateOrderStatusDto) {
    return this.fetcher.request<OrderResponse>(`/v1/orders/${orderId}/status`, {
      method: "PATCH",
      data: values,
    });
  }

  public async getNotes(orderId: string) {
    return this.fetcher.request<OrderNote[]>(`/v1/orders/${orderId}/notes`);
  }

  public async addNote(orderId: string, values: CreateOrderNoteDto) {
    return this.fetcher.request<OrderNote>(`/v1/orders/${orderId}/notes`, {
      method: "POST",
      data: values,
    });
  }

  public async requestDesignApproval(
    orderId: string,
    values: RequestDesignApprovalDto
  ) {
    return this.fetcher.request<DesignApproval>(
      `/v1/orders/${orderId}/request-design-approval`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  public async getDesignApproval(orderId: string) {
    return this.fetcher.request<DesignApproval>(
      `/v1/orders/${orderId}/design-approval`
    );
  }

  public async updateDesignApproval(
    orderId: string,
    values: UpdateDesignApprovalDto
  ) {
    return this.fetcher.request<DesignApproval>(
      `/v1/orders/${orderId}/design-approval`,
      {
        method: "PATCH",
        data: values,
      }
    );
  }
}
