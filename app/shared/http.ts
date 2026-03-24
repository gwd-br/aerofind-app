// shared/http.ts
import type { NitroFetchOptions, NitroFetchRequest } from "nitropack";

/**
 * Opções aceitas pelo $fetch do Nuxt/Nitro,
 * exceto `method` (que cada função do service fixa).
 */
export type ApiOpts = Omit<NitroFetchOptions<NitroFetchRequest>, "method">;

/** Params comuns de paginação/busca (opcional) */
export type ListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  sort?: string;
  evento_id?: number | string;
  credencial_empresa_id?: number | string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
};
