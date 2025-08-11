import { Fetcher } from "../api/api.service";
import {
  InitiatePaymentDto,
  RefundRequestDto,
  CreatePaymentDto,
  ListPaymentsDto,
} from "./dto/payments.dto";
import {
  PaymentMethod,
  PaymentDetails,
  PaymentInitiationResponse,
  PaymentStatus,
  RefundResponse,
  PaymentListResponse,
  PaymentSummary,
} from "./types/payments.types";

export class PaymentsService {
  constructor(private fetcher = new Fetcher()) {}

  /**
   * Get list of payments with pagination and filtering
   * GET /v1/payments
   */
  public async listPayments(
    params?: ListPaymentsDto
  ): Promise<PaymentListResponse> {
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
    if (params?.method) {
      queryParams.append("method", params.method);
    }
    if (params?.orderId) {
      queryParams.append("orderId", params.orderId);
    }

    const queryString = queryParams.toString();
    const url = `/v1/payments${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<PaymentListResponse>(url);
  }

  /**
   * Create a new payment record
   * POST /v1/payments
   */
  public async createPayment(data: CreatePaymentDto): Promise<PaymentDetails> {
    return this.fetcher.request<PaymentDetails>("/v1/payments", {
      method: "POST",
      data,
    });
  }

  /**
   * Get payment summary statistics
   * GET /v1/payments/summary
   */
  public async getPaymentSummary(orderId?: string): Promise<PaymentSummary> {
    const queryParams = new URLSearchParams();
    if (orderId) {
      queryParams.append("orderId", orderId);
    }

    const queryString = queryParams.toString();
    const url = `/v1/payments/summary${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<PaymentSummary>(url);
  }

  /**
   * Get available payment methods
   * GET /v1/payments/methods
   */
  public async getPaymentMethods(): Promise<PaymentMethod[]> {
    return this.fetcher.request<PaymentMethod[]>("/v1/payments/methods");
  }

  /**
   * Get payment by ID
   * GET /v1/payments/{id}
   */
  public async getPaymentById(id: string): Promise<PaymentDetails> {
    return this.fetcher.request<PaymentDetails>(`/v1/payments/${id}`);
  }

  /**
   * Initiate payment for an order
   * POST /v1/payments/initiate/{orderId}
   */
  public async initiatePayment(
    orderId: string,
    values?: InitiatePaymentDto
  ): Promise<PaymentInitiationResponse> {
    return this.fetcher.request<PaymentInitiationResponse>(
      `/v1/payments/initiate/${orderId}`,
      {
        method: "POST",
        data: values || {},
      }
    );
  }

  /**
   * Query payment status for an order
   * GET /v1/payments/status/{orderId}
   */
  public async getPaymentStatus(orderId: string): Promise<PaymentStatus> {
    return this.fetcher.request<PaymentStatus>(
      `/v1/payments/status/${orderId}`
    );
  }

  /**
   * Get payment details for an order
   * GET /v1/payments/order/{orderId}
   */
  public async getPaymentDetails(orderId: string): Promise<PaymentDetails> {
    return this.fetcher.request<PaymentDetails>(
      `/v1/payments/order/${orderId}`
    );
  }

  /**
   * Initiate refund for an order
   * POST /v1/payments/refund/{orderId}
   */
  public async initiateRefund(
    orderId: string,
    values: RefundRequestDto
  ): Promise<RefundResponse> {
    return this.fetcher.request<RefundResponse>(
      `/v1/payments/refund/${orderId}`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  /**
   * Handle Sqrool payment callback
   * POST /v1/payments/callbacks/sqrool
   */
  public async handleSqroolCallback(callbackData: object): Promise<void> {
    return this.fetcher.request<void>("/v1/payments/callbacks/sqrool", {
      method: "POST",
      data: callbackData,
    });
  }
}
