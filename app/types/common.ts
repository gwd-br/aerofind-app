/** Meta de paginação no formato Laravel (API) */
export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
};

export type PaginatedResponse<T> = PaginationMeta & {
  data: T[];
};
