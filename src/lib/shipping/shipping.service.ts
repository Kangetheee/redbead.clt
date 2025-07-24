import { Fetcher } from "../api/api.service";
import {
  CreateShippingZoneDto,
  CreateShippingRateDto,
  ShippingCalculationDto,
} from "./dto/shipping.dto";
import {
  ShippingZone,
  ShippingRate,
  ShippingOption,
} from "./types/shipping.types";

export class ShippingService {
  constructor(private fetcher = new Fetcher()) {}

  /**
   * Get all active shipping zones with their countries
   * GET /v1/shipping/zones
   */
  public async getZones(): Promise<ShippingZone[]> {
    return this.fetcher.request<ShippingZone[]>("/v1/shipping/zones");
  }

  /**
   * Create a new shipping zone with countries
   * POST /v1/shipping/zones
   */
  public async createZone(
    values: CreateShippingZoneDto
  ): Promise<ShippingZone> {
    return this.fetcher.request<ShippingZone>("/v1/shipping/zones", {
      method: "POST",
      data: values,
    });
  }

  /**
   * Get all shipping rates for a specific zone
   * GET /v1/shipping/zones/{id}/rates
   */
  public async getZoneRates(zoneId: string): Promise<ShippingRate[]> {
    return this.fetcher.request<ShippingRate[]>(
      `/v1/shipping/zones/${zoneId}/rates`
    );
  }

  /**
   * Create a new shipping rate for a specific zone
   * POST /v1/shipping/zones/{id}/rates
   */
  public async createRate(
    zoneId: string,
    values: CreateShippingRateDto
  ): Promise<ShippingRate> {
    return this.fetcher.request<ShippingRate>(
      `/v1/shipping/zones/${zoneId}/rates`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  /**
   * Calculate available shipping options and costs for a destination
   * POST /v1/shipping/calculate
   */
  public async calculateShipping(
    values: ShippingCalculationDto
  ): Promise<ShippingOption[]> {
    return this.fetcher.request<ShippingOption[]>("/v1/shipping/calculate", {
      method: "POST",
      data: values,
    });
  }
}
