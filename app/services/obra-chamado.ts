// app/services/obra-chamado.ts

import type { ApiOpts, ListParams } from "@/shared/http";
import type {
  ObraChamadosCountResponse,
  ObraChamado,
  ObraChamadosEstatisticas,
} from "@/types/obra-chamado";
import type { PaginatedResponse } from "@/types/common";

export interface ObraChamadoListParams extends ListParams {
  tipo?: string;
  situacao?: number | string;
  data_inicio?: string;
  data_fim?: string;
}

export interface ObraChamadoCountParams {
  data_inicial?: string;
  data_final?: string;
  tipo?: string;
}

export const useObraChamadoService = () => {
  const { $api } = useNuxtApp();

  /**
   * Retorna a contagem de chamados para uma obra
   * @param params.data_inicial - Data inicial no formato YYYY-MM-DD
   * @param params.data_final - Data final no formato YYYY-MM-DD
   */
  const count = (
    obraId: number | string,
    params?: ObraChamadoCountParams,
    opts?: ApiOpts,
  ) =>
    $api<ObraChamadosCountResponse>(`obras/${obraId}/chamados/count`, {
      query: params,
      ...opts,
    });

  /**
   * Lista os chamados de uma obra com paginação
   */
  const list = async (
    obraId: number | string,
    params: ObraChamadoListParams,
    opts?: ApiOpts,
  ): Promise<PaginatedResponse<ObraChamado>> => {
    const raw = await $api<PaginatedResponse<ObraChamado>>(
      `obras/${obraId}/chamados`,
      {
        query: params,
        ...opts,
      },
    );
    return raw;
  };

  /**
   * Retorna estatísticas resumidas dos chamados de uma obra
   */
  const estatisticas = (obraId: number | string, opts?: ApiOpts) =>
    $api<ObraChamadosEstatisticas>(`obras/${obraId}/chamados/estatisticas`, {
      ...opts,
    });

  return { count, list, estatisticas };
};
