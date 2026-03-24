<!-- components/PaginatedFetcher.vue -->
<script setup lang="ts">
import { ref, computed, watch, toValue } from "vue";
import { useRoute, useRouter, useAsyncData } from "#app";
// import axios from "axios"; // só se você for criar fetcher aqui; se vier por prop, ignore
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-vue-next";

type PaginatedResponse<T> = {
  data: T[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
};

const props = withDefaults(
  defineProps<{
    /** função que chama sua API externa (client-side) */
    fetcher: (q: Record<string, any>) => Promise<PaginatedResponse<any>>;
    /** params extras reativos (objeto ou função) */
    params?: Record<string, any> | (() => Record<string, any>);
    /** sincroniza page/per_page/search com a URL */
    syncQuery?: boolean;
    /** opções select */
    perPageOptions?: number[];
    /** nomes das chaves na URL */
    queryKeys?: { page?: string; perPage?: string; search?: string };
    /** search inicial (caso não venha da URL) */
    initialSearch?: string;
    /** prefixo para a cache-key do useAsyncData */
    keyBase?: string;
    disabled?: boolean;
  }>(),
  {
    params: () => ({}),
    syncQuery: true,
    perPageOptions: () => [10, 25, 50, 100],
    queryKeys: () => ({ page: "page", perPage: "per_page", search: "search" }),
    initialSearch: "",
    keyBase: "list",
    disabled: false,
  }
);

const route = useRoute();
const router = useRouter();

const qk = props.queryKeys!;
const qPage = Number(route.query[qk.page!] || 1);
const qPerPage = Number(route.query[qk.perPage!] || 10);
const qSearch =
  (route.query[qk.search!] as string) ?? props.initialSearch ?? "";

const page = ref<number>(Number.isFinite(qPage) && qPage > 0 ? qPage : 1);
const perPage = ref<number>(
  Number.isFinite(qPerPage) && qPerPage > 0 ? qPerPage : 10
);
const search = ref<string>(qSearch);

const extraParams = computed(() => toValue(props.params) || {});

/** roda apenas no cliente; lazy evita corrida inicial */
const { data, pending, error, refresh } = await useAsyncData(
  () =>
    [
      props.keyBase,
      page.value,
      perPage.value,
      search.value,
      JSON.stringify(extraParams.value),
    ].join(":"),
  () =>
    props.fetcher({
      page: page.value,
      per_page: perPage.value,
      search: search.value || undefined,
      ...extraParams.value,
    }),
  {
    watch: [page, perPage, search, extraParams],
    server: false, // <<< importante para SPA
    lazy: true, // dispara na montagem do cliente
    immediate: true, // já busca na montagem
  }
);

const total = computed(() => data.value?.total ?? 0);
const lastPage = computed(() =>
  Math.max(1, Math.ceil(total.value / perPage.value))
);
const canPrev = computed(() => page.value > 1 && !props.disabled);
const canNext = computed(() => page.value < lastPage.value && !props.disabled);

watch(data, (res) => {
  if (!res) return;
  if (page.value > (res.last_page ?? 1)) {
    page.value = 1;
  }
});

watch([page, perPage, search, extraParams], ([p, per, s]) => {
  if (!props.syncQuery) return;
  router.replace({
    query: {
      ...route.query,
      [qk.page!]: p,
      [qk.perPage!]: per,
      [qk.search!]: s || undefined,
    },
  });
});

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}
function goTo(p: number) {
  const next = clamp(p, 1, lastPage.value);
  if (next === page.value) return;
  page.value = next; // dispara nova busca
}
function setPerPage(v: unknown) {
  if (v == null) return;
  const nextPer = Number(v);
  if (!Number.isFinite(nextPer) || nextPer <= 0) return;
  const newLast = Math.max(1, Math.ceil(total.value / nextPer));
  page.value = clamp(page.value, 1, newLast);
  perPage.value = nextPer;
}

const items = computed(() => data.value?.data ?? []);
const api = {
  page,
  perPage,
  search,
  total,
  lastPage,
  pending,
  error,
  refresh,
  goTo,
  setPerPage,
};
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- entrega tudo via slot -->
    <slot
      :items="items"
      :pending="pending"
      :error="error"
      :page="page"
      :per-page="perPage"
      :search="search"
      :total="total"
      :last-page="lastPage"
      :go-to="goTo"
      :set-per-page="setPerPage"
      :refresh="refresh"
    />

    <!-- Controles (sem emits, chamam goTo/setPerPage direto) -->
    <div class="flex w-full items-center gap-4 p-3 md:p-4 [&>*]:shrink-0">
      <div class="flex items-center gap-2">
        <Label class="text-sm text-muted-foreground"
          >Registros por página</Label
        >
        <Select
          :disabled="disabled"
          :model-value="String(perPage)"
          @update:model-value="setPerPage"
        >
          <SelectTrigger class="h-8 w-[72px] rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectItem
              v-for="opt in perPageOptions"
              :key="opt"
              :value="String(opt)"
            >
              {{ opt }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="mx-auto text-sm text-muted-foreground">
        Página <span class="font-medium text-foreground">{{ page }}</span> de
        <span class="font-medium text-foreground">{{ lastPage }}</span>
      </div>

      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8 rounded-lg"
          :disabled="!canPrev"
          @click="goTo(1)"
          aria-label="First page"
        >
          <ChevronsLeft class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8 rounded-lg"
          :disabled="!canPrev"
          @click="goTo(page - 1)"
          aria-label="Previous page"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8 rounded-lg"
          :disabled="!canNext"
          @click="goTo(page + 1)"
          aria-label="Next page"
        >
          <ChevronRight class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8 rounded-lg"
          :disabled="!canNext"
          @click="goTo(lastPage)"
          aria-label="Last page"
        >
          <ChevronsRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
