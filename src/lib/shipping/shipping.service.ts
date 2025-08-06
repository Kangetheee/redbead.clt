import { Fetcher } from "../api/api.service";
import { PaginatedData4 } from "../shared/types";
import {
  CreateShippingZoneDto,
  GetShippingZonesDto,
  CreateShippingRateDto,
  GetShippingRatesDto,
  CalculateShippingDto,
} from "./dto/shipping.dto";
import {
  ShippingZoneResponse,
  ShippingRateResponse,
  ShippingOptionResponse,
} from "./types/shipping.types";

export class ShippingService {
  constructor(private fetcher = new Fetcher()) {}

  /**
   * Get paginated list of shipping zones
   */
  public async findAllZones(
    params?: GetShippingZonesDto
  ): Promise<PaginatedData4<ShippingZoneResponse>> {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }

    const queryString = queryParams.toString();
    const url = `/v1/shipping/zones${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<PaginatedData4<ShippingZoneResponse>>(url, {});
  }

  /**
   * Create a new shipping zone (Admin only)
   */
  public async createZone(
    values: CreateShippingZoneDto
  ): Promise<ShippingZoneResponse> {
    return this.fetcher.request<ShippingZoneResponse>("/v1/shipping/zones", {
      method: "POST",
      data: values,
    }); // Requires authentication (default auth: true)
  }

  /**
   * Get shipping rates for a specific zone
   */
  public async findRatesByZone(
    zoneId: string,
    params?: GetShippingRatesDto
  ): Promise<PaginatedData4<ShippingRateResponse>> {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }

    const queryString = queryParams.toString();
    const url = `/v1/shipping/zones/${zoneId}/rates${
      queryString ? `?${queryString}` : ""
    }`;

    return this.fetcher.request<PaginatedData4<ShippingRateResponse>>(url, {});
  }

  /**
   * Create a new shipping rate for a specific zone (Admin only)
   */
  public async createRate(
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
   * Calculate shipping options and costs for a destination
   */
  public async calculateShipping(
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
