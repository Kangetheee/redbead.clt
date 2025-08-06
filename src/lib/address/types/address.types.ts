export interface AddressResponse {
  id: string;
  name: string;
  email?: string;
  recipientName: string;
  companyName: string | null;
  street: string;
  street2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  phone: string | null;
  addressType: "SHIPPING" | "BILLING" | "BOTH";
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  formattedAddress: string;
}

export type AddressType = "SHIPPING" | "BILLING" | "BOTH";
