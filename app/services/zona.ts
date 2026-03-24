// app/services/zona.ts

import type { ApiOpts, ListParams } from "@/shared/http";
import type { Zona } from "@/types/zona";
import type { PaginatedResponse } from "@/types/common";

export interface ZonaListParams extends ListParams {
  search?: string;
}

export const useZonaService = () => {
  const { $api } = useNuxtApp();
  const base = "zonas";

  const list = async (
    params?: ZonaListParams,
    opts?: ApiOpts,
  ): Promise<PaginatedResponse<Zona>> => {
    const raw = await $api<PaginatedResponse<Zona>>(base, {
      query: params,
      ...opts,
    });
    return raw;
  };

  const all = async (opts?: ApiOpts): Promise<Zona[]> => {
    const raw = await list({ per_page: 100 }, opts);
    return raw.data;
  };

  return { list, all };
};
