// app/services/evento-setor-acesso.ts
// API nested resource: /eventos/{evento}/setores/{setor}/acessos

import type { ApiOpts, ListParams } from "@/shared/http";
import type { LocalAcesso } from "@/types/local-acesso";
import type { PaginatedResponse } from "@/types/common";

export interface EventoSetorAcessoListParams extends ListParams {
  per_page?: number;
}

export const useEventoSetorAcessoService = () => {
  const { $api } = useNuxtApp();
  const base = (eventoId: number | string, setorId: number | string) =>
    `eventos/${eventoId}/setores/${setorId}/acessos`;

  const list = (
    eventoId: number | string,
    setorId: number | string,
    params?: EventoSetorAcessoListParams,
    opts?: ApiOpts,
  ): Promise<PaginatedResponse<LocalAcesso>> =>
    $api<PaginatedResponse<LocalAcesso>>(base(eventoId, setorId), {
      query: params,
      ...opts,
    });

  const store = (
    eventoId: number | string,
    setorId: number | string,
    payload: { local_acesso_id: number },
    opts?: ApiOpts,
  ): Promise<LocalAcesso> =>
    $api<LocalAcesso>(base(eventoId, setorId), {
      method: "POST",
      body: payload,
      ...opts,
    });

  const get = (
    eventoId: number | string,
    setorId: number | string,
    acessoId: number | string,
    opts?: ApiOpts,
  ): Promise<LocalAcesso> =>
    $api<LocalAcesso>(`${base(eventoId, setorId)}/${acessoId}`, {
      ...opts,
    });

  const update = (
    eventoId: number | string,
    setorId: number | string,
    acessoId: number | string,
    opts?: ApiOpts,
  ): Promise<LocalAcesso> =>
    $api<LocalAcesso>(`${base(eventoId, setorId)}/${acessoId}`, {
      method: "PUT",
      ...opts,
    });

  const remove = (
    eventoId: number | string,
    setorId: number | string,
    acessoId: number | string,
    opts?: ApiOpts,
  ): Promise<void> =>
    $api<void>(`${base(eventoId, setorId)}/${acessoId}`, {
      method: "DELETE",
      ...opts,
    });

  return {
    list,
    store,
    get,
    update,
    remove,
  };
};

