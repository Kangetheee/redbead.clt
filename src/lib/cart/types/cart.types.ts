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
  option: {
    id: string;
    name: string;
    displayName: string;
    type: string;
  };
}

export interface CustomizationOption {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  type: "DROPDOWN" | "TEXT" | "COLOR" | "IMAGE";
  required: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  values: CustomizationValue[];
  templates: {
    id: string;
    name: string;
    slug: string;
    required: boolean;
    sortOrder: number;
    isActive: boolean;
  }[];
  templateSettings: {
    required: boolean;
    sortOrder: number;
    isActive: boolean;
  };
}

export interface CartItemCustomization {
  optionId: string;
  valueId: string;
  customValue?: string;
  option: CustomizationOption;
  value: CustomizationValue;
}

export interface CartProduct {
  id: string;
  name: string;
  type: string;
  material: string;
  thumbnailImage?: string;
}

export interface CartTemplate {
  id: string;
  name: string;
  basePrice: number;
  previewImage: string;
  stock: number;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  product: CartProduct;
}

export interface CartSizeVariant {
  id: string;
  name: string;
  displayName: string;
  dimensions: {
    width: number;
    height: number;
    unit: string;
  };
  price: number;
  description: string;
}

export interface CartDesign {
  id: string;
  name: string;
  preview: string;
}

export interface CartItemResponse {
  id: string;
  templateId: string;
  sizeVariantId: string;
  quantity: number;
  customizations: CartItemCustomization[];
  designId?: string;
  template: CartTemplate;
  sizeVariant: CartSizeVariant;
  design?: CartDesign;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomizationChoice {
  optionId: string;
  valueId: string;
  customValue?: string;
}
