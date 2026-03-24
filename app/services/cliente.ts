// app/services/cliente.ts

import type { ApiOpts, ListParams } from "@/shared/http";
import type { Cliente } from "@/types/cliente";
import type { PaginatedResponse } from "@/types/common";

export const useClienteService = () => {
  const { $api } = useNuxtApp();
  const base = "clientes";

  const list = async (
    params: ListParams,
    opts?: ApiOpts,
  ): Promise<PaginatedResponse<Cliente>> => {
    const raw = await $api<PaginatedResponse<Cliente>>(base, {
      query: params,
      ...opts,
    });
    return raw;
  };

  const get = (id: number | string, opts?: ApiOpts) =>
    $api<Cliente>(`${base}/${id}`, { ...opts });

  return { list, get };
};
