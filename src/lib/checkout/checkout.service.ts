import { Fetcher } from "../api/api.service";
import {
  InitCheckoutDto,
  GuestInitCheckoutDto,
  ShippingCalculationDto,
  ValidateCheckoutDto,
  CompleteCheckoutDto,
  GuestCompleteCheckoutDto,
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

  /**
   * Initialize checkout process from cart items (authenticated users)
   */
  public async initializeCheckout(
    values: InitCheckoutDto
  ): Promise<CheckoutSession> {
    return this.fetcher.request<CheckoutSession>("/v1/checkout/init", {
      method: "POST",
      data: values,
    });
  }

  /**
   * Initialize checkout for guest users with custom items
   */
  public async initializeGuestCheckout(
    values: GuestInitCheckoutDto
  ): Promise<CheckoutSession> {
    return this.fetcher.request<CheckoutSession>("/v1/checkout/guest/init", {
      method: "POST",
      data: values,
    });
  }

  /**
   * Calculate available shipping options and costs for checkout
   */
  public async calculateShipping(
    values: ShippingCalculationDto
  ): Promise<ShippingOptionsResponse> {
    return this.fetcher.request<ShippingOptionsResponse>(
      "/v1/checkout/shipping",
      {
        method: "POST",
        data: values,
      }
    );
  }

  /**
   * Validate all checkout information before completing the order
   */
  public async validateCheckout(
    values: ValidateCheckoutDto
  ): Promise<CheckoutValidation> {
    return this.fetcher.request<CheckoutValidation>("/v1/checkout/validate", {
      method: "POST",
      data: values,
    });
  }

  /**
   * Complete the checkout process and create the order (authenticated users)
   */
  public async completeCheckout(
    values: CompleteCheckoutDto
  ): Promise<CheckoutResponse> {
    return this.fetcher.request<CheckoutResponse>("/v1/checkout/complete", {
      method: "POST",
      data: values,
    });
  }

  /**
   * Complete the checkout process for guest users
   */
  public async completeGuestCheckout(
    values: GuestCompleteCheckoutDto
  ): Promise<CheckoutResponse> {
    return this.fetcher.request<CheckoutResponse>(
      "/v1/checkout/guest/complete",
      {
        method: "POST",
        data: values,
      }
    );
  }

  /**
   * Retrieve checkout session details (no authentication required)
   */
  public async getCheckoutSession(sessionId: string): Promise<CheckoutSession> {
    return this.fetcher.request<CheckoutSession>(
      `/v1/checkout/session/${sessionId}`
    );
  }

  /**
   * Get order confirmation details after successful checkout
   */
  public async getOrderConfirmation(
    orderId: string
  ): Promise<OrderConfirmation> {
    return this.fetcher.request<OrderConfirmation>(
      `/v1/checkout/confirmation/${orderId}`
    );
  }
}
