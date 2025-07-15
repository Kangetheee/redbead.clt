import { CustomizationOptionType } from "@/lib/customization/dto/options.dto";

export interface CustomizationOption {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  type: CustomizationOptionType;
  required: boolean;
  sortOrder: number;
  categoryId: string;
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
}

export interface CustomizationOptionDetail extends CustomizationOption {
  values?: CustomizationValue[];
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface CustomizationOptionFilters {
  search?: string;
  type?: CustomizationOptionType;
}

export interface CustomizationValueFilters {
  search?: string;
  optionId?: string;
  isActive?: boolean;
}
