export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface PaginatedFaqsResponse {
  data: Faq[];
  meta: {
    total: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface FaqsQueryParams {
  page?: number;
  limit?: number;
}
