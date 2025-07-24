import { Fetcher } from "../api/api.service";
import { InitiatePaymentDto, RefundRequestDto } from "./dto/payments.dto";
import {
  PaymentMethod,
  PaymentDetails,
  PaymentInitiationResponse,
  PaymentStatus,
  RefundResponse,
} from "./types/payments.types";

export class PaymentsService {
  constructor(private fetcher = new Fetcher()) {}

  public async getPaymentMethods(): Promise<PaymentMethod[]> {
    return this.fetcher.request<PaymentMethod[]>("/v1/payments/methods");
  }

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

  public async getPaymentStatus(orderId: string): Promise<PaymentStatus> {
    return this.fetcher.request<PaymentStatus>(
      `/v1/payments/status/${orderId}`
    );
  }

  public async getPaymentDetails(orderId: string): Promise<PaymentDetails> {
    return this.fetcher.request<PaymentDetails>(`/v1/payments/${orderId}`);
  }

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

  public async handleSqroolCallback(callbackData: object): Promise<void> {
    return this.fetcher.request<void>("/v1/payments/callbacks/sqrool", {
      method: "POST",
      data: callbackData,
    });
  }
}
