import type { ApiOpts, ListParams } from "@/shared/http";
import type { Mensagem, MensagemRefType } from "@/types/mensagem";
import type { PaginatedResponse } from "@/types/common";

export interface MensagemListParams extends ListParams {
  autor_id?: number | string;
  destino_id?: number | string;
  ref_id?: number | string;
  ref_type?: MensagemRefType;
  search?: string;
  data_inicio?: string;
  data_fim?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  show_ref?: MensagemRefType;
}

export interface CreateMensagemDTO {
  autor_id?: number | string;
  destino_id?: number | string;
  titulo?: string;
  mensagem?: string;
  data?: string;
  ref_id?: number | string;
  ref_type?: MensagemRefType;
}

export interface UpdateMensagemDTO extends Partial<CreateMensagemDTO> {}

export const useMensagemService = () => {
  const { $api } = useNuxtApp();
  const base = "mensagens";

  const list = async (
    params?: MensagemListParams,
    opts?: ApiOpts,
  ): Promise<PaginatedResponse<Mensagem>> => {
    const raw = await $api<PaginatedResponse<Mensagem>>(base, {
      query: params,
      ...opts,
    });
    return raw;
  };

  const get = (id: number | string, opts?: ApiOpts) =>
    $api<Mensagem>(`${base}/${id}`, { ...opts });

  const create = (
    payload: CreateMensagemDTO,
    opts?: ApiOpts,
  ): Promise<Mensagem> => {
    return $api<Mensagem>(base, {
      method: "POST" as const,
      body: payload,
      ...opts,
    });
  };

  const update = (
    id: number | string,
    payload: UpdateMensagemDTO,
    opts?: ApiOpts,
  ) =>
    $api<Mensagem>(`${base}/${id}`, {
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
