// app/services/rota.ts

import type { ApiOpts, ListParams } from "@/shared/http";
import type {
  Rota,
  RotaStats,
  RotaChamadosSituacaoPorMesResponse,
} from "@/types/rota";
import type { PaginatedResponse } from "@/types/common";

export interface RotaListParams extends ListParams {
  search?: string;
}

export interface RotaChamadosSituacaoPorMesParams {
  data_inicio?: string;
  data_fim?: string;
}

export interface RotaGerarPayload {
  mes: string;
  ano: string;
}

export const useRotaService = () => {
  const { $api } = useNuxtApp();
  const base = "rotas";

  const list = async (
    params: RotaListParams,
    opts?: ApiOpts
  ): Promise<PaginatedResponse<Rota>> => {
    const raw = await $api<PaginatedResponse<Rota>>(base, {
      query: params,
      ...opts,
    });
    return raw;
  };

  const get = (id: number | string, opts?: ApiOpts) =>
    $api<Rota>(`${base}/${id}`, { ...opts });

  /** Estatísticas da rota: contagens e resumos por dia (GET /rotas/:id/stats) */
  const getStats = (id: number | string, opts?: ApiOpts) =>
    $api<RotaStats>(`${base}/${id}/stats`, { ...opts });

  const chamadosSituacaoPorMes = (
    rotaId: number | string,
    params?: RotaChamadosSituacaoPorMesParams,
    opts?: ApiOpts
  ) =>
    $api<RotaChamadosSituacaoPorMesResponse>(
      `${base}/${rotaId}/chamados/situacao-por-mes`,
      { query: params, ...opts }
    );

  const gerar = (
    rotaId: number | string,
    payload: RotaGerarPayload,
    opts?: ApiOpts
  ) =>
    $api<void>(`${base}/${rotaId}/gerar`, {
      method: "POST",
      body: payload,
      ...opts,
    });

  return { list, get, getStats, chamadosSituacaoPorMes, gerar };
};
