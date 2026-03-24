// app/services/relatorio-obras.ts

import type { ApiOpts } from "@/shared/http";
import type {
  RelatorioObrasResponse,
  RelatorioObrasParams,
} from "@/types/relatorio-obra";

export const useRelatorioObrasService = () => {
  const { $api } = useNuxtApp();
  const base = "relatorios/obras";

  const list = async (
    params: RelatorioObrasParams,
    opts?: ApiOpts,
  ): Promise<RelatorioObrasResponse> => {
    const raw = await $api<RelatorioObrasResponse>(base, {
      query: {
        data_inicial: params.data_inicial,
        data_final: params.data_final,
        ...(params.page != null && { page: params.page }),
        ...(params.per_page != null && { per_page: params.per_page }),
      },
      ...opts,
    });
    return raw;
  };

  return { list };
};
