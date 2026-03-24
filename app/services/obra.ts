// app/services/obra.ts

import type { ApiOpts, ListParams } from "@/shared/http";
import type { Obra, CreateObraDTO, UpdateObraDTO } from "@/types/obra";
import type { PaginatedResponse } from "@/types/common";

export interface ObraListParams extends ListParams {
  id_cliente?: number | string;
  numero?: string;
  marca?: string;
  search?: string;
  zona?: number | string;
}

export const useObraService = () => {
  const { $api } = useNuxtApp();
  const base = "obras";

  const list = async (
    params: ObraListParams,
    opts?: ApiOpts,
  ): Promise<PaginatedResponse<Obra>> => {
    const raw = await $api<PaginatedResponse<Obra>>(base, {
      query: params,
      ...opts,
    });
    return raw;
  };

  const get = (id: number | string, opts?: ApiOpts) =>
    $api<Obra>(`${base}/${id}`, { ...opts });

  const create = (payload: CreateObraDTO, opts?: ApiOpts): Promise<Obra> => {
    return $api<Obra>(base, {
      method: "POST" as const,
      body: payload,
      ...opts,
    });
  };

  const update = (
    id: number | string,
    payload: UpdateObraDTO,
    opts?: ApiOpts,
  ) =>
    $api<Obra>(`${base}/${id}`, {
      method: "PUT" as const,
      body: payload,
      ...opts,
    });

  const remove = (id: number | string, opts?: ApiOpts) =>
    $api<void>(`${base}/${id}`, {
      method: "DELETE" as const,
      ...opts,
    });

  return { list, get, create, update, remove };
};
