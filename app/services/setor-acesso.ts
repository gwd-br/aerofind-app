// app/services/setor-acesso.ts
// API: GET/POST /setores/{setor}/acessos, DELETE /setores/{setor}/acessos/{acesso}

import type { ApiOpts, ListParams } from "@/shared/http";
import type { LocalAcesso } from "@/types/local-acesso";
import type { PaginatedResponse } from "@/types/common";

export interface SetorAcessoListParams extends ListParams {
  per_page?: number;
}

export const useSetorAcessoService = () => {
  const { $api } = useNuxtApp();
  const base = (setorId: number | string) => `setores/${setorId}/acessos`;

  const list = (
    setorId: number | string,
    params?: SetorAcessoListParams,
    opts?: ApiOpts,
  ): Promise<PaginatedResponse<LocalAcesso>> =>
    $api<PaginatedResponse<LocalAcesso>>(base(setorId), { query: params, ...opts });

  const store = (
    setorId: number | string,
    payload: { local_acesso_id: number },
    opts?: ApiOpts,
  ): Promise<LocalAcesso> =>
    $api<LocalAcesso>(base(setorId), { method: "POST", body: payload, ...opts });

  const remove = (
    setorId: number | string,
    acessoId: number | string,
    opts?: ApiOpts,
  ): Promise<void> =>
    $api<void>(`${base(setorId)}/${acessoId}`, { method: "DELETE", ...opts });

  return { list, store, remove };
};
