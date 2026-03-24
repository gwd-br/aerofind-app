<template>
  <div class="w-full p-8 flex justify-between items-center">
    <div class="w-full flex justify-between items-center">
      <div>
        <h2 class="font-bold text-3xl text-gray-800 leading-tight">Ingressos</h2>
        <p class="text-gray-500">Lista de ingressos cadastrados.</p>
      </div>
      <NuxtLink to="/ingressos/create">
        <Button>Novo ingresso</Button>
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
        placeholder="Pesquisar ingresso..."
      />
    </div>
  </div>
  <div>
    <div class="w-full px-8">
      <div v-if="pending">Carregando...</div>
      <Alert v-else-if="error" variant="destructive">
        <AlertCircle class="w-4 h-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>Erro ao carregar ingressos.</AlertDescription>
      </Alert>
      <div v-else class="w-full border rounded-lg border-gray-200">
        <Table class="w-full table-auto whitespace-normal">
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="ingresso in ingressos?.data" :key="ingresso.id">
              <TableCell class="align-middle py-2">
                <div class="flex flex-col justify-center w-full">
                  <p class="text-sm font-bold">{{ ingresso.nome }}</p>
                </div>
              </TableCell>
              <TableCell class="align-middle py-2">
                <span class="text-sm">{{
                  ingresso.valor != null ? formatCurrency(ingresso.valor) : "—"
                }}</span>
              </TableCell>
              <TableCell class="align-middle py-2">
                <span class="text-sm">{{ ingresso.quantidade ?? "—" }}</span>
              </TableCell>
              <TableCell class="align-middle py-2">
                <span class="text-sm">{{ ingresso.setor_id ?? "—" }}</span>
              </TableCell>
              <TableCell class="align-middle py-2">
                <span class="text-sm">{{ ingresso.tipo || "—" }}</span>
              </TableCell>
              <TableCell class="align-middle py-2">
                <Badge :variant="ingresso.ativo !== false ? 'default' : 'secondary'">
                  {{ ingresso.ativo !== false ? "Ativo" : "Inativo" }}
                </Badge>
              </TableCell>
              <TableCell class="align-middle py-2 text-right">
                <div class="flex h-full min-h-[2.5rem] justify-end gap-2 items-center">
                  <NuxtLink :to="`/ingressos/${ingresso.id}`">
                    <Button variant="outline">Editar</Button>
                  </NuxtLink>
                  <AlertDialog>
                    <AlertDialogTrigger as-child>
                      <Button variant="destructive">Excluir</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir ingresso</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o ingresso &quot;{{
                            ingresso.nome
                          }}&quot;? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          @click="handleDelete(ingresso.id)"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <p
        v-if="!pending && !error && (ingressos?.data?.length ?? 0) === 0"
        class="py-4 text-gray-500"
      >
        Nenhum ingresso encontrado.
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, AlertCircle } from "lucide-vue-next";
import { toast } from "vue-sonner";
import type { Ingresso } from "@/types/ingresso";
import type { PaginatedResponse } from "@/types/common";
import { useIngressoService } from "@/services/ingresso";
import UiPagination from "@/components/ui/pagination/UiPagination.vue";

useHead({ title: "Ingressos" });

definePageMeta({
  title: "Ingressos",
  breadcrumb: "Ingressos",
});

const route = useRoute();
const router = useRouter();
const search = ref("");
const { list, remove } = useIngressoService();

const page = ref<number>(Number(route.query.page || 1));
const perPage = ref<number>(Number(route.query.per_page || 15));

const {
  data: ingressos,
  pending,
  error,
  refresh,
} = await useAsyncData<PaginatedResponse<Ingresso>>(
  () => ["ingressos", page.value, perPage.value, search.value].join(":"),
  () =>
    list({
      page: page.value,
      per_page: perPage.value,
      nome: search.value.trim() || undefined,
    }),
  { watch: [page, perPage, search] },
);

const total = computed(() => ingressos.value?.total ?? 0);

watch(ingressos, (res) => {
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
      nome: q?.toString().trim() || undefined,
    },
  });
});

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

async function handleDelete(id: number) {
  try {
    await remove(id);
    await refresh();
    toast.success("Ingresso excluído com sucesso.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao excluir ingresso.";
    toast.error(msg);
  }
}
</script>
