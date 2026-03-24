// app/services/ingresso.ts

import type { ApiOpts, ListParams } from "@/shared/http";
import type {
  Ingresso,
  CreateIngressoDTO,
  UpdateIngressoDTO,
} from "@/types/ingresso";
import type { PaginatedResponse } from "@/types/common";

export interface IngressoListParams extends ListParams {
  barcode?: string;
  tipo_ingresso?: string;
  status?: string;
  setores_fk?: number | string;
  evento_fk?: number | string;
  enviado_acesso?: boolean;
}

export const useIngressoService = () => {
  const { $api } = useNuxtApp();
  const base = "ingressos";

  const list = (
    params?: IngressoListParams,
    opts?: ApiOpts,
  ): Promise<PaginatedResponse<Ingresso>> =>
    $api<PaginatedResponse<Ingresso>>(base, { query: params, ...opts });

  const get = (id: number | string, opts?: ApiOpts) =>
    $api<Ingresso>(`${base}/${id}`, { ...opts });

  const create = (payload: CreateIngressoDTO, opts?: ApiOpts) =>
    $api<Ingresso>(base, { method: "POST", body: payload, ...opts });

  const update = (
    id: number | string,
    payload: UpdateIngressoDTO,
    opts?: ApiOpts,
  ) =>
    $api<Ingresso>(`${base}/${id}`, { method: "PUT", body: payload, ...opts });

  const remove = (id: number | string, opts?: ApiOpts) =>
    $api<void>(`${base}/${id}`, { method: "DELETE", ...opts });

  return { list, get, create, update, remove };
};
