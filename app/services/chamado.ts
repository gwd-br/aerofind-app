import type { ApiOpts, ListParams } from "@/shared/http";
import type { Chamado } from "@/types/chamado";
import type { PaginatedResponse } from "@/types/common";

export interface ChamadoListParams extends ListParams {
  id_cliente?: number | string;
  tipo?: string;
  situacao?: number | string;
  data_inicial?: string;
  data_final?: string;
  /** Filtro por data de conclusão/execução (intervalo) */
  data_conclusao_inicial?: string;
  data_conclusao_final?: string;
  /** Zona (id ou lista separada por vírgula) */
  zona?: number | string;
  /** Número do ASP (id do orçamento vinculado ao chamado) */
  nrasp?: number | string;
}

/** Resposta do endpoint chamados/group-by/clientes */
export interface ChamadoGroupByClienteItem {
  id_cliente: number;
  /** Nome do cliente */
  cliente_nome: string;
  /** Nome da zona do cliente (quando retornado pelo backend) */
  nmzona?: string | null;
  /** Quantidade total de chamados no período/filtros */
  quantidade_chamados: number;
}

export interface ChamadoGroupByClientesParams {
  data_inicial?: string;
  data_final?: string;
  tipo?: string;
  situacao?: number | string;
  /** Filtro por data de conclusão/execução (intervalo) */
  data_conclusao_inicial?: string;
  data_conclusao_final?: string;
  /** Zona (id ou lista separada por vírgula) */
  zona?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export const useChamadoService = () => {
  const { $api } = useNuxtApp();
  const base = "chamados";

  const list = async (
    params: ChamadoListParams,
    opts?: ApiOpts
  ): Promise<PaginatedResponse<Chamado>> => {
    const raw = await $api<PaginatedResponse<Chamado>>(base, {
      query: params,
      ...opts,
    });
    return raw;
  };

  const get = (id: number | string, opts?: ApiOpts) =>
    $api<Chamado>(`${base}/${id}`, { ...opts });

  const groupByClientes = async (
    params?: ChamadoGroupByClientesParams,
    opts?: ApiOpts
  ): Promise<ChamadoGroupByClienteItem[]> => {
    const raw = await $api<ChamadoGroupByClienteItem[]>(`${base}/group-by/clientes`, {
      query: params,
      ...opts,
    });
    return raw ?? [];
  };

  return { list, get, groupByClientes };
};
