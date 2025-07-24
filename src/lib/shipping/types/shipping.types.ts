/* eslint-disable @typescript-eslint/no-explicit-any */

import { UrgencyLevel } from "../dto/shipping.dto";

/**
 * Shipping zone interface
 * From GET /v1/shipping/zones and POST /v1/shipping/zones
 */
export interface ShippingZone {
  id: string;
  name: string;
  countries: string[]; // Array of 2-letter country codes
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Shipping rate interface
 * From GET /v1/shipping/zones/{id}/rates and POST /v1/shipping/zones/{id}/rates
 */
export interface ShippingRate {
  id: string;
  name: string;
  description?: string;
  baseRate: number;
  perKgRate?: number;
  freeShippingThreshold?: number;
  estimatedDays?: string;
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

/**
 * Zone information in shipping options
 */
export interface ShippingZoneInfo {
  id: string;
  name: string;
}

/**
 * Shipping option from calculation
 * From POST /v1/shipping/calculate
 */
export interface ShippingOption {
  id: string;
  name: string;
  description?: string;
  cost: number;
  originalCost: number;
  isFree: boolean;
  estimatedDays?: string;
  urgencyMultiplier: number;
  zone: ShippingZoneInfo;
}

/**
 * Shipping address structure
 */
export interface ShippingAddress {
  recipientName: string;
  companyName?: string;
  street: string;
  street2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string; // 2-letter country code
  phone?: string;
}

/**
 * Shipping calculation request structure
 */
export interface ShippingCalculationRequest {
  sessionId?: string;
  shippingAddress: ShippingAddress;
  urgencyLevel: UrgencyLevel;
}

/**
 * Error response for shipping calculations
 */
export interface ShippingCalculationError {
  error: string;
  message: string;
  statusCode: number;
}

// Type guards for runtime type checking
export const isShippingZone = (obj: any): obj is ShippingZone => {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    Array.isArray(obj.countries) &&
    typeof obj.isActive === "boolean"
  );
};

export const isShippingRate = (obj: any): obj is ShippingRate => {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.baseRate === "number" &&
    typeof obj.zoneId === "string"
  );
};

export const isShippingOption = (obj: any): obj is ShippingOption => {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.cost === "number" &&
    typeof obj.originalCost === "number" &&
    typeof obj.isFree === "boolean" &&
    obj.zone &&
    typeof obj.zone.id === "string"
  );
};

// Utility types
export type ShippingZoneStatus = "active" | "inactive";
export type ShippingRateStatus = "active" | "inactive";
export type ShippingCalculationStatus =
  | "success"
  | "no_options"
  | "invalid_destination"
  | "error";
