export enum ContactPreferenceEnum {
  CALL = "CALL",
  EMAIL = "EMAIL",
  SMS = "SMS",
}

export interface CreateInquiryDto {
  name: string;
  phone?: string;
  email?: string;
  subject: string;
  message: string;
  contactPreference?: ContactPreferenceEnum;
  bulkOrders?: boolean;
}

export interface InquiryDto {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  subject: string;
  message: string;
  contactPreference: ContactPreferenceEnum | null;
  bulkOrders: boolean | null;
  createdAt: string;
}

export interface CreateInquiryResponse {
  message: string;
}

export interface GetInquiriesParams {
  page?: number;
  limit?: number;
  email?: string;
  phone?: string;
  name?: string;
  subject?: string;
  contactPreference?: ContactPreferenceEnum;
  bulkOrders?: boolean;
}

export interface PaginationMeta {
  total: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedInquiriesResponse {
  results: InquiryDto[];
  meta: PaginationMeta;
}
