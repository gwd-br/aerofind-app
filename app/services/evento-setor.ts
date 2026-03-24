// app/services/evento-setor.ts
// API nested resource: /eventos/{evento}/setores

import type { ApiOpts, ListParams } from "@/shared/http";
import type { Setor, CreateSetorDTO, UpdateSetorDTO } from "@/types/setor";
import type { PaginatedResponse } from "@/types/common";

export interface EventoSetorListParams extends ListParams {
  nome_setor?: string;
  categoria?: string;
  facial?: boolean;
}

export const useEventoSetorService = () => {
  const { $api } = useNuxtApp();
  const base = (eventoId: number | string) => `eventos/${eventoId}/setores`;

  const list = (
    eventoId: number | string,
    params?: EventoSetorListParams,
    opts?: ApiOpts,
  ): Promise<PaginatedResponse<Setor>> =>
    $api<PaginatedResponse<Setor>>(base(eventoId), { query: params, ...opts });

  const get = (eventoId: number | string, setorId: number | string, opts?: ApiOpts) =>
    $api<Setor>(`${base(eventoId)}/${setorId}`, { ...opts });

  const create = (
    eventoId: number | string,
    payload: Omit<CreateSetorDTO, "eventos_fk">,
    opts?: ApiOpts,
  ) =>
    $api<Setor>(base(eventoId), {
      method: "POST",
      body: payload,
      ...opts,
    });

  const update = (
    eventoId: number | string,
    setorId: number | string,
    payload: UpdateSetorDTO,
    opts?: ApiOpts,
  ) =>
    $api<Setor>(`${base(eventoId)}/${setorId}`, {
      method: "PUT",
      body: payload,
      ...opts,
    });

  const remove = (eventoId: number | string, setorId: number | string, opts?: ApiOpts) =>
    $api<void>(`${base(eventoId)}/${setorId}`, {
      method: "DELETE",
      ...opts,
    });

  return {
    list,
    get,
    create,
    update,
    remove,
  };
};

