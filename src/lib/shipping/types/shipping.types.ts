export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingRate {
  id: string;
  name: string;
  description?: string;
  baseRate: number;
  perKgRate?: number;
  minWeight?: number;
  maxWeight?: number;
  minOrderValue?: number;
  maxOrderValue?: number;
  freeShippingThreshold?: number;
  estimatedDays?: string;
  sortOrder: number;
  isActive: boolean;
  zoneId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  description?: string;
  cost: number;
  originalCost: number;
  isFree: boolean;
  estimatedDays?: string;
  urgencyMultiplier: number;
  zone?: {
    id: string;
    name: string;
  };
}

export interface ShippingCalculationRequest {
  sessionId?: string;
  items?: Array<{
    productId: string;
    quantity: number;
    weight?: number;
  }>;
  shippingAddress: {
    recipientName: string;
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  urgencyLevel?: "NORMAL" | "EXPEDITED" | "RUSH" | "EMERGENCY";
  orderValue?: number;
  totalWeight?: number;
}
