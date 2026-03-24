// services/user.ts
import type { ApiOpts, ListParams } from "@/shared/http";
import type { User, CreateUserDTO, UpdateUserDTO } from "@/types/user";
import type { PaginatedResponse } from "@/types/common";

export interface UserListParams extends ListParams {
  b_ativo?: boolean | number;
}

export const useUserService = () => {
  const { $api } = useNuxtApp();
  const base = "usuarios";

  const list = (params: UserListParams, opts?: ApiOpts) =>
    $api<PaginatedResponse<User>>(base, { query: params, ...opts });

  const get = (id: number | string, opts?: ApiOpts) =>
    $api<User>(`${base}/${id}`, { ...opts });

  const create = (payload: CreateUserDTO, opts?: ApiOpts) =>
    $api<User>(base, { method: "POST", body: payload, ...opts });

  const update = (
    id: number | string,
    payload: UpdateUserDTO,
    opts?: ApiOpts,
  ) => $api<User>(`${base}/${id}`, { method: "PUT", body: payload, ...opts });

  const remove = (id: number | string, opts?: ApiOpts) =>
    $api<void>(`${base}/${id}`, { method: "DELETE", ...opts });

  return { list, get, create, update, remove };
};
