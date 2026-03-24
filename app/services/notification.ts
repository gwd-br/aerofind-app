import type { ApiOpts } from "@/shared/http";
import type { Notification, NotificationListParams } from "@/types/notification";
import type { PaginatedResponse } from "@/types/common";

const base = "notifications";

export const useNotificationService = () => {
  const { $api } = useNuxtApp();

  const list = (params?: NotificationListParams, opts?: ApiOpts) =>
    $api<PaginatedResponse<Notification>>(base, { query: params, ...opts });

  const get = (id: number | string, opts?: ApiOpts) =>
    $api<Notification>(`${base}/${id}`, { ...opts });

  const update = (
    id: number | string,
    data: { read_at: string },
    opts?: ApiOpts,
  ) =>
    $api<Notification>(`${base}/${id}`, {
      method: "PATCH",
      body: data,
      ...opts,
    });

  const markAsRead = (id: number | string, opts?: ApiOpts) =>
    $api<Notification>(`${base}/${id}/read`, {
      method: "PUT",
      ...opts,
    });

  const markAllAsRead = (opts?: ApiOpts) =>
    $api<{ count: number }>(`${base}/read-all`, {
      method: "PUT",
      ...opts,
    });

  return { list, get, update, markAsRead, markAllAsRead };
};
