import { Fetcher } from "../api/api.service";
import {
  CreateShippingZoneDto,
  UpdateShippingZoneDto,
  CreateShippingRateDto,
  UpdateShippingRateDto,
  ShippingCalculationDto,
} from "./dto/shipping.dto";
import {
  ShippingZone,
  ShippingRate,
  ShippingOption,
} from "./types/shipping.types";

export class ShippingService {
  constructor(private fetcher = new Fetcher()) {}

  // Zone operations
  public async getZones() {
    return this.fetcher.request<ShippingZone[]>("/v1/shipping/zones");
  }

  public async createZone(values: CreateShippingZoneDto) {
    return this.fetcher.request<ShippingZone>("/v1/shipping/zones", {
      method: "POST",
      data: values,
    });
  }

  public async updateZone(zoneId: string, values: UpdateShippingZoneDto) {
    return this.fetcher.request<ShippingZone>(`/v1/shipping/zones/${zoneId}`, {
      method: "PATCH",
      data: values,
    });
  }

  public async deleteZone(zoneId: string) {
    return this.fetcher.request<void>(`/v1/shipping/zones/${zoneId}`, {
      method: "DELETE",
    });
  }

  // Rate operations
  public async getZoneRates(zoneId: string) {
    return this.fetcher.request<ShippingRate[]>(
      `/v1/shipping/zones/${zoneId}/rates`
    );
  }

  public async createRate(zoneId: string, values: CreateShippingRateDto) {
    return this.fetcher.request<ShippingRate>(
      `/v1/shipping/zones/${zoneId}/rates`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  public async updateRate(rateId: string, values: UpdateShippingRateDto) {
    return this.fetcher.request<ShippingRate>(`/v1/shipping/rates/${rateId}`, {
      method: "PATCH",
      data: values,
    });
  }

  public async deleteRate(rateId: string) {
    return this.fetcher.request<void>(`/v1/shipping/rates/${rateId}`, {
      method: "DELETE",
    });
  }

  // Calculation
  public async calculateShipping(values: ShippingCalculationDto) {
    return this.fetcher.request<ShippingOption[]>("/v1/shipping/calculate", {
      method: "POST",
      data: values,
    });
  }
}
