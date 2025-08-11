import { Fetcher } from "../api/api.service";
import {
  CreateShippingZoneDto,
  UpdateShippingZoneDto,
  GetShippingZonesDto,
  CreateShippingRateDto,
  UpdateShippingRateDto,
  GetShippingRatesDto,
  CalculateShippingDto,
} from "./dto/shipping.dto";
import {
  ShippingZoneResponse,
  ShippingRateResponse,
  ShippingOptionResponse,
  PaginatedZonesResponse,
  PaginatedRatesResponse,
} from "./types/shipping.types";

export class ShippingService {
  constructor(private fetcher = new Fetcher()) {}

  // Shipping Zone Operations

  /**
   * Get paginated list of shipping zones
   * Uses GET /v1/shipping/zones
   */
  async findAllZones(
    params?: GetShippingZonesDto
  ): Promise<PaginatedZonesResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }

    const queryString = queryParams.toString();
    const url = `/v1/shipping/zones${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<PaginatedZonesResponse>(url, {
      method: "GET",
    });
  }

  /**
   * Get a specific shipping zone by ID
   * Uses GET /v1/shipping/zones/{id}
   */
  async findZoneById(zoneId: string): Promise<ShippingZoneResponse> {
    return this.fetcher.request<ShippingZoneResponse>(
      `/v1/shipping/zones/${zoneId}`,
      {
        method: "GET",
      }
    );
  }

  /**
   * Create a new shipping zone
   * Uses POST /v1/shipping/zones
   */
  async createZone(
    values: CreateShippingZoneDto
  ): Promise<ShippingZoneResponse> {
    return this.fetcher.request<ShippingZoneResponse>("/v1/shipping/zones", {
      method: "POST",
      data: values,
    });
  }

  /**
   * Update an existing shipping zone
   * Uses PUT /v1/shipping/zones/{id}
   */
  async updateZone(
    zoneId: string,
    values: UpdateShippingZoneDto
  ): Promise<ShippingZoneResponse> {
    return this.fetcher.request<ShippingZoneResponse>(
      `/v1/shipping/zones/${zoneId}`,
      {
        method: "PUT",
        data: values,
      }
    );
  }

  /**
   * Delete a shipping zone (soft delete)
   * Uses DELETE /v1/shipping/zones/{id}
   */
  async deleteZone(zoneId: string): Promise<void> {
    return this.fetcher.request<void>(`/v1/shipping/zones/${zoneId}`, {
      method: "DELETE",
    });
  }

  // Shipping Rate Operations

  /**
   * Get shipping rates for a specific zone
   * Uses GET /v1/shipping/zones/{id}/rates
   */
  async findRatesByZone(
    zoneId: string,
    params?: GetShippingRatesDto
  ): Promise<PaginatedRatesResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }

    const queryString = queryParams.toString();
    const url = `/v1/shipping/zones/${zoneId}/rates${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<PaginatedRatesResponse>(url, {
      method: "GET",
    });
  }

  /**
   * Get a specific shipping rate by ID
   * Uses GET /v1/shipping/rates/{id}
   */
  async findRateById(rateId: string): Promise<ShippingRateResponse> {
    return this.fetcher.request<ShippingRateResponse>(
      `/v1/shipping/rates/${rateId}`,
      {
        method: "GET",
      }
    );
  }

  /**
   * Create a new shipping rate for a specific zone
   * Uses POST /v1/shipping/zones/{id}/rates
   */
  async createRate(
    zoneId: string,
    values: CreateShippingRateDto
  ): Promise<ShippingRateResponse> {
    return this.fetcher.request<ShippingRateResponse>(
      `/v1/shipping/zones/${zoneId}/rates`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  /**
   * Update an existing shipping rate
   * Uses PUT /v1/shipping/rates/{id}
   */
  async updateRate(
    rateId: string,
    values: UpdateShippingRateDto
  ): Promise<ShippingRateResponse> {
    return this.fetcher.request<ShippingRateResponse>(
      `/v1/shipping/rates/${rateId}`,
      {
        method: "PUT",
        data: values,
      }
    );
  }

  /**
   * Delete a shipping rate (soft delete)
   * Uses DELETE /v1/shipping/rates/{id}
   */
  async deleteRate(rateId: string): Promise<void> {
    return this.fetcher.request<void>(`/v1/shipping/rates/${rateId}`, {
      method: "DELETE",
    });
  }

  // Shipping Calculation

  /**
   * Calculate shipping options and costs for a destination
   * Uses POST /v1/shipping/calculate
   */
  async calculateShipping(
    values: CalculateShippingDto
  ): Promise<ShippingOptionResponse[]> {
    return this.fetcher.request<ShippingOptionResponse[]>(
      "/v1/shipping/calculate",
      {
        method: "POST",
        data: values,
      }
    );
  }
}
