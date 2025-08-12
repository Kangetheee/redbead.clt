export interface AddressResponse {
  id: string;
  name: string;
  type: string;
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
  addressType: AddressType;
  isDefault: boolean;
  createdAt: string;
  updatedAt?: string;
  formattedAddress: string;
}

export type AddressType = "SHIPPING" | "BILLING" | "BOTH";

export interface PaginatedAddressesResponse {
  items: AddressResponse[];
  meta: {
    pageCount: number;
    pageSize: number;
    currentPage: number;
    pageIndex: number;
    itemCount: number;
  };
}
