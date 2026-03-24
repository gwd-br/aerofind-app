<script setup lang="ts">
import type { Notification } from "@/types/notification";
import type { PaginatedResponse } from "@/types/common";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNotificationService } from "@/services/notification";
import {
  Bell,
  Loader2,
  Mail,
  MailOpen,
  Search,
  EyeIcon,
} from "lucide-vue-next";
import OrcamentoDialog from "@/components/orcamento/OrcamentoDialog.vue";
const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "detail", notification: Notification): void;
}>();

const open = computed({
  get: () => props.open,
  set: (v) => emit("update:open", v),
});

const notificationService = useNotificationService();
const notifications = ref<Notification[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const currentPage = ref(1);
const lastPage = ref(1);
const PER_PAGE = 20;

const list = computed(() =>
  [...notifications.value].sort((a, b) => {
    if (a.read_at !== b.read_at)
      return (a.read_at ? 1 : 0) - (b.read_at ? 1 : 0);
    return (b.created_at || "").localeCompare(a.created_at || "");
  }),
);

const hasMore = computed(() => currentPage.value < lastPage.value);

function link(n: Notification): string | null {
  const id = n.data?.ref_id;
  if (!id) return null;
  if (n.data?.ref_type?.includes("Orcamento")) return `/orcamentos/${id}`;
  if (n.data?.ref_type?.includes("Chamado")) return `/chamados/${id}`;
  return null;
}

function timeAgo(s: string | undefined): string {
  if (!s) return "";
  const d = new Date(s).getTime();
  const m = Math.floor((Date.now() - d) / 60000);
  const h = Math.floor(m / 60);
  const day = Math.floor(h / 24);
  if (m < 1) return "Agora";
  if (m < 60) return `${m}min`;
  if (h < 24) return `${h}h`;
  if (day < 7) return `${day}d`;
  return new Date(s).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function initial(n: Notification): string {
  return (n.data?.autor?.name || n.data?.title || "?").charAt(0).toUpperCase();
}

function applyResponse(res: PaginatedResponse<Notification>) {
  currentPage.value = res.current_page;
  lastPage.value = res.last_page;
  if (res.current_page === 1) {
    notifications.value = res.data ?? [];
  } else {
    const ids = new Set(notifications.value.map((x) => x.id));
    const newItems = (res.data ?? []).filter((x) => !ids.has(x.id));
    notifications.value = [...notifications.value, ...newItems];
  }
}

async function fetchList(page = 1) {
  if (!open.value) return;
  const isFirst = page === 1;
  if (isFirst) {
    loading.value = true;
    notifications.value = [];
  } else {
    loadingMore.value = true;
  }
  try {
    const res = await notificationService.list({
      page,
      per_page: PER_PAGE,
    });
    applyResponse(res);
  } catch {
    if (isFirst) notifications.value = [];
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

function loadMore() {
  if (loadingMore.value || !hasMore.value) return;
  fetchList(currentPage.value + 1);
}

function markAsReadClick(n: Notification) {
  if (n.read_at) return;
  const readAt = new Date().toISOString();
  const previous = n.read_at;
  n.read_at = readAt;
  notificationService.update(n.id, { read_at: readAt }).catch(() => {
    n.read_at = previous;
  });
}

function onDetailClick(n: Notification, e: Event) {
  e.stopPropagation();
  emit("detail", n);
}

function onListScroll(e: Event) {
  const el = e.target as HTMLElement;
  if (!el || loadingMore.value || !hasMore.value) return;
  const { scrollTop, scrollHeight, clientHeight } = el;
  if (scrollTop + clientHeight >= scrollHeight - 80) loadMore();
}

watch(open, (v) => {
  if (v) {
    currentPage.value = 1;
    lastPage.value = 1;
    fetchList(1);
  }
});
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent
      side="right"
      class="flex w-full flex-col gap-0 p-0 sm:max-w-sm"
      :aria-describedby="undefined"
    >
      <SheetHeader class="shrink-0 border-b px-4 py-3">
        <SheetTitle class="text-base font-semibold">Notificações</SheetTitle>
      </SheetHeader>

      <div class="flex min-h-0 flex-1 flex-col">
        <div
          v-if="loading"
          class="flex flex-1 items-center justify-center py-16"
        >
          <Loader2 class="size-8 animate-spin text-muted-foreground" />
        </div>

        <div
          v-else-if="list.length === 0"
          class="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-16 text-center"
        >
          <Bell class="size-10 text-muted-foreground/60" />
          <p class="text-sm text-muted-foreground">Nenhuma notificação</p>
        </div>

        <ul
          v-else
          class="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-3"
          @scroll="onListScroll"
        >
          <li
            v-for="n in list"
            :key="n.id"
            class="flex shrink-0 flex-col gap-2 rounded-lg border border-border/80 bg-card p-3 transition-colors hover:border-primary/30 hover:bg-muted/40"
            :class="{ 'border-primary/20 bg-primary/5': !n.read_at }"
          >
            <div class="flex min-w-0 flex-1 gap-3 text-left">
              <Avatar class="size-9 shrink-0 rounded-full">
                <AvatarImage
                  :src="n.data?.avatar ?? ''"
                  :alt="n.data?.autor?.name ?? ''"
                />
                <AvatarFallback class="rounded-full text-xs font-medium">
                  {{ initial(n) }}
                </AvatarFallback>
              </Avatar>
              <div class="min-w-0 flex-1">
                <p
                  class="text-sm leading-snug"
                  :class="
                    n.read_at
                      ? 'text-muted-foreground'
                      : 'font-medium text-foreground'
                  "
                >
                  {{ n.data?.title }}
                </p>
                <p
                  v-if="n.data?.body"
                  class="mt-0.5 line-clamp-1 text-xs text-muted-foreground"
                >
                  {{ n.data.body }}
                </p>
                <span
                  class="mt-1 inline-block text-xs text-muted-foreground/80"
                >
                  {{ timeAgo(n.created_at) }}
                </span>
              </div>
            </div>
            <div class="flex items-center justify-between gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <div
                      class="flex shrink-0 items-center justify-center text-muted-foreground"
                      :class="[n.read_at ? 'opacity-50' : 'cursor-pointer']"
                      aria-hidden
                    >
                      <MailOpen
                        v-if="n.read_at"
                        class="size-4"
                        aria-label="Lida"
                      />
                      <span
                        v-else
                        aria-label="Não lida"
                        @click="markAsReadClick(n)"
                        class="cursor-pointer"
                      >
                        <Mail class="size-4 text-primary" />
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {{ n.read_at ? "Lida" : "Marcar como lido" }}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <OrcamentoDialog
                :orcamento-id="n.data?.ref_id"
                v-if="n.data?.ref_type === 'App\\Orcamento'"
              >
                <template #trigger>
                  <Button
                    variant="outline"
                    size="sm"
                    class="h-7 text-xs font-mono"
                  >
                    <EyeIcon class="w-4 h-4" /> {{ n.data?.ref_type }} #{{
                      n.data?.ref_id
                    }}
                  </Button>
                </template>
              </OrcamentoDialog>
            </div>
          </li>
          <li v-if="loadingMore" class="flex shrink-0 justify-center py-2">
            <Loader2 class="size-5 animate-spin text-muted-foreground" />
          </li>
        </ul>
      </div>
    </SheetContent>
  </Sheet>
</template>
