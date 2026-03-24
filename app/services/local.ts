// app/services/local.ts

import type { ApiOpts, ListParams } from "@/shared/http";
import type { Local } from "@/types/local";
import type { PaginatedResponse } from "@/types/common";

export interface LocalListParams extends ListParams {
  nome?: string;
}

export const useLocalService = () => {
  const { $api } = useNuxtApp();
  const base = "locais";

  const list = (
    params?: LocalListParams,
    opts?: ApiOpts,
  ): Promise<PaginatedResponse<Local>> =>
    $api<PaginatedResponse<Local>>(base, { query: params, ...opts });

  const get = (id: number | string, opts?: ApiOpts) =>
    $api<Local>(`${base}/${id}`, { ...opts });

  return { list, get };
};
