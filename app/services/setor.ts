// app/services/setor.ts

import type { ApiOpts, ListParams } from "@/shared/http";
import type { Setor, CreateSetorDTO, UpdateSetorDTO } from "@/types/setor";
import type { PaginatedResponse } from "@/types/common";

export interface SetorListParams extends ListParams {
  nome_setor?: string;
  evento_id?: number | string;
  eventos_fk?: number | string;
  categoria?: string;
  facial?: boolean;
}

export const useSetorService = () => {
  const { $api } = useNuxtApp();
  const base = "setores";

  const list = (
    params?: SetorListParams,
    opts?: ApiOpts,
  ): Promise<PaginatedResponse<Setor>> =>
    $api<PaginatedResponse<Setor>>(base, { query: params, ...opts });

  const get = (id: number | string, opts?: ApiOpts) =>
    $api<Setor>(`${base}/${id}`, { ...opts });

  const create = (payload: CreateSetorDTO, opts?: ApiOpts) =>
    $api<Setor>(base, { method: "POST", body: payload, ...opts });

  const update = (
    id: number | string,
    payload: UpdateSetorDTO,
    opts?: ApiOpts,
  ) => $api<Setor>(`${base}/${id}`, { method: "PUT", body: payload, ...opts });

  const remove = (id: number | string, opts?: ApiOpts) =>
    $api<void>(`${base}/${id}`, { method: "DELETE", ...opts });

  return { list, get, create, update, remove };
};
