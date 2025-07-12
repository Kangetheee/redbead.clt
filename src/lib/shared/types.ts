export type Meta = {
  pageCount: number;
  pageSize: number;
  pageIndex: number;
};

export type PaginatedData<T> = {
  meta: Meta;
  results: T[];
};

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
