<template>
  <div class="w-full p-8 flex justify-between items-center">
    <div class="w-full flex justify-between items-center">
      <div>
        <h2 class="font-bold text-3xl text-gray-800 leading-tight">Locais</h2>
        <p class="text-gray-500">Lista de locais cadastrados.</p>
      </div>
      <NuxtLink to="/locais/create">
        <Button>Novo local</Button>
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
        placeholder="Pesquisar local..."
      />
    </div>
  </div>
  <div>
    <div class="w-full px-8">
      <div v-if="pending">Carregando...</div>
      <Alert v-else-if="error" variant="destructive">
        <AlertCircle class="w-4 h-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>Erro ao carregar locais.</AlertDescription>
      </Alert>
      <div v-else class="w-full border rounded-lg border-gray-200">
        <Table class="w-full table-auto whitespace-normal">
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Bairro</TableHead>
              <TableHead class="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="local in locais?.data" :key="local.id">
              <TableCell class="align-middle py-2">
                <div class="flex flex-col justify-center w-full">
                  <p class="text-sm font-bold">{{ local.nome }}</p>
                  <p v-if="local.descricao" class="text-xs text-gray-500 truncate max-w-xs">
                    {{ local.descricao }}
                  </p>
                </div>
              </TableCell>
              <TableCell class="align-middle py-2">
                <span class="text-sm">{{ local.cidade || "—" }}</span>
              </TableCell>
              <TableCell class="align-middle py-2">
                <span class="text-sm">{{ local.estado || "—" }}</span>
              </TableCell>
              <TableCell class="align-middle py-2">
                <span class="text-sm">{{ local.bairro || "—" }}</span>
              </TableCell>
              <TableCell class="align-middle py-2 text-right">
                <div class="flex h-full min-h-[2.5rem] justify-end gap-2 items-center">
                  <NuxtLink :to="`/locais/${local.id}`">
                    <Button variant="outline">Editar</Button>
                  </NuxtLink>
                  <AlertDialog>
                    <AlertDialogTrigger as-child>
                      <Button variant="destructive">Excluir</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir local</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o local &quot;{{
                            local.nome
                          }}&quot;? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          @click="handleDelete(local.id)"
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
        v-if="!pending && !error && (locais?.data?.length ?? 0) === 0"
        class="py-4 text-gray-500"
      >
        Nenhum local encontrado.
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
import type { Local } from "@/types/local";
import type { PaginatedResponse } from "@/types/common";
import { useLocalService } from "@/services/local";
import UiPagination from "@/components/ui/pagination/UiPagination.vue";

useHead({ title: "Locais" });

definePageMeta({
  title: "Locais",
  breadcrumb: "Locais",
});

const route = useRoute();
const router = useRouter();
const search = ref("");
const { list, remove } = useLocalService();

const page = ref<number>(Number(route.query.page || 1));
const perPage = ref<number>(Number(route.query.per_page || 15));

const {
  data: locais,
  pending,
  error,
  refresh,
} = await useAsyncData<PaginatedResponse<Local>>(
  () => ["locais", page.value, perPage.value, search.value].join(":"),
  () =>
    list({
      page: page.value,
      per_page: perPage.value,
      nome: search.value.trim() || undefined,
    }),
  { watch: [page, perPage, search] },
);

const total = computed(() => locais.value?.total ?? 0);

watch(locais, (res) => {
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

async function handleDelete(id: number) {
  try {
    await remove(id);
    await refresh();
    toast.success("Local excluído com sucesso.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao excluir local.";
    toast.error(msg);
  }
}
</script>
