// app/services/orcamento.ts

import type { ApiOpts, ListParams } from "@/shared/http";
import type {
  Orcamento,
  CreateOrcamentoDTO,
  UpdateOrcamentoDTO,
} from "@/types/orcamento";
import type { Mensagem } from "@/types/mensagem";
import type { PaginatedResponse } from "@/types/common";

export interface OrcamentoListParams extends ListParams {
  id_cliente?: number | string;
  numero?: string;
  ano?: number;
  tipo?: string;
  status?: string;
  search?: string;
  data_inicio?: string;
  data_fim?: string;
  zona?: number | string;
  departamento?: string;
  dtdiretor_inicio?: string;
  dtdiretor_fim?: string;
  dtemissao_inicio?: string;
  dtemissao_fim?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  b_projeto_grande?: boolean | number;
}

/** Resposta do endpoint orcamentos/group-by/clientes */
export interface GroupByClienteItem {
  id_cliente: number;
  nmcliente: string;
  /** Nome da zona do cliente (quando retornado pelo backend) */
  nmzona?: string | null;
  vltotal: number;
  quantidade_orcamentos: number;
}

export interface GroupByClientesParams {
  zona?: string;
  departamento?: string;
  dtdiretor?: string;
  dtdiretor_inicio?: string;
  dtdiretor_fim?: string;
  dtemissao_inicio?: string;
  dtemissao_fim?: string;
  b_projeto_grande?: number | boolean;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export const useOrcamentoService = () => {
  const { $api } = useNuxtApp();
  const base = "orcamentos";

  const list = async (
    params?: OrcamentoListParams,
    opts?: ApiOpts,
  ): Promise<PaginatedResponse<Orcamento>> => {
    const raw = await $api<PaginatedResponse<Orcamento>>(base, {
      query: params,
      ...opts,
    });
    return raw;
  };

  const get = (id: number | string, opts?: ApiOpts) =>
    $api<Orcamento>(`${base}/${id}`, { ...opts });

  const create = (
    payload: CreateOrcamentoDTO,
    opts?: ApiOpts,
  ): Promise<Orcamento> => {
    return $api<Orcamento>(base, {
      method: "POST" as const,
      body: payload,
      ...opts,
    });
  };

  const update = (
    id: number | string,
    payload: UpdateOrcamentoDTO,
    opts?: ApiOpts,
  ) =>
    $api<Orcamento>(`${base}/${id}`, {
      method: "PUT" as const,
      body: payload,
      ...opts,
    });

  const remove = (id: number | string, opts?: ApiOpts) =>
    $api<void>(`${base}/${id}`, {
      method: "DELETE" as const,
      ...opts,
    });

  const mensagens = (id: number | string, opts?: ApiOpts) =>
    $api<Mensagem[]>(`${base}/${id}/mensagens`, { ...opts });

  const groupByClientes = async (
    params?: GroupByClientesParams,
    opts?: ApiOpts,
  ): Promise<GroupByClienteItem[]> => {
    const raw = await $api<GroupByClienteItem[]>(`${base}/group-by/clientes`, {
      query: params,
      ...opts,
    });
    return raw ?? [];
  };

  return { list, get, create, update, remove, mensagens, groupByClientes };
};
