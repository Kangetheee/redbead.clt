export interface ShippingZoneResponse {
  id: string;
  name: string;
  countries: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingRateResponse {
  id: string;
  name: string;
  description: string;
  baseRate: number;
  perKgRate: number;
  minWeight?: number | null;
  maxWeight?: number | null;
  minOrderValue?: number | null;
  maxOrderValue?: number | null;
  freeShippingThreshold?: number | null;
  estimatedDays: string;
  sortOrder: number;
  isActive: boolean;
  zoneId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  name: string;
  recipientName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  type: "SHIPPING" | "BILLING" | "BOTH";
}

export interface ShippingOptionResponse {
  id: string;
  name: string;
  description: string;
  cost: number;
  originalCost: number;
  isFree: boolean;
  estimatedDays: string;
  urgencyMultiplier: number;
  zone: {
    id: string;
    name: string;
  };
}

export interface ShippingCalculationRequest {
  sessionId: string;
  shippingAddress: ShippingAddress;
}

// API-specific pagination response structure
export interface PaginatedShippingResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    lastPage: number;
  };
  links: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
}

export type PaginatedZonesResponse =
  PaginatedShippingResponse<ShippingZoneResponse>;
export type PaginatedRatesResponse =
  PaginatedShippingResponse<ShippingRateResponse>;
