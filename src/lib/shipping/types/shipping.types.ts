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
  freeShippingThreshold?: number;
  estimatedDays: string;
  minWeight?: number | null;
  maxWeight?: number | null;
  minOrderValue?: number | null;
  maxOrderValue?: number | null;
  sortOrder: number;
  isActive: boolean;
  zoneId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  recipientName: string;
  companyName?: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
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
  urgencyLevel: "LOW" | "NORMAL" | "HIGH" | "URGENT";
}

export interface ShippingZoneFilters {
  page?: number;
  limit?: number;
}

export interface ShippingRateFilters {
  page?: number;
  limit?: number;
}
