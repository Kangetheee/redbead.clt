import { CustomizationOptionType } from "@/lib/customization/dto/options.dto";

// Base types
export interface CustomizationOption {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  type: CustomizationOptionType;
  required: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomizationValue {
  id: string;
  value: string;
  displayName: string;
  description?: string;
  imageUrl?: string;
  hexColor?: string;
  priceAdjustment: number;
  sortOrder: number;
  isActive: boolean;
  optionId: string;
  createdAt: string;
  updatedAt: string;
  option?: {
    id: string;
    name: string;
    displayName: string;
    type: CustomizationOptionType;
  };
}

export interface TemplateInfo {
  id: string;
  name: string;
  slug: string;
  required: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface TemplateSettings {
  required: boolean;
  sortOrder: number;
  isActive: boolean;
}

// Extended types with relationships
export interface CustomizationOptionDetail extends CustomizationOption {
  values?: CustomizationValue[];
  templates?: TemplateInfo[];
  templateSettings?: TemplateSettings;
}

// Statistics types
export interface OptionStats {
  optionId: string;
  count: number;
}

export interface CustomizationValueStats {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  optionStats: OptionStats[];
}

// Price adjustment types
export interface PriceAdjustmentBreakdown {
  valueId: string;
  displayName: string;
  priceAdjustment: number;
}

export interface PriceAdjustmentResult {
  totalAdjustment: number;
  breakdown: PriceAdjustmentBreakdown[];
}

// Validation types
export interface CustomizationValidationResult {
  isValid: boolean;
  errors: string[];
  priceAdjustment: number;
}

// Filter types
export interface CustomizationOptionFilters {
  search?: string;
  type?: CustomizationOptionType;
}

export interface CustomizationValueFilters {
  search?: string;
  optionId?: string;
  isActive?: boolean;
}
