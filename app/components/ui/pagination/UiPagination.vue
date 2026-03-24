<script setup lang="ts">
import { computed } from "vue";
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
import type { PaginationMeta } from "@/types/common";

const props = withDefaults(
  defineProps<{
    /** v-model:page (1-indexed) */
    page: number;
    /** v-model:perPage */
    perPage: number;
    /** total de itens (usado quando meta não é passado) */
    total: number;
    /** meta de paginação da API (formato Laravel). Quando passado, current_page, last_page, from/to são usados da resposta */
    meta?: PaginationMeta | null;
    /** opções para o select */
    perPageOptions?: number[];
    /** desabilita tudo */
    disabled?: boolean;
  }>(),
  {
    perPageOptions: () => [10, 25, 50, 100],
    disabled: false,
  },
);

const emit = defineEmits<{
  (e: "update:page", value: number): void;
  (e: "update:perPage", value: number): void;
  (e: "change", value: { page: number; perPage: number }): void;
}>();

/** Página atual: da meta (API) ou do v-model */
const currentPage = computed(() =>
  props.meta != null ? props.meta.current_page : props.page,
);
/** Última página: da meta (API) ou calculada */
const lastPage = computed(() =>
  props.meta != null
    ? props.meta.last_page
    : Math.max(1, Math.ceil(props.total / props.perPage)),
);
/** Per page: da meta (API) ou do v-model */
const currentPerPage = computed(() =>
  props.meta != null ? props.meta.per_page : props.perPage,
);
/** Total: da meta (API) ou da prop */
const totalItems = computed(() =>
  props.meta != null ? props.meta.total : props.total,
);

const canPrev = computed(() => currentPage.value > 1 && !props.disabled);
const canNext = computed(
  () => currentPage.value < lastPage.value && !props.disabled,
);

/** Texto "X a Y" quando a API retorna from/to */
const fromToLabel = computed(() => {
  const m = props.meta;
  if (m?.from != null && m?.to != null) return `${m.from} a ${m.to}`;
  if (totalItems.value === 0) return "0";
  const from = (currentPage.value - 1) * currentPerPage.value + 1;
  const to = Math.min(
    currentPage.value * currentPerPage.value,
    totalItems.value,
  );
  return `${from} a ${to}`;
});

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}
function goTo(p: number) {
  const next = clamp(p, 1, lastPage.value);
  if (next === currentPage.value) return;
  emit("update:page", next);
  emit("change", { page: next, perPage: currentPerPage.value });
}
function setPerPage(v: unknown) {
  if (v == null) return;
  const nextPer = Number(v);
  if (!Number.isFinite(nextPer) || nextPer <= 0) return;
  const newLast = Math.max(1, Math.ceil(totalItems.value / nextPer));
  const newPage = clamp(currentPage.value, 1, newLast);
  emit("update:perPage", nextPer);
  if (newPage !== currentPage.value) emit("update:page", newPage);
  emit("change", { page: newPage, perPage: nextPer });
}
</script>

<template>
  <div
    class="flex w-full flex-col gap-3 py-3 sm:flex-row sm:flex-nowrap sm:items-center sm:gap-4"
  >
    <!-- 1) Texto: no mobile primeira linha, centralizado; no desktop centro -->
    <div
      class="order-1 w-full min-w-0 flex-1 text-center text-sm text-muted-foreground sm:order-2 sm:mx-auto sm:text-left"
    >
      <template v-if="totalItems > 0">
        <span class="hidden sm:inline">Registros </span>
        <span class="font-medium text-foreground">{{ fromToLabel }}</span>
        de
        <span class="font-medium text-foreground">{{ totalItems }}</span>
        <span class="hidden text-muted-foreground sm:inline">
          (Página {{ currentPage }} de {{ lastPage }})
        </span>
        <span class="text-muted-foreground sm:hidden">
          · Pág. {{ currentPage }}/{{ lastPage }}
        </span>
      </template>
      <template v-else> Nenhum registro </template>
    </div>

    <!-- 2) No mobile: per_page + botões na mesma linha (justify-between). No desktop: display contents para virar 2 blocos (per_page | botões) -->
    <div
      class="order-2 flex w-full shrink-0 items-center justify-between gap-2 sm:contents"
    >
      <div class="flex items-center gap-2 sm:order-1">
        <Label class="hidden text-sm text-muted-foreground sm:inline-block">
          Registros por página
        </Label>

        <Select
          :disabled="disabled"
          :model-value="String(currentPerPage)"
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

      <div class="flex items-center gap-1 sm:order-3 sm:gap-2">
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8 rounded-lg touch-manipulation"
          :disabled="!canPrev"
          @click="goTo(1)"
          aria-label="Primeira página"
        >
          <ChevronsLeft class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8 rounded-lg touch-manipulation"
          :disabled="!canPrev"
          @click="goTo(currentPage - 1)"
          aria-label="Página anterior"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8 rounded-lg touch-manipulation"
          :disabled="!canNext"
          @click="goTo(currentPage + 1)"
          aria-label="Próxima página"
        >
          <ChevronRight class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8 rounded-lg touch-manipulation"
          :disabled="!canNext"
          @click="goTo(lastPage)"
          aria-label="Última página"
        >
          <ChevronsRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
