// app/services/local-acesso.ts
// Lista locais de acesso do local configurado no evento (GET /locais/{local_id}/acessos).

import type { ApiOpts, ListParams } from "@/shared/http";
import type { LocalAcesso } from "@/types/local-acesso";
import type { PaginatedResponse } from "@/types/common";

export interface LocalAcessoListParams extends ListParams {}

export const useLocalAcessoService = () => {
  const { $api } = useNuxtApp();
  const base = "locais";

  /**
   * Lista os locais de acesso do local (rota locais.acessos).
   * Use o id_local do evento para obter os acessos do local configurado no evento.
   */
  const listByLocal = (
    localId: number | string,
    params?: { per_page?: number },
    opts?: ApiOpts,
  ): Promise<PaginatedResponse<LocalAcesso>> =>
    $api<PaginatedResponse<LocalAcesso>>(`${base}/${localId}/acessos`, {
      query: { per_page: 100, ...params },
      ...opts,
    });

  return { listByLocal };
};
