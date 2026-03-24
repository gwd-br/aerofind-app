<template>
  <div class="w-full p-8 flex justify-between items-center">
    <div class="w-full flex justify-between items-center">
      <div>
        <h2 class="font-bold text-3xl text-gray-800 leading-tight">Eventos</h2>
        <p class="text-gray-500">Lista de eventos cadastrados.</p>
      </div>
      <NuxtLink to="/eventos/create">
        <Button>Novo evento</Button>
      </NuxtLink>
    </div>
  </div>
  <div class="w-full px-8 pb-4 flex justify-between items-center gap-2">
    <div class="relative min-w-96">
      <div
        class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
      >
        <Search class="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </div>
      <Input
        v-model="search"
        type="text"
        class="pl-10"
        placeholder="Pesquisar evento..."
      />
    </div>
  </div>
  <div>
    <div class="w-full px-8">
      <div v-if="pending">Carregando...</div>
      <Alert v-else-if="error" variant="destructive">
        <AlertCircle class="w-4 h-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>Erro ao carregar eventos.</AlertDescription>
      </Alert>
      <div v-else class="w-full border rounded-lg border-gray-200">
        <Table class="w-full table-auto whitespace-normal">
          <TableHeader>
            <TableRow>
              <TableHead>Evento</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Sync</TableHead>
              <TableHead class="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="evento in eventos?.data" :key="evento.id">
              <TableCell class="align-middle py-2">
                <div class="flex flex-col justify-center w-full">
                  <p class="text-sm font-bold">{{ evento.nome_evento }}</p>
                  <p
                    v-if="evento.nome_serie_evento"
                    class="text-xs text-gray-500"
                  >
                    {{ evento.nome_serie_evento }}
                  </p>
                </div>
              </TableCell>
              <TableCell class="align-middle py-2">
                <span class="text-sm">{{
                  evento.data_evento ? formatDate(evento.data_evento) : "—"
                }}</span>
              </TableCell>
              <TableCell class="align-middle py-2">
                <span class="text-sm">{{ evento.nome_venue || "—" }}</span>
              </TableCell>
              <TableCell class="align-middle py-2">
                <Badge :variant="evento.sync_active ? 'default' : 'secondary'">
                  {{ evento.sync_active ? "Ativo" : "Inativo" }}
                </Badge>
              </TableCell>
              <TableCell class="align-middle py-2 text-right">
                <div class="flex h-full min-h-[2.5rem] justify-end gap-2 items-center">
                  <NuxtLink :to="`/eventos/${evento.id}`">
                    <Button variant="outline">Editar</Button>
                  </NuxtLink>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <p
        v-if="!pending && !error && (eventos?.data?.length ?? 0) === 0"
        class="py-4 text-gray-500"
      >
        Nenhum evento encontrado.
      </p>
      <UiPagination
        v-model:page="page"
        v-model:perPage="perPage"
        :total="total"
        :per-page-options="[10, 15, 25, 50, 100]"
        :disabled="pending"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, AlertCircle } from "lucide-vue-next";
import type { Evento } from "@/types/evento";
import type { PaginatedResponse } from "@/types/common";
import { useEventoService } from "@/services/evento";
import UiPagination from "@/components/ui/pagination/UiPagination.vue";

useHead({ title: "Eventos" });

definePageMeta({
  title: "Eventos",
  breadcrumb: "Eventos",
});

const route = useRoute();
const router = useRouter();
const search = ref("");
const { list } = useEventoService();

const page = ref<number>(Number(route.query.page || 1));
const perPage = ref<number>(Number(route.query.per_page || 15));

const {
  data: eventos,
  pending,
  error,
  refresh,
} = await useAsyncData<PaginatedResponse<Evento>>(
  () => ["eventos", page.value, perPage.value, search.value].join(":"),
  () =>
    list({
      page: page.value,
      per_page: perPage.value,
      nome_evento: search.value.trim() || undefined,
    }),
  { watch: [page, perPage, search] },
);

const total = computed(() => eventos.value?.total ?? 0);

watch(eventos, (res) => {
  if (!res) return;
  if (page.value > (res.last_page ?? 1)) {
    page.value = 1;
  }
});

watch([page, perPage, search], ([p, per, q]) => {
  router.replace({
    query: {
      ...route.query,
      page: p,
      per_page: per,
      nome_evento: q?.toString().trim() || undefined,
    },
  });
});

function formatDate(value: string) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleDateString("pt-BR");
}
</script>
