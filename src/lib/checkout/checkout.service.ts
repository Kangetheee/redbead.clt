import { Fetcher } from "../api/api.service";
import {
  InitCheckoutDto,
  ShippingCalculationDto,
  ValidateCheckoutDto,
  CompleteCheckoutDto,
} from "./dto/checkout.dto";
import {
  CheckoutSession,
  ShippingOptionsResponse,
  CheckoutValidation,
  CheckoutResponse,
  OrderConfirmation,
} from "./types/checkout.types";

export class CheckoutService {
  constructor(private fetcher = new Fetcher()) {}

  public async initializeCheckout(values: InitCheckoutDto) {
    return this.fetcher.request<CheckoutSession>("/v1/checkout/init", {
      method: "POST",
      data: values,
    });
  }

  public async calculateShipping(values: ShippingCalculationDto) {
    return this.fetcher.request<ShippingOptionsResponse>(
      "/v1/checkout/shipping",
      {
        method: "POST",
        data: values,
      }
    );
  }

  public async validateCheckout(values: ValidateCheckoutDto) {
    return this.fetcher.request<CheckoutValidation>("/v1/checkout/validate", {
      method: "POST",
      data: values,
    });
  }

  public async completeCheckout(values: CompleteCheckoutDto) {
    return this.fetcher.request<CheckoutResponse>("/v1/checkout/complete", {
      method: "POST",
      data: values,
    });
  }

  public async getCheckoutSession(sessionId: string) {
    return this.fetcher.request<CheckoutSession>(
      `/v1/checkout/session/${sessionId}`,
      {},
      { auth: false } // No auth required for session retrieval
    );
  }

  public async getOrderConfirmation(orderId: string) {
    return this.fetcher.request<OrderConfirmation>(
      `/v1/checkout/confirmation/${orderId}`,
      {},
      { auth: false }
    );
  }
}
