export interface CustomizationValue {
  id: string;
  value: string;
  displayName: string;
  priceAdjustment: number;
  hexColor?: string;
  imageUrl?: string;
}

export interface CustomizationOption {
  id: string;
  name: string;
  displayName: string;
  type: string;
  required: boolean;
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
  basePrice: number;
  thumbnailImage?: string;
  stock: number;
  minOrderQuantity: number;
  maxOrderQuantity: number;
}

export interface CartDesign {
  id: string;
  name: string;
  preview: string;
}

export interface CartItemResponse {
  id: string;
  productId: string;
  quantity: number;
  customizations: CartItemCustomization[];
  designId?: string;
  product: CartProduct;
  design?: CartDesign;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  customizationAdjustments: number;
  total: number;
}

export interface CartResponse {
  items: CartItemResponse[];
  summary: CartSummary;
}

export interface CustomizationChoice {
  optionId: string;
  valueId: string;
  customValue?: string;
}
