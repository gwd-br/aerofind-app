// app/services/evento.ts

import type { ApiOpts, ListParams } from "@/shared/http";
import type { Evento, UpdateEventoDTO, CreateEventoDTO } from "@/types/evento";
import type { PaginatedResponse } from "@/types/common";

export interface EventoListParams extends ListParams {
  nome_evento?: string;
  data_evento_de?: string;
  data_evento_ate?: string;
  nome_serie_evento?: string;
  nome_venue?: string;
  sync_active?: boolean;
}

export const useEventoService = () => {
  const { $api } = useNuxtApp();
  const base = "eventos";

  const list = (
    params?: EventoListParams,
    opts?: ApiOpts,
  ): Promise<PaginatedResponse<Evento>> =>
    $api<PaginatedResponse<Evento>>(base, { query: params, ...opts });

  const get = (id: number | string, opts?: ApiOpts) =>
    $api<Evento>(`${base}/${id}`, { ...opts });

  const create = (payload: CreateEventoDTO, opts?: ApiOpts) =>
    $api<Evento>(base, { method: "POST", body: payload, ...opts });

  const update = (
    id: number | string,
    payload: UpdateEventoDTO,
    opts?: ApiOpts,
  ) => $api<Evento>(`${base}/${id}`, { method: "PUT", body: payload, ...opts });

  const remove = (
    id: number | string,
    payload?: { password: string },
    opts?: ApiOpts,
  ) =>
    $api<void>(`${base}/${id}`, {
      method: "DELETE",
      ...(payload?.password && { body: { password: payload.password } }),
      ...opts,
    });

  return { list, get, create, update, remove };
};
